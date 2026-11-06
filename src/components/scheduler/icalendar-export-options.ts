import type { SchedulerRange } from './scheduler-range';

/** The options of `exportICalendar`. */
export interface ICalendarExportOptions<T = unknown> {
  /**
   * The appointments of the displayed days (the default), all loaded appointments, or those of a
   * custom range. A series is exported whole, with its rule.
   */
  range?: 'visible' | 'all' | SchedulerRange;
  /** Exports these appointments instead of the range's. */
  appointments?: readonly T[];
  /** The calendar's name (`X-WR-CALNAME`). The default is the scheduler's label. */
  name?: string;
}
