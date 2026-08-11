// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
