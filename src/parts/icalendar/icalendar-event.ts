import type { ICalendarDate } from './icalendar-date';
import type { ICalendarProperty } from './icalendar-property';

/** An event (`VEVENT`) of an iCalendar file. */
export interface ICalendarEvent {
  uid: string;
  start: ICalendarDate;
  /** `DTEND`, or the start with its `DURATION` added, in the start's form, or `null` if there is none. */
  end: ICalendarDate | null;
  summary: string;
  description: string;
  location: string;
  /** The `RRULE` value without its name, or empty if there is none. */
  rule: string;
  /** Every `EXDATE`. */
  exceptions: ICalendarDate[];
  /** The occurrence of a series this event replaces. */
  recurrenceId: ICalendarDate | null;
  /** In upper case (`CONFIRMED`, `CANCELLED`), or empty if omitted. */
  status: string;
  /** The `DTSTAMP` moment. */
  stamp: number | null;
  sequence: number | null;
  /** The properties the reader does not map, kept so a writer can put them back. */
  other: ICalendarProperty[];
}
