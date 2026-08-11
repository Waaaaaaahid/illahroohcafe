// backend/routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, menuItemRules } = require('../middleware/validationMiddleware');

router
  .route('/')
  .get(menuController.getMenuItems)
  .post(protect, admin, menuItemRules, validate, menuController.createMenuItem);

router
  .route('/:id')
  .get(menuController.getMenuItemById)
  .put(protect, admin, menuController.updateMenuItem)
  .delete(protect, admin, menuController.deleteMenuItem);

router.patch('/:id/availability', protect, admin, menuController.updateAvailability);

module.exports = router;
