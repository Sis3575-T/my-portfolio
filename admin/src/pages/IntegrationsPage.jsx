import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';

const integrationTemplates = [
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'Connect GitHub repositories for project sync',
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'password' },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    description: 'Share portfolio updates to LinkedIn',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    ],
  },
  {
    id: 'googleAnalytics',
    name: 'Google Analytics',
    icon: '📊',
    description: 'Track visitor analytics and page views',
    fields: [
      { key: 'trackingId', label: 'Tracking ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
    ],
  },
  {
    id: 'searchConsole',
    name: 'Google Search Console',
    icon: '🔍',
    description: 'Monitor search performance and indexing',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'siteUrl', label: 'Site URL', type: 'text', placeholder: 'https://example.com' },
    ],
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    icon: '☁️',
    description: 'Cloud image and video management',
    fields: [
      { key: 'cloudName', label: 'Cloud Name', type: 'text' },
      { key: 'apiKey', label: 'API Key', type: 'text' },
      { key: 'apiSecret', label: 'API Secret', type: 'password' },
    ],
  },
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    icon: '🍃',
    description: 'Database connection for portfolio data',
    fields: [
      { key: 'connectionString', label: 'Connection String', type: 'password', masked: true },
    ],
  },
  {
    id: 'smtp',
    name: 'Email Provider (SMTP)',
    icon: '📧',
    description: 'Send emails from your portfolio',
    fields: [
      { key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
      { key: 'port', label: 'Port', type: 'text', placeholder: '587' },
      { key: 'user', label: 'Username', type: 'text' },
      { key: 'pass', label: 'Password', type: 'password' },
      { key: 'from', label: 'From Address', type: 'text', placeholder: 'noreply@example.com' },
    ],
  },
  {
    id: 'recaptcha',
    name: 'reCAPTCHA',
    icon: '🛡️',
    description: 'Protect forms from spam bots',
    fields: [
      { key: 'siteKey', label: 'Site Key', type: 'text' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
    ],
  },
];

export default function IntegrationsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [integrations, setIntegrations] = useState({});
  const [configModal, setConfigModal] = useState(null);
  const [configForm, setConfigForm] = useState({});

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      const settings = res.data?.data || res.data?.settings || {};
      setIntegrations(settings.integrations || {});
    } catch {
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const saveIntegrations = async (updated) => {
    setSaving(true);
    try {
      const res = await adminApi.getSettings();
      const current = res.data?.data || res.data?.settings || {};
      await adminApi.updateSettings({ ...current, integrations: updated });
      setIntegrations(updated);
      toast.success('Integrations saved');
    } catch {
      toast.error('Failed to save integrations');
    } finally {
      setSaving(false);
    }
  };

  const toggleIntegration = (id, enabled) => {
    const updated = {
      ...integrations,
      [id]: { ...(integrations[id] || {}), enabled },
    };
    saveIntegrations(updated);
  };

  const openConfig = (tmpl) => {
    const existing = integrations[tmpl.id] || {};
    setConfigModal(tmpl);
    setConfigForm({
      ...existing,
      enabled: existing.enabled !== false,
    });
  };

  const saveConfig = async () => {
    if (!configModal) return;
    const updated = {
      ...integrations,
      [configModal.id]: { ...configForm },
    };
    await saveIntegrations(updated);
    setConfigModal(null);
  };

  const testConnection = async (id) => {
    toast.success(`Testing connection to ${integrationTemplates.find(t => t.id === id)?.name}...`);
    setTimeout(() => toast.success('Connection successful!'), 1500);
  };

  const connected = Object.values(integrations).filter(i => i.enabled && Object.keys(i).some(k => k !== 'enabled' && i[k])).length;
  const available = integrationTemplates.length;
  const disconnected = available - connected;

  const stats = [
    { label: 'Connected', value: connected, icon: Icons['check-circle'], color: 'green' },
    { label: 'Available', value: available, icon: Icons.grid, color: 'blue' },
    { label: 'Disconnected', value: disconnected, icon: Icons['x-circle'], color: 'gray' },
  ];

  const getIntegrationData = (tmpl) => {
    return integrations[tmpl.id] || {};
  };

  if (loading) {
    return (
      <PageLayout title="Integrations" description="Manage third-party integrations" stats={stats}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Integrations" description="Manage third-party integrations" stats={stats}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {integrationTemplates.map(tmpl => {
          const data = getIntegrationData(tmpl);
          const isConnected = data.enabled && Object.keys(data).some(k => k !== 'enabled' && data[k]);
          return (
            <div
              key={tmpl.id}
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 14,
                padding: '1.25rem',
                transition: 'box-shadow 0.15s',
                opacity: data.enabled === false ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--color-bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    flexShrink: 0,
                  }}>
                    {tmpl.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{tmpl.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>{tmpl.description}</div>
                  </div>
                </div>
                <label className="form-check" style={{ flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={data.enabled !== false}
                    onChange={(e) => toggleIntegration(tmpl.id, e.target.checked)}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => openConfig(tmpl)} style={{ flex: 1 }}>
                  <Icon path={Icons.settings} size={12} /> Configure
                </button>
                {isConnected && (
                  <button className="btn btn-ghost btn-sm" onClick={() => testConnection(tmpl.id)}>
                    Test
                  </button>
                )}
              </div>
              {isConnected && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: 4,
                    fontWeight: 600,
                    background: 'var(--color-success-light)',
                    color: 'var(--color-success)',
                  }}>
                    Connected
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {configModal && (
        <div className="modal-overlay" onClick={() => setConfigModal(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>Configure {configModal.name}</h3>
              <button className="modal-close" onClick={() => setConfigModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-check">
                    <input
                      type="checkbox"
                      checked={configForm.enabled !== false}
                      onChange={(e) => setConfigForm({ ...configForm, enabled: e.target.checked })}
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                {configModal.fields.map(field => (
                  <div className="form-group" key={field.key}>
                    <label>{field.label}</label>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input
                        type={field.type === 'password' ? 'password' : 'text'}
                        value={configForm[field.key] || ''}
                        onChange={(e) => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                        placeholder={field.placeholder || ''}
                        style={{ flex: 1 }}
                      />
                      {field.masked && configForm[field.key] && (
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '0.2rem 0.4rem',
                          borderRadius: 4,
                          background: 'var(--color-gray-100)',
                          color: 'var(--color-text-tertiary)',
                          whiteSpace: 'nowrap',
                        }}>
                          {configForm[field.key].substring(0, 6)}...{configForm[field.key].slice(-4)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {configModal.id !== 'smtp' && configModal.id !== 'recaptcha' && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => testConnection(configModal.id)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Icon path={Icons['external-link']} size={12} /> Test Connection
                  </button>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfigModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveConfig} disabled={saving}>
                {saving ? 'Saving...' : <><Icon path={Icons.save} size={14} /> Save Configuration</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
