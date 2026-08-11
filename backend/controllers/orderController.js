// backend/controllers/orderController.js
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const Order = require('../models/Order');

const generateOrderCode = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-6);
  return `MN-${timestamp}-${random}`;
};

const createOrder = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    return error(res, 401, 'Login required to place an order');
  }

  const { customerDetails, items, subtotal, tax, deliveryFee, totalAmount, paymentMethod } = req.body;
  const computedSubtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const computedTotal = Number((computedSubtotal + Number(tax) + Number(deliveryFee)).toFixed(2));

  if (Number(subtotal) !== Number(computedSubtotal) || Number(totalAmount) !== computedTotal) {
    return error(res, 400, 'Order totals are invalid');
  }

  const order = await Order.create({
    user: req.user.id,
    code: generateOrderCode(),
    customerDetails,
    items,
    subtotal: Number(subtotal),
    tax: Number(tax),
    deliveryFee: Number(deliveryFee),
    totalAmount: Number(totalAmount),
    paymentMethod,
  });

  return success(res, 201, order, 'Order created successfully');
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email phone role').sort('-createdAt');
  return success(res, 200, orders, 'Orders retrieved');
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone role');

  if (!order) {
    return error(res, 404, 'Order not found');
  }

  const isOwner = order.user && String(order.user._id) === String(req.user.id);
  if (!isOwner && req.user.role !== 'admin') {
    return error(res, 403, 'Not authorized to view this order');
  }

  return success(res, 200, order, 'Order retrieved');
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const validStatuses = Order.schema.path('orderStatus').enumValues;

  if (!validStatuses.includes(orderStatus)) {
    return error(res, 400, 'Invalid order status');
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    { new: true },
  ).populate('user', 'name email phone role');

  if (!order) {
    return error(res, 404, 'Order not found');
  }

  return success(res, 200, order, 'Order status updated');
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  return success(res, 200, orders, 'User orders retrieved');
});

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders };
