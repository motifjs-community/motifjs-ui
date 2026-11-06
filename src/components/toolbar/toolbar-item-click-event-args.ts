import type { Toolbar } from './Toolbar';
import type { ToolbarItem } from './toolbar-item';

/** Provides data for the event that occurs when a toolbar item is clicked. */
export interface ToolbarItemClickEventArgs {
  item: ToolbarItem;
  source: Toolbar;
  /** The click, from the bar or from the overflow menu. */
  event: Event;
}
