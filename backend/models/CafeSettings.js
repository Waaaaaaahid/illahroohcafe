// backend/models/CafeSettings.js
const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    hours: { type: String, required: true },
  },
  { _id: false }
);

const cafeSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    openingHours: { type: [openingHourSchema], default: [] },
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String },
      twitter: { type: String },
    },
    deliveryFee: { type: Number, default: 0 },
    taxPercentage: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    whatsappNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CafeSettings', cafeSettingsSchema);
