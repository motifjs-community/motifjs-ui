import type { ShortcutInfo } from './shortcut-info';

/**
 * Shortcuts that get in each other's way. `same`: the same keys in the same place, and the first one added runs.
 * `prefix`: the keys of one start the keys of another (`Ctrl+K` and `Ctrl+K W`), and the shorter one never runs.
 * `accessKey`: an app-wide Alt shortcut takes the key of an access key on the page.
 */
export interface ShortcutConflict {
  reason: 'same' | 'prefix' | 'accessKey';
  /** The keys, as they read in the shortcut added first. */
  keys: string;
  shortcuts: ShortcutInfo[];
}
