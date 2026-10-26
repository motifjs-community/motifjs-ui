import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A document was kept open, pinned, unpinned or hidden (`group`: the one it was hidden from). */
export interface DocumentChangedEventArgs {
  document: TabDocument;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
