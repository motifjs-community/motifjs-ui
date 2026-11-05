/** A row's adaptive detail opened or closed, by the user or programmatically. */
export interface GridAdaptiveRowExpandedEventArgs<T> {
  readonly row: T;
  /** The row's key; `undefined` for a new row. */
  readonly key: unknown;
  readonly rowIndex: number;
}
