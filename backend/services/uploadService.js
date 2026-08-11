// backend/services/uploadService.js
// Multer + Cloudinary storage structure. NOT wired into any route yet.
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, configureCloudinary } = require('../config/cloudinary');

/**
 * Builds a multer upload middleware backed by Cloudinary storage.
 * TODO: Call configureCloudinary() during app bootstrap before using this.
 * TODO: Import `upload` in menuRoutes.js for image uploads on menu items.
 */
const buildUploader = (folder = 'cafe-menu') => {
  configureCloudinary();
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });
  return multer({ storage });
};

module.exports = { buildUploader };
