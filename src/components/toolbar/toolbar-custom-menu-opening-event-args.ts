import type { MenuItem } from '../../parts/menu/menu-item';
import type { Toolbar } from './Toolbar';
import type { ToolbarItem } from './toolbar-item';

export interface ToolbarCustomMenuOpeningEventArgs {
  /**
   * The item pressed with the right button or the menu key, as the app gave it (a command the user added: an item that
   * names it); `null` on the bar outside the items, and on its JSX children.
   */
  item: ToolbarItem | null;
  /** Its name in the customization: its key, its position or the id of an item the user added; `null` with `item`. */
  path: string | null;
  /**
   * The commands of the menu about to open: the toolbar's own when `customizable` is on, else none. Change the list to
   * add your own or to leave some out. The menu does not open when it is empty.
   */
  items: MenuItem[];
  /** Set to `true` to keep the menu closed. */
  cancel: boolean;
  /** Whether a key opened it. */
  byKeyboard: boolean;
  event: Event;
  source: Toolbar;
}
