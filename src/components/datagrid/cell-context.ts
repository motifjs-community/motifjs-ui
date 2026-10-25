import type { GridColumn } from './grid-column';

/**
 * What a custom cell receives. The grid reuses the cell for other rows while it scrolls, so read
 * `row` and `value` inside getters (`{() => ctx.row?.name}`).
 */
export interface CellContext<T> {
  /** The row shown in this cell right now; `undefined` while it is loading. */
  readonly row: T | undefined;
  /** The value to show: the unsaved edit when there is one, else the row's value. */
  readonly value: unknown;
  /** Index of the row in the grid (new rows included). */
  readonly index: number;
  readonly column: GridColumn<T>;
}
