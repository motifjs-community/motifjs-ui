import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuBar } from './MenuBar';

export interface MenuBarCustomMenuOpeningEventArgs {
  /** The item pressed with the right button or the menu key, as the app gave it; `null` on the bar outside the items. */
  item: MenuItem | null;
  /** Its path, such as `file/recent`; `null` with `item`. */
  path: string | null;
  /**
   * The commands of the menu about to open: the bar's own when `customizable` is on, else none. Change the list to add
   * your own or to leave some out. The menu does not open when it is empty.
   */
  items: MenuItem[];
  /** Set to `true` to keep the menu closed. */
  cancel: boolean;
  /** Whether a key opened it. */
  byKeyboard: boolean;
  event: Event;
  source: MenuBar;
}
