const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getLoginHistory,
  getFailedAttempts,
  getLoginStats,
  clearLoginHistory,
} = require('../controllers/securityController');
const ActivityLog = require('../models/ActivityLog');
const LoginHistory = require('../models/LoginHistory');
const ApiKey = require('../models/ApiKey');
const BlockedIP = require('../models/BlockedIP');
const User = require('../models/User');

router.use(protect);

// Existing security routes
router.get('/login-history', getLoginHistory);
router.get('/failed-attempts', getFailedAttempts);
router.get('/stats', getLoginStats);
router.delete('/login-history', adminOnly, clearLoginHistory);

// Active sessions
router.get('/active-sessions', adminOnly, async (req, res) => {
  try {
    const users = await User.find({ refreshToken: { $ne: null } })
      .select('name email lastLogin role')
      .sort({ lastLogin: -1 })
      .lean();
    const sessions = users.map((u) => ({
      userId: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      lastActive: u.lastLogin,
      device: 'Unknown',
      browser: 'Unknown',
    }));
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/revoke-session', adminOnly, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.refreshToken = null;
    await user.save();
    res.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API keys
router.post('/api-keys/generate', adminOnly, async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    const key = ApiKey.generateKey();
    const apiKey = await ApiKey.create({
      name,
      key,
      user: req.user._id,
      permissions: permissions || [],
    });
    res.status(201).json({ success: true, data: { ...apiKey.toObject(), key } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/api-keys', adminOnly, async (req, res) => {
  try {
    const keys = await ApiKey.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    const sanitized = keys.map((k) => ({ ...k, key: `${k.key.substring(0, 8)}...` }));
    res.json({ success: true, data: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api-keys/:id', adminOnly, async (req, res) => {
  try {
    const key = await ApiKey.findByIdAndDelete(req.params.id);
    if (!key) return res.status(404).json({ success: false, message: 'API key not found' });
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blocked IPs
router.get('/blocked-ips', adminOnly, async (req, res) => {
  try {
    const ips = await BlockedIP.find({ active: true })
      .populate('blockedBy', 'name email')
      .sort({ blockedAt: -1 })
      .lean();
    res.json({ success: true, data: ips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/blocked-ips', adminOnly, async (req, res) => {
  try {
    const { ip, reason, expiresAt } = req.body;
    if (!ip) return res.status(400).json({ success: false, message: 'IP is required' });
    const existing = await BlockedIP.findOne({ ip, active: true });
    if (existing) return res.status(400).json({ success: false, message: 'IP already blocked' });
    const blocked = await BlockedIP.create({
      ip,
      reason: reason || '',
      blockedBy: req.user._id,
      expiresAt: expiresAt || null,
    });
    res.status(201).json({ success: true, data: blocked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/blocked-ips/:id', adminOnly, async (req, res) => {
  try {
    const blocked = await BlockedIP.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!blocked) return res.status(404).json({ success: false, message: 'Blocked IP not found' });
    res.json({ success: true, message: 'IP unblocked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
