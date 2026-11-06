/** Occurs when a row's changes are saved. */
export interface GridRowUpdatedEventArgs<T, K = unknown> {
  readonly key: K;
  /** The row, with the saved values. */
  readonly row: T;
  readonly changes: Partial<T>;
}
