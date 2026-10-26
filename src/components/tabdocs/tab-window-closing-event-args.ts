import type { EventArgs } from '@motifx/core';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabWindow } from './TabWindow';

/** A floating window is about to close with its documents (each one still asks through `onClosing`); `cancel = true` keeps it. */
export interface TabWindowClosingEventArgs extends EventArgs {
  window: TabWindow;
  byUser: boolean;
  source: TabDocumentManager;
}
