import type { GridSheetColumn } from './grid-sheet-column';
import type { GridSheetMerge } from './grid-sheet-merge';
import type { GridSheetRow } from './grid-sheet-row';

/**
 * An export laid out as rows of cells, for a writer to put in a file: the header rows (a row per
 * level of bands, then the columns' titles), the group rows, the data rows, the group footers and
 * the totals, in the grid's order. `exportDataGrid`
 * (`@motifx-community/ui/excel`) writes one to an ExcelJS worksheet; `grid.exportSheet()` hands it
 * to a writer of your own.
 */
export interface GridSheet<T = any> {
  readonly columns: readonly GridSheetColumn<T>[];
  readonly rows: readonly GridSheetRow<T>[];
  /** Header rows at the start: one per level of bands and one for the titles, or 0 with `headers: false`. */
  readonly headerRows: number;
  /** Cells that make one in the header: a band's title over its columns, a column's title down the band rows above it. A writer merges them. */
  readonly merges: readonly GridSheetMerge[];
  /** Grouping levels; data rows have this outline level. */
  readonly groupLevels: number;
  /** The locale the grid formats with. */
  readonly locale: string;
  /** The grid lays out right to left. */
  readonly rtl: boolean;
}
