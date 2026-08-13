const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const Coupon = require('../models/Coupon');

function calculateDiscount(coupon, subtotal) {
  let discount = coupon.type === 'percentage' ? subtotal * (coupon.value / 100) : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  return Number(Math.min(discount, subtotal).toFixed(2));
}

const validateCoupon = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const subtotal = Number(req.body.subtotal);
  if (!code || !Number.isFinite(subtotal) || subtotal < 0) return error(res, 400, 'Valid coupon code and subtotal are required');
  const coupon = await Coupon.findOne({ code, active: true });
  if (!coupon) return error(res, 404, 'Invalid or inactive coupon');
  const now = new Date();
  if (coupon.startsAt > now || (coupon.expiresAt && coupon.expiresAt < now)) return error(res, 400, 'This coupon is not currently valid');
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return error(res, 400, 'This coupon has reached its usage limit');
  if (subtotal < coupon.minOrderAmount) return error(res, 400, `Minimum order amount is ₹${coupon.minOrderAmount}`);
  const discount = calculateDiscount(coupon, subtotal);
  return success(res, 200, { code: coupon.code, discount, subtotal, totalAfterDiscount: Number((subtotal - discount).toFixed(2)) }, 'Coupon applied');
});

const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  return success(res, 200, coupons, 'Coupons retrieved');
});

const createCoupon = asyncHandler(async (req, res) => {
  const payload = { ...req.body, code: String(req.body.code || '').trim().toUpperCase() };
  const coupon = await Coupon.create(payload);
  return success(res, 201, coupon, 'Coupon created');
});

const updateCoupon = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.code) payload.code = String(payload.code).trim().toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!coupon) return error(res, 404, 'Coupon not found');
  return success(res, 200, coupon, 'Coupon updated');
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return error(res, 404, 'Coupon not found');
  return success(res, 200, null, 'Coupon deleted');
});

module.exports = { validateCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon };
