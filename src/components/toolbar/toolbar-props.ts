import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ButtonVariant } from '../button/button-variant';
import type { ToolbarItem } from './toolbar-item';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import type { ToolbarOrientation } from './toolbar-orientation';
import type { ToolbarOverflow } from './toolbar-overflow';

/** Props of `Toolbar`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface ToolbarProps extends ControlProps {
  /** Names the toolbar for screen readers. The same property as `text`. */
  label?: Bind<string>;
  /** Items as data, drawn before the JSX children. */
  items?: Bind<readonly ToolbarItem[]>;
  /** Default `'horizontal'`. */
  orientation?: Bind<ToolbarOrientation>;
  /** The size of the controls inside that have none of their own. Not given: `'md'`, and for a button its toolbar button place's (`'md'` in every language today). */
  size?: Bind<ControlSize>;
  /** The variant of the buttons inside that have none of their own. Not given: the design language's (its toolbar button place; `'ghost'` in every language today). */
  buttonVariant?: Bind<ButtonVariant>;
  /** What happens to items that do not fit. Default `'menu'`. */
  overflow?: Bind<ToolbarOverflow>;
  /** An item of `items` was pressed, after its own `click`. */
  onItemClick?: (e: ToolbarItemClickEventArgs) => void;
}
