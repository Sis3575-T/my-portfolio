import React from 'react';
import { SHORTCUTS, formatShortcutForDisplay } from '../lib/keyboardShortcuts';
import { Icon, Icons } from '../lib/icons';

export default function KeyboardShortcutsModal({ open, onClose }) {
  if (!open) return null;

  const groups = [
    {
      label: 'General',
      shortcuts: Object.entries(SHORTCUTS).filter(([key]) =>
        ['ctrl+k', 'ctrl+s', 'ctrl+p', 'ctrl+shift+p', 'escape', '?'].includes(key)
      ),
    },
    {
      label: 'Editing',
      shortcuts: Object.entries(SHORTCUTS).filter(([key]) =>
        ['ctrl+z', 'ctrl+shift+z', 'ctrl+a', 'ctrl+d', 'delete'].includes(key)
      ),
    },
    {
      label: 'Search & Export',
      shortcuts: Object.entries(SHORTCUTS).filter(([key]) =>
        ['ctrl+f', 'ctrl+shift+e'].includes(key)
      ),
    },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex: 1100, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-card)',
          borderRadius: 16,
          width: '90%',
          maxWidth: 480,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          animation: 'scaleIn 0.2s ease',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', borderRadius: 6, background: 'transparent',
              color: 'var(--color-text-tertiary)', cursor: 'pointer',
            }}
          >
            <Icon path={Icons.x} size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {groups.map((group) => (
            <div key={group.label} style={{ marginBottom: '1.25rem' }}>
              <h3
                style={{
                  fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: 'var(--color-text-tertiary)',
                  margin: '0 0 0.5rem',
                }}
              >
                {group.label}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.shortcuts.map(([key, desc]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.45rem 0.6rem', borderRadius: 6,
                      background: 'var(--color-bg-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', color: 'var(--color-text)' }}>{desc}</span>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {formatShortcutForDisplay(key).split(' + ').map((part, i) => (
                        <kbd
                          key={i}
                          style={{
                            padding: '2px 6px', background: 'var(--color-card)',
                            border: '1px solid var(--color-border)', borderRadius: 4,
                            fontSize: '0.7rem', fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--color-text-secondary)', fontWeight: 600,
                          }}
                        >
                          {part}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: '0.5rem' }}>
            Press <kbd style={{ padding: '1px 4px', background: 'var(--color-bg-subtle)', borderRadius: 3, border: '1px solid var(--color-border)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>?</kbd> anytime to open this dialog
          </p>
        </div>
      </div>
    </div>
  );
}
