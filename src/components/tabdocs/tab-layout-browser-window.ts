import type { TabLayoutNode } from './tab-layout-node';
import type { TabRect } from './tab-rect';

/** A new browser window as `saveLayout` writes it. */
export interface TabLayoutBrowserWindow {
  /** Its position and size on the screen. */
  rect: TabRect;
  root: TabLayoutNode;
  /** The group (an index in `groups`) its documents came from and return to. */
  home?: number | null;
}
