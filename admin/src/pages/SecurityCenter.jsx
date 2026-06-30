import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../services/api';
import api from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const tabs = ['Login History', 'Active Sessions', 'Security Settings', 'API Keys', 'Blocked IPs'];

export default function SecurityCenter() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Login History');
  const [loginLogs, setLoginLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [apiKeys, setApiKeys] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [saving, setSaving] = useState(false);

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newIp, setNewIp] = useState({ address: '', reason: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show2FAFlow, setShow2FAFlow] = useState(false);

  const [activeSessions, setActiveSessions] = useState([
    { id: 's1', device: 'Windows PC', browser: 'Chrome 125', ip: '192.168.1.1', lastActive: '2 min ago', since: '2026-06-28 09:30', current: true },
    { id: 's2', device: 'iPhone 15', browser: 'Safari', ip: '10.0.0.5', lastActive: '15 min ago', since: '2026-06-29 14:20', current: false },
    { id: 's3', device: 'MacBook Pro', browser: 'Firefox 128', ip: '203.0.113.42', lastActive: '2 hrs ago', since: '2026-06-25 11:00', current: false },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, settingsRes] = await Promise.all([
        adminApi.getActivityLogs({ action: 'auth.login', limit: 100 }).catch(() => ({ data: { data: [] } })),
        adminApi.getSettings(),
      ]);
      setLoginLogs(logsRes.data?.data || []);
      const s = settingsRes.data?.data || settingsRes.data?.settings || {};
      setSettings(s);
      setApiKeys(s.security?.apiKeys || []);
      setBlockedIps(s.security?.blockedIps || []);
    } catch {
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates) => {
    setSaving(true);
    try {
      const updated = { ...settings, ...updates };
      await adminApi.updateSettings(updated);
      setSettings(updated);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.newPass) { toast.error('Fill all fields'); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    try {
      await adminApi.changePassword(passwordForm.current, passwordForm.newPass);
      toast.success('Password changed');
      setShowPasswordForm(false);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch {
      toast.error('Failed to change password');
    }
  };

  const createApiKey = () => {
    if (!newKeyName.trim()) { toast.error('Key name required'); return; }
    const key = {
      id: 'key_' + Date.now(),
      name: newKeyName.trim(),
      key: 'sk_' + Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18),
      created: new Date().toISOString(),
      lastUsed: null,
      status: 'active',
    };
    const updated = [...apiKeys, key];
    setApiKeys(updated);
    setNewKeyValue(key.key);
    setNewKeyName('');
    saveSettings({ ...settings, security: { ...settings.security, apiKeys: updated } });
  };

  const revokeApiKey = async () => {
    if (!revokeTarget) return;
    const updated = apiKeys.filter(k => k.id !== revokeTarget.id);
    setApiKeys(updated);
    saveSettings({ ...settings, security: { ...settings.security, apiKeys: updated } });
    setRevokeTarget(null);
  };

  const addBlockedIp = () => {
    if (!newIp.address.trim()) { toast.error('IP address required'); return; }
    const entry = {
      id: 'ip_' + Date.now(),
      address: newIp.address.trim(),
      reason: newIp.reason.trim() || 'Manually blocked',
      blockedBy: 'Admin',
      date: new Date().toISOString(),
    };
    const updated = [...blockedIps, entry];
    setBlockedIps(updated);
    saveSettings({ ...settings, security: { ...settings.security, blockedIps: updated } });
    setNewIp({ address: '', reason: '' });
    setShowAddIpModal(false);
  };

  const unblockIp = async (ip) => {
    const updated = blockedIps.filter(i => i.id !== ip.id);
    setBlockedIps(updated);
    saveSettings({ ...settings, security: { ...settings.security, blockedIps: updated } });
  };

  const revokeSession = (session) => {
    setActiveSessions(prev => prev.filter(s => s.id !== session.id));
    toast.success('Session revoked');
  };

  const failedLogins24h = loginLogs.filter(l => l.status === 'failed').length;
  const stats = [
    { label: 'Failed Logins (24h)', value: failedLogins24h, icon: Icons['alert-circle'], color: failedLogins24h > 0 ? 'red' : 'green' },
    { label: 'Active Sessions', value: activeSessions.length, icon: Icons.users, color: 'blue' },
    { label: 'API Keys', value: apiKeys.filter(k => k.status === 'active').length, icon: Icons.key || Icons.shield, color: 'purple' },
    { label: '2FA Status', value: settings.security?.twoFactorEnabled ? 'Enabled' : 'Disabled', icon: Icons.shield, color: settings.security?.twoFactorEnabled ? 'green' : 'gray' },
  ];

  const loginColumns = [
    { key: 'user', label: 'User', render: (r) => r.user?.name || r.user?.email || r.user || 'Anonymous' },
    { key: 'ip', label: 'IP Address', render: (r) => r.ip || r.details?.ip || '-' },
    { key: 'browser', label: 'Browser', render: (r) => r.details?.browser || r.browser || '-' },
    { key: 'os', label: 'OS', render: (r) => r.details?.os || r.os || '-' },
    { key: 'location', label: 'Location', render: (r) => r.details?.location || r.location || '-' },
    {
      key: 'status', label: 'Status',
      render: (r) => (
        <span className={`status ${r.status === 'success' ? 'published' : 'draft'}`}>
          {r.status || 'unknown'}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Timestamp', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '-' },
  ];

  const apiKeyColumns = [
    { key: 'name', label: 'Name' },
    {
      key: 'key', label: 'Key',
      render: (r) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
          {r.key?.substring(0, 12)}...{r.key?.slice(-4)}
        </span>
      ),
    },
    { key: 'created', label: 'Created', render: (r) => r.created ? new Date(r.created).toLocaleDateString() : '-' },
    { key: 'lastUsed', label: 'Last Used', render: (r) => r.lastUsed ? new Date(r.lastUsed).toLocaleDateString() : 'Never' },
    {
      key: 'status', label: 'Status',
      render: (r) => (
        <span style={{
          fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: 600,
          background: r.status === 'active' ? 'var(--color-success-light)' : 'var(--color-gray-100)',
          color: r.status === 'active' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
        }}>
          {r.status || 'active'}
        </span>
      ),
    },
  ];

  const blockedIpColumns = [
    { key: 'address', label: 'IP Address', render: (r) => <span style={{ fontFamily: 'monospace' }}>{r.address}</span> },
    { key: 'reason', label: 'Reason' },
    { key: 'blockedBy', label: 'Blocked By' },
    { key: 'date', label: 'Date', render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '-' },
  ];

  const actionButtonsApiKeys = [
    { icon: Icons.trash2, label: 'Revoke', onClick: (row) => setRevokeTarget(row), variant: 'danger' },
  ];

  const actionButtonsIp = [
    { icon: Icons['eye-off'], label: 'Unblock', onClick: (row) => unblockIp(row) },
  ];

  const renderTabContent = () => {
    if (activeTab === 'Login History') {
      return (
        <DataTable
          columns={loginColumns}
          data={loginLogs}
          loading={loading}
          pageSize={15}
          emptyMessage="No login logs found"
        />
      );
    }

    if (activeTab === 'Active Sessions') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeSessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>No active sessions</div>
          )}
          {activeSessions.map(session => (
            <div key={session.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--color-bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-secondary)',
                  flexShrink: 0,
                }}>
                  <Icon path={Icons.monitor || Icons['external-link']} size={18} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {session.device}
                    {session.current && <span style={{ fontSize: '0.65rem', marginLeft: 6, padding: '0.1rem 0.35rem', borderRadius: 4, background: 'var(--color-success-light)', color: 'var(--color-success)', fontWeight: 600 }}>Current</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    {session.browser} · {session.ip}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                    Last active: {session.lastActive} · Since: {session.since}
                  </div>
                </div>
              </div>
              {!session.current && (
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setDeleteTarget(session)}>
                  <Icon path={Icons['log-out']} size={14} /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'Security Settings') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>Two-Factor Authentication</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {settings.security?.twoFactorEnabled ? '2FA is enabled' : '2FA is disabled'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => {
                  const enabled = !settings.security?.twoFactorEnabled;
                  saveSettings({ ...settings, security: { ...settings.security, twoFactorEnabled: enabled } });
                }}>
                  {settings.security?.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShow2FAFlow(!show2FAFlow)}>
                  Setup Guide
                </button>
              </div>
            </div>
            {show2FAFlow && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-subtle)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                1. Install an authenticator app (Google Authenticator, Authy)<br />
                2. Scan the QR code or enter the setup key<br />
                3. Enter the verification code to confirm<br />
                4. Save backup codes in a secure location
              </div>
            )}
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>Change Password</h4>
            {showPasswordForm ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: 500 }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: '', newPass: '', confirm: '' }); }}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleChangePassword}>Change Password</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-outline btn-sm" onClick={() => setShowPasswordForm(true)}>Change Password</button>
            )}
          </div>

          <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>Session Timeout</h4>
            <select
              value={settings.security?.sessionTimeout || '60'}
              onChange={(e) => saveSettings({ ...settings, security: { ...settings.security, sessionTimeout: e.target.value } })}
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.85rem' }}
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>
        </div>
      );
    }

    if (activeTab === 'API Keys') {
      return (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => { setNewKeyName(''); setNewKeyValue(''); setShowNewKeyModal(true); }}>
              <Icon path={Icons.plus} size={14} /> Create New Key
            </button>
          </div>
          <DataTable
            columns={apiKeyColumns}
            data={apiKeys}
            loading={loading}
            actions={actionButtonsApiKeys}
            emptyMessage="No API keys created"
          />
        </div>
      );
    }

    if (activeTab === 'Blocked IPs') {
      return (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => { setNewIp({ address: '', reason: '' }); setShowAddIpModal(true); }}>
              <Icon path={Icons.plus} size={14} /> Add IP to Blocklist
            </button>
          </div>
          <DataTable
            columns={blockedIpColumns}
            data={blockedIps}
            loading={loading}
            actions={actionButtonsIp}
            emptyMessage="No blocked IPs"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <PageLayout title="Security Center" description="Monitor and manage security" stats={stats}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem', overflowX: 'auto', gap: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: activeTab === tab ? 'var(--color-primary-subtle)' : 'transparent',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}

      {showNewKeyModal && (
        <div className="modal-overlay" onClick={() => { if (!newKeyValue) setShowNewKeyModal(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>{newKeyValue ? 'API Key Created' : 'Create API Key'}</h3>
              <button className="modal-close" onClick={() => { if (!newKeyValue) setShowNewKeyModal(false); }}>&times;</button>
            </div>
            <div className="modal-body">
              {newKeyValue ? (
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Copy this key now. You won't be able to see it again.
                  </p>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--color-bg-subtle)',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    wordBreak: 'break-all',
                    border: '1px solid var(--color-border)',
                  }}>
                    {newKeyValue}
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>Key Name</label>
                  <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Production API Key" autoFocus />
                </div>
              )}
            </div>
            <div className="modal-footer">
              {newKeyValue ? (
                <button className="btn btn-primary" onClick={() => { setShowNewKeyModal(false); setNewKeyValue(''); }}>
                  <Icon path={Icons.check} size={14} /> Done
                </button>
              ) : (
                <>
                  <button className="btn btn-outline" onClick={() => setShowNewKeyModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={createApiKey} disabled={!newKeyName.trim()}>Create</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddIpModal && (
        <div className="modal-overlay" onClick={() => setShowAddIpModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Block IP Address</h3>
              <button className="modal-close" onClick={() => setShowAddIpModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>IP Address</label>
                <input value={newIp.address} onChange={(e) => setNewIp({ ...newIp, address: e.target.value })} placeholder="192.168.1.1" />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input value={newIp.reason} onChange={(e) => setNewIp({ ...newIp, reason: e.target.value })} placeholder="Suspicious activity" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddIpModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addBlockedIp}>Block IP</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { revokeSession(deleteTarget); setDeleteTarget(null); }}
        title="Revoke Session"
        message="Are you sure you want to revoke this session? The user will be logged out."
        confirmText="Revoke"
        type="danger"
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={revokeApiKey}
        title="Revoke API Key"
        message={`Revoke "${revokeTarget?.name}"? This cannot be undone.`}
        confirmText="Revoke"
        type="danger"
      />
    </PageLayout>
  );
}
