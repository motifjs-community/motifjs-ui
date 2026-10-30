import { untracked } from '@motifx/core';
import { givenField } from '../../../core/given-field';
import { TimeZone } from '../../../parts/dates/time-zone';
import { parseRecurrenceRule } from '../../../parts/recurrence/parse-recurrence-rule';
import { readRuleDates } from '../../../parts/recurrence/read-rule-dates';
import type { RecurrenceRule } from '../../../parts/recurrence/recurrence-rule';
import { recurrenceDates } from '../../../parts/recurrence/recurrence-dates';
import type { SchedulerFields } from '../scheduler-fields';
import type { OccurrenceInfo } from './occurrence-info';
import { toDate } from './to-date';

const DAY = 86_400_000;
/** Rules read, by their text, before the cache starts again. */
const KEEP_RULES = 500;

/** What the occurrences read from their scheduler. */
export interface OccurrencesOptions<T> {
  fields: () => SchedulerFields;
  /** The scheduler's time zone: a series without one of its own repeats on its clock. */
  zone: () => TimeZone;
  idOf: (item: T) => string;
}

/**
 * The occurrences of the series among the appointments: each a plain object of the kit's with the
 * series' fields and its own start and end, made once and kept while it is asked for again (so its
 * box stays the same). A series repeats on the wall clock of its start's time zone (or the
 * scheduler's), so it keeps its hour over summer time; an all-day series keeps its days. Times in
 * its exception field are left out. The series' fields are read as they are, plain or reactive.
 */
export class Occurrences<T> {
  private readonly rules = new Map<string, RecurrenceRule | null>();
  private readonly made = new Map<string, T>();
  private readonly used = new Set<string>();
  /** Where each occurrence comes from. */
  private readonly info = new WeakMap<object, OccurrenceInfo<T>>();

  constructor(private readonly options: OccurrencesOptions<T>) {}

  /** The rule of a series, or `null` for an appointment that happens once (or whose rule cannot be followed). */
  ruleOf(item: T): RecurrenceRule | null {
    const text = givenField(item, this.options.fields().recurrenceRule);
    if (typeof text !== 'string' || !text.trim()) return null;
    if (this.rules.has(text)) return this.rules.get(text)!;
    const rule = parseRecurrenceRule(text);
    if (this.rules.size > KEEP_RULES) this.rules.clear();
    this.rules.set(text, rule);
    return rule;
  }

  /** Where an occurrence comes from; `null` for anything else. */
  infoOf(item: T): OccurrenceInfo<T> | null {
    return item !== null && typeof item === 'object' ? (this.info.get(item) ?? null) : null;
  }

  /** The time zone a series repeats in. */
  zoneOf(item: T): TimeZone {
    const name = givenField(item, this.options.fields().startTimeZone);
    return typeof name === 'string' && name ? TimeZone.of(name) : this.options.zone();
  }

  /** The occurrences of a series that start before `to` and may reach `from` (the caller keeps the ones that touch). */
  of(series: T, from: number, to: number): T[] {
    const rule = this.ruleOf(series);
    const fields = this.options.fields();
    const start = toDate(givenField(series, fields.start));
    if (!rule || !start) return [];
    const end = toDate(givenField(series, fields.end)) ?? start;
    const skipped = readRuleDates(givenField(series, fields.recurrenceException));
    const zone = this.options.zone();
    const out: T[] = [];
    const id = this.options.idOf(series);
    if (givenField(series, fields.allDay)) {
      // An all-day series keeps its days, whatever the clock: its dates are the fields of its start.
      const length = Math.max(0, TimeZone.wallOfLocal(end) - TimeZone.wallOfLocal(start));
      const walls = recurrenceDates(rule, TimeZone.wallOfLocal(start), zone.wall(from) - length - DAY, zone.wall(to) + DAY, {
        wallOf: (moment) => zone.wall(moment),
      });
      for (const wall of walls) {
        const day = Math.floor(wall / DAY);
        if (skipped.some((d) => Math.floor((d.utc ? zone.wall(d.time) : d.time) / DAY) === day)) continue;
        out.push(this.make(series, id, TimeZone.localOfWall(wall), TimeZone.localOfWall(wall + length)));
      }
      return out;
    }
    const own = this.zoneOf(series);
    const length = Math.max(0, end.getTime() - start.getTime());
    const walls = recurrenceDates(rule, own.wall(start), own.wall(from) - length - DAY, own.wall(to) + DAY, { wallOf: (moment) => own.wall(moment) });
    for (const wall of walls) {
      const moment = own.moment(wall);
      const left = skipped.some((d) =>
        d.utc ? Math.abs(d.time - moment) < 1000 : d.dateOnly ? Math.floor(d.time / DAY) === Math.floor(wall / DAY) : Math.abs(d.time - wall) < 1000,
      );
      if (!left) out.push(this.make(series, id, new Date(moment), new Date(moment + length)));
    }
    return out;
  }

  /** Forgets the occurrences not asked for since the last call (made again when they are). */
  sweep(): void {
    for (const id of this.made.keys()) if (!this.used.has(id)) this.made.delete(id);
    this.used.clear();
  }

  /** The occurrence object, kept by its series and start: its fields follow the series' each time it is read. */
  private make(series: T, seriesId: string, start: Date, end: Date): T {
    const fields = this.options.fields();
    const id = `${seriesId}~${start.getTime()}`;
    this.used.add(id);
    const values = untracked(() => ({ ...(series as object), [fields.start]: start, [fields.end]: end })) as Record<string, unknown>;
    let occurrence = this.made.get(id) as Record<string, unknown> | undefined;
    if (!occurrence) {
      occurrence = { ...values };
      this.info.set(occurrence, { series, start, id });
      this.made.set(id, occurrence as T);
      return occurrence as T;
    }
    this.info.get(occurrence)!.series = series;
    for (const [key, value] of Object.entries(values)) {
      const old = occurrence[key];
      if (old instanceof Date && value instanceof Date ? old.getTime() !== value.getTime() : old !== value) occurrence[key] = value;
    }
    return occurrence as T;
  }
}
