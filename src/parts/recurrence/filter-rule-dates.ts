import { readRuleDates } from './read-rule-dates';
import type { RuleDate } from './rule-date';

/** An exception field with only the dates `keep` says yes to, in the form it has (a list stays a list, a text a text). */
export function filterRuleDates(value: unknown, keep: (date: RuleDate) => boolean): unknown {
  if (Array.isArray(value)) return value.filter((item) => readRuleDates([item]).every(keep));
  if (typeof value !== 'string') return value;
  return value
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter((part) => part && readRuleDates(part).every(keep))
    .join(',');
}
