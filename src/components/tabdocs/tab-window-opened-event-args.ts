import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A new browser window was opened and the document (or the group, or the floating window's layout) moved into it. */
export interface TabWindowOpenedEventArgs {
  window: TabBrowserWindow;
  /** The document that moved; `null` for a group or a floating window. */
  document: TabDocument | null;
  /** Its group in the new window that is active. */
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
