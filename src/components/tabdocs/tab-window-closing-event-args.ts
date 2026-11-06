import type { EventArgs } from '@motifx/core';
import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabNewWindowCloseAction } from './tab-new-window-close-action';
import type { TabWindow } from './TabWindow';

/**
 * Occurs before a floating window or new browser window closes. `then` determines whether its documents
 * return (a floating window to where it was docked, a new window to the main window) or close (each
 * still raising `onClosing`), and it can be changed. Set `cancel = true` to keep the window, except for
 * a new window that the user closed: that window has already closed, and its documents return.
 */
export interface TabWindowClosingEventArgs extends EventArgs {
  window: TabWindow | TabBrowserWindow;
  kind: 'floating' | 'browser';
  then: TabNewWindowCloseAction;
  byUser: boolean;
  source: TabDocumentManager;
}
