/** The cell whose editor is open. */
export interface GridEditingCell<T> {
  readonly rowIndex: number;
  readonly field: string;
  readonly row: T;
}
