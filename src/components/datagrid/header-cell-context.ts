import type { GridColumn } from './grid-column';

/** What a column's `headerCell` content gets: read its fields inside getters. */
export interface HeaderCellContext<T> {
  readonly column: GridColumn<T>;
  /** The title, as `title` gives it now. */
  readonly title: string;
  /** The column's sort order now; `null` when it is not sorted. */
  readonly sort: 'asc' | 'desc' | null;
}
