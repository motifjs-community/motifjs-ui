import type { Scheduler } from './Scheduler';
import type { SchedulerRange } from './scheduler-range';

export interface DateChangedEventArgs<T = unknown> {
  from: Date;
  to: Date;
  /** The days shown now. */
  range: SchedulerRange;
  byUser: boolean;
  source: Scheduler<T>;
}
