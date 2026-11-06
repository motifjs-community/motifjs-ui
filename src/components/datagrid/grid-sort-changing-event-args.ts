import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** Occurs before the sort order changes (a header, the column menu, or programmatically). Set `cancel = true` to keep it. */
export interface GridSortChangingEventArgs extends EventArgs {
  readonly sort: readonly data.SortItem[];
  readonly previous: readonly data.SortItem[];
  /** Indicates that the user changed it. `false` programmatically. */
  readonly byUser: boolean;
}
