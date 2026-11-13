import type { data } from '@motifx-community/data';

/** How the grid's rows in memory are read for sorting, and what is waited for before they are sorted. */
export interface RowsSorting<T> {
  /** The reader of a column for sorting; `undefined` reads the field. */
  sortValue: (field: string) => ((row: T) => unknown) | undefined;
  /** How a column's values compare when the column gives no `compare` of its own; `undefined` by type. */
  compare?: (field: string) => ((a: unknown, b: unknown) => number) | undefined;
  beforeSort: (sort: readonly data.SortItem[], rows: readonly T[]) => Promise<void>;
}
