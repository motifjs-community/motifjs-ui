import type { Bind } from '@motifx/core';
import type { GridToolbarItem } from './grid-toolbar-item';
import type { GridToolbarItemName } from './grid-toolbar-item-name';

/**
 * The bar above the rows. Without `items`, it holds the built-in items whose features are enabled, in
 * this order: the group panel (at the start), "New row", "Save changes", "Discard", "Export", the
 * column list and the search box. With `items`, it holds exactly those, in that order, and a built-in
 * item whose feature is disabled is omitted. Read and change it later through `grid.toolbar`.
 */
export interface GridToolbar {
  /** `true` always shows the bar, and `false` never does. When omitted, the bar appears while it has an item. */
  visible?: Bind<boolean | undefined>;
  items?: Bind<readonly (GridToolbarItem | GridToolbarItemName)[] | undefined>;
}
