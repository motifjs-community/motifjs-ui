import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** Occurs before the view changes. Set `cancel = true` to keep the current view. */
export interface ViewChangingEventArgs<T = unknown> extends EventArgs {
  from: string;
  to: string;
  byUser: boolean;
  source: Scheduler<T>;
}
