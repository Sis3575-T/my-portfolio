const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: '' },
  features: [{ type: String, trim: true }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

serviceSchema.index({ order: 1 });

module.exports = mongoose.model('Service', serviceSchema);
