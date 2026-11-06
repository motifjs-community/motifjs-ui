import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';
import type { SchedulerRange } from './scheduler-range';

/** Occurs before an iCalendar file is written. `appointments` can be changed. Set `cancel = true` to write nothing. */
export interface ICalendarExportingEventArgs<T = unknown> extends EventArgs {
  appointments: T[];
  /** The requested range, or `null` for all. */
  range: SchedulerRange | null;
  source: Scheduler<T>;
}
