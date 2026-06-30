import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons, Icon } from '../lib/icons';
import { useToast } from './Toast';

const editorTabs = [
  { id: 'general', label: 'General', icon: Icons.settings },
  { id: 'content', label: 'Content', icon: Icons['file-text'] },
  { id: 'media', label: 'Media', icon: Icons.image },
  { id: 'layout', label: 'Layout', icon: Icons.grid },
  { id: 'style', label: 'Style', icon: Icons.palette },
  { id: 'typography', label: 'Typography', icon: Icons['file-text'] },
  { id: 'animation', label: 'Animation', icon: Icons.activity },
  { id: 'responsive', label: 'Responsive', icon: Icons.smartphone },
  { id: 'seo', label: 'SEO', icon: Icons.globe },
  { id: 'visibility', label: 'Visibility', icon: Icons.eye },
  { id: 'permissions', label: 'Permissions', icon: Icons.shield },
  { id: 'analytics', label: 'Analytics', icon: Icons['bar-chart-3'] },
  { id: 'advanced', label: 'Advanced', icon: Icons.code },
  { id: 'versions', label: 'Version History', icon: Icons.clock },
];

const componentTypes = [
  'hero', 'about', 'projects', 'skills', 'experience', 'education',
  'certificates', 'testimonials', 'services', 'blog', 'contact',
  'gallery', 'timeline', 'faq', 'cta', 'statistics', 'custom'
];

const systemFonts = [
  'Inter, sans-serif', 'system-ui, sans-serif', 'Georgia, serif',
  'Times New Roman, serif', 'Arial, sans-serif', 'Helvetica, sans-serif',
  'Courier New, monospace', 'monospace',
];

const easings = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'];
const animationTypes = ['none', 'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'flip', 'rotate', 'bounce'];
const animationTriggers = ['onScroll', 'onLoad', 'onHover'];
const scrollAnimations = ['none', 'parallax', 'reveal'];
const hoverAnimations = ['none', 'scale', 'glow', 'lift'];
const shadowOptions = ['none', 'sm', 'md', 'lg', 'xl'];
const containerWidths = ['full', 'boxed', 'narrow'];
const sectionHeights = ['auto', 'fullscreen', 'min-height'];
const flexDirections = ['row', 'column', 'row-reverse', 'column-reverse'];
const alignOptions = ['left', 'center', 'right', 'justify'];
const deviceOptions = ['desktop', 'tablet', 'mobile'];
const roleOptions = ['All', 'Admin', 'Editor', 'Viewer'];
const renderAsOptions = ['div', 'section', 'article', 'aside'];

function renderField(label, value, onChange, type = 'text', options = {}) {
  const inputStyle = {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: 6,
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div className="editor-field" key={label}>
      <label className="editor-field-label">{label}</label>
      {type === 'text' && (
        <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={options.placeholder || ''} style={inputStyle} />
      )}
      {type === 'number' && (
        <input type="number" value={value ?? 0} onChange={e => onChange(Number(e.target.value))} style={inputStyle} />
      )}
      {type === 'textarea' && (
        <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={options.placeholder || ''} rows={options.rows || 4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }} />
      )}
      {type === 'select' && (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} style={inputStyle}>
          <option value="">{options.placeholder || 'Select...'}</option>
          {(options.options || []).map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
      {type === 'toggle' && (
        <label className="editor-toggle" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{value ? 'Enabled' : 'Disabled'}</span>
        </label>
      )}
      {type === 'color' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--color-border)', cursor: 'pointer', padding: 2, background: 'none' }} />
          <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000" style={{ ...inputStyle, flex: 1 }} />
        </div>
      )}
      {type === 'range' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="range" min={options.min ?? 0} max={options.max ?? 100} step={options.step || 1} value={value ?? 0} onChange={e => onChange(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: 35, textAlign: 'right' }}>{value}{options.suffix || ''}</span>
        </div>
      )}
      {type === 'image' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder="Image URL" style={{ ...inputStyle, flex: 1 }} />
          {value && (
            <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0 }}>
              <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            </div>
          )}
        </div>
      )}
      {type === 'tags' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0.3rem', border: '1.5px solid var(--color-border)', borderRadius: 6, background: 'var(--color-bg)', minHeight: 36 }}>
          {(value || []).map((tag, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>
              {tag}
              <span onClick={() => onChange((value || []).filter((_, j) => j !== i))} style={{ cursor: 'pointer', opacity: 0.6 }}>&times;</span>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.82rem', color: 'var(--color-text)', fontFamily: 'inherit', flex: 1, minWidth: 60 }}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                onChange([...(value || []), e.target.value.trim()]);
                e.target.value = '';
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

function renderButtonEditor(buttons, onChange) {
  const items = Array.isArray(buttons) ? buttons : [];
  return (
    <div className="editor-field">
      <label className="editor-field-label">Buttons</label>
      <button className="editor-array-add" onClick={() => onChange([...items, { text: '', url: '', style: 'primary', icon: '' }])}>
        <Icon path={Icons.plus} size={12} /> Add Button
      </button>
      {items.length === 0 && <div className="editor-empty-array">No buttons</div>}
      {items.map((btn, i) => (
        <div key={i} className="editor-array-item">
          <input value={btn.text} onChange={e => { const n = [...items]; n[i] = { ...n[i], text: e.target.value }; onChange(n); }} placeholder="Text" className="editor-array-input" />
          <input value={btn.url} onChange={e => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }} placeholder="URL" className="editor-array-input" />
          <select value={btn.style} onChange={e => { const n = [...items]; n[i] = { ...n[i], style: e.target.value }; onChange(n); }} className="editor-array-select">
            <option value="primary">Primary</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
          <button className="editor-array-remove" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            <Icon path={Icons.x} size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function renderSocialLinksEditor(links, onChange) {
  const items = Array.isArray(links) ? links : [];
  return (
    <div className="editor-field">
      <label className="editor-field-label">Social Links</label>
      <button className="editor-array-add" onClick={() => onChange([...items, { platform: '', url: '', icon: '' }])}>
        <Icon path={Icons.plus} size={12} /> Add Link
      </button>
      {items.length === 0 && <div className="editor-empty-array">No links</div>}
      {items.map((link, i) => (
        <div key={i} className="editor-array-item">
          <input value={link.platform} onChange={e => { const n = [...items]; n[i] = { ...n[i], platform: e.target.value }; onChange(n); }} placeholder="Platform" className="editor-array-input" />
          <input value={link.url} onChange={e => { const n = [...items]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }} placeholder="URL" className="editor-array-input" />
          <button className="editor-array-remove" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            <Icon path={Icons.x} size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function renderListItemEditor(items, onChange, fields) {
  const list = Array.isArray(items) ? items : [];
  const defaultField = {};
  fields.forEach(f => { defaultField[f.key] = ''; });
  return (
    <div className="editor-field">
      <label className="editor-field-label">{fields[0]?.parentLabel || fields[0]?.label || 'Items'}</label>
      <button className="editor-array-add" onClick={() => onChange([...list, { ...defaultField }])}>
        <Icon path={Icons.plus} size={12} /> Add
      </button>
      {list.length === 0 && <div className="editor-empty-array">No items</div>}
      {list.map((item, idx) => (
        <div key={idx} className="editor-array-card">
          <div className="editor-array-card-fields">
            {fields.map(f => (
              <div key={f.key} style={{ flex: f.flex || 1, minWidth: f.minWidth || 80 }}>
                <input
                  value={item[f.key] || ''}
                  onChange={e => { const n = [...list]; n[idx] = { ...n[idx], [f.key]: e.target.value }; onChange(n); }}
                  placeholder={f.label}
                  className="editor-array-input"
                />
              </div>
            ))}
          </div>
          <button className="editor-array-remove" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
            <Icon path={Icons.x} size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ComponentEditor({ open, component, onClose, onSave, onPreview, versions: externalVersions, onSaveVersion, onRestoreVersion }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [versions, setVersions] = useState(externalVersions || []);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ a: null, b: null });
  const autoSaveRef = useRef(null);

  const fieldStyle = {
    padding: '0.45rem 0.65rem',
    borderRadius: 6,
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  };

  useEffect(() => {
    if (open && component) {
      setForm(JSON.parse(JSON.stringify(component)));
      setActiveTab('general');
      setActiveDevice('desktop');
      if (component.versions) setVersions(component.versions);
    }
  }, [open, component]);

  useEffect(() => {
    if (externalVersions) setVersions(externalVersions);
  }, [externalVersions]);

  useEffect(() => {
    if (!form || saving) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      setAutoSaving(true);
      setTimeout(() => setAutoSaving(false), 600);
    }, 3000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [form, saving]);

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
  }, []);

  const handleSave = async (publish = false) => {
    if (!form) return;
    setSaving(true);
    try {
      const data = { ...form };
      if (publish) data.status = 'published';
      onSave(data);
      toast.success(publish ? 'Component published' : 'Component saved');
    } catch {
      toast.error('Failed to save component');
    } finally {
      setSaving(false);
    }
  };

  const getVal = (path) => {
    if (!form) return '';
    const keys = path.split('.');
    let current = form;
    for (const key of keys) {
      if (current && typeof current === 'object') current = current[key];
      else return '';
    }
    return current ?? '';
  };

  const renderGeneralTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">General Settings</h4>
      {renderField('Name', getVal('name'), v => updateForm('name', v), 'text', { placeholder: 'Component name' })}
      {renderField('Slug', getVal('slug'), v => updateForm('slug', v), 'text', { placeholder: 'component-slug' })}
      {renderField('Description', getVal('description'), v => updateForm('description', v), 'textarea', { rows: 3, placeholder: 'Brief description...' })}
      {renderField('Type', getVal('type'), v => updateForm('type', v), 'select', { options: componentTypes })}
      {renderField('Category', getVal('category'), v => updateForm('category', v), 'text', { placeholder: 'General' })}
      {renderField('Tags', getVal('tags'), v => updateForm('tags', v), 'tags')}
      {renderField('Featured', getVal('featured'), v => updateForm('featured', v), 'toggle')}
      {renderField('Reusable', getVal('reusable'), v => updateForm('reusable', v), 'toggle')}
      {renderField('Global', getVal('global'), v => updateForm('global', v), 'toggle')}
    </div>
  );

  const renderContentTab = () => {
    const type = form?.type || 'custom';
    return (
      <div className="editor-tab-content">
        <h4 className="editor-tab-title">Content</h4>
        {renderField('Title', getVal('content.title'), v => updateForm('content.title', v), 'text', { placeholder: 'Section title' })}
        {renderField('Subtitle', getVal('content.subtitle'), v => updateForm('content.subtitle', v), 'text', { placeholder: 'Section subtitle' })}
        {renderField('Description', getVal('content.description'), v => updateForm('content.description', v), 'textarea', { rows: 4, placeholder: 'Rich text description...' })}
        {type === 'hero' && (
          <>
            {renderField('Image', getVal('content.image'), v => updateForm('content.image', v), 'image')}
            {renderField('Buttons', getVal('content.buttons'), v => updateForm('content.buttons', v), 'custom', { render: (val, onChange) => renderButtonEditor(val, onChange) })}
            {renderField('Social Links', getVal('content.socialLinks'), v => updateForm('content.socialLinks', v), 'custom', { render: (val, onChange) => renderSocialLinksEditor(val, onChange) })}
          </>
        )}
        {type === 'about' && (
          <>
            {renderField('Image URL', getVal('content.image'), v => updateForm('content.image', v), 'image')}
            {renderField('Name', getVal('content.name'), v => updateForm('content.name', v), 'text', { placeholder: 'Your name' })}
            {renderField('Title/Role', getVal('content.role'), v => updateForm('content.role', v), 'text', { placeholder: 'Your title' })}
            {renderField('Bio', getVal('content.bio'), v => updateForm('content.bio', v), 'textarea', { rows: 4, placeholder: 'Biography...' })}
            {renderField('Stats Boxes', getVal('content.stats'), v => updateForm('content.stats', v), 'custom', {
              render: (val, onChange) => renderListItemEditor(val, onChange, [
                { key: 'label', label: 'Label', flex: 2 },
                { key: 'value', label: 'Value', flex: 1 },
              ])
            })}
          </>
        )}
        {type === 'skills' && (
          <>
            {renderField('Group by Category', getVal('content.groupByCategory'), v => updateForm('content.groupByCategory', v), 'toggle')}
            {renderField('Layout', getVal('content.layout'), v => updateForm('content.layout', v), 'select', { options: ['bars', 'grid', 'circles'] })}
            {renderField('Columns', getVal('content.columns'), v => updateForm('content.columns', v), 'number')}
          </>
        )}
        {type === 'projects' && (
          <>
            {renderField('Grid Layout', getVal('content.gridLayout'), v => updateForm('content.gridLayout', v), 'toggle')}
            {renderField('Items Per Row', getVal('content.columns'), v => updateForm('content.columns', v), 'number')}
            {renderField('Filterable', getVal('content.filterable'), v => updateForm('content.filterable', v), 'toggle')}
          </>
        )}
        {(type === 'experience' || type === 'education' || type === 'timeline') && (
          <>
            {renderField('Layout', getVal('content.layout'), v => updateForm('content.layout', v), 'select', { options: ['alternating', 'cards', 'timeline'] })}
          </>
        )}
        {type === 'services' && (
          <>
            {renderField('Columns', getVal('content.columns'), v => updateForm('content.columns', v), 'number')}
          </>
        )}
        {type === 'testimonials' && (
          <>
            {renderField('Layout', getVal('content.layout'), v => updateForm('content.layout', v), 'select', { options: ['grid', 'carousel', 'list'] })}
            {renderField('Autoplay', getVal('content.autoplay'), v => updateForm('content.autoplay', v), 'toggle')}
            {renderField('Autoplay Speed (ms)', getVal('content.autoplaySpeed'), v => updateForm('content.autoplaySpeed', v), 'number')}
          </>
        )}
        {type === 'faq' && (
          <>
            {renderField('Layout', getVal('content.layout'), v => updateForm('content.layout', v), 'select', { options: ['accordion', 'grid', 'list'] })}
            {renderField('FAQ Items', getVal('content.items'), v => updateForm('content.items', v), 'custom', {
              render: (val, onChange) => renderListItemEditor(val, onChange, [
                { key: 'question', label: 'Question', flex: 2 },
                { key: 'answer', label: 'Answer', flex: 3 },
              ])
            })}
          </>
        )}
        {type === 'cta' && (
          <>
            {renderField('Button Text', getVal('content.buttonText'), v => updateForm('content.buttonText', v), 'text', { placeholder: 'Get in Touch' })}
            {renderField('Button URL', getVal('content.buttonUrl'), v => updateForm('content.buttonUrl', v), 'text', { placeholder: '#contact' })}
            {renderField('Alignment', getVal('content.alignment'), v => updateForm('content.alignment', v), 'select', { options: alignOptions })}
          </>
        )}
        {type === 'statistics' && (
          <>
            {renderField('Columns', getVal('content.columns'), v => updateForm('content.columns', v), 'number')}
            {renderField('Stat Items', getVal('content.items'), v => updateForm('content.items', v), 'custom', {
              render: (val, onChange) => renderListItemEditor(val, onChange, [
                { key: 'label', label: 'Label', flex: 2 },
                { key: 'value', label: 'Value', flex: 1 },
                { key: 'suffix', label: 'Suffix', flex: 1 },
              ])
            })}
          </>
        )}
        {type === 'contact' && (
          <>
            {renderField('Recipient Email', getVal('content.recipientEmail'), v => updateForm('content.recipientEmail', v), 'text', { placeholder: 'email@example.com' })}
            {renderField('Address', getVal('content.address'), v => updateForm('content.address', v), 'text', { placeholder: 'Your address' })}
            {renderField('Phone', getVal('content.phone'), v => updateForm('content.phone', v), 'text', { placeholder: '+1 234 567 890' })}
            {renderField('Email', getVal('content.email'), v => updateForm('content.email', v), 'text', { placeholder: 'email@example.com' })}
            {renderField('Social Links', getVal('content.socialLinks'), v => updateForm('content.socialLinks', v), 'custom', { render: (val, onChange) => renderSocialLinksEditor(val, onChange) })}
          </>
        )}
        {type === 'gallery' && (
          <>
            {renderField('Columns', getVal('content.columns'), v => updateForm('content.columns', v), 'number')}
            {renderField('Lightbox', getVal('content.lightbox'), v => updateForm('content.lightbox', v), 'toggle')}
            {renderField('Aspect Ratio', getVal('content.aspectRatio'), v => updateForm('content.aspectRatio', v), 'text', { placeholder: '4/3' })}
          </>
        )}
        {type === 'blog' && (
          <>
            {renderField('Show Count', getVal('content.showCount'), v => updateForm('content.showCount', v), 'number')}
            {renderField('Columns', getVal('content.columns'), v => updateForm('content.columns', v), 'number')}
            {renderField('Show Excerpt', getVal('content.showExcerpt'), v => updateForm('content.showExcerpt', v), 'toggle')}
            {renderField('Show Read More', getVal('content.showReadMore'), v => updateForm('content.showReadMore', v), 'toggle')}
          </>
        )}
        {type === 'custom' && (
          <>
            {renderField('HTML Content', getVal('content.html'), v => updateForm('content.html', v), 'textarea', { rows: 8, placeholder: '<div>Your HTML...</div>' })}
            {renderField('Custom CSS', getVal('content.css'), v => updateForm('content.css', v), 'textarea', { rows: 4, placeholder: '/* custom styles */' })}
            {renderField('Custom JS', getVal('content.js'), v => updateForm('content.js', v), 'textarea', { rows: 4, placeholder: '// custom scripts' })}
          </>
        )}
      </div>
    );
  };

  const renderMediaTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Media</h4>
      {renderField('Background Image', getVal('media.backgroundImage'), v => updateForm('media.backgroundImage', v), 'image')}
      {renderField('Background Video URL', getVal('media.backgroundVideo'), v => updateForm('media.backgroundVideo', v), 'text', { placeholder: 'https://...mp4' })}
      {renderField('Overlay Color', getVal('media.overlayColor'), v => updateForm('media.overlayColor', v), 'color')}
      {renderField('Overlay Opacity', getVal('media.overlayOpacity'), v => updateForm('media.overlayOpacity', v), 'range', { min: 0, max: 100, suffix: '%' })}
      {renderField('Parallax', getVal('media.parallax'), v => updateForm('media.parallax', v), 'toggle')}
      {renderField('Media Gallery', getVal('media.gallery'), v => updateForm('media.gallery', v), 'custom', {
        render: (val, onChange) => renderListItemEditor(val, onChange, [
          { key: 'url', label: 'Image URL', flex: 3 },
          { key: 'alt', label: 'Alt Text', flex: 2 },
        ])
      })}
    </div>
  );

  const renderLayoutTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Layout</h4>
      {renderField('Container Width', getVal('layout.containerWidth'), v => updateForm('layout.containerWidth', v), 'select', { options: containerWidths })}
      {renderField('Columns', getVal('layout.columns'), v => updateForm('layout.columns', v), 'number')}
      {renderField('Flex Direction', getVal('layout.flexDirection'), v => updateForm('layout.flexDirection', v), 'select', { options: flexDirections })}
      {renderField('Alignment', getVal('layout.alignment'), v => updateForm('layout.alignment', v), 'select', { options: alignOptions })}
      {renderField('Gap', getVal('layout.gap'), v => updateForm('layout.gap', v), 'text', { placeholder: '24px' })}
      {renderField('Section Height', getVal('layout.sectionHeight'), v => updateForm('layout.sectionHeight', v), 'select', { options: sectionHeights })}
      {renderField('Padding', getVal('layout.padding'), v => updateForm('layout.padding', v), 'text', { placeholder: '80px 0' })}
      {renderField('Margin', getVal('layout.margin'), v => updateForm('layout.margin', v), 'text', { placeholder: '0' })}
      {renderField('Sticky', getVal('layout.sticky'), v => updateForm('layout.sticky', v), 'toggle')}
      {renderField('Z-Index', getVal('layout.zIndex'), v => updateForm('layout.zIndex', v), 'number')}
      {renderField('Display', getVal('layout.display'), v => updateForm('layout.display', v), 'select', { options: ['block', 'flex', 'grid', 'inline-block', 'none'] })}
    </div>
  );

  const renderStyleTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Style</h4>
      {renderField('Background Color', getVal('style.background'), v => updateForm('style.background', v), 'color')}
      {renderField('Text Color', getVal('style.textColor'), v => updateForm('style.textColor', v), 'color')}
      {renderField('Heading Color', getVal('style.headingColor'), v => updateForm('style.headingColor', v), 'color')}
      {renderField('Link Color', getVal('style.linkColor'), v => updateForm('style.linkColor', v), 'color')}
      {renderField('Border', getVal('style.border'), v => updateForm('style.border', v), 'text', { placeholder: '1px solid #e2e8f0' })}
      {renderField('Border Radius', getVal('style.borderRadius'), v => updateForm('style.borderRadius', v), 'text', { placeholder: '8px' })}
      {renderField('Shadow', getVal('style.shadow'), v => updateForm('style.shadow', v), 'select', { options: shadowOptions })}
      {renderField('Opacity', getVal('style.opacity'), v => updateForm('style.opacity', v), 'range', { min: 0, max: 100, suffix: '%' })}
      {renderField('Backdrop Blur', getVal('style.backdropBlur'), v => updateForm('style.backdropBlur', v), 'range', { min: 0, max: 20, suffix: 'px' })}
    </div>
  );

  const renderTypographyTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Typography</h4>
      {renderField('Font Family', getVal('typography.fontFamily'), v => updateForm('typography.fontFamily', v), 'select', { options: systemFonts })}
      {renderField('Font Size', getVal('typography.fontSize'), v => updateForm('typography.fontSize', v), 'range', { min: 10, max: 72, suffix: 'px' })}
      {renderField('Font Weight', getVal('typography.fontWeight'), v => updateForm('typography.fontWeight', v), 'select', { options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] })}
      {renderField('Line Height', getVal('typography.lineHeight'), v => updateForm('typography.lineHeight', v), 'range', { min: 1, max: 2, step: 0.1 })}
      {renderField('Letter Spacing', getVal('typography.letterSpacing'), v => updateForm('typography.letterSpacing', v), 'range', { min: 0, max: 10, suffix: 'px' })}
      {renderField('Text Align', getVal('typography.textAlign'), v => updateForm('typography.textAlign', v), 'select', { options: ['left', 'center', 'right', 'justify'] })}
      {renderField('Font Style', getVal('typography.fontStyle'), v => updateForm('typography.fontStyle', v), 'select', { options: ['normal', 'italic', 'oblique'] })}
      {renderField('Text Transform', getVal('typography.textTransform'), v => updateForm('typography.textTransform', v), 'select', { options: ['none', 'uppercase', 'lowercase', 'capitalize'] })}
      {renderField('Text Decoration', getVal('typography.textDecoration'), v => updateForm('typography.textDecoration', v), 'select', { options: ['none', 'underline', 'overline', 'line-through'] })}
    </div>
  );

  const renderAnimationTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Animation</h4>
      {renderField('Entrance Animation', getVal('animation.type'), v => updateForm('animation.type', v), 'select', { options: animationTypes })}
      {renderField('Duration', getVal('animation.duration'), v => updateForm('animation.duration', v), 'range', { min: 0.1, max: 3, step: 0.1, suffix: 's' })}
      {renderField('Delay', getVal('animation.delay'), v => updateForm('animation.delay', v), 'range', { min: 0, max: 5, step: 0.1, suffix: 's' })}
      {renderField('Trigger', getVal('animation.trigger'), v => updateForm('animation.trigger', v), 'select', { options: animationTriggers })}
      {renderField('Easing', getVal('animation.easing'), v => updateForm('animation.easing', v), 'select', { options: easings })}
      {renderField('Loop', getVal('animation.loop'), v => updateForm('animation.loop', v), 'toggle')}
      {renderField('Scroll Animation', getVal('animation.scrollAnimation'), v => updateForm('animation.scrollAnimation', v), 'select', { options: scrollAnimations })}
      {renderField('Hover Animation', getVal('animation.hoverAnimation'), v => updateForm('animation.hoverAnimation', v), 'select', { options: hoverAnimations })}
    </div>
  );

  const renderResponsiveTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Responsive Settings</h4>
      <div className="editor-responsive-tabs">
        {deviceOptions.map(device => (
          <button
            key={device}
            className={`editor-responsive-tab${activeDevice === device ? ' active' : ''}`}
            onClick={() => setActiveDevice(device)}
          >
            <Icon path={device === 'desktop' ? Icons.monitor : device === 'tablet' ? Icons.grid : Icons.smartphone} size={14} />
            {device.charAt(0).toUpperCase() + device.slice(1)}
          </button>
        ))}
      </div>
      {renderField(`Visible on ${activeDevice}`, getVal(`responsive.${activeDevice}.visible`), v => updateForm(`responsive.${activeDevice}.visible`, v), 'toggle')}
      {renderField('Font Size (%)', getVal(`responsive.${activeDevice}.fontSize`), v => updateForm(`responsive.${activeDevice}.fontSize`, v), 'range', { min: 50, max: 150, suffix: '%' })}
      {renderField('Padding (%)', getVal(`responsive.${activeDevice}.padding`), v => updateForm(`responsive.${activeDevice}.padding`, v), 'range', { min: 50, max: 150, suffix: '%' })}
      {renderField('Margin (%)', getVal(`responsive.${activeDevice}.margin`), v => updateForm(`responsive.${activeDevice}.margin`, v), 'range', { min: 50, max: 150, suffix: '%' })}
      {renderField('Columns', getVal(`responsive.${activeDevice}.columns`), v => updateForm(`responsive.${activeDevice}.columns`, v), 'number')}
      {renderField('Image Size (%)', getVal(`responsive.${activeDevice}.imageSize`), v => updateForm(`responsive.${activeDevice}.imageSize`, v), 'range', { min: 50, max: 150, suffix: '%' })}
    </div>
  );

  const renderSEOTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">SEO</h4>
      {renderField('Meta Title', getVal('seo.metaTitle'), v => updateForm('seo.metaTitle', v), 'text', { placeholder: 'SEO title' })}
      {renderField('Meta Description', getVal('seo.metaDescription'), v => updateForm('seo.metaDescription', v), 'textarea', { rows: 3, placeholder: 'SEO meta description...' })}
      {renderField('Keywords', getVal('seo.keywords'), v => updateForm('seo.keywords', v), 'text', { placeholder: 'keyword1, keyword2' })}
      {renderField('Slug', getVal('seo.slug'), v => updateForm('seo.slug', v), 'text', { placeholder: 'section-slug' })}
      {renderField('Open Graph Title', getVal('seo.ogTitle'), v => updateForm('seo.ogTitle', v), 'text', { placeholder: 'OG title' })}
      {renderField('Open Graph Description', getVal('seo.ogDescription'), v => updateForm('seo.ogDescription', v), 'textarea', { rows: 2, placeholder: 'OG description' })}
      {renderField('Open Graph Image', getVal('seo.ogImage'), v => updateForm('seo.ogImage', v), 'image')}
    </div>
  );

  const renderVisibilityTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Visibility</h4>
      {renderField('Status', getVal('status'), v => updateForm('status', v), 'select', { options: ['published', 'draft', 'hidden', 'archived'] })}
      {renderField('Visible (main toggle)', getVal('visible', true), v => updateForm('visible', v), 'toggle')}
      {renderField('Order', getVal('order', 0), v => updateForm('order', Math.max(0, Number(v))), 'number', { placeholder: '0' })}
      {renderField('Show on Desktop', getVal('visibility.desktop'), v => updateForm('visibility.desktop', v), 'toggle')}
      {renderField('Show on Tablet', getVal('visibility.tablet'), v => updateForm('visibility.tablet', v), 'toggle')}
      {renderField('Show on Mobile', getVal('visibility.mobile'), v => updateForm('visibility.mobile', v), 'toggle')}
      {renderField('Visible From (Date)', getVal('visibility.startDate'), v => updateForm('visibility.startDate', v), 'text', { placeholder: '2024-01-01' })}
      {renderField('Visible Until (Date)', getVal('visibility.endDate'), v => updateForm('visibility.endDate', v), 'text', { placeholder: '2024-12-31' })}
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Permissions</h4>
      {renderField('Role Visibility', getVal('permissions.roleVisibility'), v => updateForm('permissions.roleVisibility', v), 'select', { options: roleOptions })}
      {renderField('Password Protect', getVal('permissions.passwordProtect'), v => updateForm('permissions.passwordProtect', v), 'toggle')}
      {getVal('permissions.passwordProtect') && (
        renderField('Password', getVal('permissions.password'), v => updateForm('permissions.password', v), 'text', { placeholder: 'Enter password' })
      )}
    </div>
  );

  const renderAnalyticsTab = () => {
    const viewCount = getVal('views') || 0;
    const lastViewed = getVal('lastViewed');
    return (
      <div className="editor-tab-content">
        <h4 className="editor-tab-title">Analytics</h4>
        <div className="editor-analytics-stats">
          <div className="editor-analytics-stat">
            <span className="editor-analytics-stat-value">{viewCount}</span>
            <span className="editor-analytics-stat-label">View Count</span>
          </div>
          <div className="editor-analytics-stat">
            <span className="editor-analytics-stat-value">{lastViewed ? new Date(lastViewed).toLocaleDateString() : 'N/A'}</span>
            <span className="editor-analytics-stat-label">Last Viewed</span>
          </div>
        </div>
        {renderField('Click Tracking', getVal('analytics.clickTracking'), v => updateForm('analytics.clickTracking', v), 'toggle')}
        {renderField('Scroll Tracking', getVal('analytics.scrollTracking'), v => updateForm('analytics.scrollTracking', v), 'toggle')}
      </div>
    );
  };

  const renderAdvancedTab = () => (
    <div className="editor-tab-content">
      <h4 className="editor-tab-title">Advanced</h4>
      {renderField('Custom CSS', getVal('advanced.customCSS'), v => updateForm('advanced.customCSS', v), 'textarea', { rows: 6, placeholder: '/* Custom CSS */\n.my-component { }' })}
      {renderField('Custom ID', getVal('advanced.customID'), v => updateForm('advanced.customID', v), 'text', { placeholder: 'my-custom-id' })}
      {renderField('Custom CSS Classes', getVal('advanced.customClasses'), v => updateForm('advanced.customClasses', v), 'text', { placeholder: 'class1 class2' })}
      {renderField('HTML Attributes', getVal('advanced.customAttributes'), v => updateForm('advanced.customAttributes', v), 'text', { placeholder: 'data-attr="value"' })}
      {renderField('Render As', getVal('advanced.renderAs'), v => updateForm('advanced.renderAs', v), 'select', { options: renderAsOptions })}
      {renderField('Wrapper Element', getVal('advanced.wrapper'), v => updateForm('advanced.wrapper', v), 'text', { placeholder: 'div' })}
    </div>
  );

  const renderVersionsTab = () => {
    const allVersions = versions || [];
    return (
      <div className="editor-tab-content">
        <h4 className="editor-tab-title">Version History</h4>
        {allVersions.length === 0 ? (
          <div className="editor-empty-state">
            <Icon path={Icons.clock} size={32} />
            <p>No versions saved yet</p>
          </div>
        ) : (
          <div className="editor-version-timeline">
            {[...allVersions].reverse().map((ver, i) => (
              <div key={ver._id || i} className="editor-version-item">
                <div className="editor-version-dot" />
                <div className="editor-version-content">
                  <div className="editor-version-header">
                    <span className="editor-version-number">v{ver.version || (allVersions.length - i)}</span>
                    <span className={`editor-version-action badge ${ver.action === 'publish' ? 'badge-green' : ver.action === 'archive' ? 'badge-purple' : 'badge-blue'}`}>
                      {ver.action || 'update'}
                    </span>
                  </div>
                  <div className="editor-version-meta">
                    {ver.createdAt ? new Date(ver.createdAt).toLocaleString() : ''}
                    {ver.user ? ` by ${ver.user.name || ver.user.email || ver.user}` : ''}
                  </div>
                  {ver.description && <div className="editor-version-desc">{ver.description}</div>}
                  <div className="editor-version-actions">
                    <button className="editor-version-btn" onClick={() => onRestoreVersion && onRestoreVersion(ver)}>
                      <Icon path={Icons['refresh-cw']} size={12} /> Restore
                    </button>
                    <button className="editor-version-btn" onClick={() => {
                      setCompareVersions({ a: compareVersions.a || ver, b: ver });
                      if (compareVersions.a) setCompareOpen(true);
                      else toast.info('Select another version to compare');
                    }}>
                      <Icon path={Icons['file-text']} size={12} /> Compare
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCompareModal = () => {
    if (!compareOpen || !compareVersions.a || !compareVersions.b) return null;
    const aData = JSON.stringify(compareVersions.a.data || compareVersions.a, null, 2);
    const bData = JSON.stringify(compareVersions.b.data || compareVersions.b, null, 2);
    const aLines = aData.split('\n');
    const bLines = bData.split('\n');
    const maxLines = Math.max(aLines.length, bLines.length);

    return (
      <div className="modal-overlay" onClick={() => setCompareOpen(false)} style={{ zIndex: 3000 }}>
        <div className="editor-compare-modal" onClick={e => e.stopPropagation()}>
          <div className="editor-compare-header">
            <h3>Version Comparison</h3>
            <button className="modal-close" onClick={() => setCompareOpen(false)}>&times;</button>
          </div>
          <div className="editor-compare-body">
            <div className="editor-compare-panel">
              <div className="editor-compare-panel-title">Version {compareVersions.a.version || 'A'}</div>
              <pre className="editor-compare-code">{aData}</pre>
            </div>
            <div className="editor-compare-divider" />
            <div className="editor-compare-panel">
              <div className="editor-compare-panel-title">Version {compareVersions.b.version || 'B'}</div>
              <pre className="editor-compare-code">{bData}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!open || !form) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'content': return renderContentTab();
      case 'media': return renderMediaTab();
      case 'layout': return renderLayoutTab();
      case 'style': return renderStyleTab();
      case 'typography': return renderTypographyTab();
      case 'animation': return renderAnimationTab();
      case 'responsive': return renderResponsiveTab();
      case 'seo': return renderSEOTab();
      case 'visibility': return renderVisibilityTab();
      case 'permissions': return renderPermissionsTab();
      case 'analytics': return renderAnalyticsTab();
      case 'advanced': return renderAdvancedTab();
      case 'versions': return renderVersionsTab();
      default: return null;
    }
  };

  const isPublished = form.status === 'published' || form.published;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="editor-modal" onClick={e => e.stopPropagation()}>
        <div className="editor-modal-header">
          <div className="editor-modal-title">
            <h3>{form.name || form.type || 'Untitled Component'}</h3>
            <span className="editor-modal-subtitle">
              {form.type} · v{form.version || 1} · Last saved: {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : 'Never'}
            </span>
          </div>
          <div className="editor-modal-header-actions">
            {autoSaving && <span className="editor-auto-save" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>Auto-saving...</span>}
            <button className="btn btn-ghost" onClick={onPreview}>
              <Icon path={Icons.eye} size={14} /> Preview
            </button>
            <button className="modal-close" onClick={onClose}>
              <Icon path={Icons.x} size={18} />
            </button>
          </div>
        </div>

        <div className="editor-modal-body">
          <div className="editor-sidebar">
            {editorTabs.map(tab => (
              <button
                key={tab.id}
                className={`editor-sidebar-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon path={tab.icon} size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="editor-content">
            {renderTabContent()}
          </div>
        </div>

        <div className="editor-modal-footer">
          <div className="editor-footer-left">
            <label className="editor-status-toggle" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status:</span>
              <span className={`comp-card-status-badge`} style={{
                background: isPublished ? '#f0fdf4' : '#f1f5f9',
                color: isPublished ? '#16a34a' : '#64748b',
                borderColor: isPublished ? '#bbf7d0' : '#e2e8f0',
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid',
              }}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
              v{form.version || 1}
            </span>
          </div>
          <div className="editor-footer-right">
            <button className="btn btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
      {renderCompareModal()}
    </div>
  );
}
