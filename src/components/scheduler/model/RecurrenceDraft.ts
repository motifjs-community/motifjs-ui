import { dayStart } from '../../../parts/dates/day-start';
import { TimeZone } from '../../../parts/dates/time-zone';
import { formatRecurrenceRule } from '../../../parts/recurrence/format-recurrence-rule';
import { parseRecurrenceRule } from '../../../parts/recurrence/parse-recurrence-rule';
import type { RecurrenceFrequency } from '../../../parts/recurrence/recurrence-frequency';
import type { RecurrenceRule } from '../../../parts/recurrence/recurrence-rule';

const DAY = 86_400_000;

/** A day of the week as the recurrence editor shows it: on or off. */
export interface DraftDay {
  /** 0 Sunday … 6 Saturday. */
  day: number;
  on: boolean;
}

/** What the recurrence editor shows: a rule taken apart into the choices it offers. */
export interface DraftState {
  frequency: 'never' | RecurrenceFrequency;
  interval: number;
  /** The seven days, from the first day of the week. */
  days: DraftDay[];
  /** A month (and a year) repeats on a day of the month, or on a weekday by its place. */
  by: 'monthDay' | 'weekday';
  /** 1 … 31, or -1 for the last day. */
  monthDay: number;
  /** 1 … 4 the first … fourth, -1 the last. */
  nth: number;
  weekday: number;
  /** 1 January … 12 December. */
  month: number;
  end: 'never' | 'count' | 'until';
  count: number;
  /** The last day it may happen, a date of the browser's clock. */
  until: Date | null;
}

/** What a rule is read and written for: where it starts, on which clock. */
export interface DraftContext {
  /** The start, as a date of the browser's clock with the series' fields. */
  start: Date | null;
  /** An all-day series ends on a date; a timed one at the end of that day on its clock. */
  allDay: boolean;
  zone: TimeZone;
  firstDayOfWeek: number;
}

/**
 * A rule as the recurrence editor's choices, and back: `read` takes a rule's text apart (the
 * start gives what the rule leaves to it), `write` puts the choices together again. Parts the
 * choices do not cover (`BYSETPOS`, `BYWEEKNO`…) stay as they were until a choice is changed, so a
 * rule of its own is never rewritten by only being shown.
 */
export class RecurrenceDraft {
  readonly state: DraftState;
  private base: RecurrenceRule | null = null;

  constructor() {
    this.state = {
      frequency: 'never',
      interval: 1,
      days: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, on: false })),
      by: 'monthDay',
      monthDay: 1,
      nth: 1,
      weekday: 1,
      month: 1,
      end: 'never',
      count: 10,
      until: null,
    };
  }

  /** A text of every choice: it changes when (and only when) a choice does. */
  key(): string {
    const s = this.state;
    return JSON.stringify([s.frequency, s.interval, s.days.map((d) => `${d.day}${d.on ? '+' : ''}`), s.by, s.monthDay, s.nth, s.weekday, s.month, s.end, s.count, s.until?.getTime() ?? null]);
  }

  /** The rule the text was read from, when it is one. */
  get rule(): RecurrenceRule | null {
    return this.base;
  }

  read(text: string, context: DraftContext): void {
    const rule = parseRecurrenceRule(text);
    this.base = rule;
    const s = this.state;
    const start = context.start ?? new Date();
    const order = [0, 1, 2, 3, 4, 5, 6].map((i) => (i + context.firstDayOfWeek) % 7);
    // The same seven days in the week's order: what shows them keeps them.
    s.days.forEach((d, i) => (d.day = order[i]));
    s.frequency = rule?.frequency ?? 'never';
    s.interval = rule?.interval ?? 1;
    const plain = rule?.weekdays.filter((w) => !w.nth).map((w) => w.day) ?? [];
    const on = rule?.frequency === 'weekly' && !plain.length ? [start.getDay()] : plain.length ? plain : [start.getDay()];
    for (const day of s.days) day.on = on.includes(day.day);
    const nth = rule?.weekdays.find((w) => w.nth);
    s.by = nth ? 'weekday' : 'monthDay';
    s.nth = nth && (nth.nth === -1 || (nth.nth >= 1 && nth.nth <= 4)) ? nth.nth : Math.min(4, Math.floor((start.getDate() - 1) / 7) + 1);
    s.weekday = nth?.day ?? start.getDay();
    s.monthDay = rule?.monthDays[0] ?? start.getDate();
    s.month = rule?.months[0] ?? start.getMonth() + 1;
    s.end = rule?.count !== null && rule?.count !== undefined ? 'count' : rule?.until ? 'until' : 'never';
    s.count = rule?.count ?? 10;
    if (rule?.until) {
      const u = rule.until;
      s.until = dayStart(u.utc && !u.dateOnly ? context.zone.toLocal(u.time) : TimeZone.localOfWall(u.time));
    } else s.until = null;
  }

  /** The rule the choices make, as text; empty when it does not repeat. */
  write(context: DraftContext): string {
    const s = this.state;
    if (s.frequency === 'never') return '';
    const base = this.base;
    const start = context.start ?? new Date();
    const rule: RecurrenceRule = {
      frequency: s.frequency,
      interval: Math.max(1, Math.round(s.interval) || 1),
      count: null,
      until: null,
      weekdays: [],
      monthDays: [],
      months: [],
      yearDays: [],
      weeks: [],
      hours: base?.hours ?? [],
      minutes: base?.minutes ?? [],
      seconds: base?.seconds ?? [],
      positions: [],
      weekStart: base?.weekStart ?? 1,
      other: base?.other ?? [],
    };
    if (s.frequency === 'weekly') {
      const days = s.days.filter((d) => d.on).map((d) => d.day);
      rule.weekdays = (days.length ? days : [start.getDay()]).map((day) => ({ day, nth: 0 }));
    } else if (s.frequency === 'monthly' || s.frequency === 'yearly') {
      if (s.by === 'weekday') rule.weekdays = [{ day: s.weekday, nth: s.nth }];
      else rule.monthDays = [s.monthDay];
      if (s.frequency === 'yearly') rule.months = [s.month];
    } else if (base?.frequency === 'daily') rule.weekdays = base.weekdays;
    if (s.end === 'count') rule.count = Math.max(1, Math.round(s.count) || 1);
    // "On a date" chosen before a date is: it ends three months after the start (as "after" starts at 10 times), or
    // the rule would be written without an end and read back as "never".
    if (s.end === 'until' && !s.until) s.until = new Date(start.getFullYear(), start.getMonth() + 3, start.getDate());
    if (s.end === 'until' && s.until) {
      const day = TimeZone.wallOfLocal(dayStart(s.until));
      rule.until = context.allDay ? { time: day, utc: false, dateOnly: true } : { time: context.zone.moment(day + DAY - 1000), utc: true, dateOnly: false };
    }
    return formatRecurrenceRule(rule);
  }
}
