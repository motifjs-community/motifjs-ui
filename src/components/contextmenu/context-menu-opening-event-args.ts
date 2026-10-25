import type { MenuItem } from '../../parts/menu/menu-item';
import type { ContextMenu } from './ContextMenu';

/** What `onOpening` gets: the items can be changed for the element, or the opening canceled. */
export interface ContextMenuOpeningEventArgs {
  /** The element pressed with the right button, or the focused one when a key opened the menu. */
  target: Element;
  /** The items to show; set it to build the menu for `target`. */
  items: readonly MenuItem[];
  /** `true`: the menu does not open, and the browser shows its own. */
  cancel: boolean;
  /** Opened with the Menu key or Shift+F10. */
  byKeyboard: boolean;
  /** The `contextmenu` or `keydown` event. */
  event: Event;
  source: ContextMenu;
}
