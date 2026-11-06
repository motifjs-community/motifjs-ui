import type { RuleDate } from '../recurrence/rule-date';

/** A date of an iCalendar file: the fields as written (`time`, a wall clock time unless `utc`) and the zone it names. */
export interface ICalendarDate extends RuleDate {
  /** The `TZID` it is written in, or empty if there is none. */
  zone: string;
}
