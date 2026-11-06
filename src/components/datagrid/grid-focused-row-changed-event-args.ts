/** Occurs when the active row changes. */
export interface GridFocusedRowChangedEventArgs<T> {
  readonly rowIndex: number;
  readonly row: T | undefined;
  /** The row's key, or `undefined` for a new row, a group row or the header. */
  readonly key: unknown;
}
