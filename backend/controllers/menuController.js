// backend/controllers/menuController.js
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { deleteCloudinaryImage } = require('../services/uploadService');
const { success, error } = require('../utils/response');

const toClientItem = (item, rating = 0) => ({ ...item.toObject(), category: item.category?.slug ?? '', image: item.image?.url ?? '', rating });
const resolveCategoryId = async (slug) => { if (!slug) return null; const category = await Category.findOne({ slug }); return category ? category._id : null; };
const normalizeImage = (image) => { if (!image) return undefined; if (typeof image === 'string') return { url: image }; return image; };

async function ratingMapFor(items) {
  const ids = items.map((item) => item._id);
  if (!ids.length) return new Map();
  const rows = await Review.aggregate([
    { $match: { item: { $in: ids }, visible: true } },
    { $group: { _id: '$item', average: { $avg: '$rating' } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), Number(row.average.toFixed(1))]));
}

const getMenuItems = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.category) { const categoryDoc = await Category.findOne({ slug: req.query.category }); if (categoryDoc) filters.category = categoryDoc._id; else if (mongoose.isValidObjectId(req.query.category)) filters.category = req.query.category; else return success(res, 200, []); }
  if (req.query.available) filters.available = req.query.available === 'true';
  if (req.query.popular) filters.popular = req.query.popular === 'true';
  if (req.query.search) filters.name = { $regex: req.query.search, $options: 'i' };
  const menuItems = await MenuItem.find(filters).populate('category');
  const ratings = await ratingMapFor(menuItems);
  return success(res, 200, menuItems.map((item) => toClientItem(item, ratings.get(String(item._id)) ?? 0)));
});

const createMenuItem = asyncHandler(async (req, res) => {
  const categoryId = await resolveCategoryId(req.body.category);
  if (!categoryId) return error(res, 400, 'Category not found');
  const menuItem = await MenuItem.create({ ...req.body, category: categoryId, image: normalizeImage(req.body.image) });
  const created = await menuItem.populate('category');
  return success(res, 201, toClientItem(created), 'Menu item created');
});

const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('category');
  if (!menuItem) return error(res, 404, 'Menu item not found');
  const ratings = await ratingMapFor([menuItem]);
  return success(res, 200, toClientItem(menuItem, ratings.get(String(menuItem._id)) ?? 0), 'Menu item retrieved');
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.category) { update.category = await resolveCategoryId(update.category); if (!update.category) return error(res, 400, 'Category not found'); }
  let previousPublicId;
  if ('image' in update) {
    if (update.image) {
      if (typeof update.image === 'string') { const existing = await MenuItem.findById(req.params.id).select('image'); if (existing?.image?.url === update.image) update.image = { url: update.image, publicId: existing.image.publicId }; else { previousPublicId = existing?.image?.publicId; update.image = { url: update.image }; } }
      else update.image = normalizeImage(update.image);
    } else { const existing = await MenuItem.findById(req.params.id).select('image'); previousPublicId = existing?.image?.publicId; update.image = null; }
  }
  const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('category');
  if (!menuItem) return error(res, 404, 'Menu item not found');
  if (previousPublicId) await deleteCloudinaryImage(previousPublicId);
  const ratings = await ratingMapFor([menuItem]);
  return success(res, 200, toClientItem(menuItem, ratings.get(String(menuItem._id)) ?? 0), 'Menu item updated');
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  if (!menuItem) return error(res, 404, 'Menu item not found');
  await MenuItem.findByIdAndDelete(req.params.id);
  if (menuItem.image?.publicId) await deleteCloudinaryImage(menuItem.image.publicId);
  return success(res, 200, { _id: req.params.id }, 'Menu item deleted');
});

const updateAvailability = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, { available: req.body.available }, { new: true, runValidators: true }).populate('category');
  if (!menuItem) return error(res, 404, 'Menu item not found');
  const ratings = await ratingMapFor([menuItem]);
  return success(res, 200, toClientItem(menuItem, ratings.get(String(menuItem._id)) ?? 0), 'Availability updated');
});

module.exports = { getMenuItems, createMenuItem, getMenuItemById, updateMenuItem, deleteMenuItem, updateAvailability };
