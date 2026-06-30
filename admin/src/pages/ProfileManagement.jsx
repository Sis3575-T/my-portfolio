import React, { useState, useEffect, useRef } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';

export default function ProfileManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ name: '', email: '', photo: '', photoFile: null });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getMe();
      const user = data.user || data;
      setProfile(user);
      setForm({
        name: user.name || '',
        email: user.email || '',
        photo: user.photo || user.avatar || '',
        photoFile: null,
      });
      try {
        const { data: logs } = await adminApi.getRecentActivity();
        setActivityLogs(logs.data || logs || []);
      } catch {}
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.photoFile) fd.append('photo', form.photoFile);
      await adminApi.updateProfile(fd);
      toast.success('Profile updated');
      await fetchData();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill in all fields'); return;
    }
    if (passwordForm.new.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (passwordForm.new !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await adminApi.changePassword(passwordForm.current, passwordForm.new);
      toast.success('Password changed successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, photoFile: file, photo: URL.createObjectURL(file) });
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Icons.user },
    { id: 'security', label: 'Security', icon: Icons.shield },
    { id: 'activity', label: 'Activity', icon: Icons.activity },
  ];

  if (loading) {
    return (
      <PageLayout title="Profile Management" description="Manage your admin profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Profile Management"
      description="Manage your admin profile and account settings"
      quickActions={activeTab === 'profile' ? [
        { label: saving ? 'Saving...' : 'Save Profile', icon: Icons.save, onClick: handleSaveProfile, primary: true },
      ] : undefined}
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem',
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            <Icon path={tab.icon} size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Profile Photo</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-border)', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => fileInputRef.current?.click()}
              >
                {form.photo ? (
                  <img src={form.photoFile ? form.photo : imageUrl(form.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Icon path={Icons.user} size={36} style={{ color: 'var(--color-text-tertiary)' }} />
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>Upload Photo</button>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Personal Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', margin: '0.25rem 0 0' }}>Email cannot be changed here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ maxWidth: 480, padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Change Password</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Enter current password" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="Enter new password (min 8 chars)" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm new password" />
            </div>
            <button className="btn btn-primary" onClick={handleChangePassword} disabled={changingPassword} style={{ alignSelf: 'flex-start' }}>
              <Icon path={Icons.save} size={14} /> {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
            <div style={{ padding: '0.75rem', background: 'var(--color-bg-subtle)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              <strong>Requirements:</strong>
              <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0 0', lineHeight: 1.6 }}>
                <li>Minimum 8 characters</li>
                <li>Use a mix of letters, numbers, and symbols</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Recent Login Activity</h3>
          {activityLogs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--color-text-tertiary)' }}>
              <Icon path={Icons.activity} size={36} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>No recent activity</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(activityLogs.slice ? activityLogs : []).slice(0, 20).map((log, i) => (
                <div key={log._id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, background: 'var(--color-bg-subtle)' }}>
                  <Icon path={log.action?.includes('login') ? Icons['log-in'] : Icons.activity} size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--color-text)' }}>{log.action || 'Activity'}</div>
                    {log.details && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</div>}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{formatDate(log.timestamp || log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
