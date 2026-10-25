import type { EventArgs } from '@motifx/core';
import type { GridRowType } from './grid-row-type';

/** A row was clicked (or double-clicked), after its cell's event; `cancel` stops what the grid does with it. */
export interface GridRowClickEventArgs<T> extends EventArgs {
  /** The row; `undefined` on a group row or while the row loads. */
  readonly row: T | undefined;
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  readonly groupKey?: readonly unknown[];
  /** The row element. */
  readonly element: HTMLElement;
  readonly event: MouseEvent;
}
