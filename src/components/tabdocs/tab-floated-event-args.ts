import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabWindow } from './TabWindow';

/** A document or a group floats in a window now. */
export interface TabFloatedEventArgs {
  document: TabDocument | null;
  /** The group in the window: the new one of a document, or the group that floated. */
  group: TabGroup;
  window: TabWindow;
  byUser: boolean;
  source: TabDocumentManager;
}
