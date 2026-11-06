/** Occurs after the rows per page change (0 means all). The grid returns to the first page. */
export interface GridPageSizeChangedEventArgs {
  readonly pageSize: number;
  readonly previous: number;
}
