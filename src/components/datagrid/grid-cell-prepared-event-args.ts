/**
 * Occurs when a cell is rendered for a row, so that you can style or extend it. The element is reused
 * for other rows while scrolling, so always set and clear what you change (`classList.toggle`,
 * `dataset`).
 */
export interface GridCellPreparedEventArgs<T> {
  readonly field: string;
  readonly row: T;
  readonly rowIndex: number;
  /** The displayed value, which is the unsaved value when there is one. */
  readonly value: unknown;
  readonly isNew: boolean;
  readonly element: HTMLElement;
}
