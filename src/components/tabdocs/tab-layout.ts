import type { TabLayoutArea } from './tab-layout-area';
import type { TabLayoutNode } from './tab-layout-node';
import type { TabLayoutWindow } from './tab-layout-window';

/** The layout as `saveLayout` writes it: plain JSON. A version 1 layout (no dock areas, no windows) still loads. */
export interface TabLayout {
  version: 1 | 2;
  /** The documents' area. */
  root: TabLayoutNode;
  /** The index of the active group, in the order of `groups`. */
  activeGroup: number;
  /** The index of the maximized group, `null` when none is. */
  maximizedGroup: number | null;
  /** The dock areas, the outermost first. */
  areas?: TabLayoutArea[];
  /** The floating windows, the one at the back first. */
  windows?: TabLayoutWindow[];
}
