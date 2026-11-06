/** Occurs when a new row is saved. */
export interface GridRowInsertedEventArgs<T, K = unknown> {
  /** The row, with the values the backend returned. */
  readonly row: T;
  readonly key: K;
}
