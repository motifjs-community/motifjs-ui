/** Occurs when the active cell moves. */
export interface GridFocusedCellChangedEventArgs<T> {
  readonly rowIndex: number;
  readonly field: string;
  readonly row: T | undefined;
}
