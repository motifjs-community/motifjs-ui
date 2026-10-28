import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** An iCalendar file is about to be read in; `appointments` (as they will be added) may be changed, `cancel = true` adds nothing. */
export interface ICalendarImportingEventArgs<T = unknown> extends EventArgs {
  text: string;
  appointments: Partial<T>[];
  source: Scheduler<T>;
}
