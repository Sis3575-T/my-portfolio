const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  date: String,
  endDate: String,
  present: { type: Boolean, default: false },
  category: { type: String, enum: ['career', 'education', 'project', 'achievement', 'other'], default: 'other' },
  description: String,
  icon: String,
  color: { type: String, default: '#6366f1' },
  featured: { type: Boolean, default: false },
  order: Number,
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Timeline', timelineSchema);
