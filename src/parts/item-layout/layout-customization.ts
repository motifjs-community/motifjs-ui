import type { LayoutAddedItem } from './layout-added-item';

/**
 * What the user changed in the items of a component, as `ItemLayout` reads and writes it. An item of the app is named by
 * its place in the items given, the keys along the way joined with `/`; an item the user added by its `id`; the top is
 * `''`. A component's own customization type has these fields, and may have more of its own.
 */
export interface LayoutCustomization {
  hidden?: readonly string[];
  order?: Readonly<Record<string, readonly string[]>>;
  moves?: Readonly<Record<string, string>>;
  texts?: Readonly<Record<string, string>>;
  added?: readonly LayoutAddedItem[];
}
