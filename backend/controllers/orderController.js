const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');

const ONLINE_PAYMENTS_ENABLED = String(process.env.ENABLE_ONLINE_PAYMENTS).toLowerCase() === 'true';

const orderSubscribers = new Map();
const adminSubscribers = new Set();

function sendSSE(res, data) {
  if (res.writableEnded) return;
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcastOrder(order, type = 'order-updated') {
  const orderId = String(order._id);
  const subscribers = orderSubscribers.get(orderId);
  if (subscribers) {
    for (const res of subscribers) {
      try { sendSSE(res, { type, order }); } catch { subscribers.delete(res); }
    }
  }
  for (const res of adminSubscribers) {
    try { sendSSE(res, { type, order }); } catch { adminSubscribers.delete(res); }
  }
}

function calculateDiscount(coupon, subtotal) {
  let discount = coupon.type === 'percentage' ? subtotal * (coupon.value / 100) : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  return Number(Math.min(discount, subtotal).toFixed(2));
}

async function resolveCoupon(code, subtotal) {
  if (!code) return { coupon: null, discount: 0 };
  const normalized = String(code).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalized, active: true });
  if (!coupon) throw new Error('Invalid or inactive coupon');
  const now = new Date();
  if (coupon.startsAt > now || (coupon.expiresAt && coupon.expiresAt < now)) throw new Error('This coupon is not currently valid');
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) throw new Error('This coupon has reached its usage limit');
  if (subtotal < coupon.minOrderAmount) throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
  return { coupon, discount: calculateDiscount(coupon, subtotal) };
}

const createOrder = asyncHandler(async (req, res) => {
  if (!req.user?.id) return error(res, 401, 'Login required to place an order');
  const { customerDetails, items, subtotal, tax, deliveryFee, totalAmount, paymentMethod, couponCode } = req.body;

  if (paymentMethod === 'online' && !ONLINE_PAYMENTS_ENABLED) {
    return error(res, 400, 'Online payments are coming soon. Please choose Cash on Delivery.');
  }

  if (!Array.isArray(items) || items.length === 0) return error(res, 400, 'Order must contain at least one item');

  const itemIds = items.map((item) => item.item);
  const menuItems = await MenuItem.find({ _id: { $in: itemIds }, available: true }).select('name price');
  const menuById = new Map(menuItems.map((item) => [String(item._id), item]));
  const sanitizedItems = [];

  for (const item of items) {
    const menuItem = menuById.get(String(item.item));
    const quantity = Number(item.quantity);
    if (!menuItem || !Number.isInteger(quantity) || quantity < 1) return error(res, 400, 'One or more order items are invalid or unavailable');
    sanitizedItems.push({ item: menuItem._id, name: menuItem.name, price: Number(menuItem.price), quantity });
  }

  const computedSubtotal = sanitizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const clientSubtotal = Number(subtotal);
  const taxAmount = Number(tax);
  const deliveryAmount = Number(deliveryFee);
  const clientTotal = Number(totalAmount);
  if (!Number.isFinite(taxAmount) || taxAmount < 0 || !Number.isFinite(deliveryAmount) || deliveryAmount < 0 || clientSubtotal !== Number(computedSubtotal.toFixed(2))) return error(res, 400, 'Order totals are invalid');

  let coupon = null;
  let discount = 0;
  try {
    ({ coupon, discount } = await resolveCoupon(couponCode, computedSubtotal));
  } catch (couponError) {
    return error(res, 400, couponError.message);
  }

  const discountedSubtotal = Number((computedSubtotal - discount).toFixed(2));
  const computedTotal = Number((discountedSubtotal + taxAmount + deliveryAmount).toFixed(2));
  if (clientTotal !== computedTotal) return error(res, 400, 'Order totals are invalid');

  const order = await Order.create({
    user: req.user.id,
    code: `MN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    customerDetails,
    items: sanitizedItems,
    subtotal: clientSubtotal,
    discount,
    couponCode: coupon?.code ?? null,
    tax: taxAmount,
    deliveryFee: deliveryAmount,
    totalAmount: clientTotal,
    paymentMethod,
  });

  if (coupon) {
    await Coupon.updateOne(
      { _id: coupon._id, active: true, $or: [{ usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }] },
      { $inc: { usageCount: 1 } },
    );
  }

  broadcastOrder(order, 'new-order');
  return success(res, 201, order, 'Order created successfully');
});

const getOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('user', 'name email phone role').sort('-createdAt');
  return success(res, 200, orders, 'Orders retrieved');
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone role');
  if (!order) return error(res, 404, 'Order not found');
  if (req.user) {
    const isOwner = order.user && String(order.user._id) === String(req.user.id);
    if (!isOwner && req.user.role !== 'admin') return error(res, 403, 'Not authorized to view this order');
  }
  return success(res, 200, order, 'Order retrieved');
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const validStatuses = Order.schema.path('orderStatus').enumValues;
  if (!validStatuses.includes(orderStatus)) return error(res, 400, 'Invalid order status');
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true, runValidators: true }).populate('user', 'name email phone role');
  if (!order) return error(res, 404, 'Order not found');
  broadcastOrder(order, 'order-updated');
  return success(res, 200, order, 'Order status updated');
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  return success(res, 200, orders, 'User orders retrieved');
});

const subscribeToOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId).populate('user', 'name email phone role');
  if (!order) return error(res, 404, 'Order not found');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  sendSSE(res, { type: 'order-updated', order });
  if (!orderSubscribers.has(orderId)) orderSubscribers.set(orderId, new Set());
  orderSubscribers.get(orderId).add(res);
  const cleanup = () => {
    const subscribers = orderSubscribers.get(orderId);
    if (subscribers) { subscribers.delete(res); if (subscribers.size === 0) orderSubscribers.delete(orderId); }
  };
  const heartbeat = setInterval(() => { if (!res.writableEnded) res.write(': heartbeat\n\n'); }, 25000);
  req.on('close', () => { clearInterval(heartbeat); cleanup(); });
});

const subscribeToAdminOrders = asyncHandler(async (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  adminSubscribers.add(res);
  const orders = await Order.find().populate('user', 'name email phone role').sort('-createdAt');
  for (const order of orders) sendSSE(res, { type: 'initial-order', order });
  const heartbeat = setInterval(() => { if (!res.writableEnded) res.write(': heartbeat\n\n'); }, 25000);
  _req.on('close', () => { clearInterval(heartbeat); adminSubscribers.delete(res); });
});

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders, subscribeToOrder, subscribeToAdminOrders };
