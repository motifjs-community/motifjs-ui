import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** Occurs after a document is kept open, pinned, unpinned or hidden. `group` is the group it was hidden from. */
export interface DocumentChangedEventArgs {
  document: TabDocument;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
