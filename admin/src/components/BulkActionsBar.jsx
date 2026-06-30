import React from 'react';
import { Icons, Icon } from '../lib/icons';

const defaultActions = [
  { key: 'publish', label: 'Publish', icon: Icons.check, variant: 'primary' },
  { key: 'unpublish', label: 'Unpublish', icon: Icons['eye-off'], variant: 'ghost' },
  { key: 'archive', label: 'Archive', icon: Icons.folder, variant: 'ghost' },
  { key: 'restore', label: 'Restore', icon: Icons['refresh-cw'], variant: 'ghost' },
  { key: 'delete', label: 'Delete', icon: Icons.trash2, variant: 'danger' },
  { key: 'duplicate', label: 'Duplicate', icon: Icons.copy, variant: 'ghost' },
  { key: 'export-csv', label: 'Export CSV', icon: Icons.download, variant: 'ghost' },
];

export default function BulkActionsBar({ count = 0, actions = defaultActions, onAction, onDeselectAll }) {
  if (count === 0) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 800,
        background: 'var(--color-card)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        animation: 'slideUp 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onDeselectAll}
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderRadius: 6, background: 'transparent',
            color: 'var(--color-text-tertiary)', cursor: 'pointer',
          }}
          title="Deselect all"
        >
          <Icon path={Icons.x} size={16} />
        </button>
        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
          {count} item{count !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {actions.map((action) => {
          const variantStyles = {
            primary: { background: 'var(--color-primary)', color: '#fff' },
            danger: { background: 'var(--color-danger-subtle)', color: 'var(--color-danger)' },
            ghost: { background: 'transparent', color: 'var(--color-text-secondary)' },
          };
          const vs = variantStyles[action.variant] || variantStyles.ghost;
          return (
            <button
              key={action.key}
              onClick={() => onAction && onAction(action.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.4rem 0.75rem', borderRadius: 8,
                border: action.variant === 'ghost' ? '1px solid var(--color-border)' : 'none',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
                ...vs,
              }}
              onMouseEnter={(e) => {
                if (action.variant === 'ghost') e.currentTarget.style.background = 'var(--color-bg-subtle)';
              }}
              onMouseLeave={(e) => {
                if (action.variant === 'ghost') e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon path={action.icon} size={14} />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
