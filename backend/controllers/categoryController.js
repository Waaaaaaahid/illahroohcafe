// backend/controllers/categoryController.js
const asyncHandler = require('../utils/asyncHandler');
const { notImplemented } = require('../utils/response');
// TODO: const Category = require('../models/Category');

// GET /api/categories
// TODO: return Category.find({ active: true }).sort('name');
const getCategories = asyncHandler(async (req, res) => {
  return notImplemented(res, 'List categories');
});

// POST /api/categories (admin)
// TODO: Generate slug from name (slugify), then Category.create({...req.body, slug}).
const createCategory = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Create category');
});

// PUT /api/categories/:id (admin)
// TODO: Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).
const updateCategory = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Update category');
});

// DELETE /api/categories/:id (admin)
// TODO: Consider soft-delete (active:false) vs hard delete; check MenuItems referencing it first.
const deleteCategory = asyncHandler(async (req, res) => {
  return notImplemented(res, 'Delete category');
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
