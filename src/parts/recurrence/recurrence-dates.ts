import type { RecurrenceDatesOptions } from './recurrence-dates-options';
import type { RecurrenceRule } from './recurrence-rule';
import type { RuleWeekday } from './rule-weekday';

const DAY = 86_400_000;
const WEEK = 7 * DAY;
/** No rule needs more steps than this to reach a date; it keeps a rule that never matches from running on. */
const MOST_STEPS = 100_000;

const dayOf = (time: number) => Math.floor(time / DAY) * DAY;
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
const daysInYear = (year: number) => (daysInMonth(year, 1) === 29 ? 366 : 365);

/** The first day of week 1 of a year: the week (from `weekStart`) that holds January 4th, so at least four of its days. */
function firstWeek(year: number, weekStart: number): number {
  const jan4 = Date.UTC(year, 0, 4);
  return jan4 - ((new Date(jan4).getUTCDay() - weekStart + 7) % 7) * DAY;
}

/**
 * The times a rule occurs from `from` up to `to` (not included), in order. Every time is a wall
 * clock time as milliseconds of UTC (`Date.UTC` of its fields), so a series keeps its hour across
 * daylight saving time, and the caller converts them to moments in the series' time zone. `start` is
 * the first time (`DTSTART`), and it counts only when the rule includes it. `COUNT` counts from
 * `start`, whatever `from` is, and with no count the steps before `from` are skipped.
 *
 * @example
 * // Every last Friday of the month, at the start's time.
 * recurrenceDates(parseRecurrenceRule('FREQ=MONTHLY;BYDAY=-1FR')!, Date.UTC(2026, 0, 30, 9), Date.UTC(2026, 0, 1), Date.UTC(2027, 0, 1))
 */
export function recurrenceDates(rule: RecurrenceRule, start: number, from: number, to: number, options: RecurrenceDatesOptions = {}): number[] {
  const limit = options.limit ?? 10_000;
  const first = new Date(start);
  const startYear = first.getUTCFullYear();
  const startMonth = first.getUTCMonth();
  const startDay = dayOf(start);
  const frequency = rule.frequency;
  const interval = Math.max(1, Math.floor(rule.interval) || 1);

  let until = Infinity;
  if (rule.until) {
    const u = rule.until;
    until = u.dateOnly ? u.time + DAY - 1 : u.utc && options.wallOf ? options.wallOf(u.time) : u.time;
  }

  // What the start says when the rule does not (RFC 5545, 3.3.10).
  let weekdays: RuleWeekday[] = rule.weekdays;
  let monthDays = rule.monthDays;
  let months = rule.months;
  const noDays = !rule.weekdays.length && !rule.monthDays.length && !rule.yearDays.length && !rule.weeks.length;
  if (frequency === 'weekly' && !weekdays.length) weekdays = [{ day: first.getUTCDay(), nth: 0 }];
  if (frequency === 'monthly' && noDays) monthDays = [first.getUTCDate()];
  if (frequency === 'yearly' && noDays) {
    monthDays = [first.getUTCDate()];
    if (!months.length) months = [startMonth + 1];
  }
  const hours = rule.hours.length ? rule.hours : [first.getUTCHours()];
  const minutes = rule.minutes.length ? rule.minutes : [first.getUTCMinutes()];
  const seconds = rule.seconds.length ? rule.seconds : [first.getUTCSeconds()];
  const times = hours
    .flatMap((h) => minutes.flatMap((m) => seconds.map((s) => ((h * 60 + m) * 60 + s) * 1000)))
    .sort((a, b) => a - b)
    .filter((t, i, all) => i === 0 || all[i - 1] !== t);

  const weeksOfYear = frequency === 'yearly' && rule.weeks.length > 0;
  // An ordinal day (2MO) counts in its month, or in its year; in a week or a day it is every one.
  const nthIn: 'month' | 'year' | null =
    frequency === 'monthly' || (frequency === 'yearly' && months.length && !weeksOfYear) ? 'month' : frequency === 'yearly' && !weeksOfYear ? 'year' : null;
  const weekOne = startDay - ((first.getUTCDay() - rule.weekStart + 7) % 7) * DAY;

  /** The first day of step `i`, and its days. */
  const step = (i: number): { begins: number; days: number[] } => {
    if (frequency === 'daily') {
      const day = startDay + i * interval * DAY;
      return { begins: day, days: [day] };
    }
    if (frequency === 'weekly') {
      const begins = weekOne + i * interval * WEEK;
      return { begins, days: Array.from({ length: 7 }, (_, d) => begins + d * DAY) };
    }
    if (frequency === 'monthly') {
      const index = startYear * 12 + startMonth + i * interval;
      const year = Math.floor(index / 12);
      const month = index - year * 12;
      const begins = Date.UTC(year, month, 1);
      return { begins, days: Array.from({ length: daysInMonth(year, month) }, (_, d) => begins + d * DAY) };
    }
    const year = startYear + i * interval;
    if (!weeksOfYear) {
      const begins = Date.UTC(year, 0, 1);
      return { begins, days: Array.from({ length: daysInYear(year) }, (_, d) => begins + d * DAY) };
    }
    // The weeks named, which may reach into the years around it.
    const begins = firstWeek(year, rule.weekStart);
    const count = (firstWeek(year + 1, rule.weekStart) - begins) / WEEK;
    const days = new Set<number>();
    for (const n of rule.weeks) {
      const week = n > 0 ? n : count + n + 1;
      if (week < 1 || week > count) continue;
      for (let d = 0; d < 7; d++) days.add(begins + (week - 1) * WEEK + d * DAY);
    }
    return { begins, days: [...days].sort((a, b) => a - b) };
  };

  /** The step `time` falls in. */
  const stepOf = (time: number): number => {
    const d = new Date(time);
    if (frequency === 'daily') return Math.floor((dayOf(time) - startDay) / (interval * DAY));
    if (frequency === 'weekly') return Math.floor((dayOf(time) - weekOne) / (interval * WEEK));
    if (frequency === 'monthly') return Math.floor((d.getUTCFullYear() * 12 + d.getUTCMonth() - (startYear * 12 + startMonth)) / interval);
    return Math.floor((d.getUTCFullYear() - startYear) / interval);
  };

  const keeps = (day: number): boolean => {
    const d = new Date(day);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const date = d.getUTCDate();
    if (months.length && !months.includes(month + 1)) return false;
    const yearDay = (day - Date.UTC(year, 0, 1)) / DAY + 1;
    const yearLength = daysInYear(year);
    if (frequency === 'yearly' && rule.yearDays.length && !rule.yearDays.some((n) => (n > 0 ? n : yearLength + n + 1) === yearDay)) return false;
    const monthLength = daysInMonth(year, month);
    if (frequency !== 'weekly' && monthDays.length && !monthDays.some((n) => (n > 0 ? n : monthLength + n + 1) === date)) return false;
    if (weekdays.length) {
      const weekday = d.getUTCDay();
      const matches = weekdays.some((w) => {
        if (w.day !== weekday) return false;
        if (!w.nth || !nthIn) return true;
        const [at, length] = nthIn === 'month' ? [date, monthLength] : [yearDay, yearLength];
        return w.nth > 0 ? Math.floor((at - 1) / 7) + 1 === w.nth : Math.floor((length - at) / 7) + 1 === -w.nth;
      });
      if (!matches) return false;
    }
    return true;
  };

  const out: number[] = [];
  let counted = 0;
  const last = Math.min(to, until + 1);
  // Nothing counts before `from` when there is no count: the steps before it are skipped.
  const skip = rule.count === null && from > start ? Math.max(0, stepOf(from) - 1) : 0;
  for (let i = skip; i < skip + MOST_STEPS; i++) {
    const { begins, days } = step(i);
    if (begins >= last) break;
    let found = days.filter(keeps).flatMap((day) => times.map((t) => day + t));
    if (rule.positions.length) {
      const all = found;
      found = rule.positions
        .map((p) => (p > 0 ? all[p - 1] : all[all.length + p]))
        .filter((t): t is number => t !== undefined)
        .sort((a, b) => a - b)
        .filter((t, n, list) => n === 0 || list[n - 1] !== t);
    }
    for (const time of found) {
      if (time < start) continue;
      if (time > until || time >= to) return out;
      counted++;
      if (rule.count !== null && counted > rule.count) return out;
      if (time >= from) {
        out.push(time);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}
