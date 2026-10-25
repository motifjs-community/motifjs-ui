import type { GridRowType } from './grid-row-type';

/** A row drawn on the screen now (`getVisibleRows()`). */
export interface GridVisibleRow<T> {
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  /** The row; `undefined` on a group row or while it loads. */
  readonly row: T | undefined;
  /** The row's key; `undefined` on a new row, a group row or while it loads. */
  readonly key: unknown;
  readonly groupKey?: readonly unknown[];
  readonly element: HTMLElement;
}
