import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';
import SectionEditor from '../components/SectionEditor';
import { sectionTypes } from '../lib/sectionDefaults';
import sectionDefaults from '../lib/sectionDefaults';

const defaultPageData = {
  title: '',
  slug: '',
  status: 'draft',
  template: '',
  parent: '',
  publishDate: '',
  unpublishDate: '',
  metaTitle: '',
  metaDescription: '',
  sections: [],
};

export default function PageBuilder() {
  const toast = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState(null);
  const [form, setForm] = useState({ ...defaultPageData });
  const [sections, setSections] = useState([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [deletedPages, setDeletedPages] = useState([]);
  const [versionHistory, setVersionHistory] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '' });

  useEffect(() => {
    fetchPages();
    fetchTemplates();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pages');
      const pg = data.data || [];
      setPages(pg);
      if (pg.length > 0 && !activePage) {
        selectPage(pg[0]);
      }
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/templates?type=page');
    } catch {}
  };

  const selectPage = (page) => {
    setActivePage(page);
    setForm({
      title: page.title || '',
      slug: page.slug || '',
      status: page.status || 'draft',
      template: page.template || '',
      parent: page.parent || '',
      publishDate: page.publishDate || '',
      unpublishDate: page.unpublishDate || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
    });
    loadSections(page._id);
    loadVersions(page._id);
  };

  const loadSections = async (pageId) => {
    try {
      const { data } = await api.get(`/pages/${pageId}/components`);
      const comps = data.data || [];
      setSections(comps.map((c, i) => ({
        id: c._id || `sec_${Date.now()}_${i}`,
        _id: c._id,
        type: c.type || 'custom',
        name: c.name || c.data?.title || c.type || 'Section',
        visible: c.isVisible !== false,
        published: c.status === 'published' || c.published !== false,
        data: c.data || {},
        styles: c.styles || {},
        style: c.style || {},
        content: c.content || {},
        layout: c.layout || {},
        media: c.media || {},
        seo: c.seo || {},
        animation: c.animation || {},
        responsive: c.responsive || {},
        permissions: c.permissions || {},
        analytics: c.analytics || {},
        advanced: c.advanced || {},
        versionHistory: c.versionHistory || [],
        order: c.order ?? i,
      })));
    } catch {
      setSections([]);
    }
  };

  const loadVersions = async (pageId) => {
    try {
      const { data } = await api.get(`/pages/${pageId}`);
      const versions = data.data?.versions || data.versions || [];
      setVersionHistory(versions);
    } catch {
      setVersionHistory([]);
    }
  };

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFormChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'title' && !activePage ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleSave = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const pageData = {
        ...form,
        slug: form.slug || generateSlug(form.title),
        status: status || form.status,
        sections: sections.map((s, i) => ({
          type: s.type, name: s.name, data: s.data, styles: s.styles,
          isVisible: s.visible, order: i, status: s.published ? 'published' : 'draft',
        })),
      };

      if (activePage) {
        await api.put(`/pages/${activePage._id}`, pageData);
        await saveComponents(activePage._id, status);
        toast.success('Page updated');
      } else {
        const { data } = await api.post('/pages', pageData);
        setActivePage(data.data || data);
        setPages(prev => [...prev, data.data || data]);
        await saveComponents(data.data?._id || data._id, status);
        toast.success('Page created');
      }
      await fetchPages();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const saveComponents = async (pageId, status) => {
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const payload = {
        type: s.type, name: s.name, data: s.data, styles: s.styles,
        isVisible: s.visible, order: i,
        status: status || (s.published ? 'published' : 'draft'),
      };
      if (s._id) {
        await api.put(`/pages/${pageId}/components/${s._id}`, payload);
      } else {
        const { data } = await api.post(`/pages/${pageId}/components`, payload);
        s._id = data.data?._id || data._id;
      }
    }
  };

  const addSection = (type) => {
    const defaults = sectionDefaults[type] || sectionDefaults.custom;
    const newSection = {
      ...JSON.parse(JSON.stringify(defaults)),
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: sections.length,
    };
    setSections(prev => [...prev, newSection]);
    setShowAddSection(false);
    toast.success('Section added');
  };

  const removeSection = (id) => {
    setSections(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  const moveSection = (id, direction) => {
    const idx = sections.findIndex(s => s.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === sections.length - 1)) return;
    const updated = [...sections];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setSections(updated.map((s, i) => ({ ...s, order: i })));
  };

  const openSectionEditor = (section) => {
    setEditingSection(section);
    setEditorOpen(true);
  };

  const saveSectionData = (updatedData) => {
    setSections(prev => prev.map(s => s.id === updatedData.id ? updatedData : s));
    setEditorOpen(false);
    setEditingSection(null);
    toast.success('Section updated');
  };

  const deletePage = async () => {
    if (!deleteTarget) return;
    try {
      setDeletedPages(prev => [...prev, deleteTarget]);
      await api.delete(`/pages/${deleteTarget._id}`);
      setPages(prev => prev.filter(p => p._id !== deleteTarget._id));
      if (activePage?._id === deleteTarget._id) {
        setActivePage(null);
        setSections([]);
        setForm({ ...defaultPageData });
      }
      toast.success('Page deleted');
    } catch {
      toast.error('Failed to delete page');
    }
    setDeleteTarget(null);
  };

  const duplicatePage = async (page) => {
    try {
      await api.post(`/pages/${page._id}/duplicate`);
      toast.success('Page duplicated');
      await fetchPages();
    } catch {
      toast.error('Failed to duplicate page');
    }
  };

  const togglePageStatus = async (page) => {
    try {
      const newStatus = page.status === 'published' ? 'draft' : 'published';
      await api.patch(`/pages/${page._id}/toggle`);
      setPages(prev => prev.map(p => p._id === page._id ? { ...p, status: newStatus } : p));
      toast.success(`Page ${newStatus}`);
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const movePageInTree = (id, direction) => {
    const rootPages = pages.filter(p => !p.parent);
    const idx = rootPages.findIndex(p => p._id === id);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= rootPages.length) return;
    const updated = [...rootPages];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    api.put('/pages/reorder', { items: updated.map((p, i) => ({ _id: p._id, order: i })) }).catch(() => {});
    setPages(prev => {
      const map = new Map(prev.map(p => [p._id, p]));
      updated.forEach(p => map.set(p._id, p));
      return [...map.values()];
    });
  };

  const saveAsTemplate = async () => {
    const name = prompt('Template name:');
    if (!name) return;
    try {
      await api.post('/templates', {
        name,
        type: 'page',
        data: {
          sections: sections.map(s => ({
            type: s.type, name: s.name, data: s.data, styles: s.styles,
            isVisible: s.visible,
          })),
        },
      });
      toast.success('Template saved');
    } catch {
      toast.error('Failed to save template');
    }
  };

  const loadFromTemplate = async () => {
    try {
      const { data } = await api.get('/templates?type=page');
      const templates = data.data || [];
      if (templates.length === 0) { toast.info('No templates available'); return; }
      const tpl = templates[0];
      if (tpl.data?.sections) {
        const imported = tpl.data.sections.map((s, i) => ({
          ...JSON.parse(JSON.stringify(sectionDefaults[s.type] || sectionDefaults.custom)),
          ...s,
          id: `sec_${Date.now()}_${i}`,
          order: sections.length + i,
        }));
        setSections(prev => [...prev, ...imported]);
        toast.success('Template loaded');
      }
    } catch {
      toast.error('Failed to load template');
    }
  };

  const importPages = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (Array.isArray(imported)) {
          for (const p of imported) {
            await api.post('/pages', p);
          }
          toast.success(`${imported.length} pages imported`);
          await fetchPages();
        }
      } catch {
        toast.error('Import failed');
      }
    };
    input.click();
  };

  const exportPages = () => {
    const data = JSON.stringify(pages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pages-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Pages exported');
  };

  const restoreFromRecycleBin = async (page) => {
    try {
      const { data } = await api.post('/pages', {
        title: page.title,
        slug: page.slug || generateSlug(page.title),
        status: 'draft',
        template: page.template,
        parent: page.parent,
      });
      setDeletedPages(prev => prev.filter(p => p._id !== page._id));
      setPages(prev => [...prev, data.data || data]);
      toast.success('Page restored');
    } catch {
      toast.error('Failed to restore');
    }
  };

  const getPageChildren = (parentId) => pages.filter(p => p.parent === parentId);
  const rootPages = pages.filter(p => !p.parent);

  const renderPageTree = (pageList, depth = 0) => {
    return pageList.map(page => {
      const children = getPageChildren(page._id);
      const isActive = activePage?._id === page._id;
      return (
        <div key={page._id}>
          <div
            onClick={() => selectPage(page)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.6rem',
              paddingLeft: 12 + depth * 20,
              borderRadius: 6,
              cursor: 'pointer',
              background: isActive ? 'var(--color-primary-subtle)' : 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              fontSize: '0.82rem',
              transition: 'background 0.1s',
              marginBottom: 1,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ cursor: 'grab', color: 'var(--color-text-tertiary)', display: 'flex' }}>
              <Icon path={Icons.menu} size={12} />
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.title || 'Untitled'}</span>
            <span style={{
              fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: 3, fontWeight: 600,
              background: page.type === 'home' ? 'var(--color-primary-light)' : page.type === 'blog' ? 'var(--color-success-light)' : 'var(--color-bg-subtle)',
              color: page.type === 'home' ? 'var(--color-primary)' : page.type === 'blog' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
            }}>
              {page.type === 'home' ? 'Home' : page.type === 'blog' ? 'Blog' : 'Page'}
            </span>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: page.status === 'published' ? 'var(--color-success)' : page.status === 'scheduled' ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
            }} />
          </div>
          {children.length > 0 && renderPageTree(children, depth + 1)}
        </div>
      );
    });
  };

  const stats = [
    { label: 'Total Pages', value: pages.length, icon: Icons.file, color: 'blue' },
    { label: 'Published', value: pages.filter(p => p.status === 'published').length, icon: Icons.check, color: 'green' },
    { label: 'Drafts', value: pages.filter(p => p.status === 'draft').length, icon: Icons.edit, color: 'yellow' },
    { label: 'Scheduled', value: pages.filter(p => p.status === 'scheduled').length, icon: Icons.clock, color: 'purple' },
  ];

  const filteredPages = pages.filter(p => {
    const q = searchVal.toLowerCase();
    if (q && !p.title?.toLowerCase().includes(q)) return false;
    if (filterVal.status && p.status !== filterVal.status) return false;
    return true;
  });

  if (loading) {
    return (
      <PageLayout title="Page Builder" description="Manage pages and sections">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Page Builder" description="Create, edit, and manage pages" stats={stats}>
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search pages..."
        filters={[{ key: 'status', label: 'Status', type: 'select', options: ['published', 'draft', 'scheduled'] }]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (val === '__reset__' || key === '__reset__') setFilterVal({ status: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={() => {
          setActivePage(null);
          setForm({ ...defaultPageData });
          setSections([]);
          setVersionHistory([]);
        }}
        extraActions={[
          { label: 'Templates', icon: Icons['file-text'], onClick: () => setShowTemplates(true) },
          { label: 'Import', icon: Icons.upload, onClick: importPages },
          { label: 'Export', icon: Icons.download, onClick: exportPages },
          { label: 'Recycle Bin', icon: Icons.trash2, onClick: () => setShowRecycleBin(true) },
        ]}
      />

      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 260px)', minHeight: 500 }}>
        <div style={{ width: 300, flexShrink: 0, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Pages ({filteredPages.length})</span>
            <button className="btn btn-ghost btn-xs" onClick={() => {
              setActivePage(null);
              setForm({ ...defaultPageData });
              setSections([]);
            }}>
              <Icon path={Icons.plus} size={12} /> New
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {filteredPages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>No pages</div>
            ) : renderPageTree(filteredPages.filter(p => !p.parent))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto' }}>
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                {activePage ? `Edit: ${activePage.title}` : 'Create New Page'}
              </h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {activePage && (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => togglePageStatus(activePage)}>
                      <Icon path={activePage.status === 'published' ? Icons['eye-off'] : Icons.eye} size={13} />
                      {activePage.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => duplicatePage(activePage)}>
                      <Icon path={Icons.copy} size={13} /> Duplicate
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(activePage)}>
                      <Icon path={Icons.trash2} size={13} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Page Title <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="Home, About, Contact..." />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} placeholder="about-us" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => handleFormChange('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Parent Page</label>
                <select value={form.parent} onChange={e => handleFormChange('parent', e.target.value)}>
                  <option value="">None (Top Level)</option>
                  {pages.filter(p => p._id !== activePage?._id).map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Template</label>
                <select value={form.template} onChange={e => handleFormChange('template', e.target.value)}>
                  <option value="">None</option>
                  <option value="default">Default</option>
                  <option value="fullwidth">Full Width</option>
                  <option value="landing">Landing</option>
                </select>
              </div>
              <div className="form-group" />
            </div>

            {form.status === 'scheduled' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Publish Date</label>
                  <input type="datetime-local" value={form.publishDate} onChange={e => handleFormChange('publishDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Unpublish Date</label>
                  <input type="datetime-local" value={form.unpublishDate} onChange={e => handleFormChange('unpublishDate', e.target.value)} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => handleSave('draft')} disabled={saving}>
                <Icon path={Icons.save} size={14} /> Save Draft
              </button>
              <button className="btn btn-primary" onClick={() => handleSave('published')} disabled={saving}>
                {saving ? 'Saving...' : <><Icon path={Icons['external-link']} size={14} /> Publish</>}
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Sections ({sections.length})
              </h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddSection(true)}>
                <Icon path={Icons.plus} size={13} /> Add Section
              </button>
            </div>

            {sections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                No sections yet. Click "Add Section" to start building.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sections.map((section, idx) => {
                  const typeInfo = sectionTypes.find(t => t.id === section.type);
                  return (
                    <div key={section.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg)',
                    }}>
                      <span style={{ cursor: 'grab', color: 'var(--color-text-tertiary)', display: 'flex' }}>
                        <Icon path={Icons.menu} size={14} />
                      </span>
                      <div style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', flexShrink: 0 }}>
                        {typeInfo ? <Icon path={typeInfo.icon} size={14} /> : <Icon path={Icons.grid} size={14} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>{section.name || section.type}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}>{section.type}</div>
                      </div>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                        background: section.visible !== false ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                      }} />
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button onClick={() => moveSection(section.id, 'up')} disabled={idx === 0} style={{ padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', opacity: idx === 0 ? 0.3 : 1 }}>
                          <Icon path={Icons['chevron-up']} size={12} />
                        </button>
                        <button onClick={() => moveSection(section.id, 'down')} disabled={idx === sections.length - 1} style={{ padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: idx === sections.length - 1 ? 'default' : 'pointer', color: idx === sections.length - 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', opacity: idx === sections.length - 1 ? 0.3 : 1 }}>
                          <Icon path={Icons['chevron-down']} size={12} />
                        </button>
                        <button onClick={() => openSectionEditor(section)} style={{ padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                          <Icon path={Icons.edit} size={12} />
                        </button>
                        <button onClick={() => removeSection(section.id)} style={{ padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)' }}>
                          <Icon path={Icons.trash2} size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>SEO Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Meta Title</label>
                <input value={form.metaTitle} onChange={e => handleFormChange('metaTitle', e.target.value)} placeholder="Page title for SEO" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Meta Description</label>
                <textarea value={form.metaDescription} onChange={e => handleFormChange('metaDescription', e.target.value)} placeholder="Brief description for search engines" rows={3} />
              </div>
            </div>
          </div>

          {versionHistory.length > 0 && (
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Version History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...versionHistory].reverse().map((v, i) => (
                  <div key={v._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>Version {versionHistory.length - i}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>{v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}</div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/backups/${v._id || v.id}/restore`);
                          toast.success('Version restored');
                          if (activePage) loadSections(activePage._id);
                        } catch { toast.error('Restore failed'); }
                      }}
                      style={{ padding: '0.3rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddSection && (
        <div className="modal-overlay" onClick={() => setShowAddSection(false)} style={{ zIndex: 100 }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 650, maxHeight: '75vh' }}>
            <div className="modal-header">
              <h3>Add Section to Page</h3>
              <button className="modal-close" onClick={() => setShowAddSection(false)}>&times;</button>
            </div>
            <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, overflowY: 'auto', maxHeight: '55vh' }}>
              {sectionTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => addSection(type.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0.75rem', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-subtle)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
                    <Icon path={type.icon} size={18} />
                  </div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showTemplates && (
        <div className="modal-overlay" onClick={() => setShowTemplates(false)} style={{ zIndex: 100 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Templates</h3>
              <button className="modal-close" onClick={() => setShowTemplates(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <button className="btn btn-primary" onClick={() => { saveAsTemplate(); setShowTemplates(false); }} style={{ width: '100%', marginBottom: 8 }}>Save as Template</button>
              <button className="btn btn-outline" onClick={() => { loadFromTemplate(); setShowTemplates(false); }} style={{ width: '100%' }}>Load from Template</button>
            </div>
          </div>
        </div>
      )}

      {showRecycleBin && (
        <div className="modal-overlay" onClick={() => setShowRecycleBin(false)} style={{ zIndex: 100 }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 550, maxHeight: '70vh' }}>
            <div className="modal-header">
              <h3>Recycle Bin ({deletedPages.length})</h3>
              <button className="modal-close" onClick={() => setShowRecycleBin(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {deletedPages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>Recycle bin is empty</p>
              ) : (
                deletedPages.map(page => (
                  <div key={page._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--color-border)', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{page.title || 'Untitled'}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => restoreFromRecycleBin(page)}>Restore</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <SectionEditor
        section={editingSection}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingSection(null); }}
        onSave={saveSectionData}
        onPreview={() => toast.info('Preview')}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deletePage}
        title="Delete Page"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </PageLayout>
  );
}
