import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ContextMenuOpeningEventArgs } from './context-menu-opening-event-args';
import type { ContextMenuTarget } from './context-menu-target';

/** Props of `ContextMenu`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface ContextMenuProps extends ControlProps {
  /** Names the menu for screen readers. The same property as `text`. */
  label?: Bind<string>;
  /** The menu's commands; `onOpening` can give others for each element. */
  items?: Bind<readonly MenuItem[]>;
  /** The element or component whose menu it is. Default: the element the `ContextMenu` is placed in. */
  target?: Bind<ContextMenuTarget | null | undefined>;
  /** The Menu key and Shift+F10 open the menu at the focused element. Default `true`. */
  keyboard?: Bind<boolean>;
  /** Scrolling that takes the element the menu opened on out of sight closes the menu (until then it goes along). Default `true`. */
  closeOnScroll?: Bind<boolean>;
  /** Pointing at an item opens its submenu. Default `true`. */
  openOnHover?: Bind<boolean>;
  /** The menu is about to open; set `e.items` for `e.target`, or cancel. */
  onOpening?: (e: ContextMenuOpeningEventArgs) => void;
  /** An item was chosen, after the item's own `click`. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
