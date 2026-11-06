import type { ICalendarEvent } from './icalendar-event';

/** The content and options of `writeICalendar`. */
export interface ICalendarWriteOptions {
  events: ICalendarEvent[];
  /** `X-WR-CALNAME`. */
  name?: string;
  /** The product id. The default is `-//MotifJS//Scheduler//EN`. */
  prodId?: string;
  /** The calendar method. The default is `PUBLISH`. */
  method?: string;
  /** The IANA zones to write a `VTIMEZONE` for. The default is every IANA zone the events are written in. */
  timeZones?: readonly string[];
  /** The `DTSTAMP` of events without one. The default is the current time. */
  stamp?: number;
}
