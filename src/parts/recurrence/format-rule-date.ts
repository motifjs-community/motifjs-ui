import type { RuleDate } from './rule-date';

const two = (n: number) => String(n).padStart(2, '0');

/** A rule's date as RFC 5545 writes it: `20261031`, `20261031T090000` or `20261031T090000Z`. */
export function formatRuleDate(date: RuleDate): string {
  const d = new Date(date.time);
  const day = `${String(d.getUTCFullYear()).padStart(4, '0')}${two(d.getUTCMonth() + 1)}${two(d.getUTCDate())}`;
  if (date.dateOnly) return day;
  return `${day}T${two(d.getUTCHours())}${two(d.getUTCMinutes())}${two(d.getUTCSeconds())}${date.utc ? 'Z' : ''}`;
}
