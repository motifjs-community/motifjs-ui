import type { Scheduler } from './Scheduler';
import type { SchedulerRange } from './scheduler-range';

export interface DateChangedEventArgs<T = unknown> {
  from: Date;
  to: Date;
  /** The days now displayed. */
  range: SchedulerRange;
  byUser: boolean;
  source: Scheduler<T>;
}
