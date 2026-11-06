import type { ICalendarEvent } from './icalendar-event';
import type { ICalendarTimeZone } from './icalendar-time-zone';

/** What `parseICalendar` reads from a file. Several calendars in one file are merged. */
export interface ICalendar {
  events: ICalendarEvent[];
  timeZones: ICalendarTimeZone[];
  /** `X-WR-CALNAME`. */
  name: string;
  /** `X-WR-TIMEZONE`. */
  timeZone: string;
  prodId: string;
  method: string;
}
