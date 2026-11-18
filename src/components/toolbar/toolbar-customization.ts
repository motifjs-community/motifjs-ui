import type { ToolbarAddedItem } from './toolbar-added-item';
import type { ToolbarItemDisplay } from './toolbar-item-display';

/**
 * What the user changed in a toolbar, to save and give back later. An item of the app is named by its `key` (else its
 * position in `items`), an item the user added by its `id`.
 */
export interface ToolbarCustomization {
  /** The items the user hid. */
  hidden?: readonly string[];
  /** The order the user gave, by key, under `''`. */
  order?: Readonly<Record<string, readonly string[]>>;
  /** The names the user gave to items. */
  texts?: Readonly<Record<string, string>>;
  /** The commands and separators the user added. */
  added?: readonly ToolbarAddedItem[];
  /** What the user chose a button shows. */
  display?: Readonly<Record<string, ToolbarItemDisplay>>;
}
