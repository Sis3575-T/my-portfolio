const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  images: [{ type: String }],
  technologies: [{ type: String, trim: true }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  category: { type: String, default: 'Full Stack' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

projectSchema.index({ featured: -1, order: 1 });
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });

module.exports = mongoose.model('Project', projectSchema);
