import { formatRuleDate } from './format-rule-date';
import type { RecurrenceRule } from './recurrence-rule';
import { WEEKDAY_CODES } from './weekday-codes';

/** Writes a rule as RFC 5545 text (without the `RRULE:` name), leaving out what is the default. */
export function formatRecurrenceRule(rule: RecurrenceRule): string {
  const parts = [`FREQ=${rule.frequency.toUpperCase()}`];
  const list = (key: string, values: readonly number[]) => values.length && parts.push(`${key}=${values.join(',')}`);
  if (rule.interval > 1) parts.push(`INTERVAL=${rule.interval}`);
  if (rule.count !== null) parts.push(`COUNT=${rule.count}`);
  if (rule.until) parts.push(`UNTIL=${formatRuleDate(rule.until)}`);
  list('BYMONTH', rule.months);
  list('BYWEEKNO', rule.weeks);
  list('BYYEARDAY', rule.yearDays);
  list('BYMONTHDAY', rule.monthDays);
  if (rule.weekdays.length) parts.push(`BYDAY=${rule.weekdays.map((w) => `${w.nth || ''}${WEEKDAY_CODES[w.day]}`).join(',')}`);
  list('BYHOUR', rule.hours);
  list('BYMINUTE', rule.minutes);
  list('BYSECOND', rule.seconds);
  list('BYSETPOS', rule.positions);
  if (rule.weekStart !== 1) parts.push(`WKST=${WEEKDAY_CODES[rule.weekStart]}`);
  parts.push(...rule.other);
  return parts.join(';');
}
