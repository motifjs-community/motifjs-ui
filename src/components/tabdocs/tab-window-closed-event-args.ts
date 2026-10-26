import type { TabDocumentManager } from './TabDocumentManager';
import type { TabWindow } from './TabWindow';

/** A floating window is gone: closed with its documents, docked, or left without documents. */
export interface TabWindowClosedEventArgs {
  window: TabWindow;
  reason: 'closed' | 'docked' | 'empty';
  byUser: boolean;
  source: TabDocumentManager;
}
