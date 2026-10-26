import type { TabDockSide } from './tab-dock-side';
import type { TabLayoutNode } from './tab-layout-node';
import type { TabRect } from './tab-rect';

/** A floating window as `saveLayout` writes it. */
export interface TabLayoutWindow {
  rect: TabRect;
  maximized?: boolean;
  root: TabLayoutNode;
  /** Where "Dock" puts it back: a dock area, or the group (its index in `groups`) it came from. */
  dock?: { side: TabDockSide | null; group: number | null };
}
