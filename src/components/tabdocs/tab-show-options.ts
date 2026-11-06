import type { TabDockSide } from './tab-dock-side';
import type { TabGroup } from './TabGroup';

/** Where and how `show` restores a hidden document. Without `group` or `side`, it returns to where it was hidden from. */
export interface TabShowOptions {
  /** Restores it into this group. */
  group?: TabGroup;
  /** Restores it into the dock area on this side, which is created if necessary. */
  side?: TabDockSide;
  /** Its position in the group's strip. The default is its previous position, or `openPosition` in another group. */
  index?: number;
  /** Makes it the active tab. The default is `true`. */
  active?: boolean;
  /** Moves focus to it as well. The default is `false`. */
  focus?: boolean;
}
