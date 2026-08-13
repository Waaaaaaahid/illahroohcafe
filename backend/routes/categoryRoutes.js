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

// Admin needs inactive categories too so toggling OFF hides them from customers
// without removing them from the admin panel.
router.get('/admin', protect, admin, categoryController.getAdminCategories);

router
  .route('/:id')
  .put(protect, admin, categoryController.updateCategory)
  .delete(protect, admin, categoryController.deleteCategory);

module.exports = router;
