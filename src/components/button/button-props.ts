import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { ButtonSize } from './button-size';
import type { ButtonTone } from './button-tone';
import type { ButtonVariant } from './button-variant';

/**
 * Props of `Button`: the shared `ControlProps` plus its own. Each one is also a settable, reactive
 * property. `split`, `menu` and `dropDown` give the button a menu; one of them must be there when
 * the button is created, because a button with a menu is built of two parts.
 */
export interface ButtonProps extends ControlProps {
  /** Default `'solid'`. */
  variant?: Bind<ButtonVariant>;
  /** Default `'standard'`. */
  tone?: Bind<ButtonTone>;
  /** Default `'md'`. */
  size?: Bind<ButtonSize>;
  icon?: Bind<IconSource | null | undefined>;
  /** Default `'start'`; `'end'` puts the icon after the text. */
  iconPosition?: Bind<'start' | 'end'>;
  /** Fills the width of what it sits in. */
  stretch?: Bind<boolean>;
  /** The native type. Default `'button'`, so a button in a form never submits by accident. */
  type?: Bind<'button' | 'submit' | 'reset'>;
  /** Shown as a tooltip. */
  hint?: Bind<string>;
  /** A toggle button: a click turns `pressed` on and off; `x-model` binds it two-way. */
  toggle?: Bind<boolean>;
  pressed?: Bind<boolean>;
  /** Work is running: a spinner shows, presses are ignored, the size stays. */
  busy?: Bind<boolean>;
  /** Disabled, it can still take focus, so a screen reader finds it and reads it as dimmed. */
  focusableWhenDisabled?: Bind<boolean>;
  /** Two parts: the button does its own action, the arrow next to it opens the menu. Without it the whole button opens the menu. */
  split?: Bind<boolean>;
  /** The menu's commands. */
  menu?: Bind<readonly MenuItem[]>;
  /** Any content to open instead of a menu (a picker, a small form). */
  dropDown?: Bind<ComponentBase | null | undefined>;
  /** A menu item was chosen, after the item's own `click`. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
}
