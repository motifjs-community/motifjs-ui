import type { RecurrenceFrequency } from './recurrence-frequency';
import type { RuleDate } from './rule-date';
import type { RuleWeekday } from './rule-weekday';

/** A recurrence rule (RFC 5545 `RRULE`), read by `parseRecurrenceRule` and written by `formatRecurrenceRule`. An empty list leaves its part out. */
export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  /** Every n-th day, week, month or year. Default 1. */
  interval: number;
  /** How many times in all (`COUNT`); `null` for no limit. */
  count: number | null;
  /** The last time it may happen (`UNTIL`, included); `null` for no limit. */
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
  /** `BYHOUR`, `BYMINUTE`, `BYSECOND`: times of each day; the start's time when empty. */
  hours: number[];
  minutes: number[];
  seconds: number[];
  /** `BYSETPOS`: which of the times found in each day, week, month or year are kept (1 the first, -1 the last). */
  positions: number[];
  /** `WKST`: the day weeks start on, 0 Sunday … 6 Saturday. Default 1 (Monday). */
  weekStart: number;
  /** Parts the kit does not read, kept as they were written so the text comes back whole. */
  other: string[];
}
