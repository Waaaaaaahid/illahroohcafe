const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Reviews are order-level: one review represents the complete order.
    // `item` is retained only for backwards compatibility with older review records.
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

// IMPORTANT: the old item-level unique index may still exist in an already-used
// MongoDB database. This index makes the same user unable to review another order
// containing the same item. The application rule is one customer review PER ORDER.
reviewSchema.index({ user: 1, order: 1 }, { unique: true, sparse: true });
reviewSchema.index({ visible: 1, createdAt: -1 });

// Remove the obsolete { user: 1, item: 1 } unique index left by the old
// item-level review system. This runs safely when the collection exists.
reviewSchema.post('init', async function () {
  try {
    const collection = this.collection;
    const indexes = await collection.indexes();
    const obsolete = indexes.find((index) => index.name === 'user_1_item_1');
    if (obsolete) await collection.dropIndex(obsolete.name);
  } catch (_) {
    // Index cleanup is best-effort; it must never prevent the app from starting.
  }
});

module.exports = mongoose.model('Review', reviewSchema);
