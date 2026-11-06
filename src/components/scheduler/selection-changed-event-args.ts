import type { Scheduler } from './Scheduler';
import type { SchedulerCell } from './scheduler-cell';

export interface SelectionChangedEventArgs<T = unknown> {
  /** The selected cells as one time range, or `null` if none are selected. */
  selection: SchedulerCell | null;
  source: Scheduler<T>;
}
