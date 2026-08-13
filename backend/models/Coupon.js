const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: null, min: 0 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.pre('validate', function validateCoupon(next) {
  if (this.type === 'percentage' && this.value > 100) return next(new Error('Percentage coupon cannot exceed 100'));
  if (this.expiresAt && this.startsAt && this.expiresAt <= this.startsAt) return next(new Error('Coupon expiry must be after start date'));
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
