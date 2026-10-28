import type { ICalendarObservance } from './icalendar-observance';

/** A time zone (`VTIMEZONE`) written in an iCalendar file. */
export interface ICalendarTimeZone {
  /** `TZID`. */
  id: string;
  observances: ICalendarObservance[];
}
