import type { SchedulerRange } from './scheduler-range';

/** What `exportICalendar` writes. */
export interface ICalendarExportOptions<T = unknown> {
  /** The appointments of the days shown (default), all the ones loaded, or those of a range of your own. A series goes whole, with its rule. */
  range?: 'visible' | 'all' | SchedulerRange;
  /** These appointments instead of the range's. */
  appointments?: readonly T[];
  /** The calendar's name (`X-WR-CALNAME`). Default: the scheduler's label. */
  name?: string;
}
