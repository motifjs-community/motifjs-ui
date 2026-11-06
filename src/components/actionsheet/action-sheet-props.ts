import type { Bind } from '@motifx/core';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { BottomSheetProps } from '../sheet/bottom-sheet-props';

/** Props of `ActionSheet`: those of `BottomSheet` plus its own. Each prop is also a settable, reactive property. */
export interface ActionSheetProps extends BottomSheetProps {
  /** The commands, as kit menu items with icons, check and radio marks, tones and submenus. Shortcuts are not shown. */
  items?: Bind<readonly MenuItem[]>;
  /** A line below the title that explains the choice. */
  message?: Bind<string>;
  /** Shows a separate Cancel button at the bottom. The default is `true`. */
  showCancel?: Bind<boolean>;
  /** The text of the Cancel button. An empty value uses the `uiLocale` string. The default is `''`. */
  cancelText?: Bind<string>;
  /** Occurs when an item is selected, after the sheet closes and the item's own `click` runs. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
}
