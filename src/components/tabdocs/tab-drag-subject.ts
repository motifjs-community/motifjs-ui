import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabWindow } from './TabWindow';

/** What is being dragged: a document, a whole group (`document: null`), or a floating window (`window`) with everything in it. */
export interface TabDragSubject {
  document: TabDocument | null;
  /** The document's group, or the group dragged (for a window, its active group). */
  group: TabGroup;
  /** The manager it is dragged from. */
  manager: TabDocumentManager;
  /** A drop now would open a copy (the copy key is held and the document may be open twice). */
  copy: boolean;
  /** The floating window moved by its title area. */
  window?: TabWindow | null;
}
