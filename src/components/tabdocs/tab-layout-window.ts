import type { TabDockSide } from './tab-dock-side';
import type { TabLayoutBar } from './tab-layout-bar';
import type { TabLayoutNode } from './tab-layout-node';
import type { TabRect } from './tab-rect';

/** A floating window as `saveLayout` writes it. */
export interface TabLayoutWindow {
  rect: TabRect;
  maximized?: boolean;
  /** Its bar settings that were set as plain values (`TabBarSettings`). */
  bar?: TabLayoutBar;
  root: TabLayoutNode;
  /** Where "Dock" returns it: a dock area, or its original group (an index in `groups`). */
  dock?: { side: TabDockSide | null; group: number | null };
}
