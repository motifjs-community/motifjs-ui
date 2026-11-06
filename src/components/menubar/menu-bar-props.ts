import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';

/** Props of `MenuBar`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface MenuBarProps extends ControlProps {
  /** The accessible name of the bar. This is the same property as `text`. */
  label?: Bind<string>;
  /** The top-level items, whose `items` define the menus they open. `&File` makes Alt+F open File. */
  items?: Bind<readonly MenuItem[]>;
  /** F10 moves focus to the bar from anywhere on the page. The default is `false` because browsers use F10. */
  focusOnF10?: Bind<boolean>;
  /**
   * While a menu is open, hovering another top-level item opens its menu, and hovering an item opens its submenu.
   * The default is `true`.
   */
  openOnHover?: Bind<boolean>;
  /** Occurs when an item is selected, after the item's own `click`. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
}
