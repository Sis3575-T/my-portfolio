const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Section = require('../models/Section');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (req, action, resource, resourceId, details = {}) => {
  try {
    await ActivityLog.create({
      user: req.user?._id,
      action,
      resource,
      resourceId: resourceId?.toString(),
      details,
      ip: req.ip,
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: ['hero', 'about', 'projects', 'skills', 'experience', 'education', 'certificates', 'testimonials', 'services', 'blog', 'contact', 'gallery', 'timeline', 'faq', 'cta', 'statistics', 'custom'],
  });
});

router.use(protect, adminOnly);

// ─── Stats ───
router.get('/stats', async (req, res) => {
  try {
    const all = await Section.find();
    const total = all.length;
    const published = all.filter(s => s.status === 'published' || (s.visible !== false && !s.status)).length;
    const draft = all.filter(s => s.status === 'draft').length;
    const hidden = all.filter(s => s.status === 'hidden' || s.visible === false).length;
    const archived = all.filter(s => s.status === 'archived').length;
    const reusable = all.filter(s => s.reusable).length;
    const global = all.filter(s => s.global).length;
    const typeCounts = {};
    all.forEach(s => { typeCounts[s.type] = (typeCounts[s.type] || 0) + 1; });
    const mostUsedType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    const sorted = all.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    res.json({
      success: true,
      data: {
        total, published, draft, hidden, archived, reusable, global,
        mostUsed: mostUsedType ? `${mostUsedType[0]} (${mostUsedType[1]})` : 'N/A',
        recentlyUpdated: sorted[0]?.name || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── CRUD ───
router.route('/')
  .get(async (req, res) => {
    try {
      const { type, category, status, search, sort, order } = req.query;
      const filter = {};
      if (type) filter.type = type;
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (search) filter.name = { $regex: search, $options: 'i' };

      let sortObj = { order: 1 };
      if (sort === 'name') sortObj = { name: order === 'asc' ? 1 : -1 };
      else if (sort === 'type') sortObj = { type: order === 'asc' ? 1 : -1 };
      else if (sort === 'status') sortObj = { status: order === 'asc' ? 1 : -1 };
      else if (sort === 'createdAt') sortObj = { createdAt: order === 'asc' ? 1 : -1 };
      else if (sort === 'updatedAt') sortObj = { updatedAt: order === 'asc' ? 1 : -1 };
      else if (sort === 'usageCount') sortObj = { usageCount: order === 'asc' ? 1 : -1 };
      else if (sort === 'version') sortObj = { version: order === 'asc' ? 1 : -1 };

      const sections = await Section.find(filter).sort(sortObj);
      res.json({ success: true, data: sections });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const section = await Section.create(req.body);
      await logActivity(req, 'create', 'section', section._id, { name: section.name, type: section.type });
      res.status(201).json({ success: true, data: section });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

router.route('/:id')
  .get(async (req, res) => {
    try {
      const section = await Section.findById(req.params.id);
      if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
      res.json({ success: true, data: section });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const section = await Section.findByIdAndUpdate(
        req.params.id,
        { ...req.body, version: req.body.status === 'published' ? (req.body.version || 1) + 1 : req.body.version },
        { new: true, runValidators: true }
      );
      if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
      await logActivity(req, 'update', 'section', section._id, { name: section.name });
      res.json({ success: true, data: section });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const section = await Section.findByIdAndDelete(req.params.id);
      if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
      await logActivity(req, 'delete', 'section', section._id, { name: section.name });
      res.json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

// ─── Duplicate ───
router.post('/:id/duplicate', async (req, res) => {
  try {
    const source = await Section.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Section not found' });
    const duplicate = await Section.create({
      ...source.toObject(),
      _id: undefined,
      name: `${source.name} (Copy)`,
      order: await Section.countDocuments(),
      status: 'draft',
      version: 1,
      versions: [],
      usageCount: 0,
      views: 0,
      lastViewed: undefined,
    });
    await logActivity(req, 'duplicate', 'section', duplicate._id, { name: duplicate.name, sourceId: source._id });
    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Status ───
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'hidden', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { status, visible: status !== 'hidden' },
      { new: true }
    );
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    await logActivity(req, status === 'published' ? 'publish' : status, 'section', section._id, { name: section.name, status });
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Reorder ───
router.put('/:id/reorder', async (req, res) => {
  try {
    const { order } = req.body;
    const section = await Section.findByIdAndUpdate(req.params.id, { order }, { new: true });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Lock/Unlock ───
router.put('/:id/lock', async (req, res) => {
  try {
    const { locked } = req.body;
    const section = await Section.findByIdAndUpdate(req.params.id, { locked }, { new: true });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Versions ───
router.post('/:id/versions', async (req, res) => {
  try {
    const { data, action = 'update', description = '' } = req.body;
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const newVersion = {
      version: (section.version || 1) + 1,
      data: data || section.toObject(),
      user: req.user?._id,
      action,
      description,
      createdAt: new Date(),
    };

    section.versions.push(newVersion);
    section.version = newVersion.version;
    if (action === 'publish') section.status = 'published';
    await section.save();

    await logActivity(req, 'version_save', 'section', section._id, { version: newVersion.version, action });
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/versions', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('versions.user', 'name email');
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, data: section.versions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/restore/:versionId', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const versionEntry = section.versions.id(req.params.versionId);
    if (!versionEntry) return res.status(404).json({ success: false, message: 'Version not found' });

    const restoredData = versionEntry.data;
    if (restoredData) {
      Object.keys(restoredData).forEach(key => {
        if (key !== '_id' && key !== '__v' && key !== 'versions') {
          section[key] = restoredData[key];
        }
      });
    }
    section.version = (section.version || 1) + 1;
    section.versions.push({
      version: section.version,
      data: section.toObject(),
      user: req.user?._id,
      action: 'restore',
      description: `Restored from version ${versionEntry.version}`,
      createdAt: new Date(),
    });
    await section.save();

    await logActivity(req, 'restore', 'section', section._id, { version: section.version, restoredFrom: versionEntry.version });
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Export ───
router.get('/export/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    const exportData = section.toObject();
    delete exportData.__v;
    res.json({ success: true, data: exportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Import ───
router.post('/import', async (req, res) => {
  try {
    const { components } = req.body;
    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid import data' });
    }
    const imported = [];
    for (const comp of components) {
      const { _id, __v, versions, ...cleanData } = comp;
      const section = await Section.create({
        ...cleanData,
        order: await Section.countDocuments(),
        status: 'draft',
        version: 1,
        usageCount: 0,
        views: 0,
      });
      imported.push(section);
      await logActivity(req, 'import', 'section', section._id, { name: section.name });
    }
    res.status(201).json({ success: true, data: imported, count: imported.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Bulk Operations ───
router.post('/bulk', async (req, res) => {
  try {
    const { action, ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }

    let update = {};
    let results;

    switch (action) {
      case 'publish':
        update = { status: 'published', visible: true };
        break;
      case 'unpublish':
        update = { status: 'draft', visible: false };
        break;
      case 'archive':
        update = { status: 'archived', visible: false };
        break;
      case 'restore':
        update = { status: 'draft', visible: true };
        break;
      case 'duplicate':
        results = [];
        for (const id of ids) {
          const source = await Section.findById(id);
          if (source) {
            const dup = await Section.create({
              ...source.toObject(),
              _id: undefined,
              name: `${source.name} (Copy)`,
              order: await Section.countDocuments(),
              status: 'draft',
              version: 1,
              versions: [],
              usageCount: 0,
              views: 0,
            });
            results.push(dup);
          }
        }
        return res.json({ success: true, data: results, count: results.length });
      case 'delete':
        results = await Section.deleteMany({ _id: { $in: ids } });
        await logActivity(req, 'bulk_delete', 'section', null, { ids, count: results.deletedCount });
        return res.json({ success: true, data: results, deletedCount: results.deletedCount });
      case 'export':
        results = await Section.find({ _id: { $in: ids } });
        return res.json({ success: true, data: results });
      default:
        return res.status(400).json({ success: false, message: `Unknown action: ${action}` });
    }

    results = await Section.updateMany({ _id: { $in: ids } }, update, { new: true });
    await logActivity(req, `bulk_${action}`, 'section', null, { ids, count: results.modifiedCount });
    res.json({ success: true, data: results, modifiedCount: results.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
