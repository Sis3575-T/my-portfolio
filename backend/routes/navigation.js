const express = require('express');
const router = express.Router();
const Navigation = require('../models/Navigation');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const menus = await Navigation.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const menu = await Navigation.create(req.body);
    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const menu = await Navigation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!menu) return res.status(404).json({ success: false, message: 'Navigation menu not found' });
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const menu = await Navigation.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Navigation menu not found' });
    res.json({ success: true, message: 'Navigation menu deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
