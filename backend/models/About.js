const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  biography: { type: String, required: true },
  careerJourney: { type: String, default: '' },
  keyAchievements: [{ type: String, trim: true }],
  stats: [{
    label: { type: String, required: true },
    value: { type: String, required: true },
    suffix: { type: String, default: '' },
  }],
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
