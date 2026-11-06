import type { EventArgs } from '@motifx/core';
import type { DataGrid } from './DataGrid';
import type { GridExportOptions } from './grid-export-options';

/**
 * Occurs before an export starts (`exportRows`, `exportCsv`, `exportTo`, the toolbar's export button).
 * Change `options`, or set `cancel = true`. For a format the grid does not write (`'xlsx'`), write it
 * here: `exportDataGrid({ component: e.component, worksheet, selectedRowsOnly: e.selectedRowsOnly })`.
 */
export interface GridExportingEventArgs extends EventArgs {
  /** `'rows'`, `'csv'`, or the format requested by the toolbar or `exportTo` (`'xlsx'`, `'pdf'`…). */
  readonly format: 'rows' | 'csv' | 'xlsx' | (string & {});
  /** The grid. */
  readonly component: DataGrid<any>;
  /** Indicates that only the selected rows are exported ("Export selected rows"). */
  readonly selectedRowsOnly: boolean;
  options: GridExportOptions;
}
