import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropSide } from './tab-drop-side';
import type { TabDropTargetKind } from './tab-drop-target-kind';
import type { TabGroup } from './TabGroup';

/** Where a drop would land: what a drop target answers for a point, and what `onDragOver` may change. */
export interface TabDropPlace {
  target: TabDropTargetKind;
  /** The manager the place is in: the one dragged from, or another of the same `dragGroup`. `null` outside. */
  manager: TabDocumentManager | null;
  /** The group it goes into or beside; `null` along an edge of the layout and outside. */
  group: TabGroup | null;
  /** In a strip, the place among the tabs once it is there; -1 elsewhere. */
  index: number;
  /** Into a group (`center`) or the side of the new group; `null` in a strip and outside. */
  side: TabDropSide | null;
}
