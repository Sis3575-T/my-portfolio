import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icons, Icon } from '../lib/icons';
import { useToast } from './Toast';
import { adminApi } from '../services/api';

const COMMON_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Nunito', 'Raleway', 'Playfair Display', 'Merriweather',
  'Source Sans Pro', 'Oswald', 'Ubuntu', 'Georgia', 'system-ui',
];

const DEFAULT_THEME = {
  colors: {
    primary: '#2563EB',
    secondary: '#7C3AED',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
    baseSize: '16px',
    headingScale: '1.25',
  },
  buttons: {
    borderRadius: '8px',
    paddingX: '20px',
    paddingY: '10px',
    fontSize: '14px',
    fontWeight: '600',
  },
  cards: {
    background: '#FFFFFF',
    borderRadius: '12px',
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '24px',
  },
  spacing: {
    baseUnit: '8px',
    sectionPadding: '80px',
    containerMaxWidth: '1200px',
  },
  shadows: {
    small: '0 1px 2px rgba(0,0,0,0.05)',
    medium: '0 4px 6px rgba(0,0,0,0.07)',
    large: '0 10px 25px rgba(0,0,0,0.12)',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    full: '9999px',
  },
};

const SECTION_TITLES = {
  colors: 'Colors',
  typography: 'Typography',
  buttons: 'Buttons',
  cards: 'Cards',
  spacing: 'Spacing',
  shadows: 'Shadows',
  borderRadius: 'Border Radius',
};

export default function ThemeLivePreview({ open, onClose, onSave, initialTheme }) {
  const toast = useToast();
  const [theme, setTheme] = useState(() => initialTheme || JSON.parse(JSON.stringify(DEFAULT_THEME)));
  const [activeSection, setActiveSection] = useState('colors');
  const [saving, setSaving] = useState(false);

  const previewRef = useRef(null);

  useEffect(() => {
    if (initialTheme) {
      setTheme(JSON.parse(JSON.stringify(initialTheme)));
    }
  }, [initialTheme]);

  const applyThemeCSS = useCallback((t) => {
    const root = document.documentElement;
    if (t.colors) {
      root.style.setProperty('--color-primary', t.colors.primary);
      root.style.setProperty('--color-bg', t.colors.background);
      root.style.setProperty('--color-card', t.colors.surface);
      root.style.setProperty('--color-text', t.colors.text);
      root.style.setProperty('--color-text-secondary', t.colors.textSecondary);
      root.style.setProperty('--color-border', t.colors.border);
      root.style.setProperty('--color-success', t.colors.success);
      root.style.setProperty('--color-warning', t.colors.warning);
      root.style.setProperty('--color-danger', t.colors.danger);
    }
    if (t.typography) {
      root.style.setProperty('--font-sans', t.typography.fontFamily);
      root.style.setProperty('--font-heading', t.typography.headingFont);
    }
    if (t.buttons) {
      root.style.setProperty('--button-radius', t.buttons.borderRadius);
      root.style.setProperty('--button-padding-x', t.buttons.paddingX);
      root.style.setProperty('--button-padding-y', t.buttons.paddingY);
      root.style.setProperty('--button-font-size', t.buttons.fontSize);
      root.style.setProperty('--button-font-weight', t.buttons.fontWeight);
    }
    if (t.spacing) {
      root.style.setProperty('--container-max-width', t.spacing.containerMaxWidth);
    }
    if (t.borderRadius) {
      root.style.setProperty('--radius-sm', t.borderRadius.small);
      root.style.setProperty('--radius-md', t.borderRadius.medium);
      root.style.setProperty('--radius-lg', t.borderRadius.large);
      root.style.setProperty('--radius-full', t.borderRadius.full);
    }
  }, []);

  useEffect(() => {
    if (open) applyThemeCSS(theme);
  }, [open, theme, applyThemeCSS]);

  const updateTheme = (section, key, value) => {
    setTheme(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[section][key] = value;
      return updated;
    });
  };

  const handleReset = () => {
    setTheme(JSON.parse(JSON.stringify(DEFAULT_THEME)));
    applyThemeCSS(DEFAULT_THEME);
    toast.info('Theme reset to defaults');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onSave) {
        await onSave(theme);
      } else {
        await adminApi.updateTheme({ settings: theme });
      }
      toast.success('Theme saved');
      onClose();
    } catch {
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const sections = Object.keys(theme);

  const renderThemeEditor = () => {
    const section = activeSection;
    const data = theme[section];
    if (!data) return null;

    return (
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>
          {SECTION_TITLES[section] || section.charAt(0).toUpperCase() + section.slice(1)}
        </h3>
        {Object.entries(data).map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          const isColors = section === 'colors';
          const isBorderRadius = section === 'borderRadius';
          const isShadow = section === 'shadows';
          const isSpacing = section === 'spacing';
          const isFont = section === 'typography' && (key === 'fontFamily' || key === 'headingFont');
          const isFontSize = section === 'typography' && (key === 'baseSize' || key === 'headingScale');
          const isNumericPx = (section === 'buttons' && (key.includes('padding') || key === 'fontSize' || key === 'borderRadius'))
            || (section === 'cards' && key === 'padding')
            || (section === 'cards' && key === 'borderRadius');

          return (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                {label}
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isColors && (
                  <>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updateTheme(section, key, e.target.value)}
                      style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateTheme(section, key, e.target.value)}
                      style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.78rem', fontFamily: 'var(--font-mono, monospace)' }}
                    />
                  </>
                )}
                {isFont && (
                  <select
                    value={value}
                    onChange={(e) => updateTheme(section, key, e.target.value)}
                    style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.78rem' }}
                  >
                    {COMMON_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
                {(isNumericPx || isBorderRadius || isSpacing || (section === 'shadows' && key === 'baseUnit')) && !isFont && !isColors && (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateTheme(section, key, e.target.value)}
                    style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.78rem' }}
                  />
                )}
                {isShadow && (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateTheme(section, key, e.target.value)}
                    style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.78rem', fontFamily: 'var(--font-mono, monospace)' }}
                  />
                )}
                {isFontSize && !isFont && (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateTheme(section, key, e.target.value)}
                    style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.78rem' }}
                  />
                )}
                {section === 'cards' && (key === 'shadow' || key === 'background') && !isColors && (
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {key === 'background' ? (
                      <input type="color" value={value} onChange={(e) => updateTheme(section, key, e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
                    ) : null}
                    <input type="text" value={value} onChange={(e) => updateTheme(section, key, e.target.value)} style={{ flex: 1, padding: '0.35rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.78rem' }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex: 1050, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', margin: '2rem',
          background: 'var(--color-card)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 16px 64px rgba(0,0,0,0.2)',
          animation: 'scaleIn 0.2s ease',
        }}
      >
        {/* Left: Theme Editor */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              Theme Editor
            </h2>
            <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 6, background: 'transparent', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
              <Icon path={Icons.x} size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', overflowX: 'auto', padding: '0.35rem 0.5rem', gap: 4 }}>
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                style={{
                  padding: '0.35rem 0.65rem', borderRadius: 6, border: 'none',
                  background: activeSection === s ? 'var(--color-primary-subtle)' : 'transparent',
                  color: activeSection === s ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: activeSection === s ? 600 : 400,
                  fontSize: '0.76rem', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {SECTION_TITLES[s] || s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {renderThemeEditor()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <button
              onClick={handleReset}
              style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Reset to defaults
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '0.45rem 1rem', borderRadius: 6, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
          <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-card)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon path={Icons.eye} size={14} /> Live Preview
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }} ref={previewRef}>
            {/* Typography Scale */}
            <div style={{ marginBottom: '2rem', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Typography Scale</h4>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>Heading 1</h1>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>Heading 2</h2>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>Heading 3</h3>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>Heading 4</h4>
              <p style={{ fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                Body text with <strong>bold</strong>, <em>italic</em>, and{' '}
                <a href="#" style={{ color: 'var(--color-primary)' }}>links</a>. The quick brown fox jumps over the lazy dog.
              </p>
            </div>

            {/* Sample Card */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                background: 'var(--color-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                padding: '1.5rem',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                  <Icon path={Icons.star} size={20} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.5rem' }}>Sample Card Title</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                  This is a sample card showing how your components will look with the current theme settings.
                </p>
                <button style={{
                  padding: 'calc(var(--button-padding-y, 10px) - 4px) calc(var(--button-padding-x, 20px) - 4px)',
                  borderRadius: 'var(--button-radius, 8px)',
                  border: 'none', background: 'var(--color-primary)', color: '#fff',
                  fontSize: 'var(--button-font-size, 14px)', fontWeight: 'var(--button-font-weight, 600)',
                  cursor: 'pointer',
                }}>
                  Primary Button
                </button>
                {' '}
                <button style={{
                  padding: 'calc(var(--button-padding-y, 10px) - 4px) calc(var(--button-padding-x, 20px) - 4px)',
                  borderRadius: 'var(--button-radius, 8px)',
                  border: '1px solid var(--color-border)', background: 'transparent',
                  color: 'var(--color-text-secondary)', fontSize: 'var(--button-font-size, 14px)',
                  fontWeight: 'var(--button-font-weight, 600)', cursor: 'pointer',
                }}>
                  Secondary
                </button>
              </div>
            </div>

            {/* Sample Form */}
            <div style={{ marginBottom: '2rem', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Sample Form</h4>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Email</label>
                <input type="email" placeholder="user@example.com" style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.88rem' }} />
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Message</label>
                <textarea placeholder="Your message..." rows={3} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <button style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--button-radius, 8px)', border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                Submit
              </button>
            </div>

            {/* Sample Table */}
            <div style={{ marginBottom: '2rem', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>Sample Table</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.6rem 1rem', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Name</th>
                    <th style={{ padding: '0.6rem 1rem', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Role</th>
                    <th style={{ padding: '0.6rem 1rem', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'John Doe', role: 'Developer', status: 'Active' },
                    { name: 'Jane Smith', role: 'Designer', status: 'Active' },
                    { name: 'Bob Johnson', role: 'Editor', status: 'Inactive' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '0.6rem 1rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border-light)' }}>{row.name}</td>
                      <td style={{ padding: '0.6rem 1rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border-light)' }}>{row.role}</td>
                      <td style={{ padding: '0.6rem 1rem', color: 'var(--color-text-secondary)', textAlign: 'right', borderBottom: '1px solid var(--color-border-light)' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: row.status === 'Active' ? 'var(--color-success-subtle)' : 'var(--color-bg-subtle)', color: row.status === 'Active' ? 'var(--color-success)' : 'var(--color-text-tertiary)', fontSize: '0.72rem', fontWeight: 600 }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sample Modal Preview */}
            <div style={{ marginBottom: '2rem', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>Sample Modal</span>
                <button style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: 4, background: 'transparent', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ padding: '1rem 1rem 0.75rem' }}>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem' }}>This is how a modal dialog would appear with your theme settings applied.</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                  <button style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
