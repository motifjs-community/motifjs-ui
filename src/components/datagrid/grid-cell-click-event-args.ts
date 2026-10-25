import type { EventArgs } from '@motifx/core';
import type { GridRowType } from './grid-row-type';

/** A cell was clicked (or double-clicked); `cancel` stops what the grid does with it (select, open or close a group, edit). */
export interface GridCellClickEventArgs<T> extends EventArgs {
  readonly field: string;
  /** The row; `undefined` on a group row or while the row loads. */
  readonly row: T | undefined;
  /** Index of the row in the grid (new rows included). */
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  /** On a group row: the values of its groups from the top level down. */
  readonly groupKey?: readonly unknown[];
  /** The cell element. */
  readonly element: HTMLElement;
  readonly event: MouseEvent;
}
