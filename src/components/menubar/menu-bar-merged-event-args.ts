import type { MenuBar } from './MenuBar';

export interface MenuBarMergedEventArgs {
  /** The bar that merged into the main bar, or left it. */
  bar: MenuBar;
  /** The main bar. */
  source: MenuBar;
}
