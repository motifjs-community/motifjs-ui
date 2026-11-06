import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabWindow } from './TabWindow';

/**
 * Occurs when a floating window or new browser window is closed, docked (its documents returned), left
 * without documents, or moved (a floating window's layout moved into a new window).
 */
export interface TabWindowClosedEventArgs {
  window: TabWindow | TabBrowserWindow;
  kind: 'floating' | 'browser';
  reason: 'closed' | 'docked' | 'empty' | 'moved';
  byUser: boolean;
  source: TabDocumentManager;
}
