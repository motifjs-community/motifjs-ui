import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabNewWindowFallback } from './tab-new-window-fallback';

/**
 * Something the manager was asked could not be done: `windowBlocked`, the browser opened no window
 * (it blocks windows a page opens without a click or a key); `windowNotUsable`, the page in it is
 * of another origin. `fallback` says what happens instead, and may be changed.
 */
export interface TabErrorEventArgs {
  error: 'windowBlocked' | 'windowNotUsable';
  document: TabDocument | null;
  group: TabGroup | null;
  fallback: TabNewWindowFallback;
  byUser: boolean;
  source: TabDocumentManager;
}
