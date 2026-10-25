import type { EventArgs } from '@motifx/core';
import type { data } from '@motifx-community/data';

/** The grouping is about to change (by the user or from code); `cancel` keeps it as it is. */
export interface GridGroupingChangingEventArgs extends EventArgs {
  /** The grouped columns it changes to, in order. */
  readonly group: readonly data.GroupItem[];
  readonly previous: readonly data.GroupItem[];
  /** The user changed it (the group panel, the column menu, a header, a chip); `false` from code. */
  readonly byUser: boolean;
}
