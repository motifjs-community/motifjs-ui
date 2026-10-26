import type { TabRect } from './tab-rect';

/** What `moveToNewWindow` may be told. */
export interface TabNewWindowOptions {
  /** The window's place and size on the screen; by default the size of what moves (or `newWindowSize`), beside it. */
  rect?: TabRect;
  /** The page the window opens, on the page's own origin; `newWindowUrl` by default. */
  url?: string;
}
