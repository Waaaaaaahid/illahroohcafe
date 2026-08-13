// backend/controllers/categoryController.js
const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');
const { success, error } = require('../utils/response');

// GET /api/categories - public/customer categories only
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ sortOrder: 1, name: 1 });
  return success(res, 200, categories);
});

// GET /api/categories/admin - all categories, including inactive (admin)
const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 });
  return success(res, 200, categories);
});

// POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, active, sortOrder } = req.body;
  const slug = String(req.body.slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const existing = await Category.findOne({ slug });
  if (existing) {
    return error(res, 400, 'Category slug already exists');
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    active: active !== undefined ? active : true,
    sortOrder: sortOrder !== undefined ? sortOrder : 0,
  });
  return success(res, 201, category, 'Category created');
});

// PUT /api/categories/:id (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return error(res, 404, 'Category not found');
  }
  return success(res, 200, category, 'Category updated');
});

// DELETE /api/categories/:id (admin) - permanent delete only when explicitly requested
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return error(res, 404, 'Category not found');
  }
  return success(res, 200, { _id: req.params.id }, 'Category deleted');
});

module.exports = { getCategories, getAdminCategories, createCategory, updateCategory, deleteCategory };
