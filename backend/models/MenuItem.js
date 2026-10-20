// backend/models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },
    sku: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, default: '' },
    stock: { type: Number, min: 0, default: 0 },
    badge: { type: String, trim: true, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    available: { type: Boolean, default: true },
    popular: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
