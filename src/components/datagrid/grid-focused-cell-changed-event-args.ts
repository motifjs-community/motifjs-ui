/** The active cell moved. */
export interface GridFocusedCellChangedEventArgs<T> {
  readonly rowIndex: number;
  readonly field: string;
  readonly row: T | undefined;
}
