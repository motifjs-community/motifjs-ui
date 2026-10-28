import type { ICalendarEvent } from './icalendar-event';

/** What `writeICalendar` writes. */
export interface ICalendarWriteOptions {
  events: ICalendarEvent[];
  /** `X-WR-CALNAME`. */
  name?: string;
  /** Default `-//MotifJS//Scheduler//EN`. */
  prodId?: string;
  /** Default `PUBLISH`. */
  method?: string;
  /** IANA zones to write a `VTIMEZONE` for. Default: every IANA zone the events are written in. */
  timeZones?: readonly string[];
  /** `DTSTAMP` of the events without one. Default: now. */
  stamp?: number;
}
