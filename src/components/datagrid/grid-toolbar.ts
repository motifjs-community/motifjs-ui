import type { Bind } from '@motifx/core';
import type { GridToolbarItem } from './grid-toolbar-item';
import type { GridToolbarItemName } from './grid-toolbar-item-name';

/**
 * The bar above the rows. Without `items` it holds the grid's own items whose features are on, in
 * this order: the group panel (at the start), "New row", "Save changes", "Discard", "Export", the
 * column list, the search box. With
 * `items` it holds exactly those, in that order; one of the grid's items whose feature is off stays
 * out. Read and change it later through `grid.toolbar`.
 */
export interface GridToolbar {
  /** `true` always shows the bar, `false` never; omitted, it shows while it has an item. */
  visible?: Bind<boolean | undefined>;
  items?: Bind<readonly (GridToolbarItem | GridToolbarItemName)[] | undefined>;
}
