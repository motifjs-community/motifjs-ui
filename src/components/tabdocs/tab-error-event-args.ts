import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabNewWindowFallback } from './tab-new-window-fallback';

/**
 * Reports an action the manager could not perform. With `windowBlocked`, the browser opened no window,
 * because it blocks windows a page opens without a click or a key press. With `windowNotUsable`, the
 * page in the window is from another origin. `fallback` determines what happens instead, and can be changed.
 */
export interface TabErrorEventArgs {
  error: 'windowBlocked' | 'windowNotUsable';
  document: TabDocument | null;
  group: TabGroup | null;
  fallback: TabNewWindowFallback;
  byUser: boolean;
  source: TabDocumentManager;
}
