import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/**
 * Occurs before an iCalendar file is imported. `appointments` holds the values to add, which can be
 * changed. Set `cancel = true` to add nothing.
 */
export interface ICalendarImportingEventArgs<T = unknown> extends EventArgs {
  text: string;
  appointments: Partial<T>[];
  source: Scheduler<T>;
}
