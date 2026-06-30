import React, { useState } from 'react';
import { Icons, Icon } from '../lib/icons';

const typeColors = {
  hero: '#6366f1',
  about: '#ec4899',
  projects: '#f59e0b',
  skills: '#10b981',
  experience: '#3b82f6',
  education: '#8b5cf6',
  certificates: '#14b8a6',
  testimonials: '#f97316',
  services: '#06b6d4',
  blog: '#ef4444',
  contact: '#84cc16',
  gallery: '#d946ef',
  timeline: '#0ea5e9',
  faq: '#22c55e',
  cta: '#e11d48',
  statistics: '#64748b',
  custom: '#78716c',
};

const typeLabels = {
  hero: 'Hero', about: 'About', projects: 'Projects', skills: 'Skills',
  experience: 'Experience', education: 'Education', certificates: 'Certificates',
  testimonials: 'Testimonials', services: 'Services', blog: 'Blog',
  contact: 'Contact', gallery: 'Gallery', timeline: 'Timeline',
  faq: 'FAQ', cta: 'CTA', statistics: 'Stats', custom: 'Custom',
};

const statusStyles = {
  published: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  draft: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
  hidden: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  archived: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
};

export default function ComponentCard({ component, onEdit, onDuplicate, onDelete, onToggleStatus, onPreview, onLock, selected, onSelect, dragHandleProps }) {
  const [hovered, setHovered] = useState(false);
  const tColor = typeColors[component.type] || '#78716c';
  const status = component.status || (component.visible !== false ? 'published' : 'draft');
  const sStyle = statusStyles[status] || statusStyles.draft;

  return (
    <div
      className={`comp-card${selected ? ' selected' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      draggable
      {...dragHandleProps}
    >
      {onSelect && (
        <div className="comp-card-check" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onSelect(component._id)}
          />
        </div>
      )}
      <div className="comp-card-thumb" style={{ background: `linear-gradient(135deg, ${tColor}, ${tColor}88)` }}>
        <span className="comp-card-initials">
          {(component.name || component.type || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </span>
        {component.global && (
          <span className="comp-card-global-badge" title="Global Component">
            <Icon path={Icons.globe} size={12} />
          </span>
        )}
        {component.reusable && (
          <span className="comp-card-reusable-badge" title="Reusable">
            <Icon path={Icons['refresh-cw']} size={12} />
          </span>
        )}
      </div>
      <div className="comp-card-body">
        <div className="comp-card-name">{component.name || component.type || 'Untitled'}</div>
        <div className="comp-card-meta">
          <span className="comp-card-type-badge" style={{ background: `${tColor}18`, color: tColor }}>
            {typeLabels[component.type] || component.type}
          </span>
          <span className="comp-card-status-badge" style={{ background: sStyle.bg, color: sStyle.color, borderColor: sStyle.border }}>
            {status}
          </span>
        </div>
        <div className="comp-card-stats">
          <span>v{component.version || 1}</span>
          <span className="comp-card-dot">·</span>
          <span>Used on {component.usageCount || 0} page{(component.usageCount || 0) !== 1 ? 's' : ''}</span>
        </div>
        <div className="comp-card-date">
          {component.updatedAt ? new Date(component.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
        </div>
      </div>
      {hovered && (
        <div className="comp-card-actions">
          {onPreview && (
            <button className="comp-card-action-btn" onClick={(e) => { e.stopPropagation(); onPreview(component); }} title="Preview">
              <Icon path={Icons.eye} size={14} />
            </button>
          )}
          {onEdit && (
            <button className="comp-card-action-btn" onClick={(e) => { e.stopPropagation(); onEdit(component); }} title="Edit">
              <Icon path={Icons.edit} size={14} />
            </button>
          )}
          {onDuplicate && (
            <button className="comp-card-action-btn" onClick={(e) => { e.stopPropagation(); onDuplicate(component); }} title="Duplicate">
              <Icon path={Icons.copy} size={14} />
            </button>
          )}
          {onToggleStatus && (
            <button className="comp-card-action-btn" onClick={(e) => { e.stopPropagation(); onToggleStatus(component); }} title={status === 'published' ? 'Unpublish' : 'Publish'}>
              <Icon path={status === 'published' ? Icons['eye-off'] : Icons.eye} size={14} />
            </button>
          )}
          {onLock && (
            <button className="comp-card-action-btn" onClick={(e) => { e.stopPropagation(); onLock(component); }} title={component.locked ? 'Unlock' : 'Lock'}>
              <Icon path={component.locked ? Icons.shield : Icons['shield']} size={14} />
            </button>
          )}
          {onDelete && (
            <button className="comp-card-action-btn danger" onClick={(e) => { e.stopPropagation(); onDelete(component); }} title="Delete">
              <Icon path={Icons.trash2} size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
