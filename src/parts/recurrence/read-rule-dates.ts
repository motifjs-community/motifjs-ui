import { parseRuleDate } from './parse-rule-date';
import type { RuleDate } from './rule-date';

function one(value: unknown): RuleDate | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : { time: value.getTime(), utc: true, dateOnly: false };
  if (typeof value === 'number') return Number.isFinite(value) ? { time: value, utc: true, dateOnly: false } : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const rule = parseRuleDate(value.replace(/^(EXDATE|RDATE)(;[^:]*)?:/i, ''));
  if (rule) return rule;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : { time: parsed, utc: true, dateOnly: false };
}

/**
 * The dates of an exception field (`EXDATE`): a text of dates apart by commas or semicolons
 * (`20261104T090000Z,20261111T090000Z`), or a list of dates, texts or milliseconds. A `Date` and a
 * text with a zone are moments; a text without one is a wall clock time of the series.
 */
export function readRuleDates(value: unknown): RuleDate[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[,;]/) : value === null || value === undefined ? [] : [value];
  const out: RuleDate[] = [];
  for (const item of list) {
    const date = one(item);
    if (date) out.push(date);
  }
  return out;
}
