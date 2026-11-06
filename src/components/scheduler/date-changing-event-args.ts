import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/**
 * Occurs before the date changes through today, next, previous or a selected date. Set
 * `cancel = true` to keep the current date.
 */
export interface DateChangingEventArgs<T = unknown> extends EventArgs {
  from: Date;
  to: Date;
  byUser: boolean;
  source: Scheduler<T>;
}
