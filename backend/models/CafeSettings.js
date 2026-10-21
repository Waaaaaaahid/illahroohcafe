// backend/models/CafeSettings.js
const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    hours: { type: String, required: true },
  },
  { _id: false }
);

const announcementItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, required: true, trim: true, maxlength: 180 },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0, min: 0 },
    durationSeconds: { type: Number, default: 4, min: 2, max: 30 },
    animation: { type: String, enum: ['fade', 'slide', 'static'], default: 'fade' },
    backgroundColor: { type: String, default: '#22231f', match: /^#[0-9a-fA-F]{6}$/ },
    textColor: { type: String, default: '#ffffff', match: /^#[0-9a-fA-F]{6}$/ },
    link: { type: String, default: '', maxlength: 500 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { _id: false }
);

const announcementBarSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    defaultDurationSeconds: { type: Number, default: 4, min: 2, max: 30 },
    animation: { type: String, enum: ['fade', 'slide', 'static'], default: 'fade' },
    announcements: {
      type: [announcementItemSchema],
      default: () => [
        { id: 'brand-message', text: 'A LITTLE SOMETHING BETTER, EVERY DAY ✳ SHOP SMART WITH ZRCART', order: 0, durationSeconds: 4, animation: 'fade', backgroundColor: '#22231f', textColor: '#ffffff', enabled: true },
        { id: 'sale-message', text: 'DISCOVER SOMETHING GOOD — SHOP THE LATEST FINDS', order: 1, durationSeconds: 4, animation: 'slide', backgroundColor: '#e9ede3', textColor: '#252720', enabled: true },
        { id: 'shipping-message', text: 'USE THE LATEST OFFERS AT CHECKOUT', order: 2, durationSeconds: 4, animation: 'fade', backgroundColor: '#22231f', textColor: '#ffffff', enabled: true },
      ],
    },
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
    announcementBar: { type: announcementBarSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CafeSettings', cafeSettingsSchema);
