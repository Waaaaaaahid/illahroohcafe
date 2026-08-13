const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/response');
const Review = require('../models/Review');
const Order = require('../models/Order');

const getItemReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ item: req.params.itemId, visible: true })
    .populate('user', 'name')
    .sort('-createdAt');
  const summary = reviews.reduce((acc, review) => {
    acc.count += 1;
    acc.total += review.rating;
    return acc;
  }, { count: 0, total: 0 });
  return success(res, 200, {
    reviews,
    count: summary.count,
    average: summary.count ? Number((summary.total / summary.count).toFixed(1)) : 0,
  }, 'Reviews retrieved');
});

const createReview = asyncHandler(async (req, res) => {
  const { orderId, itemId, rating, comment } = req.body;
  if (!orderId || !itemId || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    return error(res, 400, 'Order, item and a rating from 1 to 5 are required');
  }
  const order = await Order.findOne({ _id: orderId, user: req.user.id, orderStatus: 'Completed' });
  if (!order) return error(res, 400, 'You can review an item only after your order is completed');
  const orderedItem = order.items.find((item) => String(item.item) === String(itemId));
  if (!orderedItem) return error(res, 400, 'This item was not part of the order');
  const existing = await Review.findOne({ user: req.user.id, item: itemId });
  if (existing) return error(res, 409, 'You have already reviewed this item');
  const review = await Review.create({ user: req.user.id, item: itemId, order: orderId, rating: Number(rating), comment });
  return success(res, 201, review, 'Review submitted');
});

const getAdminReviews = asyncHandler(async (_req, res) => {
  const reviews = await Review.find().populate('user', 'name email').populate('item', 'name').populate('order', 'code').sort('-createdAt');
  return success(res, 200, reviews, 'Reviews retrieved');
});

const updateReviewVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { visible: Boolean(req.body.visible) }, { new: true, runValidators: true });
  if (!review) return error(res, 404, 'Review not found');
  return success(res, 200, review, 'Review visibility updated');
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return error(res, 404, 'Review not found');
  return success(res, 200, null, 'Review deleted');
});

module.exports = { getItemReviews, createReview, getAdminReviews, updateReviewVisibility, deleteReview };
