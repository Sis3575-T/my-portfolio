import React, { useState, useEffect } from 'react';
import { Icons, Icon } from '../lib/icons';
import { useToast } from './Toast';

const tabs = [
  { id: 'general', label: 'General', icon: Icons.settings },
  { id: 'content', label: 'Content', icon: Icons['file-text'] },
  { id: 'media', label: 'Media', icon: Icons.image },
  { id: 'style', label: 'Style', icon: Icons.palette },
  { id: 'layout', label: 'Layout', icon: Icons.grid },
  { id: 'seo', label: 'SEO', icon: Icons.globe },
  { id: 'animations', label: 'Animations', icon: Icons.activity },
  { id: 'responsive', label: 'Responsive', icon: Icons.smartphone },
  { id: 'permissions', label: 'Permissions', icon: Icons.shield },
  { id: 'analytics', label: 'Analytics', icon: Icons['bar-chart-3'] },
  { id: 'advanced', label: 'Advanced', icon: Icons.code },
  { id: 'history', label: 'Version History', icon: Icons.clock },
];

const animationTypes = ['none', 'fade', 'slide', 'zoom', 'flip', 'rotate', 'bounce', 'scale'];
const animationTriggers = ['onLoad', 'onScroll', 'onHover'];
const scrollAnimations = ['none', 'parallax', 'reveal'];
const roleOptions = ['All', 'Admin', 'Editor', 'Viewer'];
const responsiveSub = ['desktop', 'tablet', 'mobile'];
const containerOptions = ['full', 'boxed'];
const sectionHeights = ['auto', 'fullscreen', 'min-height'];
const hoverStates = ['none', 'lift', 'glow', 'underline'];
const flexDirections = ['row', 'column', 'row-reverse', 'column-reverse'];

export default function SectionEditor({ section, open, onClose, onSave, onPreview }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [activeResponsive, setActiveResponsive] = useState('desktop');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedVersions, setSavedVersions] = useState([]);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    if (open && section) {
      setForm(JSON.parse(JSON.stringify(section)));
      setActiveTab('general');
      setActiveResponsive('desktop');
    }
  }, [open, section]);

  useEffect(() => {
    if (section?.versionHistory) {
      setSavedVersions(section.versionHistory || []);
    }
  }, [section]);

  const updateForm = (path, value) => {
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
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const versionEntry = {
        id: Date.now().toString(),
        data: JSON.parse(JSON.stringify(form)),
        savedAt: new Date().toISOString(),
        label: `Version ${savedVersions.length + 1}`,
      };
      const updated = { ...form, versionHistory: [...savedVersions, versionEntry] };
      onSave(updated);
      toast.success('Section saved');
    } catch {
      toast.error('Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = (version) => {
    setForm(JSON.parse(JSON.stringify(version.data)));
    toast.info('Version restored');
  };

  const openMediaLibrary = async () => {
    setMediaLibraryOpen(true);
    setMediaLoading(true);
    try {
      const api = (await import('../services/api')).default;
      const { data } = await api.get('/media');
      setMediaItems(data.data || []);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setMediaLoading(false);
    }
  };

  const selectMedia = (url) => {
    return url;
  };

  if (!open || !form) return null;

  const renderField = (label, path, type = 'text', options = {}) => {
    const keys = path.split('.');
    let current = form;
    for (const key of keys) {
      if (current && typeof current === 'object') current = current[key];
      else current = undefined;
    }
    const value = current ?? '';

    const onChange = (val) => updateForm(path, val);

    const baseStyle = {
      padding: options.compact ? '0.3rem 0.5rem' : '0.45rem 0.65rem',
      borderRadius: 6,
      border: '1px solid var(--color-border)',
      background: 'var(--color-bg)',
      color: 'var(--color-text)',
      fontSize: '0.82rem',
      width: '100%',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    };

    return (
      <div className="form-group" key={path} style={{ marginBottom: options.noMargin ? 0 : '0.65rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>{label}</label>
        {type === 'text' && <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={options.placeholder || ''} style={baseStyle} />}
        {type === 'number' && <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} style={baseStyle} />}
        {type === 'textarea' && <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={options.placeholder || ''} rows={options.rows || 4} style={{ ...baseStyle, fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', resize: 'vertical' }} />}
        {type === 'select' && (
          <select value={value} onChange={e => onChange(e.target.value)} style={baseStyle}>
            {(options.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {type === 'toggle' && (
          <label className="form-check" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
            <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{value ? 'Enabled' : 'Disabled'}</span>
          </label>
        )}
        {type === 'color' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer', padding: 2, background: 'none' }} />
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="#000000" style={{ ...baseStyle, flex: 1 }} />
          </div>
        )}
        {type === 'range' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="range" min={options.min ?? 0} max={options.max ?? 100} value={value} onChange={e => onChange(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: 30, textAlign: 'right' }}>{value}{options.suffix || ''}</span>
          </div>
        )}
        {type === 'image' && (
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Image URL" style={{ ...baseStyle, flex: 1 }} />
              <button onClick={openMediaLibrary} style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' }}>
                <Icon path={Icons.image} size={14} />
              </button>
            </div>
            {value && <div style={{ marginTop: 6, width: 80, height: 56, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>}
          </div>
        )}
        {type === 'custom' && options.render && options.render(value, onChange)}
      </div>
    );
  };

  const renderButtonEditor = (buttons, onChange) => {
    const items = Array.isArray(buttons) ? buttons : [];
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Buttons</span>
          <button onClick={() => onChange([...items, { text: '', url: '', style: 'primary', icon: '' }])} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon path={Icons.plus} size={12} /> Add
          </button>
        </div>
        {items.length === 0 && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)', padding: 8 }}>No buttons</div>}
        {items.map((btn, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
            <input value={btn.text} onChange={e => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }} placeholder="Text" style={{ flex: 2, padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem' }} />
            <input value={btn.url} onChange={e => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }} placeholder="URL" style={{ flex: 2, padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem' }} />
            <select value={btn.style} onChange={e => { const n = [...items]; n[i] = { ...n[i], style: e.target.value }; onChange(n); }} style={{ flex: 1, padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem' }}>
              <option value="primary">Primary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ padding: '0.3rem', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)' }}>
              <Icon path={Icons.x} size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderSocialLinksEditor = (links, onChange) => {
    const items = Array.isArray(links) ? links : [];
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Social Links</span>
          <button onClick={() => onChange([...items, { platform: '', url: '', icon: '' }])} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon path={Icons.plus} size={12} /> Add
          </button>
        </div>
        {items.map((link, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 6, alignItems: 'center' }}>
            <input value={link.platform} onChange={e => { const n = [...items]; n[i] = { ...n[i], platform: e.target.value }; onChange(n); }} placeholder="Platform" style={{ flex: 1, padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem' }} />
            <input value={link.url} onChange={e => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }} placeholder="URL" style={{ flex: 2, padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem' }} />
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ padding: '0.3rem', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)' }}>
              <Icon path={Icons.x} size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderListItemEditor = (items, onChange, fields) => {
    const list = Array.isArray(items) ? items : [];
    const defaultField = {};
    fields.forEach(f => { defaultField[f.key] = ''; });
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{fields[0]?.label || 'Items'}</span>
          <button onClick={() => onChange([...list, { ...defaultField }])} style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon path={Icons.plus} size={12} /> Add
          </button>
        </div>
        {list.map((item, idx) => (
          <div key={idx} style={{ padding: '0.5rem', marginBottom: 6, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)' }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
              {fields.map(f => (
                <div key={f.key} style={{ flex: f.flex || 1, minWidth: f.minWidth || 80 }}>
                  <input
                    value={item[f.key] || ''}
                    onChange={e => { const n = [...list]; n[idx] = { ...n[idx], [f.key]: e.target.value }; onChange(n); }}
                    placeholder={f.label}
                    style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <button onClick={() => onChange(list.filter((_, i) => i !== idx))} style={{ padding: '0.2rem 0.4rem', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)', fontSize: '0.75rem' }}>Remove</button>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>General Settings</h4>
            {renderField('Section Name', 'name', 'text', { placeholder: 'My Awesome Section' })}
            {renderField('Section ID (HTML id)', 'id', 'text', { placeholder: 'section-hero' })}
            {renderField('CSS Class', 'cssClass', 'text', { placeholder: 'my-custom-class' })}
            {renderField('Section Type', 'type', 'text', { placeholder: 'hero' })}
            {renderField('Visible', 'visible', 'toggle')}
            {renderField('Published', 'published', 'toggle')}
            {renderField('Order', 'order', 'number')}
          </div>
        );
      case 'content':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Content</h4>
            {renderField('Title', 'content.title', 'text', { placeholder: 'Section title' })}
            {renderField('Subtitle', 'content.subtitle', 'text', { placeholder: 'Section subtitle' })}
            {renderField('Description', 'content.description', 'textarea', { rows: 4, placeholder: 'Rich text description...' })}
            {renderField('Image', 'content.image', 'image')}
            {renderField('Video URL', 'content.video', 'text', { placeholder: 'https://youtube.com/watch?v=...' })}
            {renderField('Buttons', 'content.buttons', 'custom', { render: (val, onChange) => renderButtonEditor(val, onChange) })}
            {renderField('Social Links', 'content.socialLinks', 'custom', { render: (val, onChange) => renderSocialLinksEditor(val, onChange) })}
            {form.type === 'faq' && renderField('FAQ Items', 'content.items', 'custom', {
              render: (val, onChange) => renderListItemEditor(val, onChange, [
                { key: 'question', label: 'Question', flex: 2 },
                { key: 'answer', label: 'Answer', flex: 3 },
              ]),
            })}
            {form.type === 'statistics' && renderField('Stat Items', 'content.items', 'custom', {
              render: (val, onChange) => renderListItemEditor(val, onChange, [
                { key: 'label', label: 'Label', flex: 2 },
                { key: 'value', label: 'Value', flex: 1 },
                { key: 'suffix', label: 'Suffix', flex: 1 },
              ]),
            })}
            {form.type === 'about' && renderField('Stats', 'content.stats', 'custom', {
              render: (val, onChange) => renderListItemEditor(val, onChange, [
                { key: 'label', label: 'Label', flex: 2 },
                { key: 'value', label: 'Value', flex: 1 },
              ]),
            })}
            {form.type === 'custom' && renderField('HTML Content', 'content.html', 'textarea', { rows: 8, placeholder: '<div>Your HTML here...</div>' })}
            {form.type === 'custom' && renderField('Custom CSS', 'content.css', 'textarea', { rows: 4, placeholder: '/* custom styles */' })}
            {form.type === 'custom' && renderField('Custom JS', 'content.js', 'textarea', { rows: 4, placeholder: '// custom scripts' })}
          </div>
        );
      case 'media':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Background Media</h4>
            {renderField('Background Image', 'media.backgroundImage', 'image')}
            {renderField('Background Video URL', 'media.backgroundVideo', 'text', { placeholder: 'https://...mp4' })}
            {renderField('Overlay Color', 'media.overlayColor', 'color')}
            {renderField('Overlay Opacity', 'media.overlayOpacity', 'range', { min: 0, max: 100, suffix: '%' })}
            {renderField('Parallax Effect', 'media.parallax', 'toggle')}
          </div>
        );
      case 'style':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Style Settings</h4>
            {renderField('Background Color', 'style.background', 'color')}
            {renderField('Text Color', 'style.textColor', 'color')}
            {renderField('Heading Color', 'style.headingColor', 'color')}
            {renderField('Link Color', 'style.linkColor', 'color')}
            {renderField('Button Style', 'style.buttonStyle', 'select', { options: ['rounded', 'square', 'pill'] })}
            {renderField('Card Style', 'style.cardStyle', 'select', { options: ['default', 'shadow', 'bordered', 'flat'] })}
            {renderField('Icon Style', 'style.iconStyle', 'select', { options: ['default', 'large', 'small', 'colored'] })}
            {renderField('Spacing', 'style.spacing', 'select', { options: ['compact', 'comfortable', 'spacious'] })}
            {renderField('Shadow', 'style.shadow', 'select', { options: ['none', 'small', 'medium', 'large'] })}
            {renderField('Border Radius', 'style.borderRadius', 'text', { placeholder: '12', compact: true })}
            {renderField('Opacity', 'style.opacity', 'range', { min: 0, max: 100, suffix: '%' })}
            {renderField('Hover State', 'style.hoverState', 'select', { options: hoverStates })}
            {renderField('Focus State', 'style.focusState', 'select', { options: ['none', 'ring', 'shadow'] })}
          </div>
        );
      case 'layout':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Layout</h4>
            {renderField('Container Width', 'layout.containerWidth', 'select', { options: containerOptions })}
            {renderField('Padding', 'layout.padding', 'text', { placeholder: '80px 0' })}
            {renderField('Margin', 'layout.margin', 'text', { placeholder: '0' })}
            {renderField('Section Height', 'layout.sectionHeight', 'select', { options: sectionHeights })}
            {renderField('Alignment', 'layout.alignment', 'select', { options: ['left', 'center', 'right'] })}
            {renderField('Columns', 'layout.columns', 'number')}
            {renderField('Gap', 'layout.gap', 'text', { placeholder: '24px' })}
            {renderField('Flex Direction', 'layout.flexDirection', 'select', { options: flexDirections })}
            {renderField('Sticky Section', 'layout.sticky', 'toggle')}
          </div>
        );
      case 'seo':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>SEO Settings</h4>
            {renderField('Meta Title', 'seo.metaTitle', 'text', { placeholder: 'SEO title' })}
            {renderField('Meta Description', 'seo.metaDescription', 'textarea', { rows: 3, placeholder: 'SEO meta description...' })}
            {renderField('Keywords', 'seo.keywords', 'text', { placeholder: 'keyword1, keyword2' })}
            {renderField('Slug', 'seo.slug', 'text', { placeholder: 'section-slug' })}
            {renderField('Open Graph Title', 'seo.ogTitle', 'text', { placeholder: 'OG title' })}
            {renderField('Open Graph Description', 'seo.ogDescription', 'textarea', { rows: 2, placeholder: 'OG description' })}
            {renderField('Open Graph Image', 'seo.ogImage', 'image')}
          </div>
        );
      case 'animations':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Animation Settings</h4>
            {renderField('Entrance Animation', 'animation.type', 'select', { options: animationTypes })}
            {renderField('Duration (seconds)', 'animation.duration', 'range', { min: 0.1, max: 3, step: 0.1, suffix: 's' })}
            {renderField('Delay (seconds)', 'animation.delay', 'range', { min: 0, max: 3, step: 0.1, suffix: 's' })}
            {renderField('Trigger', 'animation.trigger', 'select', { options: animationTriggers })}
            {renderField('Loop Animation', 'animation.loop', 'toggle')}
            {renderField('Scroll Animation', 'animation.scrollAnimation', 'select', { options: scrollAnimations })}
          </div>
        );
      case 'responsive':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Responsive Settings</h4>
            <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
              {responsiveSub.map(device => (
                <button
                  key={device}
                  onClick={() => setActiveResponsive(device)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: activeResponsive === device ? 'var(--color-primary-subtle)' : 'transparent',
                    color: activeResponsive === device ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: activeResponsive === device ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    borderBottom: activeResponsive === device ? '2px solid var(--color-primary)' : '2px solid transparent',
                    textTransform: 'capitalize',
                  }}
                >
                  <Icon path={device === 'desktop' ? Icons.monitor : device === 'tablet' ? Icons.grid : Icons.smartphone} size={14} style={{ marginRight: 6 }} />
                  {device}
                </button>
              ))}
            </div>
            {renderField(`Visible on ${activeResponsive}`, `responsive.${activeResponsive}.visible`, 'toggle')}
            {renderField('Font Size (%)', `responsive.${activeResponsive}.fontSize`, 'range', { min: 50, max: 150, suffix: '%' })}
            {renderField('Spacing (%)', `responsive.${activeResponsive}.spacing`, 'range', { min: 50, max: 150, suffix: '%' })}
            {renderField('Layout', `responsive.${activeResponsive}.layout`, 'select', { options: ['default', 'stacked', 'grid-2', 'grid-3'] })}
            {renderField('Order', `responsive.${activeResponsive}.order`, 'number')}
            {renderField('Image Size (%)', `responsive.${activeResponsive}.imageSize`, 'range', { min: 50, max: 150, suffix: '%' })}
          </div>
        );
      case 'permissions':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Permissions</h4>
            {renderField('Role Visibility', 'permissions.roleVisibility', 'select', { options: roleOptions })}
            {renderField('Password Protect', 'permissions.passwordProtect', 'toggle')}
          </div>
        );
      case 'analytics':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Analytics</h4>
            {renderField('View Count', 'analytics.viewCount', 'number')}
            {renderField('Click Tracking', 'analytics.clickTracking', 'toggle')}
            {renderField('Scroll Depth Tracking', 'analytics.scrollDepthTracking', 'toggle')}
          </div>
        );
      case 'advanced':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Advanced</h4>
            {renderField('Custom CSS', 'advanced.customCSS', 'textarea', { rows: 6, placeholder: '/* Custom CSS for this section */\n.section { }' })}
            {renderField('Custom Attributes', 'advanced.customAttributes', 'text', { placeholder: 'data-attr="value" data-id="123"' })}
            {renderField('Custom ID', 'advanced.customID', 'text', { placeholder: 'custom-section-id' })}
          </div>
        );
      case 'history':
        return (
          <div style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1rem' }}>Version History</h4>
            {savedVersions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                No versions saved yet. Save this section to create the first version.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...savedVersions].reverse().map((version, i) => (
                  <div key={version.id} style={{
                    padding: '0.75rem',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)' }}>{version.label || `Version ${savedVersions.length - i}`}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                        {version.savedAt ? new Date(version.savedAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <button onClick={() => restoreVersion(version)} style={{ padding: '0.3rem 0.6rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '75%',
        maxWidth: 1000,
        background: 'var(--color-card)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        animation: 'slideInRight 0.25s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Edit Section: {form.name || form.type}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}>{form.type} section</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={onPreview} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon path={Icons.eye} size={14} /> Preview
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
              <Icon path={Icons.x} size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: 180, borderRight: '1px solid var(--color-border)', overflowY: 'auto', flexShrink: 0, padding: '0.5rem 0' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '0.55rem 1rem',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--color-primary-subtle)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderLeft: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon path={tab.icon} size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            {renderTabContent()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
            {form.type ? <span style={{ textTransform: 'capitalize' }}>Type: {form.type}</span> : ''}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Section'}
            </button>
          </div>
        </div>

        {mediaLibraryOpen && (
          <div className="modal-overlay" onClick={() => setMediaLibraryOpen(false)} style={{ zIndex: 2000 }}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: '80vh' }}>
              <div className="modal-header">
                <h3>Media Library</h3>
                <button className="modal-close" onClick={() => setMediaLibraryOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                {mediaLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>Loading media...</div>
                ) : mediaItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)' }}>No media found</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                    {mediaItems.map(item => (
                      <div
                        key={item._id}
                        onClick={() => {
                          const url = item.url || item.path || '';
                          if (url) {
                            const activePath = activeTab === 'media' ? 'media.backgroundImage' : 'content.image';
                            updateForm(activePath, url);
                            setMediaLibraryOpen(false);
                          }
                        }}
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          aspectRatio: '1',
                          background: 'var(--color-bg-subtle)',
                        }}
                      >
                        <img src={item.url || item.path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
