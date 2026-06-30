import React from 'react';
import { Icons, Icon } from '../lib/icons';

export default function FilterPanel({ filters = [], values = {}, onChange, onReset, onSave, visible = false }) {
  if (!visible) return null;

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        background: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
        animation: 'slideDown 0.2s ease',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {filters.map((filter) => (
          <div key={filter.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select
                value={values[filter.key] || ''}
                onChange={(e) => onChange && onChange(filter.key, e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg-subtle)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">All</option>
                {(filter.options || []).map((opt) => (
                  <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                    {typeof opt === 'string' ? opt : opt.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={values[filter.key] || ''}
                onChange={(e) => onChange && onChange(filter.key, e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg-subtle)',
                  outline: 'none',
                }}
              />
            ) : (
              <input
                type="text"
                placeholder={`Filter ${filter.label.toLowerCase()}...`}
                value={values[filter.key] || ''}
                onChange={(e) => onChange && onChange(filter.key, e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg-subtle)',
                  outline: 'none',
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onReset && (
          <button className="btn btn-ghost" onClick={onReset}>
            <Icon path={Icons.x} size={14} /> Reset
          </button>
        )}
        {onSave && (
          <button className="btn btn-primary" onClick={onSave}>
            <Icon path={Icons.save} size={14} /> Save
          </button>
        )}
      </div>
    </div>
  );
}
