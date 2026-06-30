import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';
import SitePreviewRenderer from '../components/SitePreviewRenderer';
import SectionEditor from '../components/SectionEditor';
import { sectionTypes } from '../lib/sectionDefaults';
import sectionDefaults from '../lib/sectionDefaults';

const sectionTypeIcons = {};
sectionTypes.forEach(t => { sectionTypeIcons[t.id] = t.icon; });

export default function WebsiteBuilder() {
  const toast = useToast();
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('preview');
  const [device, setDevice] = useState('desktop');
  const [zoom, setZoom] = useState(100);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [contextMenu, setContextMenu] = useState(null);
  const [versionTimeline, setVersionTimeline] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ status: '' });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/pages');
      const pg = data.data || [];
      setPages(pg);
      if (pg.length > 0) {
        setActivePageId(pg[0]._id);
        loadSections(pg[0]._id);
      } else {
        setLoading(false);
      }
    } catch {
      toast.error('Failed to load pages');
      setLoading(false);
    }
  };

  const loadSections = async (pageId) => {
    if (!pageId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/pages/${pageId}/components`);
      const comps = data.data || [];
      const mapped = comps.map((c, i) => ({
        id: c._id || `sec_${Date.now()}_${i}`,
        _id: c._id,
        type: c.type || 'custom',
        name: c.name || c.data?.title || c.type?.charAt(0).toUpperCase() + c.type?.slice(1) || 'Section',
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
        permissions: c.permissions || { roleVisibility: 'All', passwordProtect: false },
        analytics: c.analytics || {},
        advanced: c.advanced || {},
        versionHistory: c.versionHistory || [],
        order: c.order ?? i,
      }));
      mapped.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSections(mapped);
      pushHistory(mapped);
      fetchVersions(pageId);
    } catch {
      toast.error('Failed to load sections');
      setSections([]);
      pushHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (pageId) => {
    try {
      const { data } = await api.get(`/pages/${pageId}`);
      const versions = data.data?.versions || data.versions || [];
      setVersionTimeline(versions);
    } catch {
      setVersionTimeline([]);
    }
  };

  const pushHistory = (newSections) => {
    const snapshot = JSON.parse(JSON.stringify(newSections));
    setHistory(prev => [...prev.slice(0, historyIndex + 1), snapshot]);
    setHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setSections(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const generateId = () => `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addSection = (type) => {
    const defaults = sectionDefaults[type] || sectionDefaults.custom;
    const newSection = {
      ...JSON.parse(JSON.stringify(defaults)),
      id: generateId(),
      order: sections.length,
      name: defaults.name || type.charAt(0).toUpperCase() + type.slice(1),
    };
    const updated = [...sections, newSection];
    setSections(updated);
    pushHistory(updated);
    setShowAddModal(false);
    toast.success(`${newSection.name} added`);
  };

  const duplicateSection = (id) => {
    const source = sections.find(s => s.id === id);
    if (!source) return;
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = generateId();
    copy.name = `${source.name} (Copy)`;
    const idx = sections.findIndex(s => s.id === id);
    const updated = [...sections.slice(0, idx + 1), copy, ...sections.slice(idx + 1)];
    setSections(updated.map((s, i) => ({ ...s, order: i })));
    pushHistory(updated.map((s, i) => ({ ...s, order: i })));
    toast.success('Section duplicated');
  };

  const removeSection = (id) => {
    const updated = sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
    setSections(updated);
    pushHistory(updated);
    if (selectedSection?.id === id) setSelectedSection(null);
  };

  const moveSection = (id, direction) => {
    const idx = sections.findIndex(s => s.id === id);
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    const reordered = updated.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
    pushHistory(reordered);
  };

  const toggleVisibility = (id) => {
    const updated = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setSections(updated);
    pushHistory(updated);
  };

  const togglePublish = (id) => {
    const updated = sections.map(s => s.id === id ? { ...s, published: !s.published } : s);
    setSections(updated);
    pushHistory(updated);
  };

  const openEditor = (section) => {
    setEditingSection(section);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingSection(null);
  };

  const saveSection = (updatedData) => {
    const updated = sections.map(s => s.id === updatedData.id ? updatedData : s);
    setSections(updated);
    pushHistory(updated);
    closeEditor();
    toast.success('Section saved');
  };

  const previewSection = () => {
    toast.info('Preview mode');
  };

  const saveDraft = async () => {
    if (!activePageId) { toast.error('No active page'); return; }
    setSaving(true);
    try {
      await saveComponents(activePageId, 'draft');
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const publishAll = async () => {
    if (!activePageId) { toast.error('No active page'); return; }
    setSaving(true);
    try {
      await saveComponents(activePageId, 'published');
      await api.put(`/pages/${activePageId}`, { status: 'published' });
      toast.success('All sections published');
    } catch {
      toast.error('Failed to publish');
    } finally {
      setSaving(false);
    }
  };

  const saveComponents = async (pageId, status) => {
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const payload = {
        type: s.type,
        name: s.name,
        data: s.data,
        styles: s.styles,
        style: s.style,
        content: s.content,
        layout: s.layout,
        media: s.media,
        seo: s.seo,
        animation: s.animation,
        responsive: s.responsive,
        isVisible: s.visible,
        order: i,
        status: status || (s.published ? 'published' : 'draft'),
      };
      if (s._id) {
        await api.put(`/pages/${pageId}/components/${s._id}`, payload);
      } else {
        const { data } = await api.post(`/pages/${pageId}/components`, payload);
        s._id = data.data?._id || data._id || s._id;
      }
    }
  };

  const handleContextMenu = (e, section) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, section });
  };

  const closeContextMenu = () => setContextMenu(null);

  const importTemplate = async () => {
    try {
      const { data } = await api.get('/templates');
      const templates = data.data || [];
      if (templates.length === 0) { toast.info('No templates available'); return; }
      const tpl = templates[0];
      if (tpl.data?.sections) {
        const imported = tpl.data.sections.map((s, i) => ({
          ...s,
          id: generateId(),
          order: sections.length + i,
        }));
        setSections(prev => [...prev, ...imported]);
        pushHistory([...sections, ...imported]);
        toast.success('Template imported');
      }
    } catch {
      toast.error('Failed to import template');
    }
  };

  const activePage = pages.find(p => p._id === activePageId);
  const totalSections = sections.length;
  const publishedCount = sections.filter(s => s.published !== false).length;
  const draftCount = sections.filter(s => s.published === false).length;
  const hiddenCount = sections.filter(s => s.visible === false).length;

  const stats = [
    { label: 'Total Sections', value: totalSections, icon: Icons.grid, color: 'blue' },
    { label: 'Published', value: publishedCount, icon: Icons.check, color: 'green' },
    { label: 'Draft', value: draftCount, icon: Icons.edit, color: 'yellow' },
    { label: 'Hidden', value: hiddenCount, icon: Icons['eye-off'], color: 'gray' },
  ];

  const filteredSections = sections.filter(s => {
    const q = searchVal.toLowerCase();
    if (q && !s.name?.toLowerCase().includes(q) && !s.type?.toLowerCase().includes(q)) return false;
    if (filterVal.status === 'published' && s.published === false) return false;
    if (filterVal.status === 'draft' && s.published !== false) return false;
    if (filterVal.status === 'hidden' && s.visible !== false) return false;
    return true;
  });

  if (loading && sections.length === 0) {
    return (
      <PageLayout title="Website Builder" description="Visual page builder">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Website Builder" description="Visual drag & drop website builder" stats={stats}>
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search sections..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: ['published', 'draft', 'hidden'] },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (val === '__reset__' || key === '__reset__') setFilterVal({ status: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={() => setShowAddModal(true)}
        onRefresh={() => activePageId && loadSections(activePageId)}
        extraActions={[
          { label: 'Templates', icon: Icons['file-text'], onClick: () => setShowTemplates(true) },
          { label: 'Undo', icon: Icons['chevron-left'], onClick: undo, disabled: historyIndex <= 0 },
          { label: 'Redo', icon: Icons['chevron-right'], onClick: redo, disabled: historyIndex >= history.length - 1 },
        ]}
      />

      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 260px)', minHeight: 500, overflow: 'hidden' }}>
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{activePage?.title || 'Page'} Sections</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>{filteredSections.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {filteredSections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>
                {searchVal || filterVal.status ? 'No matching sections' : 'No sections yet'}
              </div>
            ) : (
              filteredSections.map((section, idx) => {
                const isSelected = selectedSection?.id === section.id;
                const typeInfo = sectionTypes.find(t => t.id === section.type);
                return (
                  <div
                    key={section.id}
                    onClick={() => setSelectedSection(section)}
                    onContextMenu={(e) => handleContextMenu(e, section)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.6rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-primary-subtle)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                      marginBottom: 2,
                      transition: 'background 0.1s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ cursor: 'grab', color: 'var(--color-text-tertiary)', display: 'flex', flexShrink: 0 }}>
                      <Icon path={Icons.menu} size={14} />
                    </span>
                    <span style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, background: 'var(--color-bg)', flexShrink: 0, color: 'var(--color-text-secondary)' }}>
                      {typeInfo ? <Icon path={typeInfo.icon} size={14} /> : section.type?.charAt(0).toUpperCase()}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{section.name || section.type}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'capitalize' }}>{section.type}</div>
                    </div>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: !section.visible ? 'var(--color-text-tertiary)' : section.published !== false ? 'var(--color-success)' : 'var(--color-warning)',
                    }} />
                  </div>
                );
              })
            )}
          </div>
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} style={{ width: '100%' }}>
              <Icon path={Icons.plus} size={14} /> Add New Section
            </button>
            <button className="btn btn-ghost btn-sm" onClick={importTemplate} style={{ width: '100%', marginTop: 4 }}>
              <Icon path={Icons['download-cloud']} size={14} /> Import Template
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border)', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setMode('preview')} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: 'none', background: mode === 'preview' ? 'var(--color-primary-subtle)' : 'transparent', color: mode === 'preview' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: mode === 'preview' ? 600 : 400, fontSize: '0.8rem', cursor: 'pointer' }}>
                <Icon path={Icons.eye} size={13} /> Live Preview
              </button>
              <button onClick={() => setMode('editor')} style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: 'none', background: mode === 'editor' ? 'var(--color-primary-subtle)' : 'transparent', color: mode === 'editor' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: mode === 'editor' ? 600 : 400, fontSize: '0.8rem', cursor: 'pointer' }}>
                <Icon path={Icons.grid} size={13} /> Drag & Drop
              </button>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button onClick={() => setDevice('desktop')} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: device === 'desktop' ? 'var(--color-primary-subtle)' : 'transparent', cursor: 'pointer', color: device === 'desktop' ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'flex' }}>
                <Icon path={Icons.monitor} size={14} />
              </button>
              <button onClick={() => setDevice('tablet')} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: device === 'tablet' ? 'var(--color-primary-subtle)' : 'transparent', cursor: 'pointer', color: device === 'tablet' ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'flex' }}>
                <Icon path={Icons.grid} size={14} />
              </button>
              <button onClick={() => setDevice('mobile')} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: device === 'mobile' ? 'var(--color-primary-subtle)' : 'transparent', cursor: 'pointer', color: device === 'mobile' ? 'var(--color-primary)' : 'var(--color-text-secondary)', display: 'flex' }}>
                <Icon path={Icons.smartphone} size={14} />
              </button>
              <select value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ padding: '0.3rem 0.4rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.78rem', marginLeft: 4 }}>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
                <option value={150}>150%</option>
              </select>
              <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />
              <button className="btn btn-ghost btn-sm" onClick={undo} disabled={historyIndex <= 0} title="Undo">
                <Icon path={Icons['chevron-left']} size={14} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
                <Icon path={Icons['chevron-right']} size={14} />
              </button>
              <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />
              <button className="btn btn-ghost btn-sm" onClick={saveDraft} disabled={saving}>
                <Icon path={Icons.save} size={14} /> Save Draft
              </button>
              <button className="btn btn-primary btn-sm" onClick={publishAll} disabled={saving}>
                {saving ? 'Saving...' : <><Icon path={Icons['external-link']} size={14} /> Publish</>}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: mode === 'editor' ? '1rem' : 0, transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
            <SitePreviewRenderer
              pageId={activePageId}
              sections={mode === 'editor' ? sections.map(s => ({
                ...s,
                content: { ...s.content, ...s.data },
                style: { ...s.style, ...s.styles },
              })) : undefined}
              device={device}
              editable={true}
              onEdit={(section) => openEditor(section)}
            />
          </div>
        </div>
      </div>

      {versionTimeline.length > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '0.75rem 0', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', alignSelf: 'center' }}>Version History:</span>
          {versionTimeline.map((v, i) => (
            <button key={i} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', fontSize: '0.7rem', cursor: 'pointer', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}
              onClick={async () => {
                try { await api.post(`/backups/${v._id || v.id}/restore`); toast.success('Version restored'); loadSections(activePageId); } catch { toast.error('Restore failed'); }
              }}>
              v{i + 1} - {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}
            </button>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)} style={{ zIndex: 100 }}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: '80vh' }}>
            <div className="modal-header">
              <h3>Add New Section</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, overflowY: 'auto', maxHeight: '60vh' }}>
              {sectionTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => addSection(type.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '1rem 0.75rem',
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg)',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-subtle)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
                    <Icon path={type.icon} size={20} />
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Templates</h3>
              <button className="modal-close" onClick={() => setShowTemplates(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>Save current page as a template or load from existing templates.</p>
              <button className="btn btn-primary" onClick={async () => {
                try {
                  await api.post('/templates', { name: prompt('Template name:') || 'Untitled', type: 'page', data: { sections } });
                  toast.success('Template saved');
                  setShowTemplates(false);
                } catch { toast.error('Failed to save template'); }
              }} style={{ width: '100%', marginBottom: 8 }}>Save as Template</button>
              <button className="btn btn-outline" onClick={importTemplate} style={{ width: '100%' }}>Load from Template</button>
            </div>
          </div>
        </div>
      )}

      <SectionEditor
        section={editingSection}
        open={editorOpen}
        onClose={closeEditor}
        onSave={saveSection}
        onPreview={previewSection}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) { removeSection(deleteTarget.id); setDeleteTarget(null); } }}
        title="Delete Section"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        type="danger"
      />

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 200,
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '0.25rem',
            minWidth: 160,
          }}
          onClick={closeContextMenu}
        >
          {[
            { label: 'Edit Section', icon: Icons.edit, onClick: () => { openEditor(contextMenu.section); } },
            { label: 'Duplicate', icon: Icons.copy, onClick: () => { duplicateSection(contextMenu.section.id); } },
            { label: 'Move Up', icon: Icons['chevron-up'], onClick: () => { moveSection(contextMenu.section.id, 'up'); } },
            { label: 'Move Down', icon: Icons['chevron-down'], onClick: () => { moveSection(contextMenu.section.id, 'down'); } },
            { label: contextMenu.section.visible ? 'Hide' : 'Show', icon: contextMenu.section.visible ? Icons['eye-off'] : Icons.eye, onClick: () => { toggleVisibility(contextMenu.section.id); } },
            { label: 'Delete', icon: Icons.trash2, onClick: () => { setDeleteTarget(contextMenu.section); }, danger: true },
          ].map((action, i) => (
            <div
              key={i}
              onClick={action.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.4rem 0.75rem',
                borderRadius: 6,
                cursor: 'pointer',
                color: action.danger ? 'var(--color-danger)' : 'var(--color-text)',
                fontSize: '0.8rem',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon path={action.icon} size={14} />
              {action.label}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </PageLayout>
  );
}
