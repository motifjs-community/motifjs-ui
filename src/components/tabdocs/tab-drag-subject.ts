import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/** What is being dragged: a document, or a whole group (`document: null`). */
export interface TabDragSubject {
  document: TabDocument | null;
  /** The document's group, or the group dragged. */
  group: TabGroup;
  /** The manager it is dragged from. */
  manager: TabDocumentManager;
  /** A drop now would open a copy (the copy key is held and the document may be open twice). */
  copy: boolean;
}
