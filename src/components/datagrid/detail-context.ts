import type { DataGrid } from './DataGrid';

/** The context `masterDetail.template` receives for a row. */
export interface DetailContext<T> {
  /**
   * The row itself, re-read in getters when the row displays another object (a refresh that reloads
   * it) and on `grid.repaint()`.
   */
  readonly row: T;
  /** The row's key. */
  readonly key: unknown;
  /** The row's current grid index. Reactive. */
  readonly rowIndex: number;
  readonly grid: DataGrid<T>;
  /** Closes the details, as the user would (`onRowCollapsing` can keep them open). Returns whether they closed. */
  collapse(): boolean;
}
