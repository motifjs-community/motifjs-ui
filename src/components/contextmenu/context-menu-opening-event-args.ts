import type { ComponentBase } from '@motifx/core';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { ContextMenu } from './ContextMenu';

/** Provides data for `onOpening`. Change the items for the component, or cancel the opening. */
export interface ContextMenuOpeningEventArgs {
  /**
   * The component the menu opens for (`targetPart`): the innermost component of the target that was right-clicked,
   * or that holds focus when a key opened the menu, or the one given to `open()`.
   */
  part: ComponentBase;
  /** The items to show. Set it to build the menu for `part`. */
  items: readonly MenuItem[];
  /** With `true`, the menu does not open and the browser shows its own. */
  cancel: boolean;
  /** Indicates that the menu was opened with the Menu key or Shift+F10. */
  byKeyboard: boolean;
  /** The `contextmenu` or `keydown` event. */
  event: Event;
  source: ContextMenu;
}
