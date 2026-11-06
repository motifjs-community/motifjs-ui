import type { GridColumn } from './grid-column';

/** The context a column's `headerCell` content receives. Read its fields inside getters. */
export interface HeaderCellContext<T> {
  readonly column: GridColumn<T>;
  /** The current value of `title`. */
  readonly title: string;
  /** The column's current sort order, or `null` when it is not sorted. */
  readonly sort: 'asc' | 'desc' | null;
}
