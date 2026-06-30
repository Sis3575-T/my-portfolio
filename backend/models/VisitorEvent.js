const mongoose = require('mongoose');

const visitorEventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  visitorId: { type: String, required: true, index: true },

  eventType: { type: String, enum: [
    'page_view', 'page_exit',
    'click', 'project_click', 'github_click', 'live_demo_click',
    'resume_download', 'contact_submit',
    'scroll_depth', 'theme_change', 'language_change',
    'search', 'cta_click'
  ], required: true },

  url: { type: String },
  pageTitle: { type: String },
  element: { type: String },
  value: { type: String },

  metadata: { type: mongoose.Schema.Types.Mixed },

  timestamp: { type: Date, default: Date.now },
});

visitorEventSchema.index({ sessionId: 1, timestamp: 1 });
visitorEventSchema.index({ eventType: 1, createdAt: -1 });
visitorEventSchema.index({ timestamp: -1 });

module.exports = mongoose.model('VisitorEvent', visitorEventSchema);
