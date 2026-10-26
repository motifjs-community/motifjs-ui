import type { TabDockSide } from './tab-dock-side';
import type { TabLayoutNode } from './tab-layout-node';

/** A dock area as `saveLayout` writes it. */
export interface TabLayoutArea {
  side: TabDockSide;
  /** Pixels, or a share such as `'25%'`. */
  size: number | string;
  autoHide?: boolean;
  root: TabLayoutNode;
}
