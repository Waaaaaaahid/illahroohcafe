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

const createPaymentOrder = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return error(res, 401, 'Login required for online payment');

  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return error(res, 404, 'Order not found');
  if (String(order.user) !== String(user._id) && user.role !== 'admin') {
    return error(res, 403, 'Not authorized for this order');
  }
  if (order.paymentMethod !== 'online') {
    return error(res, 400, 'Order is not configured for online payment');
  }
  if (order.paymentStatus === 'paid') return error(res, 400, 'Order is already paid');

  const amount = Number(order.totalAmount);
  if (!Number.isFinite(amount) || amount <= 0) return error(res, 400, 'Invalid order amount');

  const razorpayOrder = await createRazorpayOrder({
    amount,
    currency: 'INR',
    receipt: String(order._id),
  });

  await Payment.findOneAndUpdate(
    { order: order._id },
    {
      order: order._id,
      user: order.user,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
      status: 'created',
      paymentMethod: 'online',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return success(res, 200, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  }, 'Payment order created');
});

const verifyPayment = asyncHandler(async (req, res) => {
  const user = await getAuthenticatedUser(req);
  if (!user) return error(res, 401, 'Login required for payment verification');

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return error(res, 400, 'Incomplete payment verification data');
  }

  const payment = await Payment.findOne({ razorpayOrderId }).populate('order');
  if (!payment) return error(res, 404, 'Payment record not found');
  if (String(payment.user) !== String(user._id) && user.role !== 'admin') {
    return error(res, 403, 'Not authorized for this payment');
  }

  const verified = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!verified) {
    await Payment.updateOne({ _id: payment._id }, { status: 'failed', razorpayPaymentId, razorpaySignature });
    return error(res, 400, 'Invalid payment signature');
  }

  await Payment.updateOne({ _id: payment._id }, { status: 'paid', razorpayPaymentId, razorpaySignature });
  await Order.updateOne({ _id: payment.order._id }, { paymentStatus: 'paid' });

  return success(res, 200, { verified: true }, 'Payment verified');
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
    return error(res, 400, 'Webhook signature configuration is missing');
  }

  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(JSON.stringify(req.body || {}));

  if (!verifyWebhookSignature(rawBody, signature)) {
    return error(res, 400, 'Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody.toString('utf8'));
  const event = payload.event;
  const entity = payload.payload?.payment?.entity;
  const razorpayOrderId = entity?.order_id;

  if (razorpayOrderId) {
    const status = event === 'payment.captured' || event === 'payment.authorized'
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
  }

  return res.status(200).json({ success: true });
});

const getPayments = asyncHandler(async (_req, res) => {
  const payments = await Payment.find()
    .populate('order', 'code totalAmount orderStatus')
    .populate('user', 'name email phone')
    .sort('-createdAt');

  return success(res, 200, payments, 'Payments retrieved');
});

module.exports = { createPaymentOrder, verifyPayment, handleWebhook, getPayments };
