const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../services/paymentService');

const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const getAuthenticatedUser = async (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (!decoded?.id) return null;
    return User.findById(decoded.id).select('-password');
  } catch {
    return null;
  }
};

// POST /api/payment/create-order
// Creates a Razorpay order and records it as a Payment doc (status 'created').
const createPaymentOrder = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return error(res, 401, 'Login required for online payment');

  if (!isRazorpayConfigured()) {
    return error(
      res,
      503,
      'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable online payments.',
    );
  }

  const { orderId } = req.body || {};
  const order = await Order.findById(orderId);
  if (!order) return error(res, 404, 'Order not found');
  if (String(order.user) !== String(user._id) && user.role !== 'admin') {
    return error(res, 403, 'Not authorized for this order');
  }
  if (order.paymentMethod !== 'online') {
    return error(res, 400, 'Order is not configured for online payment');
  }
  if (order.paymentStatus === 'paid') return error(res, 400, 'Order is already paid');

  const orderAmount = Number(order.totalAmount);
  if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
    return error(res, 400, 'Invalid order amount');
  }

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amount: orderAmount,
      currency: order.currency || 'INR',
      receipt: `order_${order.code || order._id}`,
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err.message);
    return error(res, 502, 'Payment gateway could not create the order. Please try again.');
  }

  const payment = await Payment.findOneAndUpdate(
    { order: order._id },
    {
      order: order._id,
      user: order.user,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount / 100,
      currency: razorpayOrder.currency || 'INR',
      status: 'created',
      paymentMethod: 'online',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return success(
    res,
    200,
    {
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      paymentId: payment._id,
    },
    'Payment order created'
  );
});

// POST /api/payment/verify
// Verifies the Razorpay checkout signature and marks payment + order as paid.
const verifyPayment = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return error(res, 401, 'Login required for payment verification');

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return error(res, 400, 'razorpayOrderId, razorpayPaymentId and razorpaySignature are required');
  }

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) return error(res, 404, 'Payment not found');
  if (String(payment.user) !== String(user._id) && user.role !== 'admin') {
    return error(res, 403, 'Not authorized for this payment');
  }

  const verified = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!verified) {
    await Payment.updateOne(
      { _id: payment._id },
      { status: 'failed', razorpayPaymentId, razorpaySignature }
    );
    return error(res, 400, 'Invalid payment signature');
  }

  await Payment.updateOne(
    { _id: payment._id },
    { status: 'paid', razorpayPaymentId, razorpaySignature }
  );
  await Order.updateOne({ _id: payment.order }, { paymentStatus: 'paid' });

  return success(res, 200, { verified: true }, 'Payment verified');
});

// POST /api/payment/webhook
// Razorpay server-to-server events (payment.captured / payment.failed).
// req.body is the RAW body buffer (mounted with express.raw in server.js).
const handleWebhook = asyncHandler(async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return res.status(503).json({ success: false, message: 'Razorpay webhook secret is not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(JSON.stringify(req.body || {}));

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  }

  const event = payload?.event;
  const entity = payload?.payload?.payment?.entity;
  const razorpayOrderId = entity?.order_id;

  if (!razorpayOrderId) {
    console.warn('Webhook event without order_id:', event);
    return res.status(200).json({ success: true });
  }

  const status =
    event === 'payment.captured' || event === 'payment.authorized'
      ? 'paid'
      : event === 'payment.failed'
        ? 'failed'
        : null;

  if (status) {
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status, razorpayPaymentId: entity.id },
      { new: true }
    );

    if (payment) {
      await Order.updateOne({ _id: payment.order }, { paymentStatus: status });
    }
  }

  return res.status(200).json({ success: true });
});

// GET /api/payment (admin)
const getPayments = asyncHandler(async (_req, res) => {
  const payments = await Payment.find()
    .populate('order', 'code')
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(100);

  const serialized = payments.map((payment) => {
    const data = payment.toObject();
    data.order = data.order?.code || data.order?._id || data.order;
    data.user = data.user?._id || data.user;
    return data;
  });

  return success(res, 200, serialized);
});

module.exports = { createPaymentOrder, verifyPayment, handleWebhook, getPayments };