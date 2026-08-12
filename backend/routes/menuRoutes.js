// backend/routes/menuRoutes.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validate, menuItemRules } = require('../middleware/validationMiddleware');

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
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

// POST /api/menu/upload (admin) — must be declared before '/:id'.
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const publicId = path.basename(req.file.filename, path.extname(req.file.filename));
  return res.json({ success: true, url, publicId });
});

router
  .route('/:id')
  .get(menuController.getMenuItemById)
  .put(protect, admin, menuController.updateMenuItem)
  .delete(protect, admin, menuController.deleteMenuItem);

router.patch('/:id/availability', protect, admin, menuController.updateAvailability);

module.exports = router;
