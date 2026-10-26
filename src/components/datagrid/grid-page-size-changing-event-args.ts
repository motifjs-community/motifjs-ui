import type { EventArgs } from '@motifx/core';

/** The rows per page are about to change (0: every row on one page); `cancel` keeps them. */
export interface GridPageSizeChangingEventArgs extends EventArgs {
  readonly pageSize: number;
  readonly previous: number;
}
