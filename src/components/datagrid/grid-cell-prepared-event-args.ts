/**
 * A cell was drawn for a row: style it or add to it. The element is reused for other rows while the
 * user scrolls, so set and clear what you change (`classList.toggle`, `dataset`), every time.
 */
export interface GridCellPreparedEventArgs<T> {
  readonly field: string;
  readonly row: T;
  readonly rowIndex: number;
  /** The value shown: the unsaved one when there is one. */
  readonly value: unknown;
  readonly isNew: boolean;
  readonly element: HTMLElement;
}
