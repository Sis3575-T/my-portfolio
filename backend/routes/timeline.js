const express = require('express');
const router = express.Router();
const Timeline = require('../models/Timeline');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, featured, limit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured) filter.featured = featured === 'true';
    let query = Timeline.find(filter).sort({ order: 1, date: -1 });
    if (limit) query = query.limit(parseInt(limit));
    const events = await query.lean();
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const event = await Timeline.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Timeline.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Timeline event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Timeline.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Timeline event not found' });
    res.json({ success: true, message: 'Timeline event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
