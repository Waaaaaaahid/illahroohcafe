// backend/controllers/menuController.js
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const { notImplemented, success, error } = require('../utils/response');

const toClientItem = (item) => ({
  ...item.toObject(),
  category: item.category?.slug ?? '',
  image: item.image?.url ?? '',
});

const resolveCategoryId = async (slug) => {
  if (!slug) return null;
  const category = await Category.findOne({ slug });
  return category ? category._id : null;
};

const normalizeImage = (image) => {
  if (!image) return undefined;
  if (typeof image === 'string') return { url: image };
  return image;
};

// GET /api/menu
const getMenuItems = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.category) {
    const categoryDoc = await Category.findOne({ slug: req.query.category });
    if (categoryDoc) {
      filters.category = categoryDoc._id;
    } else if (mongoose.isValidObjectId(req.query.category)) {
      filters.category = req.query.category;
    } else {
      return success(res, 200, []);
    }
  }
  if (req.query.available) filters.available = req.query.available === 'true';
  if (req.query.popular) filters.popular = req.query.popular === 'true';
  if (req.query.search) {
    filters.name = { $regex: req.query.search, $options: 'i' };
  }

  const menuItems = await MenuItem.find(filters).populate('category');
  const items = menuItems.map(toClientItem);

  return success(res, 200, items);
});

// POST /api/menu (admin)
const createMenuItem = asyncHandler(async (req, res) => {
  const categoryId = await resolveCategoryId(req.body.category);
  if (!categoryId) {
    return error(res, 400, 'Category not found');
  }

  const menuItem = await MenuItem.create({
    ...req.body,
    category: categoryId,
    image: normalizeImage(req.body.image),
  });

  const created = await menuItem.populate('category');
  return success(res, 201, toClientItem(created), 'Menu item created');
});

// GET /api/menu/:id
const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('category');
  if (!menuItem) {
    return error(res, 404, 'Menu item not found');
  }
  return success(res, 200, toClientItem(menuItem), 'Menu item retrieved');
});

// PUT /api/menu/:id (admin)
const updateMenuItem = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.category) {
    update.category = await resolveCategoryId(update.category);
    if (!update.category) {
      return error(res, 400, 'Category not found');
    }
  }
  if (update.image) {
    update.image = normalizeImage(update.image);
  }

  const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).populate('category');

  if (!menuItem) {
    return error(res, 404, 'Menu item not found');
  }
  return success(res, 200, toClientItem(menuItem), 'Menu item updated');
});

// DELETE /api/menu/:id (admin)
// TODO: Also delete Cloudinary image via publicId.
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
  if (!menuItem) {
    return error(res, 404, 'Menu item not found');
  }
  return success(res, 200, { _id: req.params.id }, 'Menu item deleted');
});

// PATCH /api/menu/:id/availability (admin)
const updateAvailability = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { available: req.body.available },
    { new: true, runValidators: true },
  ).populate('category');

  if (!menuItem) {
    return error(res, 404, 'Menu item not found');
  }
  return success(res, 200, toClientItem(menuItem), 'Availability updated');
});

module.exports = {
  getMenuItems,
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability,
};
