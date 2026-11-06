import type { MenuItem } from '../../parts/menu/menu-item';
import type { ContextMenu } from './ContextMenu';

/** Provides data for `onOpening`. Change the items for the element, or cancel the opening. */
export interface ContextMenuOpeningEventArgs {
  /** The element that was right-clicked, or the focused element when a key opened the menu. */
  target: Element;
  /** The items to show. Set it to build the menu for `target`. */
  items: readonly MenuItem[];
  /** With `true`, the menu does not open and the browser shows its own. */
  cancel: boolean;
  /** Indicates that the menu was opened with the Menu key or Shift+F10. */
  byKeyboard: boolean;
  /** The `contextmenu` or `keydown` event. */
  event: Event;
  source: ContextMenu;
}
