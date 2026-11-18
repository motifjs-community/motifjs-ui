import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { ButtonTone } from '../button/button-tone';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import type { ToolbarItemDisplay } from './toolbar-item-display';
import type { ToolbarItemOverflow } from './toolbar-item-overflow';
import type { ToolbarItemType } from './toolbar-item-type';

/**
 * One item of `Toolbar.items`, drawn as a `Button` or a separator. Every field except `key`, `command`, `click` and
 * `data` accepts a value or a function, and a function is tracked.
 */
export interface ToolbarItem {
  /** Names the item in what the user changed (`customization`), so that it keeps its changes when the items change. The default is its position. */
  key?: string | number;
  /** The default is `'button'`. */
  type?: Bind<ToolbarItemType>;
  /**
   * The command of the app the item runs (see `commands`): what the item is not given, its text, icon, hint, state and
   * action, comes from the command; a toggle is pressed as the command is `checked`.
   */
  command?: string;
  /** The caption. `&Bold` makes Alt+B click it. */
  text?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** A tooltip, which also names a button that only has an icon. */
  hint?: Bind<string>;
  /** The color of the button, according to its action. The default is `'standard'`. */
  tone?: Bind<ButtonTone>;
  /** The state of a toggle. As a function, the item tracks it, and `click` changes the value it reads. */
  pressed?: Bind<boolean>;
  /** `false` dims the item, and it cannot be clicked. The default is `true`. */
  enabled?: Bind<boolean>;
  /** `false` removes the item. The default is `true`. */
  visible?: Bind<boolean>;
  /** The commands of a `menu` item. */
  menu?: Bind<readonly MenuItem[]>;
  /** Controls whether the item can move into the overflow menu. The default is `'auto'`. */
  overflow?: Bind<ToolbarItemOverflow>;
  /**
   * What the button shows: its icon, its text, or both. The default is `'both'`: whatever it is given. The user's
   * choice (`customization`) wins. With the text left out, the text names the button and shows as its tooltip.
   */
  display?: Bind<ToolbarItemDisplay>;
  /** In a toolbar the user can change (`customizable`): `false` keeps the item where it is and shown. The default is `true`. */
  customizable?: Bind<boolean>;
  /** Occurs when the item is clicked, in the bar or in the overflow menu. */
  click?: (e: ToolbarItemClickEventArgs) => void;
  /** A custom application value for the item. */
  data?: unknown;
}
