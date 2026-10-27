import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** Another view is about to show; `cancel = true` keeps this one. */
export interface ViewChangingEventArgs<T = unknown> extends EventArgs {
  from: string;
  to: string;
  byUser: boolean;
  source: Scheduler<T>;
}
