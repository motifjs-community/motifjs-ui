/** Occurs when rows have arrived and been laid out (after a load, a filter, a sort, a page change or a resize). */
export interface GridContentReadyEventArgs {
  /** The data rows of the filter, including saved new rows. */
  readonly total: number;
}
