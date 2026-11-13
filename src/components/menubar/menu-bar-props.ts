import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { MenuBarItemsChangedEventArgs } from './menu-bar-items-changed-event-args';
import type { MenuBarMergeWhen } from './menu-bar-merge-when';
import type { MenuBarMergedEventArgs } from './menu-bar-merged-event-args';
import type { MenuBar } from './MenuBar';
import type { MenuBarCustomization } from './menu-bar-customization';
import type { MenuBarCustomizedEventArgs } from './menu-bar-customized-event-args';
import type { MenuBarCustomMenuOpeningEventArgs } from './menu-bar-custom-menu-opening-event-args';

/** Props of `MenuBar`, in addition to the shared `ControlProps`. Each prop is also a settable, reactive property. */
export interface MenuBarProps extends ControlProps {
  /** The accessible name of the bar. This is the same property as `text`. */
  label?: Bind<string>;
  /** The top-level items, whose `items` define the menus they open. `&File` makes Alt+F open File. */
  items?: Bind<readonly MenuItem[]>;
  /** F10 moves focus to the bar from anywhere on the page. The default is `false` because browsers use F10. */
  focusOnF10?: Bind<boolean>;
  /**
   * While a menu is open, hovering another top-level item opens its menu, and hovering an item opens its submenu.
   * The default is `true`.
   */
  openOnHover?: Bind<boolean>;
  /**
   * The user can hide and move the items from the menu of the right button or the menu key (Shift+F10). Each item can
   * say otherwise (`customizable`). The default is `false`.
   */
  customizable?: Bind<boolean>;
  /** What the user changed, as `onCustomized` reported it, to give back. */
  customization?: Bind<MenuBarCustomization | null>;
  /** Commands the user can add in the customizer, each with a `key`. Without it, the app's commands (`commands`). */
  commands?: Bind<readonly MenuItem[]>;
  /** The customizer has a keyboard page (`ShortcutEditor`), to give the app's shortcuts other keys. The default is `true`. */
  customizerKeyboard?: Bind<boolean>;
  /** The menu of the right button offers the customizer when `customizable` is on. The default is `true`. */
  customizer?: Bind<boolean>;
  /** The main bar of the page: other bars merge their items into it (`mergeInto`). The default is `false`. */
  mergeHost?: Bind<boolean>;
  /** The name of the main bar, when there are several. The default is `'main'`. */
  mergeName?: Bind<string>;
  /** The main bar to merge into: its name or the bar itself. Merged, this bar's items are shown there. */
  mergeInto?: Bind<string | MenuBar | null>;
  /** When the bar merges. The default is `'shown'`. */
  mergeWhen?: Bind<MenuBarMergeWhen>;
  /** The place whose being shown or focused merges the bar. The default is the component the bar is in. */
  mergeScope?: Bind<ComponentBase | null>;
  /** The bar is hidden while it is merged. The default is `true`. */
  hideWhenMerged?: Bind<boolean>;
  /** On the main bar: occurs when a bar merged into it. */
  onMerged?: (e: MenuBarMergedEventArgs) => void;
  /** On the main bar: occurs when a bar left it. */
  onUnmerged?: (e: MenuBarMergedEventArgs) => void;
  /** Occurs when an item is selected, after the item's own `click`. */
  onItemClick?: (e: MenuItemClickEventArgs) => void;
  /** Occurs when the user changed the bar, with everything changed so far, to save. */
  onCustomized?: (e: MenuBarCustomizedEventArgs) => void;
  /** Occurs before the menu of the right button opens, to add commands of your own or leave some out. */
  onCustomMenuOpening?: (e: MenuBarCustomMenuOpeningEventArgs) => void;
  /** Occurs after a change by path (`addItem`, `removeItem`, `moveItem`, `updateItem`), with the new list to keep. */
  onItemsChanged?: (e: MenuBarItemsChangedEventArgs) => void;
}
