// backend/config/razorpay.js
// Razorpay SDK instance factory. Keys are read lazily from process.env.
// TODO: Populate RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env
const Razorpay = require('razorpay');

let razorpayInstance = null;

/**
 * Lazily creates (or returns cached) Razorpay instance.
 * Kept lazy so importing this file never throws when env vars are empty.
 */
const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
