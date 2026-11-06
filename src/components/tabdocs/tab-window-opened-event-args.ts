import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs after a new browser window opens and the document, group or floating window's layout moves into it. */
export interface TabWindowOpenedEventArgs {
  window: TabBrowserWindow;
  /** The document that moved, or `null` for a group or floating window. */
  document: TabDocument | null;
  /** The active group in the new window. */
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
