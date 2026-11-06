import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { ButtonTone } from '../button/button-tone';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import type { ToolbarItemOverflow } from './toolbar-item-overflow';
import type { ToolbarItemType } from './toolbar-item-type';

/**
 * One item of `Toolbar.items`, drawn as a `Button` (or a separator). Every field but `click` and
 * `data` is a value or a function: a function is tracked.
 */
export interface ToolbarItem {
  /** Default `'button'`. */
  type?: Bind<ToolbarItemType>;
  /** The caption; `&Bold` makes Alt+B press it. */
  text?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** A tooltip; the name of a button that only has an icon. */
  hint?: Bind<string>;
  /** The color of the button, by what it does. Default `'standard'`. */
  tone?: Bind<ButtonTone>;
  /** A toggle's state. Given as a function, the item follows it: `click` changes what it reads. */
  pressed?: Bind<boolean>;
  /** `false` dims the item; it cannot be pressed. Default `true`. */
  enabled?: Bind<boolean>;
  /** `false` leaves the item out. Default `true`. */
  visible?: Bind<boolean>;
  /** The commands of a `menu` item. */
  menu?: Bind<readonly MenuItem[]>;
  /** Whether it may move into the "more" menu. Default `'auto'`. */
  overflow?: Bind<ToolbarItemOverflow>;
  /** Runs when the item is pressed, in the bar or in the "more" menu. */
  click?: (e: ToolbarItemClickEventArgs) => void;
  /** The app's own value for the item. */
  data?: unknown;
}
