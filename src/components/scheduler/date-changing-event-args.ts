import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** The scheduler is about to show another date (today, next, previous, a date chosen); `cancel = true` stays. */
export interface DateChangingEventArgs<T = unknown> extends EventArgs {
  from: Date;
  to: Date;
  byUser: boolean;
  source: Scheduler<T>;
}
