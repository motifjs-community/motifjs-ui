/** Occurs when the summary values are recalculated. */
export interface GridSummaryChangedEventArgs {
  /** The values of `summary.totalItems`, in order. */
  readonly total: readonly unknown[];
  /** Indicates that the values reflect unsaved changes (`recalculateWhileEditing`) rather than new data. */
  readonly editing: boolean;
}
