const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  validate,
  orderRules,
} = require('../middleware/validationMiddleware');

// Customer orders
router.get(
  '/my',
  protect,
  orderController.getMyOrders
);

// 🔥 Admin realtime SSE
// IMPORTANT: this MUST come before /:id
router.get(
  '/admin/events',
  protect,
  admin,
  orderController.subscribeToAdminOrders
);

// Create order
router.post(
  '/',
  protect,
  orderRules,
  validate,
  orderController.createOrder
);

// Admin get all orders
router.get(
  '/',
  protect,
  admin,
  orderController.getOrders
);

// Single order
router.get(
  '/:id',
  orderController.getOrderById
);

// Admin update order status
router.put(
  '/:id/status',
  protect,
  admin,
  orderController.updateOrderStatus
);

// Customer realtime tracking
router.get(
  '/:id/events',
  orderController.subscribeToOrder
);

module.exports = router;