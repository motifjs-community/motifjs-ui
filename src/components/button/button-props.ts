import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { ButtonSize } from './button-size';
import type { ButtonTone } from './button-tone';
import type { ButtonVariant } from './button-variant';

/**
 * Props of `Button`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive
 * property. `split`, `menu` and `dropDown` give the button a menu. One of them must be set when the
 * button is created, because a button with a menu has two parts.
 */
export interface ButtonProps extends ControlProps {
  /** The default is `'solid'`. */
  variant?: Bind<ButtonVariant>;
  /** The default is `'standard'`. */
  tone?: Bind<ButtonTone>;
  /** The default is `'md'`. */
  size?: Bind<ButtonSize>;
  /** An image address or a component. Given as a function, the "more" menu of a toolbar calls it again for its own copy. */
  icon?: Bind<IconSource | null | undefined>;
  /** Places the icon before or after the text. The default is `'start'`, and `'end'` puts it after the text. */
  iconPosition?: Bind<'start' | 'end'>;
  /** Stretches to the full width of its container. */
  stretch?: Bind<boolean>;
  /** The native type. The default is `'button'`, so a button in a form never submits by accident. */
  type?: Bind<'button' | 'submit' | 'reset'>;
  /** The tooltip text. */
  hint?: Bind<string>;
  /** Makes it a toggle button. A click turns `pressed` on and off, and `x-model` provides two-way binding. */
  toggle?: Bind<boolean>;
  pressed?: Bind<boolean>;
  /** Indicates that work is in progress. A spinner appears, clicks are ignored and the size is preserved. */
  busy?: Bind<boolean>;
  /** When disabled, the button can still receive focus, so a screen reader can find it and announce it as dimmed. */
  focusableWhenDisabled?: Bind<boolean>;
  /**
   * With a menu, the button keeps its own action and an arrow next to it opens the menu. Without it, the whole button
   * opens the menu.
   */
  split?: Bind<boolean>;
  /** The menu commands. */
  menu?: Bind<readonly MenuItem[]>;
  /** Any content to open instead of a menu, such as a picker or a small form. */
  dropDown?: Bind<ComponentBase | null | undefined>;
  /** Occurs when a menu item is selected, after the item's own `click`. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
}
