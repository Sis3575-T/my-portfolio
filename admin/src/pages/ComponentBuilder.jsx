import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api, { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import PageLayout from '../components/PageLayout';
import ComponentCard from '../components/ComponentCard';
import ComponentEditor from '../components/ComponentEditor';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import '../styles/component-builder.css';

const typeColors = {
  hero: '#6366f1', about: '#ec4899', projects: '#f59e0b', skills: '#10b981',
  experience: '#3b82f6', education: '#8b5cf6', certificates: '#14b8a6',
  testimonials: '#f97316', services: '#06b6d4', blog: '#ef4444', contact: '#84cc16',
  gallery: '#d946ef', timeline: '#0ea5e9', faq: '#22c55e', cta: '#e11d48',
  statistics: '#64748b', custom: '#78716c',
};

const typeLabels = {
  hero: 'Hero', about: 'About', projects: 'Projects', skills: 'Skills',
  experience: 'Experience', education: 'Education', certificates: 'Certificates',
  testimonials: 'Testimonials', services: 'Services', blog: 'Blog',
  contact: 'Contact', gallery: 'Gallery', timeline: 'Timeline',
  faq: 'FAQ', cta: 'CTA', statistics: 'Stats', custom: 'Custom',
};

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'usageCount', label: 'Usage' },
];

export default function ComponentBuilder() {
  const toast = useToast();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [previewComp, setPreviewComp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const [newCompType, setNewCompType] = useState('hero');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, hidden: 0, archived: 0, reusable: 0, global: 0, mostUsed: '', recentlyUpdated: '' });
  const [versions, setVersions] = useState([]);
  const fileInputRef = useRef(null);

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sections');
      const comps = data.data || [];
      setComponents(comps);
      computeStats(comps);
    } catch {
      toast.error('Failed to load components');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComponents(); }, []);

  const computeStats = (comps) => {
    const total = comps.length;
    const published = comps.filter(c => c.status === 'published' || (c.visible !== false && !c.status)).length;
    const draft = comps.filter(c => c.status === 'draft').length;
    const hidden = comps.filter(c => c.status === 'hidden' || c.visible === false).length;
    const archived = comps.filter(c => c.status === 'archived').length;
    const reusable = comps.filter(c => c.reusable).length;
    const global = comps.filter(c => c.global).length;
    const typeCounts = {};
    comps.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] || 0) + 1; });
    const mostUsed = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    const sorted = [...comps].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    const recentlyUpdated = sorted[0]?.name || '';
    setStats({ total, published, draft, hidden, archived, reusable, global, mostUsed: mostUsed ? `${typeLabels[mostUsed[0]] || mostUsed[0]} (${mostUsed[1]})` : 'N/A', recentlyUpdated });
  };

  const filtered = useMemo(() => {
    let result = [...components];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.type || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (filterType) result = result.filter(c => c.type === filterType);
    if (filterStatus) {
      if (filterStatus === 'published') result = result.filter(c => c.status === 'published' || (c.visible !== false && !c.status));
      else if (filterStatus === 'hidden') result = result.filter(c => c.status === 'hidden' || c.visible === false);
      else result = result.filter(c => c.status === filterStatus);
    }
    if (filterCategory) result = result.filter(c => c.category === filterCategory);
    result.sort((a, b) => {
      let aVal = a[sortBy], bVal = b[sortBy];
      if (sortBy === 'name' || sortBy === 'type' || sortBy === 'status') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }
      if (sortBy === 'usageCount') {
        aVal = aVal || 0;
        bVal = bVal || 0;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [components, search, filterType, filterStatus, filterCategory, sortBy, sortDir]);

  const categories = useMemo(() => {
    const cats = new Set(components.map(c => c.category).filter(Boolean));
    return [...cats];
  }, [components]);

  const types = useMemo(() => {
    const ts = new Set(components.map(c => c.type).filter(Boolean));
    return [...ts];
  }, [components]);

  const handleEdit = (comp) => {
    setEditingComp(comp);
    setEditorOpen(true);
  };

  const handleSave = async (data) => {
    try {
      let res;
      if (data._id) {
        res = await api.put(`/sections/${data._id}`, data);
        setComponents(prev => prev.map(c => c._id === data._id ? { ...c, ...data } : c));
      } else {
        res = await adminApi.createSection(data);
        setComponents(prev => [...prev, res.data.data]);
      }
      computeStats(components);
      toast.success('Component saved');
      setEditorOpen(false);
      setEditingComp(null);
    } catch {
      toast.error('Failed to save component');
    }
  };

  const handleDuplicate = async (comp) => {
    setDuplicateTarget(comp);
  };

  const doDuplicate = async () => {
    if (!duplicateTarget) return;
    try {
      if (duplicateTarget._id) {
        const { data } = await api.post(`/sections/${duplicateTarget._id}/duplicate`);
        setComponents(prev => [...prev, data.data]);
        toast.success('Component duplicated');
      }
    } catch {
      toast.error('Failed to duplicate');
    }
    setDuplicateTarget(null);
  };

  const handleDelete = (comp) => {
    setDeleteTarget(comp);
  };

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/sections/${deleteTarget._id}`);
      setComponents(prev => prev.filter(c => c._id !== deleteTarget._id));
      setSelected(prev => prev.filter(id => id !== deleteTarget._id));
      toast.success('Component deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleVisible = async (comp) => {
    const next = comp.visible === false ? true : false;
    try {
      await api.put(`/sections/${comp._id}`, { visible: next });
      setComponents(prev => prev.map(c => c._id === comp._id ? { ...c, visible: next } : c));
      toast.success(`Component ${next ? 'shown' : 'hidden'}`);
    } catch {
      toast.error('Failed to toggle visibility');
    }
  };

  const handleToggleStatus = async (comp) => {
    try {
      const newStatus = comp.status === 'published' || (comp.visible !== false && !comp.status) ? 'draft' : 'published';
      await api.put(`/sections/${comp._id}/status`, { status: newStatus });
      setComponents(prev => prev.map(c => c._id === comp._id ? { ...c, status: newStatus } : c));
      computeStats(components);
      toast.success(`Component ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleLock = async (comp) => {
    try {
      await api.put(`/sections/${comp._id}/lock`, { locked: !comp.locked });
      setComponents(prev => prev.map(c => c._id === comp._id ? { ...c, locked: !c.locked } : c));
      toast.success(comp.locked ? 'Component unlocked' : 'Component locked');
    } catch {
      toast.error('Failed to toggle lock');
    }
  };

  const handlePreview = (comp) => {
    setPreviewComp(comp);
  };

  const handleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(c => c._id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selected.length === 0) return;
    try {
      const { data } = await api.post('/sections/bulk', { action, ids: selected });
      if (data.success) {
        toast.success(`Bulk ${action} completed`);
        await fetchComponents();
        setSelected([]);
      }
    } catch {
      toast.error(`Bulk ${action} failed`);
    }
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === sortBy) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(val);
      setSortDir('desc');
    }
  };

  const handleExport = async (comp) => {
    try {
      const { data } = await api.get(`/sections/export/${comp._id}`);
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${comp.name || comp.type || 'component'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Component exported');
    } catch {
      toast.error('Failed to export');
    }
  };

  const handleExportAll = async () => {
    try {
      const blob = new Blob([JSON.stringify(components, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `components-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('All components exported');
    } catch {
      toast.error('Failed to export');
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      let parsed;
      try {
        parsed = JSON.parse(importJson);
      } catch {
        toast.error('Invalid JSON');
        setImporting(false);
        return;
      }
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const { data } = await api.post('/sections/import', { components: arr });
      if (data.success) {
        toast.success(`${data.data?.length || arr.length} component(s) imported`);
        await fetchComponents();
        setShowImportModal(false);
        setImportJson('');
      }
    } catch {
      toast.error('Failed to import');
    } finally {
      setImporting(false);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportJson(ev.target.result);
      setShowImportModal(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateNew = async () => {
    try {
      const defaults = {
        name: `${newCompType.charAt(0).toUpperCase() + newCompType.slice(1)} Section`,
        type: newCompType,
        visible: true,
        order: components.length,
        content: {},
        style: {},
        layout: {},
        media: {},
        seo: {},
        animation: {},
        responsive: {
          desktop: { visible: true, fontSize: 100, spacing: 100, layout: 'default', order: 0, imageSize: 100 },
          tablet: { visible: true, fontSize: 85, spacing: 80, layout: 'stacked', order: 0, imageSize: 80 },
          mobile: { visible: true, fontSize: 70, spacing: 60, layout: 'stacked', order: 0, imageSize: 60 },
        },
        permissions: { roleVisibility: 'All', passwordProtect: false },
        analytics: { clickTracking: false, scrollTracking: false },
        advanced: { customCSS: '', customAttributes: '', customID: '', customClasses: '', renderAs: 'div', wrapper: '' },
        version: 1,
        status: 'draft',
        reusable: false,
        global: false,
        featured: false,
      };
      const { data } = await api.post('/sections', defaults);
      setComponents(prev => [...prev, data.data]);
      computeStats([...components, data.data]);
      toast.success('Component created');
      setShowCreateModal(false);
      setEditingComp(data.data);
      setEditorOpen(true);
    } catch {
      toast.error('Failed to create component');
    }
  };

  const handleContextMenu = (e, comp) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      comp,
    });
  };

  const handleVersionSave = async () => {
    if (!editingComp) return;
    try {
      const { data } = await api.post(`/sections/${editingComp._id}/versions`, {
        data: editingComp,
        action: 'update',
        description: 'Manual save',
      });
      setVersions(data.data?.versions || []);
      toast.success('Version saved');
    } catch {
      toast.error('Failed to save version');
    }
  };

  const handleVersionRestore = async (version) => {
    if (!editingComp) return;
    try {
      await api.post(`/sections/${editingComp._id}/restore/${version._id}`);
      const { data } = await api.get(`/sections/${editingComp._id}`);
      setEditingComp(data.data);
      setVersions(data.data?.versions || []);
      toast.success('Version restored');
    } catch {
      toast.error('Failed to restore version');
    }
  };

  const loadVersions = async (compId) => {
    try {
      const { data } = await api.get(`/sections/${compId}/versions`);
      setVersions(data.data || []);
    } catch {
      setVersions([]);
    }
  };

  const handleSortTable = (key) => {
    if (key === sortBy) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const renderStats = () => [
    { label: 'Total Components', value: stats.total, icon: Icons.grid, color: 'blue' },
    { label: 'Published', value: stats.published, icon: Icons.check, color: 'green' },
    { label: 'Draft', value: stats.draft, icon: Icons.edit, color: 'yellow' },
    { label: 'Hidden', value: stats.hidden, icon: Icons['eye-off'], color: 'gray' },
    { label: 'Reusable', value: stats.reusable, icon: Icons['refresh-cw'], color: 'purple' },
    { label: 'Global', value: stats.global, icon: Icons.globe, color: 'blue' },
    { label: 'Most Used', value: stats.mostUsed, icon: Icons['bar-chart-3'], color: 'purple' },
    { label: 'Recently Updated', value: stats.recentlyUpdated, icon: Icons.clock, color: 'blue' },
  ];

  const renderToolbar = () => (
    <div className="comp-toolbar">
      <div className="comp-toolbar-main">
        <div className="comp-toolbar-left">
          <div className="comp-search">
            <Icon path={Icons.search} size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 0, display: 'flex' }}>
                <Icon path={Icons.x} size={14} />
              </button>
            )}
          </div>
          <select className="comp-filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{typeLabels[t] || t}</option>)}
          </select>
          <select className="comp-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </select>
          <select className="comp-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="comp-filter-select" value={sortBy} onChange={handleSortChange}>
            {sortOptions.map(o => (
              <option key={o.value} value={o.value}>
                {o.label} {sortBy === o.value ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="comp-toolbar-right">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Icon path={Icons.plus} size={14} /> Create
          </button>
          <button className="btn btn-ghost btn-icon" onClick={fetchComponents} title="Refresh">
            <Icon path={Icons['refresh-cw']} size={14} />
          </button>
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} title="Import">
            <Icon path={Icons.upload} size={14} /> Import
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
          <button className="btn btn-ghost" onClick={handleExportAll} title="Export All">
            <Icon path={Icons.download} size={14} /> Export
          </button>
          <div className="comp-view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
              <Icon path={Icons.grid} size={14} />
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
              <Icon path={Icons.list} size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="comp-grid">
      {filtered.map(comp => (
        <ComponentCard
          key={comp._id}
          component={comp}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onPreview={handlePreview}
          onLock={handleLock}
          selected={selected.includes(comp._id)}
          onSelect={handleSelect}
          dragHandleProps={{
            onContextMenu: (e) => handleContextMenu(e, comp),
            onClick: () => handleEdit(comp),
          }}
        />
      ))}
      {filtered.length === 0 && (
        <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.puzzle} size={40} />
          <h3>No components found</h3>
          <p>Try adjusting your search or filters, or create a new component.</p>
        </div>
      )}
    </div>
  );

  const renderListView = () => (
    <table className="comp-list-table">
      <thead>
        <tr>
          <th style={{ width: 40, padding: '0.75rem 1rem', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
            <input
              type="checkbox"
              checked={selected.length === filtered.length && filtered.length > 0}
              onChange={handleSelectAll}
              style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
          </th>
          {[
            { key: 'order', label: '#' },
            { key: 'name', label: 'Name' },
            { key: 'type', label: 'Type' },
            { key: 'visible', label: 'Visible' },
            { key: 'status', label: 'Status' },
            { key: 'version', label: 'Version' },
            { key: 'usageCount', label: 'Used On' },
            { key: 'createdAt', label: 'Created' },
            { key: 'updatedAt', label: 'Modified' },
          ].map(col => (
            <th key={col.key} className="sortable" onClick={() => handleSortTable(col.key)} style={{ cursor: 'pointer' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {col.label}
                {sortBy === col.key && (
                  <Icon path={sortDir === 'asc' ? Icons['chevron-up'] : Icons['chevron-down']} size={12} />
                )}
              </span>
            </th>
          ))}
          <th style={{ width: 120 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map(comp => (
          <tr key={comp._id} onContextMenu={(e) => handleContextMenu(e, comp)} style={{ cursor: 'pointer' }}>
            <td onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.includes(comp._id)}
                onChange={() => handleSelect(comp._id)}
                style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </td>
            <td style={{ color: 'var(--color-text-tertiary)', fontSize: '0.82rem', textAlign: 'center' }}>{comp.order ?? '-'}</td>
            <td>
              <div className="comp-list-name" onClick={() => handleEdit(comp)}>
                <span className="comp-list-type-dot" style={{ background: typeColors[comp.type] || '#78716c' }} />
                {comp.name || comp.type || 'Untitled'}
              </div>
            </td>
            <td><span className="comp-card-type-badge" style={{ background: `${(typeColors[comp.type] || '#78716c')}18`, color: typeColors[comp.type] || '#78716c' }}>{typeLabels[comp.type] || comp.type}</span></td>
            <td>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleVisible(comp); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: comp.visible !== false ? '#16a34a' : '#dc2626',
                  fontSize: '1rem',
                }}
                title={comp.visible !== false ? 'Visible' : 'Hidden'}
              >
                <Icon path={comp.visible !== false ? Icons.eye : Icons['eye-off']} size={16} />
              </button>
            </td>
            <td>
              {(() => {
                const status = comp.status || (comp.visible !== false ? 'published' : 'draft');
                const sStyle = status === 'published' ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' } :
                  status === 'draft' ? { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' } :
                  status === 'hidden' ? { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' } :
                  { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
                return <span style={{ background: sStyle.bg, color: sStyle.color, borderColor: sStyle.border, padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, border: '1px solid', textTransform: 'capitalize' }}>{status}</span>;
              })()}
            </td>
            <td style={{ color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>v{comp.version || 1}</td>
            <td style={{ color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>{comp.usageCount || 0}</td>
            <td style={{ color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>{comp.createdAt ? new Date(comp.createdAt).toLocaleDateString() : '-'}</td>
            <td style={{ color: 'var(--color-text-tertiary)', fontSize: '0.82rem' }}>{comp.updatedAt ? new Date(comp.updatedAt).toLocaleDateString() : '-'}</td>
            <td>
              <div className="comp-list-actions">
                <button className="comp-list-action-btn" onClick={() => handleEdit(comp)} title="Edit"><Icon path={Icons.edit} size={14} /></button>
                <button className="comp-list-action-btn" onClick={() => handleDuplicate(comp)} title="Duplicate"><Icon path={Icons.copy} size={14} /></button>
                <button className="comp-list-action-btn" onClick={() => handleToggleStatus(comp)} title={comp.status === 'published' || (!comp.status && comp.visible !== false) ? 'Unpublish' : 'Publish'}>
                  <Icon path={(comp.status === 'published' || (!comp.status && comp.visible !== false)) ? Icons['eye-off'] : Icons.eye} size={14} />
                </button>
                <button className="comp-list-action-btn danger" onClick={() => handleDelete(comp)} title="Delete"><Icon path={Icons.trash2} size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCreateModal = () => (
    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3>Create Component</h3>
          <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Component Type</label>
            <select
              value={newCompType}
              onChange={(e) => setNewCompType(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem', fontFamily: 'inherit' }}
            >
              {Object.entries(typeLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={handleCreateNew}>
            Create Component
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (!previewComp) return null;
    const typeColor = typeColors[previewComp.type] || '#78716c';
    return (
      <div className="comp-preview-overlay" onClick={() => setPreviewComp(null)}>
        <div className="comp-preview-modal" onClick={e => e.stopPropagation()}>
          <div className="comp-preview-header">
            <h3>{previewComp.name || previewComp.type || 'Preview'}</h3>
            <button className="modal-close" onClick={() => setPreviewComp(null)}>&times;</button>
          </div>
          <div className="comp-preview-body">
            <div className="comp-preview-frame" style={{ background: previewComp.style?.background || '#fff', color: previewComp.style?.textColor || '#333' }}>
              {previewComp.content ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  {previewComp.content.title && <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{previewComp.content.title}</h2>}
                  {previewComp.content.subtitle && <p style={{ fontSize: 16, opacity: 0.7, marginBottom: 8 }}>{previewComp.content.subtitle}</p>}
                  {previewComp.content.description && <p style={{ fontSize: 14, opacity: 0.6, maxWidth: 500, margin: '0 auto' }}>{previewComp.content.description}</p>}
                  {previewComp.content.buttons?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                      {previewComp.content.buttons.map((btn, i) => (
                        <span key={i} style={{
                          padding: '8px 20px', borderRadius: btn.style === 'outline' ? 8 : 50,
                          background: btn.style === 'outline' ? 'transparent' : typeColor,
                          color: btn.style === 'outline' ? typeColor : '#fff',
                          border: btn.style === 'outline' ? `2px solid ${typeColor}` : 'none',
                          fontSize: 14, fontWeight: 600,
                        }}>{btn.text || 'Button'}</span>
                      ))}
                    </div>
                  )}
                  {previewComp.type === 'about' && previewComp.content.image && (
                    <div style={{ marginTop: 16 }}>
                      <img src={previewComp.content.image} alt="" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                  )}
                  {(previewComp.type === 'skills' || previewComp.type === 'statistics') && previewComp.content?.items?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${previewComp.content.columns || 2}, 1fr)`, gap: 12, marginTop: 16 }}>
                      {previewComp.content.items.map((item, i) => (
                        <div key={i} style={{ padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.03)' }}>
                          <div style={{ fontSize: 20, fontWeight: 800 }}>{item.value}</div>
                          <div style={{ fontSize: 12, opacity: 0.6 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="comp-preview-placeholder">
                  <div style={{ textAlign: 'center' }}>
                    <Icon path={Icons.puzzle} size={32} />
                    <p>Component preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImportModal = () => (
    <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
      <div className="comp-import-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Import Components</h3>
          <button className="modal-close" onClick={() => setShowImportModal(false)}>&times;</button>
        </div>
        <div className="comp-import-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>Paste JSON or drop a file</p>
          <textarea
            className="comp-import-textarea"
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='[{ "name": "Hero Section", "type": "hero", ... }]'
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => { setShowImportModal(false); setImportJson(''); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleImport} disabled={importing || !importJson.trim()}>
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContextMenu = () => {
    if (!contextMenu) return null;
    const comp = contextMenu.comp;
    const status = comp.status || (comp.visible !== false ? 'published' : 'draft');
    return (
      <div
        className="comp-context-menu"
        style={{ top: contextMenu.y, left: contextMenu.x }}
        onClick={() => setContextMenu(null)}
        onMouseLeave={() => setContextMenu(null)}
      >
        <button className="comp-context-item" onClick={() => { handleEdit(comp); setContextMenu(null); }}><Icon path={Icons.eye} size={14} /> View / Edit</button>
        <button className="comp-context-item" onClick={() => { handlePreview(comp); setContextMenu(null); }}><Icon path={Icons['external-link']} size={14} /> Preview</button>
        <div className="comp-context-divider" />
        <button className="comp-context-item" onClick={() => { handleDuplicate(comp); setContextMenu(null); }}><Icon path={Icons.copy} size={14} /> Duplicate</button>
        <button className="comp-context-item" onClick={() => { handleEdit(comp); setContextMenu(null); }}><Icon path={Icons.move} size={14} /> Move</button>
        <div className="comp-context-divider" />
        <button className="comp-context-item" onClick={() => { handleToggleStatus(comp); setContextMenu(null); }}><Icon path={status === 'published' ? Icons['eye-off'] : Icons.eye} size={14} /> {status === 'published' ? 'Hide' : 'Show'}</button>
        <button className="comp-context-item" onClick={() => { handleLock(comp); setContextMenu(null); }}><Icon path={Icons.shield} size={14} /> {comp.locked ? 'Unlock' : 'Lock'}</button>
        <button className="comp-context-item" onClick={() => { handleEdit(comp); setContextMenu(null); }}><Icon path={Icons['download-cloud']} size={14} /> Archive</button>
        <div className="comp-context-divider" />
        <button className="comp-context-item" onClick={() => { handleExport(comp); setContextMenu(null); }}><Icon path={Icons.download} size={14} /> Export</button>
        <button className="comp-context-item" onClick={() => { handleEdit(comp); setContextMenu(null); }}><Icon path={Icons['file-text']} size={14} /> Save as Template</button>
        <button className="comp-context-item" onClick={() => { setContextMenu(null); }}><Icon path={Icons.globe} size={14} /> Save as Global</button>
        <div className="comp-context-divider" />
        <button className="comp-context-item" onClick={() => { handleEdit(comp); setContextMenu(null); }}><Icon path={Icons.clock} size={14} /> Compare Versions</button>
        <button className="comp-context-item" onClick={() => { handleEdit(comp); setContextMenu(null); }}><Icon path={Icons['refresh-cw']} size={14} /> Restore Previous</button>
        <div className="comp-context-divider" />
        <button className="comp-context-item danger" onClick={() => { handleDelete(comp); setContextMenu(null); }}><Icon path={Icons.trash2} size={14} /> Delete</button>
      </div>
    );
  };

  const renderBulkBar = () => {
    if (selected.length === 0) return null;
    const actions = [
      { action: 'publish', label: 'Publish', icon: Icons.check },
      { action: 'unpublish', label: 'Unpublish', icon: Icons['eye-off'] },
      { action: 'archive', label: 'Archive', icon: Icons['download-cloud'] },
      { action: 'restore', label: 'Restore', icon: Icons['refresh-cw'] },
      { action: 'duplicate', label: 'Duplicate', icon: Icons.copy },
      { action: 'export', label: 'Export', icon: Icons.download },
    ];
    return (
      <div className="comp-bulk-bar">
        <span className="comp-bulk-count">{selected.length} selected</span>
        <div className="comp-bulk-divider" />
        {actions.map(a => (
          <button key={a.action} className="comp-bulk-btn" onClick={() => handleBulkAction(a.action)}>
            <Icon path={a.icon} size={12} /> {a.label}
          </button>
        ))}
        <div className="comp-bulk-divider" />
        <button className="comp-bulk-btn danger" onClick={() => handleBulkAction('delete')}>
          <Icon path={Icons.trash2} size={12} /> Delete
        </button>
        <button className="comp-bulk-btn" onClick={() => setSelected([])}>
          Deselect
        </button>
      </div>
    );
  };

  if (loading && components.length === 0) {
    return (
      <PageLayout title="Component Builder" description="Design and manage your site components">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="spinner" />
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        title="Component Builder"
        description="Design, manage, and organize your site components"
        stats={renderStats()}
      >
        <div className="comp-builder">
          {renderToolbar()}

          {viewMode === 'grid' ? renderGridView() : renderListView()}

          {showCreateModal && renderCreateModal()}
          {previewComp && renderPreview()}
          {showImportModal && renderImportModal()}
          {contextMenu && renderContextMenu()}
          {renderBulkBar()}
        </div>
      </PageLayout>

      <ComponentEditor
        open={editorOpen}
        component={editingComp}
        onClose={() => { setEditorOpen(false); setEditingComp(null); setVersions([]); }}
        onSave={handleSave}
        onPreview={() => { setPreviewComp(editingComp); setEditorOpen(false); }}
        versions={versions}
        onSaveVersion={handleVersionSave}
        onRestoreVersion={handleVersionRestore}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        title="Delete Component"
        message={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.type || 'this component'}"?`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      <ConfirmDialog
        open={!!duplicateTarget}
        onClose={() => setDuplicateTarget(null)}
        onConfirm={doDuplicate}
        title="Duplicate Component"
        message={`Duplicate "${duplicateTarget?.name || duplicateTarget?.type || 'this component'}"?`}
        confirmText="Duplicate"
        type="info"
      />
    </>
  );
}
