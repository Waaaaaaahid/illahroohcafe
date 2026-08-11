// backend/controllers/paymentController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
// TODO: const Payment = require('../models/Payment');
// TODO: const Order = require('../models/Order');
// TODO: const { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } = require('../services/paymentService');

// POST /api/payment/create-order
// TODO: Given orderId/amount from req.body, call createRazorpayOrder({amount, receipt: orderId}).
// TODO: Persist a Payment doc with status 'created' and razorpayOrderId.
const createPaymentOrder = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Create payment order');
});

// POST /api/payment/verify
// TODO: Verify signature via verifyPaymentSignature(req.body). On success, update
// Payment.status='paid' and related Order.paymentStatus='paid'.
const verifyPayment = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Verify payment');
});

// POST /api/payment/webhook
// TODO: Use raw request body + 'x-razorpay-signature' header with verifyWebhookSignature().
// TODO: Handle events like payment.captured / payment.failed and update records accordingly.
// NOTE: This route needs raw body parsing (express.raw) instead of json() - configure in server.js/routes.
const handleWebhook = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Payment webhook handler');
});

// GET /api/payment (admin)
// TODO: Payment.find().populate('order user').sort('-createdAt') with pagination.
const getPayments = asyncHandler(async (req, res) => {
  return notImplemented(res, 'List payments');
});

module.exports = { createPaymentOrder, verifyPayment, handleWebhook, getPayments };
