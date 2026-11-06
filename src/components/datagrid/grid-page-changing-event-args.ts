import type { EventArgs } from '@motifx/core';

/** Occurs before another page appears (paged mode, 0-based). Set `cancel = true` to stay on the current page. */
export interface GridPageChangingEventArgs extends EventArgs {
  readonly page: number;
  readonly previous: number;
}
