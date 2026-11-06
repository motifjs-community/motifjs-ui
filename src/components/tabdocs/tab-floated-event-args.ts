import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabWindow } from './TabWindow';

/** Occurs after a document or group floats in a window. */
export interface TabFloatedEventArgs {
  document: TabDocument | null;
  /** The group in the window: a document's new group, or the group that floated. */
  group: TabGroup;
  window: TabWindow;
  byUser: boolean;
  source: TabDocumentManager;
}
