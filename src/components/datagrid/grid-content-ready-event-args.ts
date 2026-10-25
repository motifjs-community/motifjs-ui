/** Rows arrived and are laid out (after a load, a filter, a sort, a page, a resize). */
export interface GridContentReadyEventArgs {
  /** Data rows of the filter, saved new rows included. */
  readonly total: number;
}
