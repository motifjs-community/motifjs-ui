import type { Scheduler } from './Scheduler';
import type { SchedulerRange } from './scheduler-range';

/** The view shows its appointments: after the first load, a new date or view, and new data. */
export interface ContentReadyEventArgs<T = unknown> {
  range: SchedulerRange;
  /** The appointments in the range. */
  appointments: readonly T[];
  source: Scheduler<T>;
}
