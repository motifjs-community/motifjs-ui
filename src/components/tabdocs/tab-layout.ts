import type { TabLayoutArea } from './tab-layout-area';
import type { TabLayoutBrowserWindow } from './tab-layout-browser-window';
import type { TabLayoutHidden } from './tab-layout-hidden';
import type { TabLayoutNode } from './tab-layout-node';
import type { TabLayoutWindow } from './tab-layout-window';

/**
 * The layout as `saveLayout` writes it, in plain JSON. Layouts of versions 1 (no dock areas, no windows)
 * and 2 (no new windows) still load.
 */
export interface TabLayout {
  version: 1 | 2 | 3;
  /** The document area. */
  root: TabLayoutNode;
  /** The index of the active group, in the order of `groups`. */
  activeGroup: number;
  /** The index of the maximized group, or `null` when none is maximized. */
  maximizedGroup: number | null;
  /** The dock areas, with the outermost first. */
  areas?: TabLayoutArea[];
  /** The floating windows, with the one at the back first. */
  windows?: TabLayoutWindow[];
  /** The new browser windows, with the most recently used last. */
  browserWindows?: TabLayoutBrowserWindow[];
  /** The hidden documents, in the order they were hidden. */
  hidden?: TabLayoutHidden[];
}
