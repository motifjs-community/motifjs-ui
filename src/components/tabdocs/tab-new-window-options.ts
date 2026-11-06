import type { TabRect } from './tab-rect';

/** The options of `moveToNewWindow`. */
export interface TabNewWindowOptions {
  /**
   * The window's position and size on the screen. By default, it has the size of what moves (or
   * `newWindowSize`) and opens beside it.
   */
  rect?: TabRect;
  /** The page the window opens, on the page's own origin. The default is `newWindowUrl`. */
  url?: string;
}
