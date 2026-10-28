import { formatRuleDate } from './format-rule-date';
import type { RuleDate } from './rule-date';

/**
 * An exception field with one more date, in the form it already has: a list gets a `Date` (or the
 * text of a wall clock time), a text (or nothing yet) gets the date as RFC 5545 writes it after a comma.
 */
export function addRuleDate(value: unknown, date: RuleDate): unknown {
  if (Array.isArray(value)) return [...value, date.utc && !date.dateOnly ? new Date(date.time) : formatRuleDate(date)];
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? `${text},${formatRuleDate(date)}` : formatRuleDate(date);
}
