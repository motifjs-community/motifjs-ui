import type { DataGrid } from './DataGrid';

/** What `masterDetail.template` gets for a row. */
export interface DetailContext<T> {
  /** The row itself; read again in getters when the row shows another object (a refresh that loads it again), and on `grid.repaint()`. */
  readonly row: T;
  /** The row's key. */
  readonly key: unknown;
  /** The row's grid index now; reactive. */
  readonly rowIndex: number;
  readonly grid: DataGrid<T>;
  /** Closes the details, as the user would (`onRowCollapsing` can keep them open). Returns whether they closed. */
  collapse(): boolean;
}
