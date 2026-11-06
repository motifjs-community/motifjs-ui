import type { Scheduler } from './Scheduler';
import type { SchedulerRange } from './scheduler-range';

/** Occurs when the view has displayed its appointments: after a load, a new date or view, or new data. */
export interface ContentReadyEventArgs<T = unknown> {
  range: SchedulerRange;
  /** The appointments in the range. */
  appointments: readonly T[];
  source: Scheduler<T>;
}
