const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Page = require('../models/Page');
const Version = require('../models/Version');
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

const saveVersion = async (resourceType, resourceId, data, action, user, description = '') => {
  try {
    const latest = await Version.findOne({ resourceType, resourceId }).sort({ version: -1 });
    const version = (latest?.version || 0) + 1;
    await Version.create({ resourceType, resourceId, data, version, action, user: user?._id, description });
  } catch (err) {
    console.error('Version save error:', err.message);
  }
};

// Public routes
router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const sections = (page.sections || []).filter(s => s.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, data: { ...page.toObject(), sections } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/home', async (req, res) => {
  try {
    const page = await Page.findOne({ isHome: true, status: 'published' });
    if (!page) return res.json({ success: true, data: null });
    const sections = (page.sections || []).filter(s => s.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, data: { ...page.toObject(), sections } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Auth required for all routes below
router.use(protect);

router.route('/')
  .get(async (req, res) => {
    try {
      const { search, status } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (search) filter.name = { $regex: search, $options: 'i' };
      const pages = await Page.find(filter).sort('order').populate('createdBy', 'name email');
      res.json({ success: true, data: pages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const { name, slug, description, insertAfter } = req.body;
      let order = 0;
      const pageCount = await Page.countDocuments();
      order = pageCount;
      if (insertAfter) {
        const afterPage = await Page.findOne({ slug: insertAfter });
        if (afterPage) {
          order = afterPage.order + 1;
          await Page.updateMany({ order: { $gte: order } }, { $inc: { order: 1 } });
        }
      }
      const page = await Page.create({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description,
        order,
        createdBy: req.user._id,
      });
      await saveVersion('page', page._id, page.toObject(), 'create', req.user);
      await logActivity(req, 'create', 'page', page._id, { name: page.name });
      res.status(201).json({ success: true, data: page });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

router.put('/reorder', async (req, res) => {
  try {
    const { items } = req.body;
    const ops = items.map(item => ({
      updateOne: { filter: { _id: item._id }, update: { order: item.order } },
    }));
    await Page.bulkWrite(ops);
    res.json({ success: true, message: 'Pages reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.route('/:id')
  .get(async (req, res) => {
    try {
      const page = await Page.findById(req.params.id).populate('createdBy', 'name email');
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      res.json({ success: true, data: page });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const oldPage = await Page.findById(req.params.id);
      if (!oldPage) return res.status(404).json({ success: false, message: 'Page not found' });
      const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      await saveVersion('page', page._id, oldPage.toObject(), 'update', req.user, req.body.description || '');
      await logActivity(req, 'update', 'page', page._id, { name: page.name });
      res.json({ success: true, data: page });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const page = await Page.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      await saveVersion('page', page._id, page.toObject(), 'archive', req.user);
      await logActivity(req, 'archive', 'page', page._id, { name: page.name });
      res.json({ success: true, message: 'Page archived successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

router.post('/:id/duplicate', async (req, res) => {
  try {
    const source = await Page.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Page not found' });
    const pageCount = await Page.countDocuments();
    const duplicate = await Page.create({
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Date.now()}`,
      description: source.description,
      template: source.template,
      status: 'draft',
      order: pageCount,
      components: (source.components || []).map(c => ({ ...c.toObject(), _id: undefined })),
      sections: (source.sections || []).map(s => ({ ...s, _id: undefined })),
      seo: source.seo || {},
      createdBy: req.user._id,
    });
    await logActivity(req, 'duplicate', 'page', duplicate._id, { name: duplicate.name, source: source.name });
    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/publish', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    page.status = 'published';
    page.publishedAt = new Date();
    await page.save();
    await saveVersion('page', page._id, page.toObject(), 'publish', req.user);
    await logActivity(req, 'publish', 'page', page._id, { name: page.name });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/archive', async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    await saveVersion('page', page._id, page.toObject(), 'archive', req.user);
    await logActivity(req, 'archive', 'page', page._id, { name: page.name });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/restore', async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, { status: 'draft' }, { new: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    await saveVersion('page', page._id, page.toObject(), 'restore', req.user);
    await logActivity(req, 'restore', 'page', page._id, { name: page.name });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/sections', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const { sections } = req.body;
    page.sections = sections;
    await page.save();
    await logActivity(req, 'update-sections', 'page', page._id, { name: page.name });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/versions', async (req, res) => {
  try {
    const versions = await Version.find({ resourceType: 'page', resourceId: req.params.id })
      .sort({ version: -1 })
      .populate('user', 'name email');
    res.json({ success: true, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/versions', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    await saveVersion('page', page._id, page.toObject(), 'update', req.user, req.body.description || 'Manual version');
    await logActivity(req, 'create-version', 'page', page._id, { name: page.name });
    res.json({ success: true, message: 'Version created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/restore/:versionId', async (req, res) => {
  try {
    const version = await Version.findById(req.params.versionId);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });
    if (version.resourceId.toString() !== req.params.id) {
      return res.status(400).json({ success: false, message: 'Version does not belong to this page' });
    }
    const oldData = version.data;
    const page = await Page.findByIdAndUpdate(req.params.id, oldData, { new: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    await saveVersion('page', page._id, page.toObject(), 'restore', req.user, `Restored from version ${version.version}`);
    await logActivity(req, 'restore-version', 'page', page._id, { name: page.name, version: version.version });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Component routes
router.get('/:pageId/components', async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: (page.components || []).sort((a, b) => a.order - b.order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:pageId/components', async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const component = {
      type: req.body.type || 'custom',
      title: req.body.title || '',
      subtitle: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      content: {},
      styles: {},
      advanced: {},
      isVisible: true,
      order: (page.components || []).length,
    };
    page.components.push(component);
    await page.save();
    const saved = page.components[page.components.length - 1];
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:pageId/components/reorder', async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const { items } = req.body;
    for (const item of items) {
      const comp = page.components.id(item._id);
      if (comp) comp.order = item.order;
    }
    await page.save();
    res.json({ success: true, message: 'Components reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.route('/:pageId/components/:componentId')
  .put(async (req, res) => {
    try {
      const page = await Page.findById(req.params.pageId);
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      const component = page.components.id(req.params.componentId);
      if (!component) return res.status(404).json({ success: false, message: 'Component not found' });
      Object.assign(component, req.body);
      await page.save();
      res.json({ success: true, data: component });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const page = await Page.findById(req.params.pageId);
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      page.components = page.components.filter(c => c._id.toString() !== req.params.componentId);
      await page.save();
      res.json({ success: true, message: 'Component deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

router.post('/:pageId/components/:componentId/duplicate', async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const source = page.components.id(req.params.componentId);
    if (!source) return res.status(404).json({ success: false, message: 'Component not found' });
    const duplicate = { ...source.toObject(), _id: undefined, title: `${source.title} (Copy)`, order: (page.components || []).length };
    page.components.push(duplicate);
    await page.save();
    const saved = page.components[page.components.length - 1];
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:pageId/components/:componentId/toggle', async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const component = page.components.id(req.params.componentId);
    if (!component) return res.status(404).json({ success: false, message: 'Component not found' });
    component.isVisible = !component.isVisible;
    await page.save();
    res.json({ success: true, data: component });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:pageId/components/:componentId/move', async (req, res) => {
  try {
    const { targetPageId } = req.body;
    const sourcePage = await Page.findById(req.params.pageId);
    if (!sourcePage) return res.status(404).json({ success: false, message: 'Source page not found' });
    const component = sourcePage.components.id(req.params.componentId);
    if (!component) return res.status(404).json({ success: false, message: 'Component not found' });
    const compData = { ...component.toObject() };
    sourcePage.components = sourcePage.components.filter(c => c._id.toString() !== req.params.componentId);
    await sourcePage.save();
    const targetPage = await Page.findById(targetPageId);
    if (!targetPage) return res.status(404).json({ success: false, message: 'Target page not found' });
    delete compData._id;
    compData.order = (targetPage.components || []).length;
    targetPage.components.push(compData);
    await targetPage.save();
    res.json({ success: true, message: 'Component moved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
