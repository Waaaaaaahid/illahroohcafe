const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

// GET /api/admin/stats (admin)
// Aggregates dashboard numbers: revenue, orders, users, menu items,
// status breakdown, top sellers and a 7-day revenue series.
const getStats = asyncHandler(async (_req, res) => {
  const [totals] = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        // Revenue = paid online orders + COD orders (any payment status other
        // than failed/refunded). Cancelled orders never count as sales.
        totalRevenue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$orderStatus', 'Cancelled'] },
                  {
                    $or: [
                      { $eq: ['$paymentStatus', 'paid'] },
                      {
                        $and: [
                          { $eq: ['$paymentMethod', 'cod'] },
                          { $nin: ['$paymentStatus', ['failed', 'refunded']] },
                        ],
                      },
                    ],
                  },
                ],
              },
              '$totalAmount',
              0,
            ],
          },
        },
      },
    },
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
  const totalUsers = await User.countDocuments();
  const menuItems = await MenuItem.countDocuments({ available: true });

  const statusBreakdown = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const recentOrders = await Order.find().sort('-createdAt').limit(5);

  const topSellingItems = await Order.aggregate([
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
  ]);

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return { day, next };
  });

  const revenueSeriesRaw = await Order.aggregate([
    {
      // Same sale definition as the totals above: paid online + COD, minus
      // failed/refunded/cancelled. COD rows stay 'pending' until delivery.
      $match: {
        $or: [
          { paymentStatus: 'paid' },
          {
            paymentMethod: 'cod',
            paymentStatus: { $nin: ['failed', 'refunded'] },
          },
        ],
        orderStatus: { $ne: 'Cancelled' },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' },
        },
        revenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  const revenueByDay = new Map(revenueSeriesRaw.map((entry) => [entry._id, entry.revenue]));

  const revenueSeries = days.map(({ day }) => {
    const key = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(day);
    const label = day.toLocaleDateString(undefined, { weekday: 'short' });
    return { label, revenue: Math.round((revenueByDay.get(key) || 0) * 100) / 100 };
  });

  const ordersByStatus = statusBreakdown.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  return success(res, 200, {
    totalOrders: totals?.totalOrders || 0,
    totalRevenue: totals?.totalRevenue || 0,
    todayOrders,
    totalUsers,
    menuItems,
    totalMenuItems: menuItems,
    statusBreakdown,
    ordersByStatus,
    topSellingItems,
    recentOrders,
    revenueSeries,
  });
});

module.exports = { getStats };