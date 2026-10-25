import type { DataGrid } from '../DataGrid';

/** What the toolbar asks the grid; the grid owns its data, menus and focus. */
export interface ToolbarHost {
  grid: DataGrid<any>;
  /** Whether there is something to export (an exportable visible column). */
  canExport(): boolean;
  /** Opens the list of columns under `anchor`. */
  openColumns(anchor: HTMLElement): void;
  /** Whether the list of columns has a column to show or hide. */
  hasColumns(): boolean;
}
