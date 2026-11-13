import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ContextMenuOpeningEventArgs } from './context-menu-opening-event-args';
import type { ContextMenuPresentation } from './context-menu-presentation';
import type { ContextMenuTarget } from './context-menu-target';

/** Props of `ContextMenu`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface ContextMenuProps extends ControlProps {
  /** The accessible name of the menu. This is the same property as `text`. */
  label?: Bind<string>;
  /** The commands. `onOpening` can provide different ones for each element. */
  items?: Bind<readonly MenuItem[]>;
  /** The component the menu belongs to. The default is the component the `ContextMenu` is placed in. */
  target?: Bind<ContextMenuTarget | null | undefined>;
  /** The Menu key and Shift+F10 open the menu at the focused element. The default is `true`. */
  keyboard?: Bind<boolean>;
  /**
   * Scrolling the component the menu opened on out of view closes the menu. Until then, the menu follows it.
   * The default is `true`.
   */
  closeOnScroll?: Bind<boolean>;
  /** Hovering an item opens its submenu. The default is `true`. */
  openOnHover?: Bind<boolean>;
  /**
   * A menu at the pointer, an `ActionSheet` from the bottom, or (`'auto'`) a sheet when a finger opened it, or on a
   * screen with only a coarse pointer when not opened by a key. The default is `'menu'`.
   */
  presentation?: Bind<ContextMenuPresentation>;
  /** Occurs before the menu opens. Set `e.items` for `e.target`, or cancel. */
  onOpening?: (e: ContextMenuOpeningEventArgs) => void;
  /** Occurs when an item is selected, after the item's own `click`. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
  onClosed?: (reason: PopupCloseReason) => void;
}
