import { parseShortcut } from './keyboard';
import { isApplePlatform } from './platform';

const NAMES: Record<string, string> = {
  ' ': 'Space',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  escape: 'Esc',
  delete: 'Del',
  insert: 'Ins',
  pageup: 'PgUp',
  pagedown: 'PgDn',
};

/** How keys read on this platform: `Mod+Shift+S` reads `Ctrl+Shift+S`, and `⇧⌘S` on Apple platforms. */
export function shortcutText(shortcut: string): string {
  let chords;
  try {
    chords = parseShortcut(shortcut);
  } catch {
    return shortcut;
  }
  const apple = isApplePlatform();
  return chords
    .map((c) => {
      const key = NAMES[c.key] ?? (c.key.length === 1 ? c.key.toUpperCase() : c.key[0].toUpperCase() + c.key.slice(1));
      if (apple) return `${c.ctrl ? '⌃' : ''}${c.alt ? '⌥' : ''}${c.shift ? '⇧' : ''}${c.meta ? '⌘' : ''}${key}`;
      return [c.ctrl && 'Ctrl', c.alt && 'Alt', c.shift && 'Shift', c.meta && 'Win', key].filter(Boolean).join('+');
    })
    .join(' ');
}
