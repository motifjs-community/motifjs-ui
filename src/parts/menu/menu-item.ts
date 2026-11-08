import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { MenuItemClickEventArgs } from './menu-item-click-event-args';
import type { MenuItemMerge } from './menu-item-merge';
import type { MenuItemMergeAt } from './menu-item-merge-at';

/**
 * One command of a menu. Every field except `click` and `data` is a value or a function. A function
 * is tracked, so the item changes in the open menu when what it reads changes.
 */
export interface MenuItem {
  /** Finds the item in paths such as `file/recent` (a `MenuBar`'s changes by path). The default is its position. */
  key?: string | number;
  /**
   * The command of the app the item runs (see `commands`): what the item is not given, its text, icon, hint, keys,
   * state and action, comes from the command.
   */
  command?: string;
  /** The label. `&` marks the key that selects it while the menu is open (`&Copy`), and `&&` is a literal `&`. */
  text?: Bind<string>;
  /** An image address, an element or a component. A function is called each time the item is drawn. */
  icon?: Bind<IconSource | null | undefined>;
  /** The text shown as a tooltip. */
  hint?: Bind<string>;
  /** `false` keeps the item in the menu, dimmed, and it cannot be selected. The default is `true`. */
  enabled?: Bind<boolean>;
  /** `false` omits the item. The default is `true`. */
  visible?: Bind<boolean>;
  /** When set, the item shows a check mark when `true` (a `menuitemcheckbox`). `undefined` makes it a plain item again. */
  checked?: Bind<boolean | undefined>;
  /** Items in the same group are choices of one setting (`menuitemradio`). The one whose `checked` is `true` shows a dot. */
  group?: Bind<string>;
  /** A key combination shown at the end of the item (`Ctrl+S`). It is display only, and the app registers the key itself. */
  shortcut?: Bind<string>;
  /** A second, dimmer text after the label that distinguishes the item, such as a folder. It is part of the item's name. */
  description?: Bind<string>;
  /** A submenu, opened at the side of the item. */
  items?: Bind<readonly MenuItem[]>;
  /** The color of the item, by what it does (`danger` for a deletion). The default is `'standard'`. */
  tone?: Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>;
  /** Shows a line before the item, to group the commands. */
  beginGroup?: Bind<boolean>;
  /** Runs when the item is selected, after the menu closes. */
  click?: (e: MenuItemClickEventArgs) => void;
  /** In a `MenuBar` the user can change: `false` keeps the item where it is and shown. The default is `true`. */
  customizable?: Bind<boolean>;
  /** In a `MenuBar` merged into another: what the item does there. The default is `'auto'`. */
  merge?: Bind<MenuItemMerge>;
  /** In a `MenuBar` merged into another: where the item stands there. The default is the end. */
  mergeAt?: Bind<MenuItemMergeAt>;
  /** Custom data for the item. */
  data?: unknown;
}
