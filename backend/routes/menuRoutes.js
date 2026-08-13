const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { body } = require('express-validator');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, menuItemRules } = require('../middleware/validationMiddleware');
const { buildUploader, isCloudinaryConfigured } = require('../services/uploadService');

// Upload storage, chosen in order of preference:
// 1. Cloudinary (when CLOUDINARY_* env vars are set) — used in production.
// 2. Local disk (development) — files land in backend/uploads/menu and are
//    served statically at /uploads. Persists as long as the backend runs.
const uploadsDir = path.join(__dirname, '..', 'uploads', 'menu');

const storage = isCloudinaryConfigured()
  ? buildUploader('cafe-menu').storage
  : process.env.NODE_ENV === 'production'
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, cb) => {
          fs.mkdirSync(uploadsDir, { recursive: true });
          cb(null, uploadsDir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      });

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

  if (isCloudinaryConfigured()) {
    return res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
    });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({
      success: false,
      message:
        'Image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable menu image uploads.',
    });
  }

  // Development fallback: the file was saved to backend/uploads/menu.
  return res.json({
    success: true,
    message: 'Image uploaded successfully',
    url: `/uploads/menu/${req.file.filename}`,
    publicId: `local:${req.file.filename}`,
  });
});

router
  .route('/:id')
  .get(menuController.getMenuItemById)
  .put(protect, admin, menuItemRules, validate, menuController.updateMenuItem)
  .delete(protect, admin, menuController.deleteMenuItem);

router.patch(
  '/:id/availability',
  protect,
  admin,
  body('available').isBoolean().withMessage('available must be a boolean'),
  validate,
  menuController.updateAvailability
);

module.exports = router;