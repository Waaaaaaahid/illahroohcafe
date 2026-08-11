// backend/controllers/adminController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
// TODO: const Order = require('../models/Order');
// TODO: const User = require('../models/User');
// TODO: const MenuItem = require('../models/MenuItem');

// GET /api/admin/stats (admin)
// TODO: Aggregate: total revenue (sum totalAmount where paymentStatus='paid'),
// total orders count, total users count, top-selling menu items (aggregate on Order.items),
// orders grouped by orderStatus for a dashboard chart.
const getStats = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Admin dashboard stats');
});

module.exports = { getStats };
