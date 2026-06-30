import React from 'react';
import { Icons, Icon } from '../lib/icons';

export default function AutoSaveIndicator({ status = 'saved', lastSaved, onRetry }) {
  const config = {
    saved: {
      icon: Icons.check,
      color: 'var(--color-success)',
      label: 'All changes saved',
    },
    saving: {
      icon: null,
      color: 'var(--color-text-tertiary)',
      label: 'Saving...',
      spin: true,
    },
    unsaved: {
      icon: null,
      color: 'var(--color-warning)',
      label: 'Unsaved changes',
      dot: true,
    },
    error: {
      icon: Icons['alert-circle'],
      color: 'var(--color-danger)',
      label: 'Save failed',
    },
  };

  const c = config[status] || config.saved;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: c.color }}>
      {status === 'unsaved' && (
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
      )}
      {status === 'saving' && (
        <span style={{ width: 12, height: 12, border: '2px solid var(--color-gray-300)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0, display: 'inline-block' }} />
      )}
      {c.icon && <Icon path={c.icon} size={12} />}
      <span>{c.label}</span>
      {lastSaved && status === 'saved' && (
        <span style={{ opacity: 0.7 }}>
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '1px 6px', borderRadius: 4, border: '1px solid var(--color-danger)',
            background: 'transparent', color: 'var(--color-danger)', fontSize: '0.68rem',
            cursor: 'pointer', fontWeight: 600,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
