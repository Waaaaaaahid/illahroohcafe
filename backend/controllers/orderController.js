// backend/controllers/orderController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
// TODO: const Order = require('../models/Order');
// TODO: const { calculateOrderTotals } = require('../services/orderService');
// TODO: const { sendEmail } = require('../services/emailService');

// POST /api/orders
// TODO: Validate body via orderRules. Compute totals with calculateOrderTotals(items, taxPct, deliveryFee)
// pulled from CafeSettings. Attach req.user?.id if authenticated (guest checkout allowed).
// Create Order.create({...}), optionally send confirmation email.
const createOrder = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Create order');
});

// GET /api/orders (admin) - list all orders
// TODO: Support pagination/filter by orderStatus/paymentStatus; Order.find().populate('user items.item').
const getOrders = asyncHandler(async (req, res) => {
  return notImplemented(res, 'List all orders');
});

// GET /api/orders/:id
// TODO: Order.findById(req.params.id).populate('user items.item'); ensure requester owns it or is admin.
const getOrderById = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Get order by id');
});

// PUT /api/orders/:id/status (admin)
// TODO: Validate new orderStatus against enum; Order.findByIdAndUpdate(id, { orderStatus }, { new: true }).
const updateOrderStatus = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Update order status');
});

// GET /api/orders/my (protected) - current user's orders
// TODO: Order.find({ user: req.user.id }).sort('-createdAt').
const getMyOrders = asyncHandler(async (req, res) => {
  return notImplemented(res, "List current user's orders");
});

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders };
