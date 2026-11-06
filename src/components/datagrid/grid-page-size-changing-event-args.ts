import type { EventArgs } from '@motifx/core';

/** Occurs before the rows per page change (0 means all). Set `cancel = true` to keep the current value. */
export interface GridPageSizeChangingEventArgs extends EventArgs {
  readonly pageSize: number;
  readonly previous: number;
}
