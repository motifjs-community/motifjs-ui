import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropSide } from './tab-drop-side';
import type { TabDropTargetKind } from './tab-drop-target-kind';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';

/** Where a drop would land: what a drop target returns for a point, and what `onDragOver` can change. */
export interface TabDropPlace {
  target: TabDropTargetKind;
  /** The manager of the position: the one dragged from, or another in the same `dragGroup`. `null` outside. */
  manager: TabDocumentManager | null;
  /** The group it moves into or beside. `null` along an edge, in a dock area, when floating and outside. */
  group: TabGroup | null;
  /** In a strip, its position among the tabs after the drop. -1 elsewhere. */
  index: number;
  /** Into a group (`center`) or the side of the new group. `null` in a strip, a dock area, when floating and outside. */
  side: TabDropSide | null;
  /** The dock area of a `dock-area` position. */
  dockSide?: TabDockSide | null;
  /** The window of a `float` position. For `new-window`, its position on the screen. */
  rect?: TabRect | null;
  /** The new browser window an `edge` position runs along. `null` is the document area of the main window. */
  browserWindow?: TabBrowserWindow | null;
}
