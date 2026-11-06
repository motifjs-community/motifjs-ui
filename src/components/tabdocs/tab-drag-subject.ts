import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabWindow } from './TabWindow';

/**
 * The item being dragged: a document, a whole group (`document: null`), or a floating window (`window`)
 * with its contents.
 */
export interface TabDragSubject {
  document: TabDocument | null;
  /** The document's group, the group being dragged, or a window's active group. */
  group: TabGroup;
  /** The manager it is dragged from. */
  manager: TabDocumentManager;
  /** Indicates that a drop now would open a copy: the copy key is held and the document can be open twice. */
  copy: boolean;
  /** The floating window being moved by its title area. */
  window?: TabWindow | null;
}
