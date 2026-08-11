// backend/config/cloudinary.js
// Cloudinary SDK configuration. Credentials are read from env at call-time only.
// TODO: Populate CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env
const cloudinary = require('cloudinary').v2;

/**
 * Configures the cloudinary SDK singleton.
 * Call this once during app bootstrap (not done automatically in this skeleton).
 */
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

module.exports = { cloudinary, configureCloudinary };
