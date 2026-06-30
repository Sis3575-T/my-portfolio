import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

const ROLES = ['admin', 'editor', 'user'];

const roleColors = {
  admin: { bg: '#EF444418', color: '#EF4444' },
  editor: { bg: '#3B82F618', color: '#3B82F6' },
  user: { bg: '#10B98118', color: '#10B981' },
};

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', role: 'user', isActive: true, password: '',
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', role: 'user', isActive: true, password: '' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name || '', email: user.email || '', role: user.role || 'user', isActive: user.isActive !== false, password: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (!editing && !form.password.trim()) { toast.error('Password is required'); return; }
    if (form.password && form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) {
        await api.put(`/users/${editing._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', payload);
        toast.success('User created');
      }
      await fetchUsers();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      await api.put(`/users/${toggleTarget._id}`, { isActive: !toggleTarget.isActive });
      toast.success(`User ${toggleTarget.isActive ? 'deactivated' : 'activated'}`);
      setUsers(prev => prev.map(u => u._id === toggleTarget._id ? { ...u, isActive: !u.isActive } : u));
    } catch {
      toast.error('Failed to toggle user status');
    } finally {
      setToggling(false);
      setToggleTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchVal.toLowerCase();
    if (!q) return true;
    return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  });

  const total = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const editorCount = users.filter(u => u.role === 'editor').length;
  const activeCount = users.filter(u => u.isActive !== false).length;

  const stats = [
    { label: 'Total Users', value: total, icon: Icons.users, color: 'blue' },
    { label: 'Admins', value: adminCount, icon: Icons.user, color: 'red' },
    { label: 'Editors', value: editorCount, icon: Icons.edit, color: 'purple' },
    { label: 'Active', value: activeCount, icon: Icons['check-circle'], color: 'green' },
  ];

  const columns = [
    {
      key: 'name', label: 'User', sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {row.photo || row.avatar ? (
              <img src={imageUrl(row.photo || row.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{(row.name || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text)' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role', sortable: true,
      render: (row) => {
        const c = roleColors[row.role] || roleColors.user;
        return (
          <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, background: c.bg, color: c.color }}>
            {row.role || 'user'}
          </span>
        );
      },
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: (row) => (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600,
          background: row.isActive !== false ? '#10B98118' : '#EF444418',
          color: row.isActive !== false ? '#10B981' : '#EF4444',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.isActive !== false ? '#10B981' : '#EF4444' }} />
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin', label: 'Last Login', sortable: true,
      render: (row) => {
        if (!row.lastLogin) return <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>Never</span>;
        return <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{new Date(row.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
      },
    },
  ];

  return (
    <PageLayout
      title="Users Management"
      description="Manage admin users and their roles"
      stats={stats}
    >
      <Toolbar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        searchPlaceholder="Search users..."
        onAddNew={openCreate}
        onRefresh={fetchUsers}
      />

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No users found"
        emptyIcon={Icons.users}
        actions={[
          { icon: Icons.edit, onClick: (row) => openEdit(row), label: 'Edit' },
          { icon: Icons['user-check'], onClick: (row) => setToggleTarget(row), label: 'Toggle Status' },
          { icon: Icons.trash2, onClick: (row) => setDeleteTarget(row), label: 'Delete', variant: 'danger' },
        ]}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{editing ? 'New Password (leave blank to keep current)' : 'Password'} {!editing && <span style={{ color: 'var(--color-danger)' }}>*</span>}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleStatus}
        title="Toggle User Status"
        message={`${toggleTarget?.isActive ? 'Deactivate' : 'Activate'} user "${toggleTarget?.name}"?`}
        confirmText={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        type="warning"
        loading={toggling}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Delete user "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </PageLayout>
  );
}
