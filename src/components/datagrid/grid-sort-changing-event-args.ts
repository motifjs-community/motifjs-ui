import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** The sort order is about to change (a header, the column menu, code); `cancel` keeps it. */
export interface GridSortChangingEventArgs extends EventArgs {
  readonly sort: readonly data.SortItem[];
  readonly previous: readonly data.SortItem[];
  /** The user changed it; `false` from code. */
  readonly byUser: boolean;
}
