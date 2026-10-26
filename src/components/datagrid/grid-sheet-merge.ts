/** Cells of a `GridSheet` that make one: a band's header over its columns, a column's header down the band rows. */
export interface GridSheetMerge {
  /** The first row, an index into `rows`. */
  readonly row: number;
  /** The first column, an index into `columns`. */
  readonly column: number;
  readonly rows: number;
  readonly columns: number;
}
