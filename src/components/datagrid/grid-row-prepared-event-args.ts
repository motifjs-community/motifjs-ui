import type { GridRowType } from './grid-row-type';

/**
 * Occurs when a row is rendered, so that you can style or extend it. The element is reused for other
 * rows while scrolling, so always set and clear what you change.
 */
export interface GridRowPreparedEventArgs<T> {
  /** The row, or `undefined` on a group row. */
  readonly row: T | undefined;
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  readonly groupKey?: readonly unknown[];
  readonly isSelected: boolean;
  readonly element: HTMLElement;
}
