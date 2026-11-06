import type { GridToolbarItem } from './grid-toolbar-item';
import type { GridToolbarItemName } from './grid-toolbar-item-name';

/**
 * The toolbar is laid out (when the grid is created and whenever what it shows changes). `items` are
 * the items it takes, as `toolbar.items` would list them: change the list to change the bar.
 */
export interface GridToolbarPreparingEventArgs {
  items: (GridToolbarItem | GridToolbarItemName)[];
}
