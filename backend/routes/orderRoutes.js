// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, orderRules } = require('../middleware/validationMiddleware');

// NOTE: order matters - '/my' must be declared before '/:id' to avoid being
// swallowed by the dynamic param route.
router.get('/my', protect, orderController.getMyOrders);

router
  .route('/')
  .post(protect, orderRules, validate, orderController.createOrder)
  .get(protect, admin, orderController.getOrders);

router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router;
