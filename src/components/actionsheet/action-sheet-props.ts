import type { Bind } from '@motifx/core';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { BottomSheetProps } from '../sheet/bottom-sheet-props';

/** Props of `ActionSheet`: those of `BottomSheet` plus its own. Each one is also a settable, reactive property. */
export interface ActionSheetProps extends BottomSheetProps {
  /** The commands: the kit's menu items (icons, check and radio marks, tones, submenus, shortcuts are not shown). */
  items?: Bind<readonly MenuItem[]>;
  /** A line under the title that says what the choice is about. */
  message?: Bind<string>;
  /** A cancel button apart, at the bottom. Default `true`. */
  showCancel?: Bind<boolean>;
  /** Its text; empty for `uiLocale`'s. Default `''`. */
  cancelText?: Bind<string>;
  /** An item was chosen, after the sheet closed and the item's own `click` ran. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
}
