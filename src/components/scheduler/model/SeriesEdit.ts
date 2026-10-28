import { dayStart } from '../../../parts/dates/day-start';
import { TimeZone } from '../../../parts/dates/time-zone';
import { addRuleDate } from '../../../parts/recurrence/add-rule-date';
import { filterRuleDates } from '../../../parts/recurrence/filter-rule-dates';
import { formatRecurrenceRule } from '../../../parts/recurrence/format-recurrence-rule';
import type { RecurrenceRule } from '../../../parts/recurrence/recurrence-rule';
import { recurrenceDates } from '../../../parts/recurrence/recurrence-dates';
import type { RuleDate } from '../../../parts/recurrence/rule-date';
import type { SchedulerFields } from '../scheduler-fields';
import type { OccurrenceInfo } from './occurrence-info';
import type { Occurrences } from './Occurrences';
import type { SeriesPlan } from './series-plan';
import type { SeriesScope } from './series-scope';
import { toDate } from './to-date';

const DAY = 86_400_000;

/** What the series edits read from their scheduler. */
export interface SeriesEditOptions<T> {
  fields: () => SchedulerFields;
  occurrences: Occurrences<T>;
  /** The key an occurrence changed apart from its series names that series by. */
  keyOf: (item: T) => unknown;
}

/**
 * What a change to an occurrence of a series comes to, without writing it:
 * - this occurrence: a new appointment in its place (naming its series by `recurrenceId`) and its
 *   time left out of the series (`EXDATE`);
 * - this and the following: the series ends before it (`UNTIL`, or a smaller `COUNT`) and a new
 *   series starts from it, with the change;
 * - the whole series: the series takes the change; a time moved moves every occurrence by as much
 *   (a weekly series moved to another day moves its weekdays too).
 * Deleting works the same way. Changing the first occurrence and the ones after it is the whole series.
 */
export class SeriesEdit<T> {
  constructor(private readonly options: SeriesEditOptions<T>) {}

  update(occurrence: T, changes: Partial<T>, scope: SeriesScope): SeriesPlan<T> {
    const info = this.options.occurrences.infoOf(occurrence);
    if (!info) return { add: [], update: [{ item: occurrence, changes }], remove: [] };
    const fields = this.options.fields();
    const series = info.series;
    const own = changes as Record<string, unknown>;
    if (scope === 'following' && this.isFirst(info)) scope = 'series';
    if (scope === 'occurrence') {
      const single = this.copy(occurrence);
      const key = this.options.keyOf(series);
      if (key !== undefined && key !== null) single[fields.recurrenceId] = key;
      for (const [name, value] of Object.entries(own)) if (name !== fields.recurrenceRule && name !== fields.recurrenceException) single[name] = value;
      return { add: [single as Partial<T>], update: [{ item: series, changes: this.leaveOut(series, info) }], remove: [] };
    }
    if (scope === 'series') return { add: [], update: [{ item: series, changes: this.moved(series, occurrence, changes) }], remove: [] };
    const next = this.copy(occurrence);
    const rule = this.options.occurrences.ruleOf(series)!;
    next[fields.recurrenceRule] = formatRecurrenceRule(this.rest(series, info, rule));
    next[fields.recurrenceException] = filterRuleDates((series as Record<string, unknown>)[fields.recurrenceException], (d) => !this.before(d, info, series));
    Object.assign(next, own);
    if (own[fields.recurrenceRule] === undefined) {
      const days = this.dayShift(occurrence, changes);
      if (days) next[fields.recurrenceRule] = formatRecurrenceRule(shiftDays(this.options.occurrences.ruleOf(next as T) ?? rule, days));
    }
    return { add: [next as Partial<T>], update: [{ item: series, changes: this.ended(series, info, rule) }], remove: [] };
  }

  /** `exceptions`: the occurrences changed apart from the series (they go with it). */
  remove(occurrence: T, scope: SeriesScope, exceptions: readonly T[] = []): SeriesPlan<T> {
    const info = this.options.occurrences.infoOf(occurrence);
    if (!info) return { add: [], update: [], remove: [occurrence] };
    const series = info.series;
    if (scope === 'following' && this.isFirst(info)) scope = 'series';
    if (scope === 'occurrence') return { add: [], update: [{ item: series, changes: this.leaveOut(series, info) }], remove: [] };
    if (scope === 'series') return { add: [], update: [], remove: [series, ...exceptions] };
    const start = this.options.fields().start;
    const later = exceptions.filter((e) => (toDate((e as Record<string, unknown>)[start])?.getTime() ?? 0) >= info.start.getTime());
    return { add: [], update: [{ item: series, changes: this.ended(series, info, this.options.occurrences.ruleOf(series)!) }], remove: later };
  }

  // Inside.

  private allDay(item: T): boolean {
    return !!(item as Record<string, unknown>)?.[this.options.fields().allDay];
  }

  /** A wall clock time of a start or an end: an all-day one's by its fields, a timed one's on the series' clock. */
  private wallOf(value: Date, allDay: boolean, zone: TimeZone): number {
    return allDay ? TimeZone.wallOfLocal(value) : zone.wall(value);
  }

  private isFirst(info: OccurrenceInfo<T>): boolean {
    const start = toDate((info.series as Record<string, unknown>)[this.options.fields().start]);
    if (!start) return true;
    return this.allDay(info.series) ? dayStart(start).getTime() === dayStart(info.start).getTime() : start.getTime() === info.start.getTime();
  }

  /** The occurrence's time as an exception date of its series. */
  private dateOf(info: OccurrenceInfo<T>): RuleDate {
    return this.allDay(info.series)
      ? { time: TimeZone.wallOfLocal(dayStart(info.start)), utc: false, dateOnly: true }
      : { time: info.start.getTime(), utc: true, dateOnly: false };
  }

  /** Whether an exception date of a series is before an occurrence. */
  private before(date: RuleDate, info: OccurrenceInfo<T>, series: T): boolean {
    if (date.utc) return date.time < info.start.getTime();
    const wall = this.allDay(series) ? TimeZone.wallOfLocal(info.start) : this.options.occurrences.zoneOf(series).wall(info.start);
    return date.dateOnly ? date.time < Math.floor(wall / DAY) * DAY : date.time < wall;
  }

  private leaveOut(series: T, info: OccurrenceInfo<T>): Partial<T> {
    const field = this.options.fields().recurrenceException;
    return { [field]: addRuleDate((series as Record<string, unknown>)[field], this.dateOf(info)) } as Partial<T>;
  }

  /** How many times the rule happens before an occurrence (they count, left out or not). */
  private countBefore(series: T, info: OccurrenceInfo<T>, rule: RecurrenceRule): number {
    const start = toDate((series as Record<string, unknown>)[this.options.fields().start])!;
    const allDay = this.allDay(series);
    const zone = this.options.occurrences.zoneOf(series);
    const first = this.wallOf(start, allDay, zone);
    return recurrenceDates(rule, first, first, this.wallOf(info.start, allDay, zone), { wallOf: (m) => zone.wall(m) }).length;
  }

  /** The series' changes so it ends before an occurrence: a smaller count, or an end just before it. */
  private ended(series: T, info: OccurrenceInfo<T>, rule: RecurrenceRule): Partial<T> {
    const fields = this.options.fields();
    const ends: RecurrenceRule = { ...rule };
    if (rule.count !== null) ends.count = Math.max(1, this.countBefore(series, info, rule));
    else
      ends.until = this.allDay(series)
        ? { time: TimeZone.wallOfLocal(dayStart(info.start)) - DAY, utc: false, dateOnly: true }
        : { time: info.start.getTime() - 1000, utc: true, dateOnly: false };
    const exceptions = filterRuleDates((series as Record<string, unknown>)[fields.recurrenceException], (d) => this.before(d, info, series));
    return { [fields.recurrenceRule]: formatRecurrenceRule(ends), [fields.recurrenceException]: exceptions } as Partial<T>;
  }

  /** The rule of the series that goes on from an occurrence: what is left of its count. */
  private rest(series: T, info: OccurrenceInfo<T>, rule: RecurrenceRule): RecurrenceRule {
    if (rule.count === null) return { ...rule };
    return { ...rule, count: Math.max(1, rule.count - this.countBefore(series, info, rule)) };
  }

  /** Days a change moves an occurrence by (on its clock). */
  private dayShift(occurrence: T, changes: Partial<T>): number {
    const fields = this.options.fields();
    const own = changes as Record<string, unknown>;
    const record = occurrence as Record<string, unknown>;
    const from = toDate(record[fields.start]);
    const to = toDate(own[fields.start] ?? record[fields.start]);
    if (!from || !to) return 0;
    const zone = this.options.occurrences.zoneOf(occurrence);
    const allDay = !!record[fields.allDay];
    const nowAllDay = own[fields.allDay] === undefined ? allDay : !!own[fields.allDay];
    return Math.floor(this.wallOf(to, nowAllDay, zone) / DAY) - Math.floor(this.wallOf(from, allDay, zone) / DAY);
  }

  /** The changes of the whole series for a change made on one occurrence: times move by as much as that one's did. */
  private moved(series: T, occurrence: T, changes: Partial<T>): Partial<T> {
    const fields = this.options.fields();
    const own = changes as Record<string, unknown>;
    const out: Record<string, unknown> = { ...own };
    if (own[fields.start] === undefined && own[fields.end] === undefined && own[fields.allDay] === undefined) return out as Partial<T>;
    const record = occurrence as Record<string, unknown>;
    const zone = this.options.occurrences.zoneOf(series);
    const wasAllDay = !!record[fields.allDay];
    const allDay = own[fields.allDay] === undefined ? wasAllDay : !!own[fields.allDay];
    const from = toDate(record[fields.start])!;
    const start = toDate(own[fields.start] ?? record[fields.start])!;
    const end = toDate(own[fields.end] ?? record[fields.end]) ?? start;
    const shift = this.wallOf(start, allDay, zone) - this.wallOf(from, wasAllDay, zone);
    const seriesStart = toDate((series as Record<string, unknown>)[fields.start])!;
    const first = this.wallOf(seriesStart, this.allDay(series), zone) + shift;
    out[fields.start] = allDay ? TimeZone.localOfWall(first) : zone.date(first);
    out[fields.end] = allDay
      ? TimeZone.localOfWall(first + (TimeZone.wallOfLocal(end) - TimeZone.wallOfLocal(start)))
      : new Date((out[fields.start] as Date).getTime() + (end.getTime() - start.getTime()));
    const days = this.dayShift(occurrence, changes);
    const rule = this.options.occurrences.ruleOf(series);
    if (days && rule && own[fields.recurrenceRule] === undefined) out[fields.recurrenceRule] = formatRecurrenceRule(shiftDays(rule, days));
    return out as Partial<T>;
  }

  /** An occurrence's fields as a new appointment's: without the key, the rule and the exceptions. */
  private copy(occurrence: T): Record<string, unknown> {
    const fields = this.options.fields();
    const out = { ...(occurrence as Record<string, unknown>) };
    delete out[fields.key];
    delete out[fields.recurrenceRule];
    delete out[fields.recurrenceException];
    delete out[fields.recurrenceId];
    return out;
  }
}

/** A rule moved by some days: its weekdays (every Monday, the 2nd Monday) and a single day of the month go with it. */
function shiftDays(rule: RecurrenceRule, days: number): RecurrenceRule {
  const out: RecurrenceRule = { ...rule };
  if (rule.weekdays.length && rule.frequency !== 'daily') out.weekdays = rule.weekdays.map((w) => ({ ...w, day: (((w.day + days) % 7) + 7) % 7 }));
  if (rule.monthDays.length === 1 && rule.monthDays[0] > 0 && !rule.weekdays.length) {
    const day = rule.monthDays[0] + days;
    if (day >= 1 && day <= 31) out.monthDays = [day];
  }
  return out;
}
