import type { TabLayoutNode } from './tab-layout-node';

/** The layout as `saveLayout` writes it: plain JSON. */
export interface TabLayout {
  version: 1;
  root: TabLayoutNode;
  /** The index of the active group, in the order of `groups`. */
  activeGroup: number;
  /** The index of the maximized group, `null` when none is. */
  maximizedGroup: number | null;
}
