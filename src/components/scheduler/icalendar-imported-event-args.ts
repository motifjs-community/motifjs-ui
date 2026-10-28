import type { ICalendarImportResult } from './icalendar-import-result';
import type { Scheduler } from './Scheduler';

export interface ICalendarImportedEventArgs<T = unknown> extends ICalendarImportResult<T> {
  source: Scheduler<T>;
}
