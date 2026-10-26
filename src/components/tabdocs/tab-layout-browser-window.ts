import type { TabLayoutNode } from './tab-layout-node';
import type { TabRect } from './tab-rect';

/** A new browser window as `saveLayout` writes it. */
export interface TabLayoutBrowserWindow {
  /** Its place and size on the screen. */
  rect: TabRect;
  root: TabLayoutNode;
  /** The group (its index in `groups`) its documents came from, where they go back to. */
  home?: number | null;
}
