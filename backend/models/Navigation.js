const mongoose = require('mongoose');

const navItemSchema = new mongoose.Schema({
  label: String,
  url: String,
  type: { type: String, enum: ['link', 'dropdown', 'megamenu'], default: 'link' },
  icon: String,
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  order: Number,
  target: { type: String, default: '_self' },
  cssClass: String,
  visible: { type: Boolean, default: true },
  roles: [String],
  children: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false });

const navigationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [navItemSchema],
  active: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

navigationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Navigation', navigationSchema);
