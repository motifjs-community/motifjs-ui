/** A new row was saved. */
export interface GridRowInsertedEventArgs<T, K = unknown> {
  /** The row, with what the backend gave back. */
  readonly row: T;
  readonly key: K;
}
