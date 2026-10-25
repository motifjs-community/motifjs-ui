import type { Toolbar } from './Toolbar';
import type { ToolbarItem } from './toolbar-item';

/** What a pressed toolbar item reports. */
export interface ToolbarItemClickEventArgs {
  item: ToolbarItem;
  source: Toolbar;
  /** The click, from the bar or from the "more" menu. */
  event: Event;
}
