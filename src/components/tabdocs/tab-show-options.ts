import type { TabDockSide } from './tab-dock-side';
import type { TabGroup } from './TabGroup';

/** Where and how `show` puts a hidden document back. Without `group` or `side`, it goes back where it was hidden from. */
export interface TabShowOptions {
  /** Into this group. */
  group?: TabGroup;
  /** Into the dock area of this side (made when there is none). */
  side?: TabDockSide;
  /** Its place in the group's strip. Default: where it was, or as `openPosition` says in another group. */
  index?: number;
  /** Make it the active tab. Default `true`. */
  active?: boolean;
  /** Move focus to it as well. Default `false`. */
  focus?: boolean;
}
