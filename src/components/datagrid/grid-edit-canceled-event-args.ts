/** Occurs when unsaved changes are discarded. */
export interface GridEditCanceledEventArgs<T> {
  readonly rows: readonly T[];
}
