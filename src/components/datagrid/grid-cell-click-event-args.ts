import type { EventArgs } from '@motifx/core';
import type { GridRowType } from './grid-row-type';

/**
 * Occurs when a cell is clicked or double-clicked. Set `cancel = true` to prevent the grid's handling
 * (selection, the group toggle and the editor).
 */
export interface GridCellClickEventArgs<T> extends EventArgs {
  readonly field: string;
  /** The row, or `undefined` on a group row or while the row loads. */
  readonly row: T | undefined;
  /** The index of the row in the grid, including new rows. */
  readonly rowIndex: number;
  readonly rowType: GridRowType;
  /** On a group row, the group values from the top level down. */
  readonly groupKey?: readonly unknown[];
  /** The cell element. */
  readonly element: HTMLElement;
  readonly event: MouseEvent;
}
