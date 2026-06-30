import React, { useState } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';

export default function ChangePassword() {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!current || !newPass || !confirm) { toast.error('Please fill in all fields'); return false; }
    if (newPass.length < 8) { toast.error('New password must be at least 8 characters'); return false; }
    if (newPass !== confirm) { toast.error('New passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await adminApi.changePassword(current, newPass);
      toast.success('Password changed successfully');
      setCurrent('');
      setNewPass('');
      setConfirm('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ value, onChange, placeholder, show, onToggle }) => (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingRight: '40px', width: '100%' }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px',
        }}
        tabIndex={-1}
      >
        <Icon path={show ? Icons['eye-off'] : Icons.eye} size={16} />
      </button>
    </div>
  );

  return (
    <PageLayout
      title="Change Password"
      description="Update your admin account password"
      breadcrumbs={[{ label: 'Settings' }, { label: 'Change Password' }]}
    >
      <div style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem', borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Current Password</label>
              <PasswordInput value={current} onChange={setCurrent} placeholder="Enter current password" show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <PasswordInput value={newPass} onChange={setNewPass} placeholder="Enter new password (min 8 chars)" show={showNew} onToggle={() => setShowNew(!showNew)} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
              <Icon path={Icons.save} size={14} /> {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>

        <div style={{ padding: '1rem', marginTop: '1rem', background: 'var(--color-bg-subtle)', borderRadius: 10, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text)', display: 'block', marginBottom: '0.25rem' }}>Password Requirements:</strong>
          <ul style={{ paddingLeft: '1rem', margin: 0, lineHeight: 1.8 }}>
            <li>Minimum 8 characters</li>
            <li>Should be different from your current password</li>
            <li>Use a combination of letters, numbers, and symbols</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
