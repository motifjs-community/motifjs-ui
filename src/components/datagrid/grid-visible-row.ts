import type { ComponentBase } from '@motifx/core';
import type { GridRowType } from './grid-row-type';

/** A currently rendered row (`getVisibleRows()`). */
export interface GridVisibleRow<T> {
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  /** The row, or `undefined` on a group row or while it loads. */
  readonly row: T | undefined;
  /** The row's key, or `undefined` on a new row, a group row or while it loads. */
  readonly key: unknown;
  readonly groupKey?: readonly unknown[];
  /** The row's part. */
  readonly part: ComponentBase;
}
