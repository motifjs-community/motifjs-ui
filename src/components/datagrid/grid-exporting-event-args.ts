import type { EventArgs } from '@motifx/core';
import type { GridExportOptions } from './grid-export-options';

/** An export is about to start (`exportRows`, `exportCsv`, the toolbar's button); change `options`, or `cancel` it. */
export interface GridExportingEventArgs extends EventArgs {
  readonly format: 'rows' | 'csv';
  options: GridExportOptions;
}
