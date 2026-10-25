import type { DataGrid } from './DataGrid';
import type { GridToolbarItem } from './grid-toolbar-item';

/** What a toolbar item's `click` receives. */
export interface GridToolbarItemClickEventArgs {
  item: GridToolbarItem;
  /** The grid the toolbar belongs to. */
  grid: DataGrid<any>;
  event: Event;
}
