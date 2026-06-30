import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';

const tabs = ['Navbar', 'Footer', 'Sidebar', 'Global Elements'];

const defaultLayout = {
  navbar: {
    style: 'sticky',
    bgColor: '#ffffff',
    textColor: '#1f2937',
    logoPosition: 'left',
    menuAlignment: 'right',
    height: 64,
    transparent: false,
    shadow: true,
  },
  footer: {
    bgColor: '#1f2937',
    textColor: '#f9fafb',
    columns: 3,
    showSocial: true,
    showCopyright: true,
    copyrightText: '© 2026 All rights reserved.',
  },
  sidebar: {
    position: 'left',
    width: 260,
    bgColor: '#ffffff',
    textColor: '#1f2937',
    showDesktop: true,
    showTablet: true,
    showMobile: false,
  },
  global: {
    backToTop: true,
    backToTopStyle: 'round',
    cookieBanner: true,
    cookieMessage: 'This website uses cookies to improve your experience.',
    announcementBar: false,
    announcementText: '',
    announcementLink: '',
    floatingButton: false,
    floatingIcon: '💬',
    floatingLink: '',
  },
};

export default function LayoutManager() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Navbar');
  const [layout, setLayout] = useState(defaultLayout);

  useEffect(() => {
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      const settings = res.data?.data || res.data?.settings || {};
      setLayout(settings.layout || defaultLayout);
    } catch {
      toast.error('Failed to load layout settings');
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (updated) => {
    setSaving(true);
    try {
      const res = await adminApi.getSettings();
      const current = res.data?.data || res.data?.settings || {};
      await adminApi.updateSettings({ ...current, layout: updated });
      setLayout(updated);
      toast.success('Layout settings saved');
    } catch {
      toast.error('Failed to save layout settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section, key, value) => {
    const updated = {
      ...layout,
      [section]: { ...layout[section], [key]: value },
    };
    setLayout(updated);
    saveLayout(updated);
  };

  const stats = [
    { label: 'Navbar', value: layout.navbar.style, icon: Icons.menu, color: 'blue' },
    { label: 'Footer Columns', value: layout.footer.columns, icon: Icons['chevron-down'], color: 'green' },
    { label: 'Sidebar Width', value: `${layout.sidebar.width}px`, icon: Icons['chevron-right'], color: 'yellow' },
    { label: 'Global Elements', value: [layout.global.backToTop, layout.global.cookieBanner, layout.global.announcementBar, layout.global.floatingButton].filter(Boolean).length + '/4', icon: Icons.grid, color: 'purple' },
  ];

  if (loading) {
    return (
      <PageLayout title="Layout Manager" description="Control site-wide layout elements" stats={stats}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading...</div>
      </PageLayout>
    );
  }

  const renderNavbarSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-group">
        <label>Style</label>
        <select value={layout.navbar.style} onChange={(e) => updateSection('navbar', 'style', e.target.value)}>
          <option value="fixed">Fixed</option>
          <option value="sticky">Sticky</option>
          <option value="static">Static</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label>Background Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={layout.navbar.bgColor} onChange={(e) => updateSection('navbar', 'bgColor', e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{layout.navbar.bgColor}</span>
          </div>
        </div>
        <div className="form-group">
          <label>Text Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={layout.navbar.textColor} onChange={(e) => updateSection('navbar', 'textColor', e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{layout.navbar.textColor}</span>
          </div>
        </div>
        <div className="form-group">
          <label>Logo Position</label>
          <select value={layout.navbar.logoPosition} onChange={(e) => updateSection('navbar', 'logoPosition', e.target.value)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
        <div className="form-group">
          <label>Menu Alignment</label>
          <select value={layout.navbar.menuAlignment} onChange={(e) => updateSection('navbar', 'menuAlignment', e.target.value)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="form-group">
          <label>Height (px)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="range" min="48" max="96" value={layout.navbar.height} onChange={(e) => updateSection('navbar', 'height', Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: '0.82rem', minWidth: 30 }}>{layout.navbar.height}px</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={layout.navbar.transparent} onChange={(e) => updateSection('navbar', 'transparent', e.target.checked)} />
              <span>Transparent</span>
            </label>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={layout.navbar.shadow} onChange={(e) => updateSection('navbar', 'shadow', e.target.checked)} />
              <span>Shadow</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFooterSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label>Background Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={layout.footer.bgColor} onChange={(e) => updateSection('footer', 'bgColor', e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{layout.footer.bgColor}</span>
          </div>
        </div>
        <div className="form-group">
          <label>Text Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={layout.footer.textColor} onChange={(e) => updateSection('footer', 'textColor', e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{layout.footer.textColor}</span>
          </div>
        </div>
        <div className="form-group">
          <label>Columns</label>
          <select value={layout.footer.columns} onChange={(e) => updateSection('footer', 'columns', Number(e.target.value))}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={layout.footer.showSocial} onChange={(e) => updateSection('footer', 'showSocial', e.target.checked)} />
              <span>Show social links</span>
            </label>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={layout.footer.showCopyright} onChange={(e) => updateSection('footer', 'showCopyright', e.target.checked)} />
              <span>Show copyright</span>
            </label>
          </div>
        </div>
      </div>
      {layout.footer.showCopyright && (
        <div className="form-group">
          <label>Copyright Text</label>
          <input value={layout.footer.copyrightText} onChange={(e) => updateSection('footer', 'copyrightText', e.target.value)} />
        </div>
      )}
    </div>
  );

  const renderSidebarSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label>Position</label>
          <select value={layout.sidebar.position} onChange={(e) => updateSection('sidebar', 'position', e.target.value)}>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="form-group">
          <label>Width (px)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="range" min="200" max="400" step="10" value={layout.sidebar.width} onChange={(e) => updateSection('sidebar', 'width', Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: '0.82rem', minWidth: 30 }}>{layout.sidebar.width}px</span>
          </div>
        </div>
        <div className="form-group">
          <label>Background Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={layout.sidebar.bgColor} onChange={(e) => updateSection('sidebar', 'bgColor', e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{layout.sidebar.bgColor}</span>
          </div>
        </div>
        <div className="form-group">
          <label>Text Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="color" value={layout.sidebar.textColor} onChange={(e) => updateSection('sidebar', 'textColor', e.target.value)} style={{ width: 40, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>{layout.sidebar.textColor}</span>
          </div>
        </div>
      </div>
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Show on devices</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={layout.sidebar.showDesktop} onChange={(e) => updateSection('sidebar', 'showDesktop', e.target.checked)} />
              <span>Desktop</span>
            </label>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={layout.sidebar.showTablet} onChange={(e) => updateSection('sidebar', 'showTablet', e.target.checked)} />
              <span>Tablet</span>
            </label>
          </div>
          <div className="form-group">
            <label className="form-check">
              <input type="checkbox" checked={layout.sidebar.showMobile} onChange={(e) => updateSection('sidebar', 'showMobile', e.target.checked)} />
              <span>Mobile</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGlobalSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 10, padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Back to Top Button</h4>
          <label className="form-check">
            <input type="checkbox" checked={layout.global.backToTop} onChange={(e) => updateSection('global', 'backToTop', e.target.checked)} />
          </label>
        </div>
        {layout.global.backToTop && (
          <div className="form-group">
            <label>Style</label>
            <select value={layout.global.backToTopStyle} onChange={(e) => updateSection('global', 'backToTopStyle', e.target.value)}>
              <option value="round">Round</option>
              <option value="square">Square</option>
              <option value="pill">Pill</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 10, padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Cookie Banner</h4>
          <label className="form-check">
            <input type="checkbox" checked={layout.global.cookieBanner} onChange={(e) => updateSection('global', 'cookieBanner', e.target.checked)} />
          </label>
        </div>
        {layout.global.cookieBanner && (
          <div className="form-group">
            <label>Cookie Message</label>
            <input value={layout.global.cookieMessage} onChange={(e) => updateSection('global', 'cookieMessage', e.target.value)} />
          </div>
        )}
      </div>

      <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 10, padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Announcement Bar</h4>
          <label className="form-check">
            <input type="checkbox" checked={layout.global.announcementBar} onChange={(e) => updateSection('global', 'announcementBar', e.target.checked)} />
          </label>
        </div>
        {layout.global.announcementBar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Announcement Text</label>
              <input value={layout.global.announcementText} onChange={(e) => updateSection('global', 'announcementText', e.target.value)} placeholder="New portfolio update!" />
            </div>
            <div className="form-group">
              <label>Link (optional)</label>
              <input value={layout.global.announcementLink} onChange={(e) => updateSection('global', 'announcementLink', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 10, padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Floating Action Button</h4>
          <label className="form-check">
            <input type="checkbox" checked={layout.global.floatingButton} onChange={(e) => updateSection('global', 'floatingButton', e.target.checked)} />
          </label>
        </div>
        {layout.global.floatingButton && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Icon</label>
              <input value={layout.global.floatingIcon} onChange={(e) => updateSection('global', 'floatingIcon', e.target.value)} placeholder="💬" />
            </div>
            <div className="form-group">
              <label>Link</label>
              <input value={layout.global.floatingLink} onChange={(e) => updateSection('global', 'floatingLink', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Navbar': return renderNavbarSettings();
      case 'Footer': return renderFooterSettings();
      case 'Sidebar': return renderSidebarSettings();
      case 'Global Elements': return renderGlobalSettings();
      default: return null;
    }
  };

  return (
    <PageLayout
      title="Layout Manager"
      description="Control site-wide layout elements"
      stats={stats}
      quickActions={[
        { label: 'Reset to Defaults', icon: Icons['refresh-cw'], onClick: () => saveLayout(defaultLayout), primary: false },
        { label: 'Save All', icon: Icons.save, onClick: () => saveLayout(layout), primary: true },
      ]}
    >
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                border: 'none',
                background: activeTab === tab ? 'var(--color-primary-subtle)' : 'transparent',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ padding: '1.5rem' }}>
          {renderTabContent()}
        </div>
      </div>
    </PageLayout>
  );
}
