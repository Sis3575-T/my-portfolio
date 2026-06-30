const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['hero', 'about', 'projects', 'skills', 'experience', 'education', 'certificates', 'testimonials', 'services', 'blog', 'contact', 'gallery', 'timeline', 'faq', 'cta', 'statistics', 'custom'],
    required: true,
  },
  slug: String,
  description: String,
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  style: { type: mongoose.Schema.Types.Mixed, default: {} },
  layout: { type: mongoose.Schema.Types.Mixed, default: {} },
  media: { type: mongoose.Schema.Types.Mixed, default: {} },
  animation: { type: mongoose.Schema.Types.Mixed, default: {} },
  responsive: { type: mongoose.Schema.Types.Mixed, default: {} },
  seo: { type: mongoose.Schema.Types.Mixed, default: {} },
  typography: { type: mongoose.Schema.Types.Mixed, default: {} },
  visibility: { type: mongoose.Schema.Types.Mixed, default: { desktop: true, tablet: true, mobile: true } },
  permissions: { type: mongoose.Schema.Types.Mixed, default: { roleVisibility: 'All', passwordProtect: false, password: '' } },
  analytics: { type: mongoose.Schema.Types.Mixed, default: { clickTracking: false, scrollTracking: false } },
  advanced: { type: mongoose.Schema.Types.Mixed, default: { customCSS: '', customID: '', customClasses: '', customAttributes: '', renderAs: 'div', wrapper: '' } },
  status: { type: String, enum: ['draft', 'published', 'hidden', 'archived'], default: 'draft' },
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  reusable: { type: Boolean, default: false },
  global: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  category: String,
  tags: [String],

  // Versioning
  version: { type: Number, default: 1 },
  versions: [{
    version: Number,
    data: mongoose.Schema.Types.Mixed,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['create', 'update', 'publish', 'archive', 'restore'], default: 'update' },
    description: String,
    createdAt: { type: Date, default: Date.now },
  }],

  // Analytics
  usageCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  lastViewed: Date,
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
