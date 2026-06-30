import React, { useState, useEffect, useCallback } from 'react';
import { Icons, Icon } from '../lib/icons';
import '../styles/properties-panel.css';

const TABS = [
  { id: 'content', label: 'Content', icon: Icons['file-text'] },
  { id: 'style', label: 'Style', icon: Icons.palette },
  { id: 'typography', label: 'Typography', icon: Icons['file-json'] },
  { id: 'layout', label: 'Layout', icon: Icons.grid },
  { id: 'spacing', label: 'Spacing', icon: Icons.move },
  { id: 'animation', label: 'Animation', icon: Icons.activity },
  { id: 'responsive', label: 'Responsive', icon: Icons.smartphone },
  { id: 'seo', label: 'SEO', icon: Icons.globe },
  { id: 'visibility', label: 'Visibility', icon: Icons.eye },
  { id: 'permissions', label: 'Permissions', icon: Icons.shield },
  { id: 'advanced', label: 'Advanced', icon: Icons.code },
];

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Nunito', 'Raleway', 'Playfair Display', 'Merriweather',
  'Source Sans Pro', 'Oswald', 'Ubuntu', 'system-ui', 'Georgia',
];

const ANIMATION_TYPES = ['none', 'fade', 'slide', 'zoom', 'flip'];
const ANIMATION_TRIGGERS = ['onLoad', 'onScroll', 'onHover'];
const HOVER_EFFECTS = ['none', 'lift', 'glow', 'underline', 'scale'];
const FLEX_DIRECTIONS = ['row', 'column', 'row-reverse', 'column-reverse'];
const TEXT_ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const DEVICES = [
  { id: 'desktop', icon: Icons.monitor },
  { id: 'tablet', icon: Icons.grid },
  { id: 'mobile', icon: Icons.smartphone },
];

export default function PropertiesPanel({ section, open, onClose, onSave, onDelete, onDuplicate }) {
  const [activeTab, setActiveTab] = useState('content');
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  useEffect(() => {
    if (open && section) {
      setForm(JSON.parse(JSON.stringify(section)));
      setActiveTab('content');
      setActiveDevice('desktop');
      setAutoSaveStatus('saved');
    }
  }, [open, section]);

  const updateForm = useCallback((path, value) => {
    setForm(prev => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
    setAutoSaveStatus('unsaved');
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setAutoSaveStatus('saving');
    try {
      await onSave(form);
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && form) onDelete(form.id || form._id);
    onClose();
  };

  const handleDuplicate = () => {
    if (onDuplicate && form) onDuplicate(form.id || form._id);
  };

  if (!open || !form) return null;

  const getValue = (path) => {
    const keys = path.split('.');
    let val = form;
    for (const key of keys) {
      if (val && typeof val === 'object') val = val[key];
      else return '';
    }
    return val ?? '';
  };

  const renderField = (label, path, type = 'text', options = {}) => {
    const value = getValue(path);
    const onChange = (val) => updateForm(path, val);

    return (
      <div className="pp-field" key={path}>
        <label className="pp-label">{label}</label>
        {type === 'text' && (
          <input
            className="pp-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={options.placeholder || ''}
          />
        )}
        {type === 'textarea' && (
          <textarea
            className="pp-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={options.placeholder || ''}
            rows={options.rows || 3}
          />
        )}
        {type === 'number' && (
          <input
            className="pp-input"
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        )}
        {type === 'color' && (
          <div className="pp-color-row">
            <input
              className="pp-color-swatch"
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
            />
            <input
              className="pp-input pp-color-hex"
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
            />
          </div>
        )}
        {type === 'select' && (
          <select
            className="pp-select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {(options.options || []).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        )}
        {type === 'range' && (
          <div className="pp-range-row">
            <input
              className="pp-range"
              type="range"
              min={options.min ?? 0}
              max={options.max ?? 100}
              step={options.step ?? 1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
            />
            <span className="pp-range-value">{value}{options.suffix || ''}</span>
          </div>
        )}
        {type === 'toggle' && (
          <label className="pp-toggle-row">
            <div className="pp-toggle">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
              />
              <div className="pp-toggle-slider" />
            </div>
            <span className="pp-toggle-label">{value ? 'Enabled' : 'Disabled'}</span>
          </label>
        )}
        {type === 'buttonGroup' && (
          <div className="pp-btn-group">
            {(options.options || []).map((opt) => (
              <button
                key={opt}
                className={`pp-btn-group-btn${value === opt ? ' active' : ''}`}
                onClick={() => onChange(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'content':
        return (
          <div>
            <h4 className="pp-section-title">Content</h4>
            {renderField('Name', 'name', 'text', { placeholder: 'Section name' })}
            {renderField('Title', 'content.title', 'text', { placeholder: 'Section title' })}
            {renderField('Subtitle', 'content.subtitle', 'text', { placeholder: 'Section subtitle' })}
            {renderField('Description', 'content.description', 'textarea', { rows: 4, placeholder: 'Description text...' })}
            {renderField('Image URL', 'content.image', 'text', { placeholder: 'https://...' })}
            {renderField('Video URL', 'content.video', 'text', { placeholder: 'https://youtube.com/...' })}
            {renderField('Link URL', 'content.link', 'text', { placeholder: 'https://...' })}
            {renderField('Link Text', 'content.linkText', 'text', { placeholder: 'Learn more' })}
          </div>
        );
      case 'style':
        return (
          <div>
            <h4 className="pp-section-title">Style</h4>
            {renderField('Background Color', 'style.background', 'color')}
            {renderField('Text Color', 'style.textColor', 'color')}
            {renderField('Border Color', 'style.borderColor', 'color')}
            {renderField('Border Width', 'style.borderWidth', 'range', { min: 0, max: 10, suffix: 'px' })}
            {renderField('Border Style', 'style.borderStyle', 'select', { options: ['none', 'solid', 'dashed', 'dotted'] })}
            {renderField('Shadow', 'style.shadow', 'select', { options: ['none', 'small', 'medium', 'large'] })}
            {renderField('Border Radius', 'style.borderRadius', 'range', { min: 0, max: 50, suffix: 'px' })}
            {renderField('Opacity', 'style.opacity', 'range', { min: 0, max: 100, suffix: '%' })}
          </div>
        );
      case 'typography':
        return (
          <div>
            <h4 className="pp-section-title">Typography</h4>
            {renderField('Font Family', 'typography.fontFamily', 'select', { options: FONT_OPTIONS })}
            {renderField('Font Size', 'typography.fontSize', 'range', { min: 10, max: 80, suffix: 'px' })}
            {renderField('Font Weight', 'typography.fontWeight', 'select', { options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] })}
            {renderField('Line Height', 'typography.lineHeight', 'range', { min: 0.5, max: 3, step: 0.1, suffix: '' })}
            {renderField('Letter Spacing', 'typography.letterSpacing', 'range', { min: -2, max: 10, step: 0.5, suffix: 'px' })}
            {renderField('Text Alignment', 'typography.textAlign', 'buttonGroup', { options: TEXT_ALIGNMENTS })}
            {renderField('Text Transform', 'typography.textTransform', 'select', { options: ['none', 'uppercase', 'lowercase', 'capitalize'] })}
          </div>
        );
      case 'layout':
        return (
          <div>
            <h4 className="pp-section-title">Layout</h4>
            {renderField('Container Width', 'layout.containerWidth', 'select', { options: ['full', 'boxed', 'wide'] })}
            {renderField('Max Width', 'layout.maxWidth', 'text', { placeholder: '1200px' })}
            {renderField('Padding', 'layout.padding', 'text', { placeholder: '80px 0' })}
            {renderField('Margin', 'layout.margin', 'text', { placeholder: '0 auto' })}
            {renderField('Min Height', 'layout.minHeight', 'text', { placeholder: 'auto' })}
            {renderField('Columns', 'layout.columns', 'number')}
            {renderField('Gap', 'layout.gap', 'text', { placeholder: '24px' })}
            {renderField('Flex Direction', 'layout.flexDirection', 'select', { options: FLEX_DIRECTIONS })}
            {renderField('Align Items', 'layout.alignItems', 'select', { options: ['flex-start', 'center', 'flex-end', 'stretch'] })}
            {renderField('Justify Content', 'layout.justifyContent', 'select', { options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'] })}
            {renderField('Overflow', 'layout.overflow', 'select', { options: ['visible', 'hidden', 'scroll'] })}
          </div>
        );
      case 'spacing':
        return (
          <div>
            <h4 className="pp-section-title">Padding</h4>
            <div className="pp-spacing-grid">
              <div className="pp-spacing-item">
                <label>Top</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.paddingTop') === 'number' ? getValue('spacing.paddingTop') : ''}
                  onChange={(e) => updateForm('spacing.paddingTop', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="pp-spacing-item">
                <label>Right</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.paddingRight') === 'number' ? getValue('spacing.paddingRight') : ''}
                  onChange={(e) => updateForm('spacing.paddingRight', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="pp-spacing-item">
                <label>Bottom</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.paddingBottom') === 'number' ? getValue('spacing.paddingBottom') : ''}
                  onChange={(e) => updateForm('spacing.paddingBottom', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="pp-spacing-item">
                <label>Left</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.paddingLeft') === 'number' ? getValue('spacing.paddingLeft') : ''}
                  onChange={(e) => updateForm('spacing.paddingLeft', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
            <h4 className="pp-section-title" style={{ marginTop: '1rem' }}>Margin</h4>
            <div className="pp-spacing-grid">
              <div className="pp-spacing-item">
                <label>Top</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.marginTop') === 'number' ? getValue('spacing.marginTop') : ''}
                  onChange={(e) => updateForm('spacing.marginTop', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="pp-spacing-item">
                <label>Right</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.marginRight') === 'number' ? getValue('spacing.marginRight') : ''}
                  onChange={(e) => updateForm('spacing.marginRight', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="pp-spacing-item">
                <label>Bottom</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.marginBottom') === 'number' ? getValue('spacing.marginBottom') : ''}
                  onChange={(e) => updateForm('spacing.marginBottom', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="pp-spacing-item">
                <label>Left</label>
                <input
                  className="pp-input"
                  type="number"
                  value={typeof getValue('spacing.marginLeft') === 'number' ? getValue('spacing.marginLeft') : ''}
                  onChange={(e) => updateForm('spacing.marginLeft', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        );
      case 'animation':
        return (
          <div>
            <h4 className="pp-section-title">Animation</h4>
            {renderField('Entrance Animation', 'animation.type', 'select', { options: ANIMATION_TYPES })}
            {renderField('Duration', 'animation.duration', 'range', { min: 0.1, max: 3, step: 0.1, suffix: 's' })}
            {renderField('Delay', 'animation.delay', 'range', { min: 0, max: 3, step: 0.1, suffix: 's' })}
            {renderField('Trigger', 'animation.trigger', 'select', { options: ANIMATION_TRIGGERS })}
            {renderField('Hover Effect', 'animation.hoverEffect', 'select', { options: HOVER_EFFECTS })}
            {renderField('Loop', 'animation.loop', 'toggle')}
          </div>
        );
      case 'responsive':
        return (
          <div>
            <h4 className="pp-section-title">Responsive Settings</h4>
            <div className="pp-responsive-sub">
              {DEVICES.map((device) => (
                <button
                  key={device.id}
                  className={`pp-responsive-sub-btn${activeDevice === device.id ? ' active' : ''}`}
                  onClick={() => setActiveDevice(device.id)}
                >
                  <Icon path={device.icon} size={13} />
                  {device.id.charAt(0).toUpperCase() + device.id.slice(1)}
                </button>
              ))}
            </div>
            <p className="pp-section-desc">Settings for {activeDevice}</p>
            {renderField(`Visible on ${activeDevice}`, `responsive.${activeDevice}.visible`, 'toggle')}
            {renderField('Font Size', `responsive.${activeDevice}.fontSize`, 'range', { min: 50, max: 150, suffix: '%' })}
            {renderField('Spacing Scale', `responsive.${activeDevice}.spacing`, 'range', { min: 50, max: 150, suffix: '%' })}
            {renderField('Layout Mode', `responsive.${activeDevice}.layout`, 'select', { options: ['default', 'stacked', 'grid-2', 'grid-3'] })}
            {renderField('Order', `responsive.${activeDevice}.order`, 'number')}
          </div>
        );
      case 'seo':
        return (
          <div>
            <h4 className="pp-section-title">SEO</h4>
            {renderField('Meta Title', 'seo.metaTitle', 'text', { placeholder: 'SEO title' })}
            {renderField('Meta Description', 'seo.metaDescription', 'textarea', { rows: 3, placeholder: 'SEO description...' })}
            {renderField('Slug', 'seo.slug', 'text', { placeholder: 'section-slug' })}
            {renderField('Open Graph Title', 'seo.ogTitle', 'text', { placeholder: 'OG title' })}
            {renderField('Open Graph Description', 'seo.ogDescription', 'textarea', { rows: 2, placeholder: 'OG description' })}
            {renderField('Open Graph Image', 'seo.ogImage', 'text', { placeholder: 'https://...' })}
          </div>
        );
      case 'visibility':
        return (
          <div>
            <h4 className="pp-section-title">Visibility</h4>
            {renderField('Show Section', 'visible', 'toggle')}
            {renderField('Published', 'published', 'toggle')}
            <div style={{ marginTop: '0.75rem' }}>
              {renderField('Role Visibility', 'permissions.roleVisibility', 'select', { options: ['All', 'Admin', 'Editor', 'Viewer'] })}
            </div>
          </div>
        );
      case 'permissions':
        return (
          <div>
            <h4 className="pp-section-title">Permissions</h4>
            {renderField('Role Visibility', 'permissions.roleVisibility', 'select', { options: ['All', 'Admin', 'Editor', 'Viewer'] })}
            {renderField('Password Protect', 'permissions.passwordProtect', 'toggle')}
          </div>
        );
      case 'advanced':
        return (
          <div>
            <h4 className="pp-section-title">Advanced</h4>
            {renderField('Custom CSS', 'advanced.customCSS', 'textarea', { rows: 6, placeholder: '/* CSS */\n.section { }' })}
            {renderField('Custom ID', 'advanced.customID', 'text', { placeholder: 'my-custom-id' })}
            {renderField('CSS Classes', 'advanced.cssClasses', 'text', { placeholder: 'class1 class2' })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`pp-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`pp-panel${open ? ' open' : ''}`}>
        <div className="pp-header">
          <div className="pp-header-left">
            <span className={`pp-header-status ${form.published !== false ? 'published' : 'draft'}`}>
              {form.published !== false ? 'Published' : 'Draft'}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="pp-header-name">{form.name || form.type || 'Section'}</div>
            </div>
            <span className="pp-header-type">{form.type || 'section'}</span>
          </div>
          <button className="pp-header-close" onClick={onClose}>
            <Icon path={Icons.x} size={16} />
          </button>
        </div>

        <div className="pp-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`pp-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <Icon path={tab.icon} size={16} />
            </button>
          ))}
        </div>

        <div className="pp-content">
          {renderTab()}
        </div>

        <div className="pp-footer">
          <div className="pp-footer-left">
            <button className="pp-footer-btn danger" onClick={handleDelete} title="Delete section">
              <Icon path={Icons.trash2} size={13} /> Delete
            </button>
            <button className="pp-footer-btn ghost" onClick={handleDuplicate} title="Duplicate section">
              <Icon path={Icons.copy} size={13} /> Duplicate
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={`pp-auto-save ${autoSaveStatus}`}>
              {autoSaveStatus === 'saving' && (
                <span style={{ width: 10, height: 10, border: '2px solid var(--color-gray-300)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
              )}
              {autoSaveStatus === 'saved' && <Icon path={Icons.check} size={11} />}
              {autoSaveStatus === 'error' && <Icon path={Icons['alert-circle']} size={11} />}
              {autoSaveStatus === 'saved' && 'Saved'}
              {autoSaveStatus === 'saving' && 'Saving...'}
              {autoSaveStatus === 'unsaved' && 'Unsaved'}
              {autoSaveStatus === 'error' && 'Error'}
            </div>
            <button className="pp-footer-btn primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
