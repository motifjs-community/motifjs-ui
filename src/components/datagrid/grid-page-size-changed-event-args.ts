/** The rows per page changed (0: every row on one page); the grid is back on the first page. */
export interface GridPageSizeChangedEventArgs {
  readonly pageSize: number;
  readonly previous: number;
}
