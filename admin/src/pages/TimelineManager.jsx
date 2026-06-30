import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';

const categories = ['Career', 'Education', 'Project', 'Achievement'];
const categoryColors = {
  Career: { bg: 'var(--color-primary-light)', color: 'var(--color-primary)' },
  Education: { bg: 'var(--color-success-light)', color: 'var(--color-success)' },
  Project: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  Achievement: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)' },
};

const defaultEvent = {
  title: '',
  subtitle: '',
  date: '',
  endDate: '',
  present: false,
  category: 'Career',
  description: '',
  icon: '',
  color: '#3B82F6',
  featured: false,
  order: 0,
};

export default function TimelineManager() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [form, setForm] = useState({ ...defaultEvent });

  useEffect(() => { fetchTimeline(); }, []);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      const settings = res.data?.data || res.data?.settings || {};
      setEvents(settings.timeline || []);
    } catch {
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const saveTimeline = async (updated) => {
    setSaving(true);
    try {
      const res = await adminApi.getSettings();
      const current = res.data?.data || res.data?.settings || {};
      await adminApi.updateSettings({ ...current, timeline: updated });
      setEvents(updated);
      toast.success('Timeline saved');
    } catch {
      toast.error('Failed to save timeline');
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...defaultEvent });
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      title: event.title || '',
      subtitle: event.subtitle || '',
      date: event.date || '',
      endDate: event.endDate || '',
      present: event.present || false,
      category: event.category || 'Career',
      description: event.description || '',
      icon: event.icon || '',
      color: event.color || '#3B82F6',
      featured: event.featured || false,
      order: event.order ?? 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.date.trim()) { toast.error('Date is required'); return; }
    setSaving(true);
    try {
      let updated;
      if (editing) {
        updated = events.map(e => e._id === editing._id ? { ...form, _id: editing._id } : e);
      } else {
        updated = [...events, { ...form, _id: 'evt_' + Date.now() }];
      }
      await saveTimeline(updated);
      setShowModal(false);
    } catch {
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const updated = events.filter(e => e._id !== deleteTarget._id);
    await saveTimeline(updated);
    setDeleteTarget(null);
  };

  const filtered = useMemo(() => {
    return events.filter(e => {
      const q = searchVal.toLowerCase();
      if (q && !e.title?.toLowerCase().includes(q) && !e.subtitle?.toLowerCase().includes(q)) return false;
      if (filterCategory && e.category !== filterCategory) return false;
      return true;
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [events, searchVal, filterCategory]);

  const stats = [
    { label: 'Total Events', value: events.length, icon: Icons.clock, color: 'blue' },
    { label: 'Career Events', value: events.filter(e => e.category === 'Career').length, icon: Icons.briefcase, color: 'green' },
    { label: 'Education Events', value: events.filter(e => e.category === 'Education').length, icon: Icons['graduation-cap'], color: 'yellow' },
    { label: 'Project Events', value: events.filter(e => e.category === 'Project').length, icon: Icons.code, color: 'purple' },
  ];

  const toggleDesc = (id) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <PageLayout title="Timeline Manager" description="Interactive timeline builder" stats={stats}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Timeline Manager" description="Interactive timeline builder" stats={stats}>
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search timeline events..."
        filters={[
          { key: 'category', label: 'Category', type: 'select', options: categories },
        ]}
        filterValues={{ category: filterCategory }}
        onFilterChange={(key, val) => {
          if (val === '__reset__' || key === '__reset__') setFilterCategory('');
          else setFilterCategory(val);
        }}
        onAddNew={openCreate}
        onRefresh={fetchTimeline}
        extraActions={[
          {
            label: 'Save Timeline',
            icon: Icons.save,
            onClick: () => saveTimeline(events),
          },
        ]}
      />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.clock} size={40} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>No timeline events found</h3>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 30 }}>
          <div style={{
            position: 'absolute',
            left: 11,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--color-border)',
          }} />
          {filtered.map((event, idx) => {
            const catColor = categoryColors[event.category] || categoryColors.Career;
            return (
              <div
                key={event._id || idx}
                style={{
                  position: 'relative',
                  marginBottom: '1rem',
                  paddingLeft: 30,
                }}
                onMouseEnter={(e) => { e.currentTarget.querySelector('.timeline-actions').style.opacity = 1; }}
                onMouseLeave={(e) => { e.currentTarget.querySelector('.timeline-actions').style.opacity = 0; }}
              >
                <div style={{
                  position: 'absolute',
                  left: -23,
                  top: 20,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: event.color || '#3B82F6',
                  border: '3px solid var(--color-card)',
                  zIndex: 1,
                }} />
                <div style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  padding: '1rem 1.25rem',
                  transition: 'box-shadow 0.15s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)' }}>{event.date || '?'}</span>
                        {event.endDate && !event.present && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>— {event.endDate}</span>
                        )}
                        {event.present && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>— Present</span>
                        )}
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: 4,
                          fontWeight: 600,
                          background: catColor.bg,
                          color: catColor.color,
                        }}>
                          {event.category}
                        </span>
                        {event.featured && (
                          <Icon path={Icons.star} size={12} style={{ color: '#F59E0B' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.15rem' }}>
                        {event.icon && <span style={{ marginRight: 4 }}>{event.icon}</span>}
                        {event.title}
                      </div>
                      {event.subtitle && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
                          {event.subtitle}
                        </div>
                      )}
                      {event.description && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                          {expandedDesc[event._id] || event.description.length <= 120
                            ? event.description
                            : event.description.substring(0, 120) + '...'}
                          {event.description.length > 120 && (
                            <button
                              onClick={() => toggleDesc(event._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.78rem', padding: 0, marginLeft: 4 }}
                            >
                              {expandedDesc[event._id] ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="timeline-actions" style={{
                      display: 'flex',
                      gap: 2,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      flexShrink: 0,
                    }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(event)} data-tooltip="Edit">
                        <Icon path={Icons.edit} size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(event)} data-tooltip="Delete" style={{ color: 'var(--color-danger)' }}>
                        <Icon path={Icons.trash2} size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Event' : 'Add Event'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Subtitle</label>
                  <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Role or position" />
                </div>
                <div className="form-group">
                  <label>Date / Year</label>
                  <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="2024" />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} placeholder="2026" disabled={form.present} style={{ flex: 1 }} />
                    <label className="form-check" style={{ whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={form.present} onChange={(e) => setForm({ ...form, present: e.target.checked, endDate: e.target.checked ? '' : form.endDate })} />
                      <span>Present</span>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Event description..." />
                </div>
                <div className="form-group">
                  <label>Icon / Emoji</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🚀" />
                </div>
                <div className="form-group">
                  <label>Timeline Dot Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{form.color}</span>
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <label className="form-check">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    <span>Featured event</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><Icon path={Icons.save} size={14} /> {editing ? 'Update' : 'Add'} Event</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
        type="danger"
      />
    </PageLayout>
  );
}
