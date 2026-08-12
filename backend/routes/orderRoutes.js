const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, orderRules } = require('../middleware/validationMiddleware');

router.get('/my', protect, orderController.getMyOrders);
router.get('/admin/events', protect, admin, orderController.subscribeToAdminOrders);
router.post('/', protect, orderRules, validate, orderController.createOrder);
router.get('/', protect, admin, orderController.getOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);
router.get('/:id/events', protect, orderController.subscribeToOrder);

module.exports = router;
