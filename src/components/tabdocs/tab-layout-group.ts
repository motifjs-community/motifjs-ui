import type { TabDropSide } from './tab-drop-side';
import type { TabLayoutDocument } from './tab-layout-document';

/** A group as `saveLayout` writes it. */
export interface TabLayoutGroup {
  kind: 'group';
  documents: TabLayoutDocument[];
  /** The index of the active document, or -1 for none. */
  active: number;
  /** The indexes of the documents, with the most recently used first. */
  recent: number[];
  locked?: boolean;
  /** Written when the group accepts no drops. */
  allowDrop?: boolean;
  /** Written when the group has its own drop sides. */
  dropSides?: TabDropSide[];
}
