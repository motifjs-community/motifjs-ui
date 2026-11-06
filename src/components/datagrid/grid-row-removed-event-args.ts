/** Occurs when a row is deleted on the backend. */
export interface GridRowRemovedEventArgs<T, K = unknown> {
  readonly key: K;
  readonly row: T;
}
