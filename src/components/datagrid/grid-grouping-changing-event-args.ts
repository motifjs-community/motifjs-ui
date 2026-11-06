import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** Occurs before the grouping changes, by the user or programmatically. Set `cancel = true` to keep it. */
export interface GridGroupingChangingEventArgs extends EventArgs {
  /** The grouped columns it changes to, in order. */
  readonly group: readonly data.GroupItem[];
  readonly previous: readonly data.GroupItem[];
  /** Indicates that the user changed it (the group panel, the column menu, a header, a chip). `false` programmatically. */
  readonly byUser: boolean;
}
