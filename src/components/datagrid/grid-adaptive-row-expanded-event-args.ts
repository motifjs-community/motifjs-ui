/** Occurs after a row's adaptive detail opens or closes, by the user or programmatically. */
export interface GridAdaptiveRowExpandedEventArgs<T> {
  readonly row: T;
  /** The row's key, or `undefined` for a new row. */
  readonly key: unknown;
  readonly rowIndex: number;
}
