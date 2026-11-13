import type { LayoutCustomization } from './layout-customization';
import type { LayoutNode } from './layout-node';

/** What an `ItemLayout` works on. */
export interface ItemLayoutOptions<I extends object, C extends LayoutCustomization> {
  /** The items given. */
  items: () => readonly I[];
  /** The commands the user can add, each with a `key`. */
  commands: () => readonly I[];
  /** What the user changed so far. */
  custom: () => C;
  /** The field of an item that holds its own items (a menu's `items`), or `null` for a flat list. */
  childrenField: string | null;
  /** Makes a separator the user added; without it, separators cannot be added. */
  separator?: (id: string) => I;
  /** Further changes to an item as it is drawn, from the owner's own part of the customization; `null` for none. */
  dressed?: (node: LayoutNode<I>) => Partial<I> | null;
}
