import type { EventArgs } from '@motifx/core';
import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabNewWindowCloseAction } from './tab-new-window-close-action';
import type { TabWindow } from './TabWindow';

/**
 * A floating window or a new browser window is about to close. `then` says what its documents do:
 * go back (a floating window: where it was docked; a new window: to the main window) or close (each
 * one still asks through `onClosing`); it may be changed. `cancel = true` keeps the window, except
 * a new window the user closed: that one is gone already, and its documents come back.
 */
export interface TabWindowClosingEventArgs extends EventArgs {
  window: TabWindow | TabBrowserWindow;
  kind: 'floating' | 'browser';
  then: TabNewWindowCloseAction;
  byUser: boolean;
  source: TabDocumentManager;
}
