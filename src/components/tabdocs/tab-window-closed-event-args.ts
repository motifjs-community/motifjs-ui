import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabWindow } from './TabWindow';

/**
 * A floating window or a new browser window is gone: closed, docked (its documents went back),
 * left without documents, or moved (a floating window's layout went into a new window).
 */
export interface TabWindowClosedEventArgs {
  window: TabWindow | TabBrowserWindow;
  kind: 'floating' | 'browser';
  reason: 'closed' | 'docked' | 'empty' | 'moved';
  byUser: boolean;
  source: TabDocumentManager;
}
