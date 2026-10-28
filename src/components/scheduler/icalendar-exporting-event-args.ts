import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';
import type { SchedulerRange } from './scheduler-range';

/** An iCalendar file is about to be written; `appointments` may be changed, `cancel = true` writes nothing. */
export interface ICalendarExportingEventArgs<T = unknown> extends EventArgs {
  appointments: T[];
  /** The range asked for, `null` for all. */
  range: SchedulerRange | null;
  source: Scheduler<T>;
}
