const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  field: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  gpa: { type: String, default: '' },
  description: { type: String, default: '' },
  achievements: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
