import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropPlace } from './tab-drop-place';
import type { TabGroup } from './TabGroup';

/** Occurs after a drop completes. `group` is where the document, or the group's documents, ended up. */
export interface TabDroppedEventArgs extends TabDropPlace {
  /** The dropped document, or the copy when one was opened. `null` for a group. */
  document: TabDocument | null;
  from: TabGroup;
  copy: boolean;
  byKeyboard: boolean;
  source: TabDocumentManager;
}
