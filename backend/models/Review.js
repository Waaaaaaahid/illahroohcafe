const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Customer reviews are order-level: one review represents the complete order,
    // not individual menu items. `item` is retained only for backwards compatibility.
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, required: true },
    authorName: { type: String, trim: true, maxlength: 80, required: true },
    authorRole: { type: String, trim: true, maxlength: 80 },
    source: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    visible: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Customer reviews are submitted once for the whole completed order.
reviewSchema.index({ user: 1, order: 1 }, { unique: true, sparse: true });
reviewSchema.index({ visible: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
