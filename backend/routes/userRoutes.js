// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router
  .route('/profile')
  .get(protect, userController.getProfile)
  .put(protect, userController.updateProfile);

router.get('/', protect, admin, userController.getUsers);
router.delete('/:id', protect, admin, userController.deleteUser);
router.put('/:id/role', protect, admin, userController.updateUserRole);

module.exports = router;
