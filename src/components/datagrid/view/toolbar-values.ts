import type { GridToolbarItem } from '../grid-toolbar-item';
import type { GridToolbarItemName } from '../grid-toolbar-item-name';

/** The toolbar's options as the grid reads them: values, not functions. */
export interface ToolbarValues {
  visible: boolean | undefined;
  items: readonly (GridToolbarItem | GridToolbarItemName)[] | undefined;
}
