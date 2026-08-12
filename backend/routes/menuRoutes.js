// backend/routes/menuRoutes.js
const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, menuItemRules } = require('../middleware/validationMiddleware');

const storage = multer.memoryStorage();

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

// POST /api/menu/upload (admin) — must be declared before '/:id'.
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided',
    });
  }

  const ext = path.extname(req.file.originalname || '').toLowerCase();
  const publicId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return res.json({
    success: true,
    message: 'Image received successfully',
    filename: `${publicId}${ext}`,
    publicId,
  });
});

router
  .route('/:id')
  .get(menuController.getMenuItemById)
  .put(protect, admin, menuController.updateMenuItem)
  .delete(protect, admin, menuController.deleteMenuItem);

router.patch('/:id/availability', protect, admin, menuController.updateAvailability);

module.exports = router;