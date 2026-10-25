import type { data } from '@motifx-community/data';

/** The sort order changed. */
export interface GridSortChangedEventArgs {
  readonly sort: readonly data.SortItem[];
  readonly previous: readonly data.SortItem[];
  readonly byUser: boolean;
}
