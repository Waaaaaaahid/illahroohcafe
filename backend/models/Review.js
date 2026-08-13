const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, item: 1 }, { unique: true });
reviewSchema.index({ item: 1, visible: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
