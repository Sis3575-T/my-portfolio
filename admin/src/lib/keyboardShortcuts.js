import { useEffect } from 'react';

export const SHORTCUTS = {
  'ctrl+k': 'Open command palette',
  'ctrl+s': 'Save current item',
  'ctrl+p': 'Open page',
  'ctrl+shift+p': 'Command palette (commands)',
  'ctrl+z': 'Undo',
  'ctrl+shift+z': 'Redo',
  'ctrl+a': 'Select all',
  'escape': 'Close modal / deselect',
  'ctrl+f': 'Focus search',
  'ctrl+d': 'Duplicate selected',
  'delete': 'Delete selected',
  'ctrl+shift+e': 'Export',
  '?': 'Show keyboard shortcuts',
};

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handle = (e) => {
      const parts = [];
      if (e.metaKey || e.ctrlKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.key === ' ') parts.push('space');
      else if (e.key === '?') parts.push('?');
      else parts.push(e.key.toLowerCase());
      const key = parts.join('+');

      if (handlers[key]) {
        e.preventDefault();
        e.stopPropagation();
        handlers[key](e);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [handlers]);
}

export function formatShortcutForDisplay(shortcut) {
  return shortcut
    .replace('ctrl', 'Ctrl')
    .replace('shift', 'Shift')
    .replace('escape', 'Esc')
    .split('+')
    .join(' + ');
}
