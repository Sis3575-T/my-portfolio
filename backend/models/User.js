const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['superadmin', 'admin', 'editor', 'viewer'], default: 'admin' },

  // Profile
  avatar: { type: String, default: '' },
  username: { type: String, unique: true, sparse: true, trim: true },
  displayName: String,
  firstName: String,
  lastName: String,
  bio: { type: String, maxlength: 500 },
  jobTitle: String,
  company: String,
  website: String,
  phone: String,
  altPhone: String,
  country: String,
  state: String,
  city: String,
  postalCode: String,
  address: String,
  secondaryEmail: String,

  // Social links
  social: {
    linkedin: String,
    github: String,
    twitter: String,
    facebook: String,
    instagram: String,
    youtube: String,
    telegram: String,
    whatsapp: String,
    portfolio: String,
  },

  // Preferences
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    accentColor: { type: String, default: '#6366f1' },
    sidebarStyle: { type: String, enum: ['default', 'collapsed', 'icons'], default: 'default' },
    tableDensity: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
    animations: { type: Boolean, default: true },
    defaultDashboard: { type: String, default: 'dashboard' },
    defaultLandingPage: { type: String, default: 'dashboard' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    timeFormat: { type: String, default: '12h' },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' },
    itemsPerPage: { type: Number, default: 25 },
  },

  // Notifications
  notifications: {
    email: {
      securityAlerts: { type: Boolean, default: true },
      visitorAlerts: { type: Boolean, default: false },
      contactFormAlerts: { type: Boolean, default: true },
      backupAlerts: { type: Boolean, default: true },
      deploymentAlerts: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false },
      monthlyReport: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
    browser: {
      securityAlerts: { type: Boolean, default: true },
      visitorAlerts: { type: Boolean, default: false },
      contactFormAlerts: { type: Boolean, default: true },
      backupAlerts: { type: Boolean, default: false },
      deploymentAlerts: { type: Boolean, default: false },
      systemAlerts: { type: Boolean, default: true },
    },
    sound: { type: Boolean, default: false },
    desktop: { type: Boolean, default: true },
  },

  // Security
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  recoveryCodes: [String],
  recoveryEmail: String,
  loginAlerts: { type: Boolean, default: true },
  securityQuestions: [{
    question: String,
    answer: String,
  }],
  passwordChangedAt: Date,
  passwordHistory: [String],

  // Connected accounts
  connectedAccounts: {
    github: { connected: Boolean, email: String, username: String },
    linkedin: { connected: Boolean, email: String, url: String },
    google: { connected: Boolean, email: String },
    cloudinary: { cloudName: String, apiKey: String, apiSecret: String },
  },

  // Sessions
  sessions: [{
    token: String,
    device: String,
    browser: String,
    os: String,
    ip: String,
    country: String,
    city: String,
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    isCurrent: { type: Boolean, default: false },
  }],

  // Account status
  isActive: { type: Boolean, default: true },
  deactivatedAt: Date,
  deletedAt: Date,

  // Auth
  refreshToken: { type: String, default: null },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },

  // Timestamps
  storageUsed: { type: Number, default: 0 },
  profileCompletion: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordHistory;
  delete obj.twoFactorSecret;
  delete obj.securityQuestions;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
