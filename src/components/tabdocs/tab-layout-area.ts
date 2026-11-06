import type { TabDockSide } from './tab-dock-side';
import type { TabLayoutBar } from './tab-layout-bar';
import type { TabLayoutNode } from './tab-layout-node';

/** A dock area as `saveLayout` writes it. */
export interface TabLayoutArea {
  side: TabDockSide;
  /** The size, in pixels or as a share such as `'25%'`. */
  size: number | string;
  autoHide?: boolean;
  /** Its bar settings that were set as plain values (`TabBarSettings`). */
  bar?: TabLayoutBar;
  root: TabLayoutNode;
}
