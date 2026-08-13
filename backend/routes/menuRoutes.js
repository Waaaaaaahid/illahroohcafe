const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, menuItemRules } = require('../middleware/validationMiddleware');
const { buildUploader, isCloudinaryConfigured } = require('../services/uploadService');

// Cloudinary-backed storage when configured; in-memory otherwise (returns a
// clear 503 error so clients know image hosting isn't enabled).
const storage = isCloudinaryConfigured()
  ? buildUploader('cafe-menu').storage
  : multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

router
  .route('/')
  .get(menuController.getMenuItems)
  .post(protect, admin, menuItemRules, validate, menuController.createMenuItem);

router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      success: false,
      message:
        'Image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable menu image uploads.',
    });
  }

  return res.json({
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