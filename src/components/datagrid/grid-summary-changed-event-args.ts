/** The summary values were worked out again. */
export interface GridSummaryChangedEventArgs {
  /** The values of `summary.totalItems`, in order. */
  readonly total: readonly unknown[];
  /** The values follow unsaved changes (`recalculateWhileEditing`) rather than new data. */
  readonly editing: boolean;
}
