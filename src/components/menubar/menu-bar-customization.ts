import type { MenuBarAddedItem } from './menu-bar-added-item';

/**
 * What the user changed in the bar, to save and give back later. An item of the app is named by its place in the
 * items given, the keys along the way joined with `/` (`file/recent`; a missing key is the position), and keeps that
 * name wherever the user moves it; an item the user added is named by its `id`. The bar is `''`.
 */
export interface MenuBarCustomization {
  /** The items the user hid. */
  hidden?: readonly string[];
  /** The order the user gave, by key: the bar's items under `''`, a menu's items under the name of the menu. */
  order?: Readonly<Record<string, readonly string[]>>;
  /** The items the user moved to another menu: the name of the item, and the name of the menu. */
  moves?: Readonly<Record<string, string>>;
  /** The names the user gave to items. */
  texts?: Readonly<Record<string, string>>;
  /** The commands and menus the user added. */
  added?: readonly MenuBarAddedItem[];
}
