import type { EventArgs } from '@motifx/core';

/** Another page is about to show (paged mode, 0-based); `cancel` stays on this one. */
export interface GridPageChangingEventArgs extends EventArgs {
  readonly page: number;
  readonly previous: number;
}
