import type { ICalendarDate } from './icalendar-date';
import type { ICalendarProperty } from './icalendar-property';

/** An event (`VEVENT`) of an iCalendar file. */
export interface ICalendarEvent {
  uid: string;
  start: ICalendarDate;
  /** `DTEND`, or the start with its `DURATION` added, in the start's form; `null` for none. */
  end: ICalendarDate | null;
  summary: string;
  description: string;
  location: string;
  /** The `RRULE` value without its name; empty for none. */
  rule: string;
  /** Every `EXDATE`. */
  exceptions: ICalendarDate[];
  /** The occurrence of a series this event replaces. */
  recurrenceId: ICalendarDate | null;
  /** Upper case (`CONFIRMED`, `CANCELLED`); empty when not given. */
  status: string;
  /** The `DTSTAMP` moment. */
  stamp: number | null;
  sequence: number | null;
  /** The properties the reader does not map, kept so a writer can put them back. */
  other: ICalendarProperty[];
}
