import type { data } from '@motifx-community/data';

/** Occurs when the sort order changes. */
export interface GridSortChangedEventArgs {
  readonly sort: readonly data.SortItem[];
  readonly previous: readonly data.SortItem[];
  readonly byUser: boolean;
}
