import { useEffect } from 'react';

interface ShortcutOptions {
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

/**
 * Hook to listen for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const { altKey = false, ctrlKey = false, shiftKey = false, metaKey = false } = options;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.altKey === altKey &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey
      ) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [key, callback, options]);
}
