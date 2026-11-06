import type { GridToolbarItem } from './grid-toolbar-item';
import type { GridToolbarItemName } from './grid-toolbar-item-name';

/**
 * Occurs when the toolbar is laid out (when the grid is created and whenever its content changes).
 * `items` holds the items it uses, as `toolbar.items` would list them. Change the list to change the bar.
 */
export interface GridToolbarPreparingEventArgs {
  items: (GridToolbarItem | GridToolbarItemName)[];
}
