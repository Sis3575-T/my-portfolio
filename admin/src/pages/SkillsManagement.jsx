import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';

const categoryOptions = ['Frontend', 'Backend', 'Database', 'Tools', 'Other'];

const getCategoryColor = (cat) => {
  const colors = { Frontend: '#3B82F6', Backend: '#10B981', Database: '#F59E0B', Tools: '#8B5CF6', Other: '#6B7280' };
  return colors[cat] || '#6B7280';
};

export default function SkillsManagement() {
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterVal, setFilterVal] = useState({ category: '' });
  const [form, setForm] = useState({ name: '', category: 'Frontend', proficiency: 80, icon: '', order: 0 });

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getSkills();
      setSkills(data.data || []);
    } catch {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'Frontend', proficiency: 80, icon: '', order: 0 });
    setShowModal(true);
  };

  const openEdit = (skill) => {
    setEditing(skill);
    setForm({ name: skill.name || '', category: skill.category || 'Frontend', proficiency: skill.proficiency ?? 80, icon: skill.icon || '', order: skill.order ?? 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) await adminApi.updateSkill(editing._id, form);
      else await adminApi.createSkill(form);
      toast.success(editing ? 'Skill updated' : 'Skill created');
      await fetchSkills();
      setShowModal(false);
    } catch {
      toast.error('Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteSkill(deleteTarget._id);
      toast.success('Skill deleted');
      setSkills(prev => prev.filter(s => s._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete skill');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const moveSkill = (index, direction) => {
    const newSkills = [...skills];
    const target = index + direction;
    if (target < 0 || target >= newSkills.length) return;
    [newSkills[index], newSkills[target]] = [newSkills[target], newSkills[index]];
    setSkills(newSkills);
  };

  const filteredSkills = skills.filter(s => {
    const q = searchVal.toLowerCase();
    if (q && !s.name?.toLowerCase().includes(q)) return false;
    if (filterVal.category && s.category !== filterVal.category) return false;
    return true;
  });

  const stats = [
    { label: 'Total Skills', value: skills.length, icon: Icons.code, color: 'blue' },
    { label: 'Frontend', value: skills.filter(s => s.category === 'Frontend').length, icon: Icons.code, color: 'blue' },
    { label: 'Backend', value: skills.filter(s => s.category === 'Backend').length, icon: Icons.database, color: 'green' },
    { label: 'Database', value: skills.filter(s => s.category === 'Database').length, icon: Icons.database, color: 'yellow' },
    { label: 'Tools', value: skills.filter(s => s.category === 'Tools').length, icon: Icons.settings, color: 'purple' },
    { label: 'Other', value: skills.filter(s => s.category === 'Other' || !categoryOptions.includes(s.category)).length, icon: Icons.grid, color: 'gray' },
  ];

  return (
    <PageLayout
      title="Skills Management"
      description="Manage your technical skills"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search skills..."
        filters={[
          { key: 'category', label: 'Category', type: 'select', options: categoryOptions },
        ]}
        filterValues={filterVal}
        onFilterChange={(key, val) => {
          if (key === '__reset__' || val === '__reset__') setFilterVal({ category: '' });
          else setFilterVal({ ...filterVal, [key]: val });
        }}
        onAddNew={openCreate}
        onRefresh={fetchSkills}
      />

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
              <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 12, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 16, borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div className="skeleton" style={{ width: '100%', height: 10, borderRadius: 5, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)' }}>
          <Icon path={Icons.code} size={48} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>No skills found</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Click 'Add New' to add your first skill.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredSkills.map((skill, index) => (
            <div
              key={skill._id}
              style={{
                padding: '1.25rem', borderRadius: 14, border: '1px solid var(--color-border)',
                background: 'var(--color-card)', transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${getCategoryColor(skill.category)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    {skill.icon ? <span style={{ fontSize: '1.5rem' }}>{skill.icon}</span> : <Icon path={Icons.code} size={20} style={{ color: getCategoryColor(skill.category) }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>{skill.name}</div>
                    <span className="badge" style={{ background: `${getCategoryColor(skill.category)}18`, color: getCategoryColor(skill.category), fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{skill.category || 'Other'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button onClick={() => moveSkill(index, -1)} disabled={index === 0} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', background: 'transparent', opacity: index === 0 ? 0.3 : 1 }}>
                    <Icon path={Icons['chevron-up']} size={14} />
                  </button>
                  <button onClick={() => moveSkill(index, 1)} disabled={index >= filteredSkills.length - 1} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: index >= filteredSkills.length - 1 ? 'default' : 'pointer', color: index >= filteredSkills.length - 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', background: 'transparent', opacity: index >= filteredSkills.length - 1 ? 0.3 : 1 }}>
                    <Icon path={Icons['chevron-down']} size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1, height: 10, background: 'var(--color-bg)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${skill.proficiency}%`, height: '100%', background: `linear-gradient(90deg, ${getCategoryColor(skill.category)}, ${getCategoryColor(skill.category)}dd)`, borderRadius: 5, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 32, textAlign: 'right' }}>{skill.proficiency}%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Order: {skill.order ?? index + 1}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(skill)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-text-secondary)', background: 'transparent', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icon path={Icons.edit} size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(skill)} style={{ width: 30, height: 30, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--color-danger)', background: 'transparent', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icon path={Icons.trash2} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Skill' : 'Add Skill'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="React, Node.js, etc." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {categoryOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label>Proficiency: {form.proficiency}%</label>
                <input type="range" min={0} max={100} value={form.proficiency} onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })} style={{ width: '100%', accentColor: getCategoryColor(form.category) }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}><span>0</span><span>50</span><span>100</span></div>
              </div>
              <div className="form-group">
                <label>Icon (emoji or text)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. ⚛️ or React" />
                {form.icon && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.5rem' }}>{form.icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Preview</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Skill' : 'Create Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </PageLayout>
  );
}
