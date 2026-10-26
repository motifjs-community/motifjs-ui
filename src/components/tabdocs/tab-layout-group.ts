import type { TabDropSide } from './tab-drop-side';
import type { TabLayoutDocument } from './tab-layout-document';

/** A group as `saveLayout` writes it. */
export interface TabLayoutGroup {
  kind: 'group';
  documents: TabLayoutDocument[];
  /** The index of the active document, -1 for none. */
  active: number;
  /** Indexes of the documents, the one used last first. */
  recent: number[];
  locked?: boolean;
  /** Written when the group takes no drops. */
  allowDrop?: boolean;
  /** Written when the group has drop sides of its own. */
  dropSides?: TabDropSide[];
}
