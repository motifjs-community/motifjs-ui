import { fillTemplate } from '../../core/fill-template';
import type { UiStrings } from '../../core/ui-strings';
import type { RecurrenceRule } from './recurrence-rule';

/** What `describeRecurrence` writes with. */
export interface DescribeRecurrenceOptions {
  locale: string;
  strings: UiStrings;
  /** The time zone a moment in the rule (an `UNTIL` in UTC) is written on. Default: the browser's. */
  timeZone?: string;
}

const ORDINALS: Record<number, keyof UiStrings> = {
  1: 'recurrenceFirst',
  2: 'recurrenceSecond',
  3: 'recurrenceThird',
  4: 'recurrenceFourth',
  [-1]: 'recurrenceLast',
};

const EVERY: Record<RecurrenceRule['frequency'], [keyof UiStrings, keyof UiStrings]> = {
  daily: ['recurrenceSummaryDaily', 'recurrenceSummaryDays'],
  weekly: ['recurrenceSummaryWeekly', 'recurrenceSummaryWeeks'],
  monthly: ['recurrenceSummaryMonthly', 'recurrenceSummaryMonths'],
  yearly: ['recurrenceSummaryYearly', 'recurrenceSummaryYears'],
};

/** The name of a weekday (0 Sunday) or a month (1 January) in a locale. */
const weekdayName = (locale: string, day: number) => new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(Date.UTC(2026, 0, 4 + day));
const monthName = (locale: string, month: number) => new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(Date.UTC(2026, month - 1, 1));

/**
 * How a rule repeats, in plain words of the locale: "Every 2 weeks on Monday and Wednesday, until
 * 31 December 2026". `start` (a date of the browser's clock with the series' fields) gives what the
 * rule leaves to it: the weekday, the day of the month. Parts the words do not cover are said to be
 * a rule of its own.
 */
export function describeRecurrence(rule: RecurrenceRule | null, start: Date | null, options: DescribeRecurrenceOptions): string {
  const { locale, strings } = options;
  const t = (key: keyof UiStrings, values: Record<string, unknown> = {}) => fillTemplate(strings[key], values);
  if (!rule) return t('recurrenceSummaryNever');
  const [one, many] = EVERY[rule.frequency];
  let text = rule.interval > 1 ? t(many, { n: rule.interval }) : t(one);
  let own =
    rule.yearDays.length > 0 ||
    rule.weeks.length > 0 ||
    rule.positions.length > 0 ||
    rule.hours.length > 0 ||
    rule.minutes.length > 0 ||
    rule.seconds.length > 0 ||
    rule.other.length > 0 ||
    rule.monthDays.length > 1 ||
    (rule.frequency === 'yearly' && rule.months.length > 1);
  const list = (names: string[]) => new Intl.ListFormat(locale, { type: 'conjunction' }).format(names);
  const plain = rule.weekdays.filter((w) => !w.nth);
  const nth = rule.weekdays.filter((w) => w.nth);
  const ordinal = (n: number) => {
    if (ORDINALS[n]) return t(ORDINALS[n]);
    own = true;
    return String(n);
  };
  if (rule.frequency === 'daily' || rule.frequency === 'weekly') {
    const days = rule.weekdays.length ? rule.weekdays.map((w) => w.day) : rule.frequency === 'weekly' && start ? [start.getDay()] : [];
    // From the start of the week the rule names.
    const order = (day: number) => (day - rule.weekStart + 7) % 7;
    if (days.length) text = t('recurrenceSummaryOnDays', { rule: text, days: list([...new Set(days)].sort((a, b) => order(a) - order(b)).map((d) => weekdayName(locale, d))) });
    if (rule.monthDays.length || rule.months.length || nth.length) own = true;
  } else if (rule.frequency === 'monthly') {
    if (nth.length === 1 && !plain.length && !rule.monthDays.length) {
      text = t('recurrenceSummaryOnNth', { rule: text, nth: ordinal(nth[0].nth), weekday: weekdayName(locale, nth[0].day) });
    } else if (!rule.weekdays.length) {
      const day = rule.monthDays[0] ?? start?.getDate();
      if (day === -1) text = t('recurrenceSummaryOnLastDay', { rule: text });
      else if (day !== undefined && day > 0) text = t('recurrenceSummaryOnDay', { rule: text, day });
      else own = true;
    } else own = true;
    if (rule.months.length) own = true;
  } else {
    const month = rule.months[0] ?? (start ? start.getMonth() + 1 : 1);
    if (nth.length === 1 && !plain.length && !rule.monthDays.length) {
      text = t('recurrenceSummaryOnNthOf', { rule: text, nth: ordinal(nth[0].nth), weekday: weekdayName(locale, nth[0].day), month: monthName(locale, month) });
    } else if (!rule.weekdays.length && (rule.monthDays[0] ?? 1) > 0) {
      const day = rule.monthDays[0] ?? start?.getDate() ?? 1;
      const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(Date.UTC(2024, month - 1, day));
      text = t('recurrenceSummaryOnDate', { rule: text, date });
    } else own = true;
  }
  if (rule.count !== null) text = t('recurrenceSummaryCount', { rule: text, count: rule.count });
  else if (rule.until) {
    const date = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: rule.until.utc && !rule.until.dateOnly ? options.timeZone || undefined : 'UTC',
    }).format(rule.until.time);
    text = t('recurrenceSummaryUntil', { rule: text, date });
  }
  return own ? t('recurrenceSummaryCustom', { rule: text }) : text;
}
