import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';

/** Props of `MenuBar`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface MenuBarProps extends ControlProps {
  /** Names the bar for screen readers. The same property as `text`. */
  label?: Bind<string>;
  /** The top items; their `items` are the menus they open. `&File` makes Alt+F open File. */
  items?: Bind<readonly MenuItem[]>;
  /** F10 moves focus to the bar from anywhere on the page. Default `false`: browsers use F10 themselves. */
  focusOnF10?: Bind<boolean>;
  /** While a menu is open, pointing at another top item opens its menu; pointing at an item opens its submenu. Default `true`. */
  openOnHover?: Bind<boolean>;
  /** An item was chosen, after the item's own `click`. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
}
