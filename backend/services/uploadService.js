// backend/services/uploadService.js
// Multer + Cloudinary storage for menu images. Enabled only when the
// CLOUDINARY_* env vars are configured in the hosting environment.
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, configureCloudinary } = require('../config/cloudinary');

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

/**
 * Builds a multer storage engine backed by Cloudinary.
 * Throws a descriptive error when Cloudinary is not configured.
 */
const buildUploader = (folder = 'cafe-menu') => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    );
  }

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

module.exports = { buildUploader, isCloudinaryConfigured };