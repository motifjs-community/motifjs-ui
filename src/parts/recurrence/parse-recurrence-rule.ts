import { parseRuleDate } from './parse-rule-date';
import type { RecurrenceFrequency } from './recurrence-frequency';
import type { RecurrenceRule } from './recurrence-rule';
import type { RuleWeekday } from './rule-weekday';
import { WEEKDAY_CODES } from './weekday-codes';

const FREQUENCIES: Record<string, RecurrenceFrequency> = { DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly', YEARLY: 'yearly' };

/** Whole numbers in a range, from a comma list; `null` when one is not. */
function numbers(text: string, min: number, max: number, zero = false): number[] | null {
  const out: number[] = [];
  for (const part of text.split(',')) {
    if (!/^[+-]?\d+$/.test(part.trim())) return null;
    const n = Number(part);
    if ((!zero && n === 0) || Math.abs(n) > max || n < min) return null;
    out.push(n);
  }
  return out;
}

function weekdays(text: string): RuleWeekday[] | null {
  const out: RuleWeekday[] = [];
  for (const part of text.split(',')) {
    const m = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/i.exec(part.trim());
    if (!m) return null;
    const nth = m[1] ? Number(m[1]) : 0;
    if (Math.abs(nth) > 53) return null;
    out.push({ day: WEEKDAY_CODES.indexOf(m[2].toUpperCase()), nth });
  }
  return out;
}

/**
 * Reads a recurrence rule (RFC 5545 `RRULE`, with or without the `RRULE:` name): `FREQ` daily to
 * yearly, `INTERVAL`, `COUNT`, `UNTIL`, `BYDAY` (`2MO`, `-1FR`), `BYMONTHDAY`, `BYMONTH`,
 * `BYYEARDAY`, `BYWEEKNO`, `BYHOUR`, `BYMINUTE`, `BYSECOND`, `BYSETPOS`, `WKST`. Returns `null` if the
 * text is not a rule it can follow (a known part with a wrong value, or hourly and shorter).
 *
 * @example
 * parseRecurrenceRule('FREQ=MONTHLY;BYDAY=-1FR;COUNT=6')
 */
export function parseRecurrenceRule(text: string | null | undefined): RecurrenceRule | null {
  const body = (text ?? '').trim().replace(/^RRULE:/i, '');
  if (!body) return null;
  const rule: Partial<RecurrenceRule> & { other: string[] } = {
    interval: 1,
    count: null,
    until: null,
    weekdays: [],
    monthDays: [],
    months: [],
    yearDays: [],
    weeks: [],
    hours: [],
    minutes: [],
    seconds: [],
    positions: [],
    weekStart: 1,
    other: [],
  };
  for (const part of body.split(';')) {
    if (!part.trim()) continue;
    const at = part.indexOf('=');
    if (at < 1) return null;
    const key = part.slice(0, at).trim().toUpperCase();
    const value = part.slice(at + 1).trim();
    let list: number[] | null;
    switch (key) {
      case 'FREQ':
        if (!FREQUENCIES[value.toUpperCase()]) return null;
        rule.frequency = FREQUENCIES[value.toUpperCase()];
        break;
      case 'INTERVAL':
        if (!/^\d+$/.test(value) || Number(value) < 1) return null;
        rule.interval = Number(value);
        break;
      case 'COUNT':
        if (!/^\d+$/.test(value) || Number(value) < 1) return null;
        rule.count = Number(value);
        break;
      case 'UNTIL':
        rule.until = parseRuleDate(value);
        if (!rule.until) return null;
        break;
      case 'BYDAY': {
        const days = weekdays(value);
        if (!days) return null;
        rule.weekdays = days;
        break;
      }
      case 'WKST':
        if (!WEEKDAY_CODES.includes(value.toUpperCase())) return null;
        rule.weekStart = WEEKDAY_CODES.indexOf(value.toUpperCase());
        break;
      case 'BYMONTHDAY':
        if (!(list = numbers(value, -31, 31))) return null;
        rule.monthDays = list;
        break;
      case 'BYMONTH':
        if (!(list = numbers(value, 1, 12))) return null;
        rule.months = list;
        break;
      case 'BYYEARDAY':
        if (!(list = numbers(value, -366, 366))) return null;
        rule.yearDays = list;
        break;
      case 'BYWEEKNO':
        if (!(list = numbers(value, -53, 53))) return null;
        rule.weeks = list;
        break;
      case 'BYHOUR':
        if (!(list = numbers(value, 0, 23, true))) return null;
        rule.hours = list;
        break;
      case 'BYMINUTE':
        if (!(list = numbers(value, 0, 59, true))) return null;
        rule.minutes = list;
        break;
      case 'BYSECOND':
        if (!(list = numbers(value, 0, 60, true))) return null;
        rule.seconds = list;
        break;
      case 'BYSETPOS':
        if (!(list = numbers(value, -366, 366))) return null;
        rule.positions = list;
        break;
      default:
        rule.other.push(part.trim());
    }
  }
  return rule.frequency ? (rule as RecurrenceRule) : null;
}
