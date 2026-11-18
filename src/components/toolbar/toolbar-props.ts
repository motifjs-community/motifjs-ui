import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ButtonVariant } from '../button/button-variant';
import type { ToolbarCustomMenuOpeningEventArgs } from './toolbar-custom-menu-opening-event-args';
import type { ToolbarCustomization } from './toolbar-customization';
import type { ToolbarCustomizedEventArgs } from './toolbar-customized-event-args';
import type { ToolbarItem } from './toolbar-item';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import type { ToolbarOrientation } from './toolbar-orientation';
import type { ToolbarOverflow } from './toolbar-overflow';

/** Props of `Toolbar`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface ToolbarProps extends ControlProps {
  /** The accessible name of the toolbar. This is the same property as `text`. */
  label?: Bind<string>;
  /** Items defined as data, drawn before the JSX children. */
  items?: Bind<readonly ToolbarItem[]>;
  /** The default is `'horizontal'`. */
  orientation?: Bind<ToolbarOrientation>;
  /**
   * Applied to child controls that do not set their own `size`. If omitted, this is `'md'`, and for a button the size
   * of its toolbar button place (`'md'` in every design language today).
   */
  size?: Bind<ControlSize>;
  /**
   * Applied to child buttons that do not set their own `variant`. If omitted, this comes from the design language (its
   * toolbar button place, `'ghost'` in every design language today).
   */
  buttonVariant?: Bind<ButtonVariant>;
  /** How items that do not fit are handled. The default is `'menu'`. */
  overflow?: Bind<ToolbarOverflow>;
  /**
   * The user can hide, move and rename the items of `items`, add commands and separators, and choose what a button
   * shows, from the menu of the right button or the menu key (Shift+F10) and in the customizer. Each item can say
   * otherwise (`customizable`); JSX children stay as they are. The default is `false`.
   */
  customizable?: Bind<boolean>;
  /** What the user changed, as `onCustomized` reported it, to give back. */
  customization?: Bind<ToolbarCustomization | null>;
  /** Commands the user can add, each with a `key`. Without it, the app's commands (`commands`) that have a text. */
  commands?: Bind<readonly ToolbarItem[]>;
  /** The menu of the right button offers the customizer when `customizable` is on. The default is `true`. */
  customizer?: Bind<boolean>;
  /** The customizer has a keyboard page (`ShortcutEditor`), to give the app's shortcuts other keys. The default is `true`. */
  customizerKeyboard?: Bind<boolean>;
  /**
   * A customizable toolbar takes commands sent from the menus of the page: the menu of the right button on a menu bar
   * item that names a command offers to add it here. The default is `true`.
   */
  acceptCommands?: Bind<boolean>;
  /** Occurs when an item in `items` is clicked, after its own `click`. */
  onItemClick?: (e: ToolbarItemClickEventArgs) => void;
  /** Occurs when the user changed the toolbar, with everything changed so far, to save. */
  onCustomized?: (e: ToolbarCustomizedEventArgs) => void;
  /** Occurs before the menu of the right button opens, to add commands of your own or leave some out. */
  onCustomMenuOpening?: (e: ToolbarCustomMenuOpeningEventArgs) => void;
}
