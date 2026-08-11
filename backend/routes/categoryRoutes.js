// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router
  .route('/')
  .get(categoryController.getCategories)
  .post(protect, admin, categoryController.createCategory);

router
  .route('/:id')
  .put(protect, admin, categoryController.updateCategory)
  .delete(protect, admin, categoryController.deleteCategory);

module.exports = router;
