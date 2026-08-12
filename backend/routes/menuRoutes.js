const express = require('express');
const multer = require('multer');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, menuItemRules } = require('../middleware/validationMiddleware');
const { buildUploader } = require('../services/uploadService');

const upload = buildUploader('illahroohcafe/menu');

router
  .route('/')
  .get(menuController.getMenuItems)
  .post(protect, admin, menuItemRules, validate, menuController.createMenuItem);

router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename,
  });
});

router
  .route('/:id')
  .get(menuController.getMenuItemById)
  .put(protect, admin, menuController.updateMenuItem)
  .delete(protect, admin, menuController.deleteMenuItem);

router.patch('/:id/availability', protect, admin, menuController.updateAvailability);

module.exports = router;
