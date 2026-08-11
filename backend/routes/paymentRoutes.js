// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/create-order', paymentController.createPaymentOrder);
router.post('/verify', paymentController.verifyPayment);
// TODO: In server.js, mount this specific route with express.raw({type: 'application/json'})
// BEFORE the global express.json() middleware, since Razorpay webhook signature
// verification requires the raw request body.
router.post('/webhook', paymentController.handleWebhook);
router.get('/', protect, admin, paymentController.getPayments);

module.exports = router;
