import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ButtonVariant } from '../button/button-variant';
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
  /** Occurs when an item in `items` is clicked, after its own `click`. */
  onItemClick?: (e: ToolbarItemClickEventArgs) => void;
}
