import type { GridColumn } from './grid-column';

/**
 * The context a custom cell receives. The grid reuses the cell for other rows while scrolling, so
 * read `row` and `value` inside getters (`{() => ctx.row?.name}`).
 */
export interface CellContext<T> {
  /** The row currently displayed in this cell, or `undefined` while it is loading. */
  readonly row: T | undefined;
  /** The value to display: the unsaved edit when there is one, otherwise the row's value. */
  readonly value: unknown;
  /** The index of the row in the grid, including new rows. */
  readonly index: number;
  readonly column: GridColumn<T>;
}
