import type { GridRowType } from './grid-row-type';

/**
 * A row was drawn: style it or add to it. The element is reused for other rows while the user scrolls,
 * so set and clear what you change, every time.
 */
export interface GridRowPreparedEventArgs<T> {
  /** The row; `undefined` on a group row. */
  readonly row: T | undefined;
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  readonly groupKey?: readonly unknown[];
  readonly isSelected: boolean;
  readonly element: HTMLElement;
}
