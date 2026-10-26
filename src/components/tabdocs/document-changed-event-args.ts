import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** A document was kept open, pinned or unpinned. */
export interface DocumentChangedEventArgs {
  document: TabDocument;
  group: TabGroup;
  byUser: boolean;
  source: TabDocumentManager;
}
