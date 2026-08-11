// backend/services/paymentService.js
// Razorpay integration structure. Secrets are only read from process.env inside functions.
const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');

/**
 * Creates a Razorpay order.
 * TODO: Call this from paymentController.createOrder with amount (in paise) and receipt id.
 */
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt }) => {
  const instance = getRazorpayInstance();
  // TODO: handle/propagate errors from instance.orders.create in the controller.
  return instance.orders.create({
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt,
  });
};

/**
 * Verifies the signature returned by Razorpay checkout after payment.
 * TODO: Call from paymentController.verifyPayment with razorpay_order_id,
 * razorpay_payment_id, razorpay_signature from req.body.
 */
const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

/**
 * Verifies the Razorpay webhook signature header.
 * TODO: Call from paymentController.webhook using the raw request body and
 * the `x-razorpay-signature` header, with RAZORPAY_WEBHOOK_SECRET.
 */
const verifyWebhookSignature = (rawBody, signatureHeader) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expectedSignature === signatureHeader;
};

module.exports = { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature };
