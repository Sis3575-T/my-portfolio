const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  resourceType: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  version: { type: Number, required: true },
  diff: { type: mongoose.Schema.Types.Mixed },
  action: { type: String, enum: ['create', 'update', 'publish', 'archive', 'restore'], default: 'update' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, default: '' },
}, { timestamps: true });

versionSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
versionSchema.index({ resourceType: 1, resourceId: 1, version: 1 });

module.exports = mongoose.model('Version', versionSchema);
