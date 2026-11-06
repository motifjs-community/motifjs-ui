import type { RecurrenceFrequency } from './recurrence-frequency';
import type { RuleDate } from './rule-date';
import type { RuleWeekday } from './rule-weekday';

/**
 * A recurrence rule (RFC 5545 `RRULE`), read by `parseRecurrenceRule` and written by `formatRecurrenceRule`.
 * An empty list omits its part.
 */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  /** Every n-th day, week, month or year. The default is 1. */
  interval: number;
  /** The total number of occurrences (`COUNT`), or `null` for no limit. */
  count: number | null;
  /** The last time it can occur (`UNTIL`, included), or `null` for no limit. */
  until: RuleDate | null;
  /** `BYDAY`. */
  weekdays: RuleWeekday[];
  /** `BYMONTHDAY`: 1 … 31, or -1 the last day, -2 the one before… */
  monthDays: number[];
  /** `BYMONTH`: 1 January … 12 December. */
  months: number[];
  /** `BYYEARDAY`: 1 … 366, or from the end with -1 … */
  yearDays: number[];
  /** `BYWEEKNO`: weeks of the year (week 1 holds at least four of its days), or from the end. */
  weeks: number[];
  /** `BYHOUR`, `BYMINUTE`, `BYSECOND`: times of each day. When empty, the start's time is used. */
  hours: number[];
  minutes: number[];
  seconds: number[];
  /** `BYSETPOS`: which of the times found in each day, week, month or year are kept (1 the first, -1 the last). */
  positions: number[];
  /** `WKST`: the day weeks start on, 0 Sunday … 6 Saturday. The default is 1 (Monday). */
  weekStart: number;
  /** Parts the kit does not read, kept as written so the text is preserved in full. */
  other: string[];
}
