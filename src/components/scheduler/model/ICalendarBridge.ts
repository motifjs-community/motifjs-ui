import { TimeZone } from '../../../parts/dates/time-zone';
import type { ICalendarDate } from '../../../parts/icalendar/icalendar-date';
import type { ICalendarEvent } from '../../../parts/icalendar/icalendar-event';
import { icalendarMoment } from '../../../parts/icalendar/icalendar-moment';
import { parseICalendar } from '../../../parts/icalendar/parse-icalendar';
import { writeICalendar } from '../../../parts/icalendar/write-icalendar';
import { addRuleDate } from '../../../parts/recurrence/add-rule-date';
import { formatRecurrenceRule } from '../../../parts/recurrence/format-recurrence-rule';
import { formatRuleDate } from '../../../parts/recurrence/format-rule-date';
import { parseRecurrenceRule } from '../../../parts/recurrence/parse-recurrence-rule';
import { readRuleDates } from '../../../parts/recurrence/read-rule-dates';
import type { AppointmentEditor } from '../AppointmentEditor';
import type { ICalendarImportResult } from '../icalendar-import-result';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerRange } from '../scheduler-range';
import type { AppointmentStore } from './AppointmentStore';
import type { SchedulerModel } from './SchedulerModel';
import { toDate } from './to-date';

/** What the bridge uses of its scheduler. */
export interface ICalendarBridgeOptions<T> {
  model: SchedulerModel<T>;
  store: AppointmentStore<T>;
  editor: AppointmentEditor<T>;
  fields: () => SchedulerFields;
  items: () => readonly T[];
  timeZone: () => string | null;
  hasSource: () => boolean;
}

type Row = Record<string, unknown>;

/**
 * Turns appointments into iCalendar events and back (RFC 5545). A timed appointment is written on
 * its own zone's clock (else the scheduler's, else the browser's) with that zone's `VTIMEZONE`, an
 * all-day one as dates; a series with its rule (`UNTIL` in UTC, as the RFC asks) and the times left
 * out; an occurrence changed apart under its series' UID with the time it replaces (`RECURRENCE-ID`:
 * the left-out time of the series nearest to it). Read back, every event is an appointment's values;
 * adding them goes through the editor, so the data layer and the events see them as any other.
 */
export class ICalendarBridge<T> {
  /** The UID each value read came from, and the series UID of an occurrence changed apart. */
  private readonly uids = new WeakMap<object, string>();
  private readonly seriesUids = new WeakMap<object, string>();

  constructor(private readonly options: ICalendarBridgeOptions<T>) {}

  /** The appointments with a part in `range` (a series with an occurrence in it), or all of them. */
  appointmentsIn(range: SchedulerRange | null): T[] {
    const { model, fields } = this.options;
    const all = this.options.items().filter((item) => (item as Row)?.[fields().visible] !== false);
    if (!range) return [...all];
    const from = range.start.getTime();
    const to = range.end.getTime();
    return all.filter((item) => {
      if (model.occurrences.ruleOf(item)) return model.occurrences.of(item, from, to).some((o) => this.touches(o, from, to));
      return this.touches(item, from, to);
    });
  }

  write(appointments: readonly T[], name: string): string {
    const claimed = new Set<string>();
    const events = appointments.map((item) => this.eventOf(item, claimed)).filter((e): e is ICalendarEvent => !!e);
    return writeICalendar({ events, name });
  }

  /** The values of the appointments a file holds: the series and single ones first, then the occurrences changed apart. */
  read(text: string): Partial<T>[] {
    const calendar = parseICalendar(text);
    const f = this.options.fields();
    const fallback = this.options.timeZone() || calendar.timeZone || null;
    const own = this.options.timeZone() || TimeZone.localName();
    const byUid = new Map<string, Row>();
    const main: Row[] = [];
    const apart: { event: ICalendarEvent; values: Row }[] = [];
    const moment = (d: ICalendarDate) => icalendarMoment(d, calendar.timeZones, fallback);
    for (const event of calendar.events) {
      const allDay = event.start.dateOnly;
      const start = allDay ? TimeZone.localOfWall(event.start.time) : new Date(moment(event.start));
      const endDate = event.end ?? event.start;
      const end = allDay ? TimeZone.localOfWall(event.end ? event.end.time : event.start.time + 86_400_000) : new Date(moment(endDate));
      const values: Row = { [f.text]: event.summary, [f.start]: start, [f.end]: end, [f.allDay]: allDay };
      if (event.description) values[f.description] = event.description;
      const zone = event.start.zone && TimeZone.isValid(event.start.zone) && event.start.zone !== own ? event.start.zone : '';
      if (zone && !allDay) values[f.startTimeZone] = zone;
      const endZone = event.end?.zone && TimeZone.isValid(event.end.zone) && event.end.zone !== (zone || own) ? event.end.zone : '';
      if (endZone && !allDay) values[f.endTimeZone] = endZone;
      if (event.rule) values[f.recurrenceRule] = event.rule;
      if (event.exceptions.length) values[f.recurrenceException] = event.exceptions.map((d) => formatRuleDate(this.inZone(d, zone || own, moment))).join(',');
      if (event.recurrenceId) {
        apart.push({ event, values });
        continue;
      }
      if (event.status === 'CANCELLED') continue;
      this.uids.set(values, event.uid);
      if (!this.options.hasSource()) values[f.key] = event.uid;
      byUid.set(event.uid, values);
      main.push(values);
    }
    const out: Row[] = [...main];
    for (const { event, values } of apart) {
      const series = byUid.get(event.uid);
      const id = event.recurrenceId!;
      // The time it replaces is left out of its series.
      if (series) {
        const zone = String(series[f.startTimeZone] || own);
        const left = readRuleDates(series[f.recurrenceException]);
        const at = this.inZone(id, zone, moment);
        if (!left.some((d) => d.time === at.time && d.utc === at.utc)) series[f.recurrenceException] = addRuleDate(series[f.recurrenceException], at);
      }
      if (event.status === 'CANCELLED') continue;
      delete values[f.recurrenceRule];
      delete values[f.recurrenceException];
      values[f.recurrenceId] = event.uid;
      this.seriesUids.set(values, event.uid);
      if (!this.options.hasSource()) values[f.key] = `${event.uid}/${formatRuleDate(id)}`;
      out.push(values);
    }
    return out as Partial<T>[];
  }

  /** Adds each appointment (one whose key is there already is changed); an occurrence changed apart names its series by the key it was saved with. */
  async save(appointments: readonly Partial<T>[]): Promise<ICalendarImportResult<T>> {
    const { editor, store, fields } = this.options;
    const f = fields();
    const keys = new Map<string, unknown>();
    const result: ICalendarImportResult<T> = { added: [], updated: [], failed: [] };
    for (const values of appointments) {
      const row = values as Row;
      const seriesUid = this.seriesUids.get(values);
      if (seriesUid !== undefined && keys.has(seriesUid)) row[f.recurrenceId] = keys.get(seriesUid);
      const key = row[f.key];
      const existing = key === undefined ? undefined : this.options.items().find((item) => (item as Row)?.[f.key] === key);
      if (existing) {
        if (await editor.update(existing, values, false)) result.updated.push(existing);
        else result.failed.push(values);
        continue;
      }
      const saved = await editor.add(values, false);
      if (!saved) {
        result.failed.push(values);
        continue;
      }
      result.added.push(saved);
      const uid = this.uids.get(values);
      if (uid !== undefined) keys.set(uid, store.keyOf(saved));
    }
    return result;
  }

  // Inside.

  private touches(item: T, from: number, to: number): boolean {
    const time = this.options.model.timeOf(item);
    if (!time) return false;
    const start = time.start.getTime();
    const end = time.end.getTime();
    return start < to && (end > from || (end === start && start >= from));
  }

  private eventOf(item: T, claimed: Set<string>): ICalendarEvent | null {
    const { model, store } = this.options;
    const f = this.options.fields();
    const row = item as Row;
    const start = toDate(row[f.start]);
    if (!start) return null;
    const end = toDate(row[f.end]) ?? start;
    const allDay = !!row[f.allDay];
    const zone = String(row[f.startTimeZone] || this.options.timeZone() || TimeZone.localName());
    const endZone = String(row[f.endTimeZone] || zone);
    const at = (moment: Date, name: string): ICalendarDate => ({ time: TimeZone.of(name).wall(moment), utc: false, dateOnly: false, zone: name });
    const day = (local: Date): ICalendarDate => ({ time: TimeZone.wallOfLocal(local), utc: false, dateOnly: true, zone: '' });
    const event: ICalendarEvent = {
      uid: String(store.keyOf(item) ?? ''),
      start: allDay ? day(start) : at(start, zone),
      end: allDay ? day(end > start ? end : new Date(start.getTime() + 86_400_000)) : at(end < start ? start : end, endZone),
      summary: String(row[f.text] ?? ''),
      description: String(row[f.description] ?? ''),
      location: '',
      rule: '',
      exceptions: [],
      recurrenceId: null,
      status: '',
      stamp: null,
      sequence: null,
      other: [],
    };
    const found = model.occurrences.ruleOf(item);
    if (found) {
      const rule = { ...found };
      // With a time and a zone, the RFC wants UNTIL in UTC.
      if (rule.until && !rule.until.utc && !rule.until.dateOnly && !allDay) rule.until = { time: TimeZone.of(zone).moment(rule.until.time), utc: true, dateOnly: false };
      event.rule = formatRecurrenceRule(rule);
      event.exceptions = readRuleDates(row[f.recurrenceException]).map((d) =>
        allDay ? { time: d.utc ? model.zone.wall(d.time) : d.time, utc: false, dateOnly: true, zone: '' } : { ...d, dateOnly: false, zone: d.utc ? '' : zone },
      );
    }
    if (model.isException(item)) {
      const series = model.seriesOf(item);
      if (series) {
        event.uid = String(store.keyOf(series) ?? event.uid);
        event.recurrenceId = this.replaced(series, start, allDay, claimed);
      }
    }
    return event;
  }

  /** The time an occurrence changed apart replaces: the left-out time of its series nearest to it (not taken by another). */
  private replaced(series: T, start: Date, allDay: boolean, claimed: Set<string>): ICalendarDate {
    const { model } = this.options;
    const f = this.options.fields();
    const row = series as Row;
    const zone = String(row[f.startTimeZone] || this.options.timeZone() || TimeZone.localName());
    const clock = TimeZone.of(zone);
    const key = String(this.options.store.keyOf(series));
    let best: { date: ICalendarDate; far: number; id: string } | null = null;
    for (const d of readRuleDates(row[f.recurrenceException])) {
      const moment = d.utc ? d.time : allDay || d.dateOnly ? model.zone.moment(d.time) : clock.moment(d.time);
      const id = `${key}|${moment}`;
      if (claimed.has(id)) continue;
      const far = Math.abs(moment - start.getTime());
      if (best && best.far <= far) continue;
      const date: ICalendarDate = allDay ? { time: model.zone.wall(moment), utc: false, dateOnly: true, zone: '' } : { time: clock.wall(moment), utc: false, dateOnly: false, zone };
      best = { date, far, id };
    }
    if (best) {
      claimed.add(best.id);
      return best.date;
    }
    return allDay ? { time: TimeZone.wallOfLocal(start), utc: false, dateOnly: true, zone: '' } : { time: clock.wall(start), utc: false, dateOnly: false, zone };
  }

  /** A date of a file on the wall clock of `zone` (a date only stays one). */
  private inZone(date: ICalendarDate, zone: string, moment: (d: ICalendarDate) => number): ICalendarDate {
    if (date.dateOnly) return { ...date, utc: false, zone: '' };
    return { time: TimeZone.of(zone).wall(moment(date)), utc: false, dateOnly: false, zone };
  }
}
