import type { Scheduler } from './Scheduler';
import type { SchedulerCell } from './scheduler-cell';

export interface SelectionChangedEventArgs<T = unknown> {
  /** The cells selected now, as one time; `null` when none is. */
  selection: SchedulerCell | null;
  source: Scheduler<T>;
}
