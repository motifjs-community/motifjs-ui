import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { MenuItemClickEventArgs } from './menu-item-click-event-args';

/**
 * One command of a menu. Every field but `click` and `data` is a value or a function: a function
 * is followed, so the item changes in the open menu when what it reads changes.
 */
export interface MenuItem {
  /** The label; `&` marks the key that chooses it while the menu is open (`&Copy`), `&&` is a literal `&`. */
  text: Bind<string>;
  /** An image address, an element or a component; a function is called each time the item is drawn. */
  icon?: Bind<IconSource | null | undefined>;
  /** Shown as a tooltip. */
  hint?: Bind<string>;
  /** `false` keeps the item in the menu, dimmed, and it cannot be chosen. Default `true`. */
  enabled?: Bind<boolean>;
  /** `false` leaves the item out. Default `true`. */
  visible?: Bind<boolean>;
  /** Given, the item shows a check mark when `true` (a `menuitemcheckbox`); `undefined` makes it a plain item again. */
  checked?: Bind<boolean | undefined>;
  /** Items of the same group are choices of one setting (`menuitemradio`): the one whose `checked` is `true` shows a dot. */
  group?: Bind<string>;
  /** A key combination shown at the end of the item (`Ctrl+S`); only shown, the app registers the key itself. */
  shortcut?: Bind<string>;
  /** A second, dimmer text after the label: what tells the item apart, such as a folder. It is part of the item's name. */
  description?: Bind<string>;
  /** A submenu, opened at the side of the item. */
  items?: Bind<readonly MenuItem[]>;
  /** The colour of the item, by what it does (`danger` for a deletion). Default `'standard'`. */
  tone?: Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>;
  /** A line before the item, to group the commands. */
  beginGroup?: Bind<boolean>;
  /** Runs when the item is chosen, after the menu closed. */
  click?: (e: MenuItemClickEventArgs) => void;
  /** The app's own value for the item. */
  data?: unknown;
}
