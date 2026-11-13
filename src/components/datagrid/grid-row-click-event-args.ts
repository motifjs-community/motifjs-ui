import type { ComponentBase, EventArgs } from '@motifx/core';
import type { GridRowType } from './grid-row-type';

/**
 * Occurs when a row is clicked or double-clicked, after its cell's event. Set `cancel = true` to prevent
 * the grid's handling.
 */
export interface GridRowClickEventArgs<T> extends EventArgs {
  /** The row, or `undefined` on a group row or while the row loads. */
  readonly row: T | undefined;
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  readonly groupKey?: readonly unknown[];
  /** The row's part. */
  readonly part: ComponentBase;
  readonly event: MouseEvent;
}
