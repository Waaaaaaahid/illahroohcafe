// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/create-order', paymentController.createPaymentOrder);
router.post('/verify', paymentController.verifyPayment);
// NOTE: server.js mounts express.raw() for /api/payment/webhook BEFORE the
// global express.json(), so req.body here is the raw Buffer used for
// Razorpay signature verification.
router.post('/webhook', paymentController.handleWebhook);
router.get('/', protect, admin, paymentController.getPayments);

module.exports = router;
