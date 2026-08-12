const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

const getStats = asyncHandler(async (_req, res) => {
  const [revenueResult, totalOrders, totalUsers, totalMenuItems, statusRows, topItems] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments(),
    User.countDocuments(),
    MenuItem.countDocuments(),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.item',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const ordersByStatus = statusRows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  return success(res, 200, {
    totalRevenue: revenueResult[0]?.revenue || 0,
    totalOrders,
    totalUsers,
    totalMenuItems,
    ordersByStatus,
    topSellingItems: topItems,
  }, 'Admin statistics retrieved');
});

module.exports = { getStats };
