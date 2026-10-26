import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropSide } from './tab-drop-side';
import type { TabDropTargetKind } from './tab-drop-target-kind';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';

/** Where a drop would land: what a drop target answers for a point, and what `onDragOver` may change. */
export interface TabDropPlace {
  target: TabDropTargetKind;
  /** The manager the place is in: the one dragged from, or another of the same `dragGroup`. `null` outside. */
  manager: TabDocumentManager | null;
  /** The group it goes into or beside; `null` along an edge, in a dock area, floating and outside. */
  group: TabGroup | null;
  /** In a strip, the place among the tabs once it is there; -1 elsewhere. */
  index: number;
  /** Into a group (`center`) or the side of the new group; `null` in a strip, a dock area, floating and outside. */
  side: TabDropSide | null;
  /** The dock area of a `dock-area` place. */
  dockSide?: TabDockSide | null;
  /** The window of a `float` place. */
  rect?: TabRect | null;
}
