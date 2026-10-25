import type { EventArgs } from '@motifx/core';
import type { DataGrid } from './DataGrid';
import type { GridExportOptions } from './grid-export-options';

/**
 * An export is about to start (`exportRows`, `exportCsv`, `exportTo`, the toolbar's export button);
 * change `options`, or `cancel` it. For a format the grid does not write itself (`'xlsx'`), this is
 * where you write it: `exportDataGrid({ component: e.component, worksheet, selectedRowsOnly: e.selectedRowsOnly })`.
 */
export interface GridExportingEventArgs extends EventArgs {
  /** `'rows'`, `'csv'`, or the format the toolbar or `exportTo` asks for (`'xlsx'`, `'pdf'`…). */
  readonly format: 'rows' | 'csv' | 'xlsx' | (string & {});
  /** The grid. */
  readonly component: DataGrid<any>;
  /** Only the selected rows ("Export selected rows"). */
  readonly selectedRowsOnly: boolean;
  options: GridExportOptions;
}
