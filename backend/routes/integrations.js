const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'integrations' });
    if (!setting) {
      setting = await Setting.create({ key: 'integrations', value: {} });
    }
    res.json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/', protect, adminOnly, async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { key: 'integrations' },
      { value: req.body },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/test/:name', protect, adminOnly, async (req, res) => {
  try {
    const { name } = req.params;
    const integrations = await Setting.findOne({ key: 'integrations' });
    const config = integrations?.value?.[name];

    if (!config) {
      return res.status(404).json({ success: false, message: `Integration '${name}' not configured` });
    }

    let connected = false;
    let message = '';

    switch (name) {
      case 'sendgrid':
      case 'mailgun':
        connected = !!(config.apiKey || config.api_key);
        message = connected ? 'API key looks valid' : 'Missing API key';
        break;
      case 'googleAnalytics':
        connected = !!(config.measurementId || config.trackingId);
        message = connected ? 'Tracking ID looks valid' : 'Missing tracking ID';
        break;
      case 'recaptcha':
        connected = !!(config.siteKey && config.secretKey);
        message = connected ? 'Keys look valid' : 'Missing site key or secret key';
        break;
      case 'stripe':
        connected = !!(config.publishableKey && config.secretKey);
        message = connected ? 'API keys look valid' : 'Missing publishable or secret key';
        break;
      default:
        connected = Object.keys(config).length > 0;
        message = connected ? 'Configuration found' : 'No configuration';
    }

    res.json({ success: true, data: { name, connected, message } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
