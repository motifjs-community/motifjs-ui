import { effect, reactive, untracked } from '@motifx/core';
import { dayStart } from '../../../parts/dates/day-start';
import { TimeZone } from '../../../parts/dates/time-zone';
import type { SchedulerBlockedTime } from '../scheduler-blocked-time';
import type { SchedulerCell } from '../scheduler-cell';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerRange } from '../scheduler-range';
import type { SchedulerTimeCheck } from '../scheduler-time-check';
import type { AgendaDay } from './agenda-day';
import type { AgendaPiece } from './agenda-piece';
import { blockedSpans, type BlockedSpan } from './blocked-spans';
import type { CellPlace } from './cell-place';
import type { ColumnEdge } from './column-edge';
import type { DayBlock } from './day-block';
import type { GroupResource } from './group-resource';
import type { Draft } from './draft';
import type { HeaderCell } from './header-cell';
import type { HeaderRow } from './header-row';
import type { LinePiece } from './line-piece';
import { makeGroups } from './make-groups';
import type { OccurrenceInfo } from './occurrence-info';
import { Occurrences } from './Occurrences';
import type { OverlapMode } from './overlap-mode';
import { placeLanes, type LaneSpan } from './place-lanes';
import { placeStack, type StackSpan } from './place-stack';
import { placeTimed, type TimedSpan } from './place-timed';
import type { ResolvedView } from './resolved-view';
import type { ResourceKind } from './ResourceKind';
import type { Resources } from './Resources';
import { sameValue } from './same-value';
import type { ScaleCell } from './scale-cell';
import type { SchedulerColumn } from './scheduler-column';
import type { SchedulerDay } from './scheduler-day';
import type { SchedulerGroup } from './scheduler-group';
import type { StripPiece } from './strip-piece';
import type { StripRow } from './strip-row';
import type { TimeSlot } from './time-slot';
import type { TimeTick } from './time-tick';
import type { TimedPiece } from './timed-piece';
import type { TimelineRow } from './timeline-row';
import { toDate } from './to-date';
import { viewDates } from './view-dates';
import { dayCells, viewKind, type ViewKind } from './view-kind';

const DAY = 86_400_000;
const MINUTE = 60_000;
/** Past this many cells a view set to `scrolling: 'auto'` builds only what is in view. */
const VIRTUAL_CELLS = 2000;

/** A rule of the developer's: whether an appointment may be at a time. */
export type TimeRule<T> = (check: SchedulerTimeCheck<T>) => boolean;

/** What the model reads from its scheduler. Each is read in an effect, so a reactive source is followed. */
export interface SchedulerModelOptions<T> {
  /** The date the view is built around. */
  date: () => Date;
  items: () => readonly T[];
  fields: () => SchedulerFields;
  view: () => ResolvedView;
  firstDayOfWeek: () => number;
  workDays: () => readonly number[];
  isHoliday: () => ((date: Date) => boolean) | null;
  overlapMode: () => OverlapMode;
  /** The lines a week of the month and the all-day panel have room for (measured); `Infinity` before. */
  room: () => { month: number; allDay: number };
  /** An appointment being moved or resized, shown where it would go. */
  draft?: () => Draft<T> | null;
  /** The clock the days and hours are on. Default: the browser's. */
  zone?: () => TimeZone;
  /** The resource kinds: the colours they give, and the groups of the columns. */
  resources?: Resources;
  /** The scheduler's work hours (a resource's own win). Default 9 to 17. */
  workHours?: () => { start: number; end: number };
  blockedTimes?: () => readonly SchedulerBlockedTime[];
  /** Whether an appointment may overlap another in its group; or a rule that decides the whole check. Default `true`. */
  allowOverlap?: () => boolean | TimeRule<T>;
  /** Whether an appointment may be outside the work hours. Default `true`. */
  allowOffHours?: () => boolean;
  /** A timeline row's sizes in pixels (measured): a lane, the gap around lanes, the least a row is. */
  lineMetrics?: () => { lane: number; gap: number; min: number };
}

/** An appointment as the layout reads it. */
interface Entry<T> {
  id: string;
  item: T;
  start: Date;
  end: Date;
  /** Its start and end on the wall clock (milliseconds of UTC with the clock's fields): where it is placed. */
  ws: number;
  we: number;
  allDay: boolean;
  draft: boolean;
  invalid: boolean;
  /** Its resource values, by field (where a draft would put it, for the draft). */
  values: Record<string, unknown[]>;
  /** What its box writes and paints, read here so a plain object's change reaches the box too. */
  text: string;
  /** Its own colour; a box without one takes its resources'. */
  color: string;
  disabled: boolean;
  series: boolean;
  exception: boolean;
}

interface ModelState<T> {
  /** Now, in milliseconds; moved on by the scheduler's clock. */
  now: number;
  days: SchedulerDay[];
  /** The groups of the columns; none without `groups`. */
  groups: SchedulerGroup[];
  /** The columns: each day, in each group (in the month, over all the weeks). */
  columns: SchedulerColumn[];
  /** The heads of the dates (the weekdays in the month) and the rows of group heads, outer first. */
  dates: HeaderCell[];
  heads: HeaderRow[];
  slots: TimeSlot[];
  /** The timed pieces of every column, in one list: a piece keeps its object (and its box) when it moves to another column. */
  timed: TimedPiece<T>[];
  allDay: StripRow<T>;
  weeks: StripRow<T>[];
  /** The cell with keyboard focus, and the other end of the selection. */
  focus: CellPlace;
  anchor: CellPlace | null;
  /** The appointments shown, in time order. */
  shown: T[];
  /** A timeline's cells along the time, its rows (a group each), and the heads over the cells: days or months over hours or days. */
  ticks: TimeTick[];
  rows: TimelineRow<T>[];
  upper: ScaleCell[];
  lower: ScaleCell[];
  /** The agenda's days (in each group), with their appointments. */
  agenda: AgendaDay<T>[];
  /** What a big view builds: the columns of the day views, or the cells along a timeline's time, from `first`. */
  window: { first: number; count: number };
  /** Moves on each time the appointments of the days shown are read again. */
  revision: number;
}

/**
 * The scheduler without its DOM: the days and times the view shows, the groups of resources its
 * columns are split into, where every appointment goes (filled in place: a day, a column, a cell
 * row and an appointment's piece stay the same objects while they stay on screen), the
 * occurrences of the series in the days shown, the focused cell, the selection and whether a time
 * is free. Days and hours are on the scheduler's clock (its time zone): an appointment is placed
 * by its wall clock times there, so on the day summer time changes an hour is skipped or doubled,
 * and a box never ends before its end's row nor shows shorter than it lasts.
 */
export class SchedulerModel<T> {
  readonly state: ModelState<T>;
  readonly occurrences: Occurrences<T>;
  private readonly timedCache = new Map<string, TimedPiece<T>>();
  private readonly stripCache = new Map<string, StripPiece<T>>();
  /** Group heads by their resources (and date): a head keeps its object while its item is shown. */
  private readonly headCache = new Map<string, HeaderCell>();
  private readonly lineCache = new Map<string, LinePiece<T>>();
  private readonly agendaCache = new Map<string, AgendaPiece<T>>();
  private readonly agendaDays = new Map<string, AgendaDay<T>>();
  private readonly ids = new WeakMap<object, string>();
  private fieldsNow: SchedulerFields | null = null;
  /** The shape of the columns last made: the days, the groups and how they stand. */
  private shape = '';
  /** The resource kinds while a layout runs (read once for all its appointments). */
  private kindsNow: ResourceKind<unknown>[] | null = null;
  /** The timed pieces as written last, with each one's column. */
  private timedRaw: { pieces: TimedPiece<T>[]; columns: number[] } = { pieces: [], columns: [] };
  /** The appointments shown, as written last. */
  private shownRaw: T[] = [];
  /** What was written last into each piece kept, and into each timeline row's list. */
  private readonly written = new WeakMap<object, object>();
  private readonly rowPieces = new WeakMap<object, LinePiece<T>[]>();
  private zoneNow: TimeZone | null = null;
  private nextId = 0;
  private readonly stops: (() => void)[] = [];
  /** The appointments of the days shown, read once for every layout until they change (a drag only adds its draft). */
  private base: Entry<T>[] = [];
  private baseById = new Map<string, Entry<T>>();
  /** The base's appointments by the group they are in, made again when the base or the groups change. */
  private buckets: { revision: number; groups: string; byGroup: Entry<T>[][] } = { revision: -1, groups: '', byGroup: [] };
  /** The groups each appointment read is in, and the groups by their key. */
  private groupsCache = new WeakMap<Entry<T>, { version: number; list: number[] }>();
  private groupIndex: { key: string; version: number; keys: Map<string, number> } = { key: '', version: 0, keys: new Map() };
  /** What the timeline was last laid out for: a draft alone lays out only the rows it touches. */
  private laid: { revision: number; settings: string; draft: Entry<T> | null } = { revision: -1, settings: '', draft: null };

  constructor(private readonly options: SchedulerModelOptions<T>) {
    this.occurrences = new Occurrences<T>({
      fields: () => this.fields(),
      zone: () => this.zone,
      idOf: (item) => this.idOf(item),
    });
    this.state = reactive({
      now: Date.now(),
      days: [],
      groups: [],
      columns: [],
      dates: [],
      heads: [],
      slots: [],
      timed: [],
      allDay: {
        index: 0,
        days: [],
        columns: [],
        pieces: [],
        more: [],
        moreAt: [],
        lanes: 0,
      },
      weeks: [],
      focus: { column: 0, slot: 0 },
      anchor: null,
      shown: [],
      ticks: [],
      rows: [],
      upper: [],
      lower: [],
      agenda: [],
      window: { first: 0, count: 64 },
      revision: 0,
    }) as ModelState<T>;
  }

  /** Starts following the options; call `dispose` to stop. */
  start(): void {
    if (this.stops.length) return;
    if (this.options.resources) this.stops.push(this.options.resources.follow());
    this.stops.push(effect(() => this.fillGroups()));
    this.stops.push(effect(() => this.fillDays()));
    this.stops.push(effect(() => this.fillSlots()));
    this.stops.push(effect(() => this.fillTicks()));
    this.stops.push(effect(() => this.fillRows()));
    this.stops.push(effect(() => this.fillBlocks()));
    this.stops.push(effect(() => this.collect()));
    this.stops.push(effect(() => this.layout()));
  }

  dispose(): void {
    for (const stop of this.stops.splice(0)) stop();
  }

  get view(): ResolvedView {
    return this.options.view();
  }

  /** The layout the view uses. Reactive. */
  get kind(): ViewKind {
    return viewKind(this.view.type);
  }

  /** The scheduler's clock. */
  get zone(): TimeZone {
    return this.zoneNow ?? this.options.zone?.() ?? TimeZone.local;
  }

  /** The fields it reads: while the appointments are read, the ones read at the start (each read of an option has its cost, and the appointments are many). */
  private fields(): SchedulerFields {
    return this.fieldsNow ?? this.options.fields();
  }

  /** Whether the view builds only what is in view: set so, or (`'auto'`) its cells are many. Reactive. */
  get virtual(): boolean {
    const mode = this.view.scrolling ?? 'auto';
    if (mode !== 'auto') return mode === 'virtual';
    const kind = this.kind;
    if (kind === 'timeline') return this.state.rows.length * this.state.ticks.length > VIRTUAL_CELLS;
    if (kind === 'time') return this.state.columns.length * Math.max(1, this.state.slots.length) > VIRTUAL_CELLS;
    return false;
  }

  /** Sets what a big view builds: from `first`, `count` columns (day views) or cells along the time (a timeline). */
  setWindow(first: number, count: number): void {
    const at = Math.max(0, Math.floor(first));
    const size = Math.max(1, Math.ceil(count));
    const now = this.state.window;
    if (now.first !== at || now.count !== size) this.state.window = { first: at, count: size };
  }

  /** The columns the day views build: all of them, or the window's. Reactive. */
  shownColumns(): SchedulerColumn[] {
    const columns = this.state.columns;
    if (this.kind !== 'time' || !this.virtual) return columns;
    const { first, count } = this.state.window;
    return columns.slice(first, first + count);
  }

  /** Whether a run of columns (`first`, `span`) is in what the day views build. Reactive. */
  columnsShown(first: number, span: number): boolean {
    if (this.kind !== 'time' || !this.virtual) return true;
    const { first: from, count } = this.state.window;
    return first < from + count && first + span > from;
  }

  /** The timed pieces the day views build. Reactive. */
  shownTimed(): TimedPiece<T>[] {
    const timed = this.state.timed;
    if (this.kind !== 'time' || !this.virtual) return timed;
    const { first, count } = this.state.window;
    // By the columns written with them: the pieces themselves are not read one by one.
    const { pieces, columns } = this.timedRaw;
    return pieces.filter((_, i) => columns[i] >= first && columns[i] < first + count);
  }

  /** Of heads over runs of columns, in the order of their first column, the ones in what the day views build. Reactive. */
  shownHeads<H extends { first: number; span: number }>(heads: readonly H[]): readonly H[] {
    if (this.kind !== 'time' || !this.virtual) return heads;
    const { first, count } = this.state.window;
    // The first head that ends after the window's start, then on while they start before its end.
    let lo = 0;
    let hi = heads.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (heads[mid].first + heads[mid].span <= first) lo = mid + 1;
      else hi = mid;
    }
    let end = lo;
    while (end < heads.length && heads[end].first < first + count) end++;
    return heads.slice(lo, end);
  }

  /** The cells along a timeline's time it builds. Reactive. */
  shownTicks(): TimeTick[] {
    const ticks = this.state.ticks;
    if (!this.virtual) return ticks;
    const { first, count } = this.state.window;
    return ticks.slice(first, first + count);
  }

  /** Whether a run of a timeline's cells (`from`, `span`, shares of a cell too) is in what it builds. Reactive. */
  ticksShown(from: number, span: number): boolean {
    if (!this.virtual) return true;
    const { first, count } = this.state.window;
    return from < first + count && from + span > first;
  }

  /** Where now is along a timeline, in cells; `null` when it is not in the days and hours shown. Reactive. */
  nowTick(): number | null {
    const today = this.todayWall();
    const day = this.state.days.findIndex((d) => d.wall === today);
    if (day < 0) return null;
    const minutes = (this.zone.wall(this.state.now) - today) / MINUTE;
    if (dayCells(this.view.type)) return day + minutes / (24 * 60);
    const { from, to, step } = this.hours();
    if (minutes < from || minutes > to) return null;
    return day * this.state.slots.length + (minutes - from) / step;
  }

  /** The minutes of the day the time rows show, and the minutes in a row. */
  private hours(): { from: number; to: number; step: number } {
    const view = this.view;
    const from = Math.max(0, Math.min(24, view.startDayHour)) * 60;
    const to = Math.max(from / 60 + 1, Math.min(24, view.endDayHour)) * 60;
    return { from, to, step: Math.max(5, Math.min(240, Math.round(view.cellDuration))) };
  }

  /** Whether the columns are grouped. Reactive. */
  get grouped(): boolean {
    return this.state.groups.length > 0;
  }

  /** The dates stand over the groups: by date, or with a single day. Reactive. */
  get datesFirst(): boolean {
    return this.state.groups.length > 0 && (this.view.groupByDate || this.state.days.length === 1);
  }

  /** The columns of a row of the month (a week), or of the day views. Reactive. */
  get perRow(): number {
    return this.view.type === 'month' ? 7 * Math.max(1, this.state.groups.length) : this.state.columns.length;
  }

  /** The days shown, `end` not included. Reactive. */
  range(): SchedulerRange {
    const days = this.state.days;
    const zone = this.zone;
    if (!days.length) {
      const wall = TimeZone.wallOfLocal(dayStart(this.options.date()));
      return { start: zone.date(wall), end: zone.date(wall + DAY) };
    }
    return { start: days[0].date, end: zone.date(days[days.length - 1].wall + DAY) };
  }

  /** Today's start, in milliseconds. Reactive. */
  today(): number {
    return this.zone.moment(this.todayWall());
  }

  /** Today's start on the wall clock. Reactive. */
  todayWall(): number {
    return Math.floor(this.zone.wall(this.state.now) / DAY) * DAY;
  }

  /** The columns of today, empty when it is not shown. Reactive. */
  todayColumns(): SchedulerColumn[] {
    return this.shownColumns().filter((c) => c.day.today);
  }

  /** Where now is in a day column (0–1), or `null` outside the hours shown. Reactive. */
  nowAt(): number | null {
    const view = this.view;
    const minutes = (this.zone.wall(this.state.now) - this.todayWall()) / MINUTE;
    const from = view.startDayHour * 60;
    const to = view.endDayHour * 60;
    return minutes < from || minutes > to ? null : (minutes - from) / (to - from);
  }

  /** The key the layout uses for an appointment (an occurrence's: its series' and its start). */
  idOf(item: T): string {
    const occurrence = this.occurrences.infoOf(item);
    if (occurrence) return occurrence.id;
    const key = (item as Record<string, unknown>)?.[this.fields().key];
    if (key !== undefined && key !== null) return `k${String(key)}`;
    const object = item as unknown as object;
    let id = this.ids.get(object);
    if (!id) this.ids.set(object, (id = `o${this.nextId++}`));
    return id;
  }

  /** An appointment's start and end, `end` never before `start`. */
  timeOf(item: T): { start: Date; end: Date; allDay: boolean } | null {
    const fields = this.fields();
    const record = item as Record<string, unknown>;
    const start = toDate(record[fields.start]);
    if (!start) return null;
    const end = toDate(record[fields.end]) ?? start;
    const allDay = !!record[fields.allDay];
    const to = end < start ? start : end;
    if (!allDay) return { start, end: to, allDay };
    // An all-day appointment covers its days whole: the days of its fields, on the scheduler's clock.
    const zone = this.zone;
    const first = TimeZone.wallOfLocal(dayStart(start));
    const last = TimeZone.wallOfLocal(dayStart(to));
    return {
      start: zone.date(first),
      end: zone.date(last === TimeZone.wallOfLocal(to) && to > start ? last : last + DAY),
      allDay,
    };
  }

  /** Where an occurrence of a series comes from; `null` for any other appointment. */
  occurrenceOf(item: T): OccurrenceInfo<T> | null {
    return this.occurrences.infoOf(item);
  }

  /** The series of an occurrence (or of one changed apart from it, by its `recurrenceId`), a series itself, or `null`. */
  seriesOf(item: T): T | null {
    const occurrence = this.occurrences.infoOf(item);
    if (occurrence) return occurrence.series;
    if (this.occurrences.ruleOf(item)) return item;
    const fields = this.options.fields();
    const id = (item as Record<string, unknown>)?.[fields.recurrenceId];
    if (id === undefined || id === null || id === '') return null;
    return this.options.items().find((other) => (other as Record<string, unknown>)?.[fields.key] === id) ?? null;
  }

  /** Whether an appointment is an occurrence changed apart from its series. */
  isException(item: T): boolean {
    const id = (item as Record<string, unknown>)?.[this.fields().recurrenceId];
    return !this.occurrences.infoOf(item) && id !== undefined && id !== null && id !== '';
  }

  /** The appointments between `start` and `end` (any part of them); with `group`, the ones in it. */
  appointmentsIn(start: Date, end: Date, group: SchedulerGroup | null = null): T[] {
    return this.entries(start, end)
      .filter((e) => !group || inGroup(e.values, group))
      .map((e) => e.item);
  }

  // Groups and resources.

  /** The group of a column, `null` without groups. Reactive. */
  groupOf(column: number): SchedulerGroup | null {
    return this.state.columns[column]?.group ?? null;
  }

  /** The values an appointment's resource fields would have in another group: only the values of the fields grouped by change (in a list, the one of the group it leaves). */
  movedValues(item: T, from: SchedulerGroup | null, to: SchedulerGroup | null): Record<string, unknown> | null {
    if (!to || !from || to === from) return null;
    const resources = this.options.resources;
    const record = item as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(to.values)) {
      const old = from.values[field];
      if (sameValue(old, value)) continue;
      const kind = resources?.kind(field);
      const current = record?.[field];
      if (kind?.multiple || Array.isArray(current)) {
        const list = Array.isArray(current) ? current : current === undefined || current === null || current === '' ? [] : [current];
        const kept = list.filter((v) => !sameValue(v, old) && !sameValue(v, value));
        const at = list.findIndex((v) => sameValue(v, old));
        kept.splice(at < 0 ? kept.length : Math.min(at, kept.length), 0, value);
        out[field] = kept;
      } else out[field] = value;
    }
    return Object.keys(out).length ? out : null;
  }

  /**
   * Whether an appointment may be at a time (with `resources`, the values its resource fields
   * would have there): not over a blocked time, not outside the work hours unless allowed, not over
   * another appointment of its groups unless allowed; a rule of the developer's decides it all.
   */
  check(item: T, start: Date, end: Date, allDay: boolean, resources: Record<string, unknown> | null = null): { free: boolean; check: SchedulerTimeCheck<T> } {
    const merged = { ...(item as object), ...(resources ?? {}) };
    const values = this.options.resources?.allValuesOf(merged) ?? {};
    const shown: Record<string, unknown> = {};
    for (const field of Object.keys(values)) shown[field] = (merged as Record<string, unknown>)[field];
    const zone = this.zone;
    const ws = zone.wall(start);
    const we = Math.max(ws, zone.wall(end));
    const groups = this.state.groups.filter((g) => inGroup(values, g));
    const id = this.idOf(item);
    // Within the days shown, the appointments are read already.
    const range = this.range();
    const read = this.state.days.length && start >= range.start && end <= range.end ? this.base : this.entries(start, end);
    const overlapping = read
      .filter((e) => !e.draft && e.id !== id && e.start < end && start < e.end)
      .filter((e) => !this.grouped || groups.some((g) => inGroup(e.values, g)))
      .map((e) => e.item);
    const until = Math.max(we, ws + 1);
    const blocked = blockedSpans(this.options.blockedTimes?.() ?? [], ws, until, zone)
      .filter((span) => span.start < until && span.end > ws && blockFor(span.block, values))
      .map((span) => span.block);
    const offHours = this.offHours(ws, we, allDay, values, groups);
    const check: SchedulerTimeCheck<T> = { appointment: item, start, end, allDay, resources: shown, overlapping, blocked: [...new Set(blocked)], offHours };
    const rule = this.options.allowOverlap?.() ?? true;
    if (typeof rule === 'function') return { free: !!rule(check), check };
    const offHoursAllowed = this.options.allowOffHours?.() ?? true;
    const free = !check.blocked.length && (offHoursAllowed || !offHours) && (rule || !overlapping.length);
    return { free, check };
  }

  /** Whether a time is outside the work hours of its groups (without groups: of its resources that have their own, else the scheduler's). */
  private offHours(ws: number, we: number, allDay: boolean, values: Record<string, unknown[]>, groups: SchedulerGroup[]): boolean {
    const base = this.options.workHours?.() ?? { start: 9, end: 17 };
    const baseDays = this.options.workDays();
    let windows: { start: number; end: number; days: readonly number[] }[];
    if (this.grouped && groups.length) windows = groups.map((g) => ({ start: g.workStart, end: g.workEnd, days: g.workDays }));
    else {
      windows = [];
      for (const kind of this.options.resources?.kinds() ?? []) {
        for (const value of values[kind.field] ?? []) {
          const own = kind.workOf(kind.find(value));
          if (own.start !== undefined || own.end !== undefined || own.days) {
            windows.push({ start: own.start ?? base.start, end: own.end ?? base.end, days: own.days ?? baseDays });
          }
        }
      }
      if (!windows.length) windows = [{ ...base, days: baseDays }];
    }
    const last = we > ws ? we - 1 : ws;
    return windows.some((w) => {
      for (let day = Math.floor(ws / DAY) * DAY; day <= last; day += DAY) {
        if (!w.days.includes(new Date(day).getUTCDay())) return true;
        if (allDay) continue;
        const from = Math.max(ws, day);
        const to = Math.min(Math.max(we, ws), day + DAY);
        if (from < day + w.start * 3_600_000 || to > day + w.end * 3_600_000) return true;
      }
      return false;
    });
  }

  // Cells.

  /** The time of a cell: `slot` -1 is the all-day panel (and every day of the month view). */
  cellOf(place: CellPlace): SchedulerCell | null {
    const column = this.state.columns[place.column];
    if (!column) return null;
    const day = column.day;
    const zone = this.zone;
    const slot = this.state.slots[place.slot];
    const resources = column.group ? { ...column.group.values } : null;
    if (place.slot < 0 || dayCells(this.view.type) || !slot) return { start: day.date, end: zone.date(day.wall + DAY), allDay: true, resources };
    return {
      start: zone.date(day.wall + slot.minutes * MINUTE),
      end: zone.date(day.wall + (slot.minutes + this.view.cellDuration) * MINUTE),
      allDay: false,
      resources,
    };
  }

  /** The cells between the anchor and the focus, as one time in the anchor's group; `null` without a selection. Reactive. */
  selection(): SchedulerCell | null {
    const anchor = this.state.anchor;
    if (!anchor) return null;
    const focus = this.state.focus;
    const a = this.cellOf(anchor);
    const b = this.cellOf(focus);
    if (!a || !b) return null;
    const columns = this.state.columns;
    if (a.allDay || b.allDay) {
      const first = Math.min(columns[anchor.column].day.wall, columns[focus.column].day.wall);
      const last = Math.max(columns[anchor.column].day.wall, columns[focus.column].day.wall);
      return { start: this.zone.date(first), end: this.zone.date(last + DAY), allDay: true, resources: a.resources };
    }
    return a.start <= b.start ? { start: a.start, end: b.end, allDay: false, resources: a.resources } : { start: b.start, end: a.end, allDay: false, resources: a.resources };
  }

  /** Whether a cell is in the selection. Reactive. */
  isSelected(column: number, slot: number): boolean {
    const selection = this.selection();
    if (!selection) return false;
    const anchor = this.state.anchor;
    if (anchor && this.groupOf(anchor.column) !== this.groupOf(column)) return false;
    const cell = this.cellOf({ column, slot });
    if (!cell) return false;
    if (selection.allDay !== cell.allDay) return false;
    return cell.start >= selection.start && cell.end <= selection.end;
  }

  /** The blocked time a cell is in, or `null`. Reactive. */
  blockAt(column: number, slot: number): DayBlock | null {
    const col = this.state.columns[column];
    if (!col) return null;
    if (slot < 0 || dayCells(this.view.type)) return col.blocked ? (col.blocks.find((b) => b.from <= 0 && b.to >= 24 * 60) ?? null) : null;
    const row = this.state.slots[slot];
    if (!row) return null;
    const end = row.minutes + this.view.cellDuration;
    return col.blocks.find((b) => b.from < end && b.to > row.minutes) ?? null;
  }

  /** Puts the focus on a cell; `extend` keeps the anchor (a range), otherwise the cell alone is selected. */
  focusCell(place: CellPlace, extend = false): void {
    const columns = this.state.columns.length;
    const slots = this.state.slots.length;
    const month = dayCells(this.view.type);
    const column = Math.max(0, Math.min(columns - 1, place.column));
    const slot = month ? -1 : Math.max(this.view.allDayPanel && this.kind === 'time' ? -1 : 0, Math.min(slots - 1, place.slot));
    const anchor = extend && this.state.anchor ? this.state.anchor : { column, slot };
    this.state.focus = { column, slot };
    this.state.anchor = anchor;
  }

  clearSelection(): void {
    this.state.anchor = null;
  }

  // Effects.

  private fillGroups(): void {
    const view = this.options.view();
    const resources = this.options.resources;
    const hours = this.options.workHours?.() ?? { start: 9, end: 17 };
    const kinds = view.groups.map((field) => resources?.kind(field)).filter((k) => !!k);
    const made = makeGroups(kinds, { ...hours, days: this.options.workDays() });
    untracked(() => {
      const groups = this.state.groups;
      made.forEach((values, index) => {
        const group = { index, ...values };
        if (index < groups.length) assignGroup(groups[index], group);
        else groups.push(group);
      });
      if (groups.length > made.length) groups.splice(made.length);
    });
  }

  private fillDays(): void {
    const view = this.options.view();
    const date = this.options.date();
    const dates = viewDates(view, date, this.options.firstDayOfWeek(), this.options.workDays());
    const workDays = this.options.workDays();
    const holiday = this.options.isHoliday();
    const hours = this.options.workHours?.() ?? { start: 9, end: 17 };
    const groups = this.state.groups.slice();
    for (const group of groups) void group.key, void group.path;
    const today = this.todayWall();
    const zone = this.zone;
    const month = view.type === 'month' ? date.getMonth() : -1;
    const shownMonths = new Set<number>();
    if (view.type === 'month') {
      for (let i = 0; i < Math.max(1, view.intervalCount); i++) shownMonths.add((month + i) % 12);
    }
    untracked(() => {
      const days = this.state.days;
      // The focus keeps its date and group when the days change, else goes to the date shown.
      const was = this.state.columns[this.state.focus.column];
      const focusedDate = was?.day.local.getTime();
      const focusedGroup = was?.group?.key ?? '';
      dates.forEach((local, index) => {
        const wall = TimeZone.wallOfLocal(local);
        const values: SchedulerDay = {
          index,
          date: zone.date(wall),
          local,
          wall,
          today: wall === today,
          past: wall < today,
          work: workDays.includes(local.getDay()),
          weekend: local.getDay() === 0 || local.getDay() === 6,
          holiday: !!holiday?.(local),
          outside: month >= 0 && !shownMonths.has(local.getMonth()),
        };
        if (index < days.length) assign(days[index], values);
        else days.push(values);
      });
      if (days.length > dates.length) days.splice(dates.length);
      this.fillColumns(view, groups, hours, workDays);
      this.fillWeeks();
      const columns = this.state.columns;
      const find = (time: number | undefined, key: string) => columns.findIndex((c) => c.day.local.getTime() === time && (c.group?.key ?? '') === key);
      const keep = focusedDate === undefined ? -1 : find(focusedDate, focusedGroup);
      const shown = find(dayStart(date).getTime(), focusedGroup);
      const shownAny = shown >= 0 ? shown : columns.findIndex((c) => c.day.local.getTime() === dayStart(date).getTime());
      const focus = this.state.focus;
      const column = keep >= 0 ? keep : shownAny >= 0 ? shownAny : Math.max(0, Math.min(focus.column, columns.length - 1));
      const slot = dayCells(view.type) ? -1 : viewKind(view.type) === 'timeline' ? Math.max(0, focus.slot) : focus.slot;
      if (column !== focus.column || slot !== focus.slot) this.state.focus = { column, slot };
      const anchor = this.state.anchor;
      if (anchor && anchor.column >= columns.length) this.state.anchor = null;
    });
  }

  /** The columns: in each group the days (or, by date, in each day the groups), and the heads over them. */
  private fillColumns(view: ResolvedView, groups: SchedulerGroup[], hours: { start: number; end: number }, workDays: readonly number[]): void {
    const days = this.state.days;
    const kind = viewKind(view.type);
    // A timeline has a row per group and the agenda a list: neither stands the groups under the dates.
    const byDate = view.groupByDate && (kind === 'time' || kind === 'month');
    const month = view.type === 'month';
    const list: (SchedulerGroup | null)[] = groups.length ? groups : [null];
    const rows = month ? Math.ceil(days.length / 7) : 1;
    const perRowDays = month ? 7 : days.length;
    const made: Omit<SchedulerColumn, 'blocks' | 'blocked'>[] = [];
    for (let r = 0; r < rows; r++) {
      const rowDays = days.slice(r * perRowDays, r * perRowDays + perRowDays);
      const order: [SchedulerDay, SchedulerGroup | null][] = byDate ? rowDays.flatMap((d) => list.map((g) => [d, g] as [SchedulerDay, SchedulerGroup | null])) : list.flatMap((g) => rowDays.map((d) => [d, g] as [SchedulerDay, SchedulerGroup | null]));
      order.forEach(([day, group], i) => {
        const prev = i > 0 ? order[i - 1] : null;
        made.push({
          index: made.length,
          day,
          group,
          edge: prev ? edgeBetween(prev, [day, group], byDate) : '',
          work: (group ? group.workDays : workDays).includes(day.local.getDay()),
          workStart: group ? group.workStart : hours.start,
          workEnd: group ? group.workEnd : hours.end,
          label: group ? group.path.map((p) => p.text).join(', ') : '',
        });
      });
    }
    // Another date fills the columns in place; another shape (other days, other groups) makes them anew, as one change.
    const shape = [kind, byDate, days.length, list.map((g) => g?.key ?? '').join(',')].join('|');
    const reshaped = shape !== this.shape;
    this.shape = shape;
    if (reshaped) this.state.columns = made.map((values) => ({ ...values, blocks: [], blocked: false }) as SchedulerColumn);
    const columns = this.state.columns;
    if (!reshaped) {
      made.forEach((values, index) => {
        if (index < columns.length) assign(columns[index], values as SchedulerColumn);
        else columns.push({ ...values, blocks: [], blocked: false });
      });
      if (columns.length > made.length) columns.splice(made.length);
    }
    if (kind === 'time' || kind === 'month') this.fillHeads(columns.slice(0, month ? 7 * list.length : columns.length), groups.length ? view.groups.length : 0, byDate || (!month && days.length === 1));
    else this.fillHeads([], 0, false);
  }

  /** The heads over a row of columns: a date (a weekday) per day, and a row of group heads per level. */
  private fillHeads(row: SchedulerColumn[], levels: number, byDate: boolean): void {
    const dates: HeaderCell[] = [];
    const runs = (same: (a: SchedulerColumn, b: SchedulerColumn) => boolean) => {
      const out: { first: number; span: number }[] = [];
      row.forEach((column, i) => {
        const last = out[out.length - 1];
        if (last && same(row[last.first], column)) last.span++;
        else out.push({ first: i, span: 1 });
      });
      return out;
    };
    for (const run of byDate ? runs((a, b) => a.day === b.day) : row.map((_, i) => ({ first: i, span: 1 }))) {
      const column = row[run.first];
      dates.push({
        key: `d${run.first}`,
        ...run,
        level: -1,
        edge: column.edge,
        day: column.day,
        resource: null,
        values: column.group ? { ...column.group.values } : {},
      });
    }
    if (this.state.dates.length !== dates.length) this.state.dates = dates;
    else fillList(this.state.dates, dates);
    const heads: HeaderRow[] = [];
    const kinds = this.options.resources;
    const seen = new Set<string>();
    for (let level = 0; level < levels; level++) {
      const same = (a: SchedulerColumn, b: SchedulerColumn) =>
        (!byDate || a.day === b.day) && a.group!.path.slice(0, level + 1).every((p, i) => sameValue(p.value, b.group!.path[i].value));
      const cells = runs(same).map((run): HeaderCell => {
        const column = row[run.first];
        const path = column.group!.path.slice(0, level + 1);
        const values: Record<string, unknown> = {};
        for (const p of path) values[p.field] = p.value;
        const key = `g${level}:${path.map((p) => `${p.field}=${String(p.value)}`).join('|')}${byDate ? `@${column.day.index}` : ''}`;
        seen.add(key);
        const cell = { key, ...run, level, edge: column.edge, day: byDate ? column.day : null, resource: path[level], values };
        const known = this.headCache.get(key);
        if (known && sameHead('resource', known.resource, cell.resource)) {
          for (const name of ['first', 'span', 'edge', 'day'] as const) if (known[name] !== cell[name]) (known as unknown as Record<string, unknown>)[name] = cell[name];
          return known;
        }
        const made = reactive(cell) as HeaderCell;
        this.headCache.set(key, made);
        return made;
      });
      const field = row[0]?.group?.path[level]?.field ?? '';
      heads.push({ level, label: kinds?.kind(field)?.label ?? field, cells });
    }
    for (const key of this.headCache.keys()) if (!seen.has(key)) this.headCache.delete(key);
    const rows = this.state.heads;
    heads.forEach((values, index) => {
      if (index < rows.length) {
        const target = rows[index];
        if (target.level !== values.level) target.level = values.level;
        if (target.label !== values.label) target.label = values.label;
        if (target.cells.length !== values.cells.length || target.cells.some((c, i) => c !== values.cells[i])) target.cells = values.cells;
      } else rows.push(values);
    });
    if (rows.length > heads.length) rows.splice(heads.length);
  }

  private fillWeeks(): void {
    const days = this.state.days;
    const weeks = this.state.weeks;
    const month = this.view.type === 'month';
    const count = month ? Math.ceil(days.length / 7) : 0;
    const per = 7 * Math.max(1, this.state.groups.length);
    const columns = this.state.columns;
    for (let w = 0; w < count; w++) {
      const slice = days.slice(w * 7, w * 7 + 7);
      const cols = columns.slice(w * per, w * per + per);
      if (w < weeks.length) {
        weeks[w].days = slice;
        weeks[w].columns = cols;
      } else
        weeks.push({
          index: w,
          days: slice,
          columns: cols,
          pieces: [],
          more: [],
          moreAt: [],
          lanes: 0,
        });
    }
    if (weeks.length > count) weeks.splice(count);
    const panel = viewKind(this.view.type) === 'time';
    this.state.allDay.days = panel ? days.slice() : [];
    this.state.allDay.columns = panel ? columns.slice() : [];
  }

  private fillSlots(): void {
    const view = this.options.view();
    const from = Math.max(0, Math.min(24, view.startDayHour)) * 60;
    const to = Math.max(from / 60 + 1, Math.min(24, view.endDayHour)) * 60;
    const step = Math.max(5, Math.min(240, Math.round(view.cellDuration)));
    untracked(() => {
      const slots = this.state.slots;
      let index = 0;
      for (let minutes = from; minutes < to; minutes += step, index++) {
        const values: TimeSlot = {
          index,
          minutes,
          hourStart: minutes % 60 === 0 || minutes === from,
        };
        if (index < slots.length) assign(slots[index], values);
        else slots.push(values);
      }
      if (slots.length > index) slots.splice(index);
      if (this.state.focus.slot >= index) this.state.focus = { column: this.state.focus.column, slot: index - 1 };
    });
  }

  /** A timeline's cells along the time (a time row of each day, or each whole day) and the heads over them. */
  private fillTicks(): void {
    const view = this.options.view();
    const kind = viewKind(view.type);
    const days = this.state.days.map((d) => d);
    const slots = this.state.slots.map((s) => ({ minutes: s.minutes, hourStart: s.hourStart }));
    untracked(() => {
      const made: Omit<TimeTick, 'index'>[] = [];
      if (kind === 'timeline') {
        const whole = dayCells(view.type);
        for (const day of days) {
          if (whole) made.push({ day, slot: -1, minutes: 0, hourStart: true, dayStart: false });
          else slots.forEach((slot, i) => made.push({ day, slot: i, minutes: slot.minutes, hourStart: slot.hourStart, dayStart: i === 0 }));
        }
      }
      fillObjects(
        this.state.ticks,
        made.map((values, index) => ({ index, ...values })),
      );
      const upper: ScaleCell[] = [];
      const lower: ScaleCell[] = [];
      if (kind === 'timeline' && dayCells(view.type)) {
        // The months over their days.
        days.forEach((day, i) => {
          const last = upper[upper.length - 1];
          if (last && last.day.local.getMonth() === day.local.getMonth() && last.day.local.getFullYear() === day.local.getFullYear()) last.span++;
          else upper.push({ key: `m${i}`, first: i, span: 1, kind: 'month', day, minutes: 0, dayStart: true });
          lower.push({ key: `d${i}`, first: i, span: 1, kind: 'day', day, minutes: 0, dayStart: true });
        });
      } else if (kind === 'timeline') {
        // The days over their hours: an hour stands over its rows, to the next hour's first.
        const per = slots.length;
        days.forEach((day, d) => {
          upper.push({ key: `d${d}`, first: d * per, span: per, kind: 'day', day, minutes: 0, dayStart: true });
          slots.forEach((slot, i) => {
            const last = lower[lower.length - 1];
            if (!slot.hourStart && last && last.day === day) last.span++;
            else lower.push({ key: `h${d * per + i}`, first: d * per + i, span: 1, kind: 'hour', day, minutes: slot.minutes, dayStart: i === 0 });
          });
        });
      }
      fillObjects(this.state.upper, upper);
      fillObjects(this.state.lower, lower);
    });
  }

  /** A timeline's rows: a row per group (one without groups), with what its head cells show. */
  private fillRows(): void {
    const view = this.options.view();
    const timeline = viewKind(view.type) === 'timeline';
    const groups = timeline ? this.state.groups.map((g) => g) : [];
    for (const group of groups) void group.key, void group.path;
    const days = this.state.days.length;
    untracked(() => {
      const list: (SchedulerGroup | null)[] = timeline ? (groups.length ? groups : [null]) : [];
      const rows = this.state.rows;
      list.forEach((group, index) => {
        const before = index > 0 ? list[index - 1] : null;
        const path = group?.path ?? [];
        const starts = path.map((_, level) => !before || path.slice(0, level + 1).some((p, i) => !sameValue(p.value, before.path[i]?.value)));
        const edge: TimelineRow<T>['edge'] = !before ? '' : starts[0] ? 'outer' : 'inner';
        const values = {
          index,
          key: group?.key ?? '',
          group,
          first: (group?.index ?? 0) * days,
          edge,
          label: path.map((p) => p.text).join(', '),
        };
        if (index < rows.length) {
          const row = rows[index];
          assign(row, values as TimelineRow<T>);
          if (row.starts.join() !== starts.join()) row.starts = starts;
        } else {
          // A store of its own, as a piece is: in development DevTools then finds what changes in it at once.
          rows.push(reactive({ ...values, starts, pieces: [], lanes: 0, height: 0, more: [], moreLane: 0 }) as TimelineRow<T>);
        }
      });
      if (rows.length > list.length) rows.splice(list.length);
    });
  }

  /** Writes into each column the blocked times of its day that are for its group. */
  private fillBlocks(): void {
    const view = this.options.view();
    const blocks = this.options.blockedTimes?.() ?? [];
    if (!blocks.length) {
      // None: no column is read one by one.
      void this.state.columns.length;
      untracked(() => {
        for (const column of this.state.columns) {
          if (column.blocked) column.blocked = false;
          if (column.blocks.length) column.blocks = [];
        }
      });
      return;
    }
    const columns = this.state.columns.map((c) => c);
    for (const column of columns) void column.day.wall, void column.group;
    const days = this.state.days.map((d) => d.wall);
    if (!days.length) return;
    const spans = blockedSpans(blocks, days[0], days[days.length - 1] + DAY, this.zone);
    untracked(() => this.placeBlocks(columns, spans, view));
  }

  /** Reads the appointments of the days shown (without a draft): every layout places them from here until they change. */
  private collect(): void {
    const days = this.state.days.map((d) => d.wall);
    // The colours resources give: which kind colours, and its items' colours.
    for (const kind of this.options.resources?.kinds() ?? []) {
      void kind.useColorAsDefault;
      for (const item of kind.items) void kind.valueOf(item), void kind.colorOf(item);
    }
    const zone = this.zone;
    const entries = days.length ? this.read(zone.date(days[0]), zone.date(days[days.length - 1] + DAY), null) : [];
    untracked(() => {
      this.base = entries;
      this.baseById = new Map(entries.map((e) => [e.id, e]));
      this.occurrences.sweep();
      this.state.revision++;
    });
  }

  /** Places the appointments read (and a draft): the views each their own way. */
  private layout(): void {
    const view = this.options.view();
    const kind = viewKind(view.type);
    const revision = this.state.revision;
    // A timeline places by its rows and days, not by the columns.
    const columns = kind === 'timeline' ? [] : this.state.columns.map((c) => c);
    for (const column of columns) void column.day.wall, void column.group;
    const count = this.state.columns.length;
    const slots = this.state.slots.length;
    const days = this.state.days.map((d) => d.wall);
    const groups = this.state.groups.map((g) => g);
    for (const group of groups) void group.key;
    const draft = this.options.draft?.() ?? null;
    const room = this.options.room();
    const mode = this.options.overlapMode();
    const rows = kind === 'timeline' ? this.state.rows.map((r) => r) : [];
    const ticks = kind === 'timeline' ? this.state.ticks.length : 0;
    const metrics = kind === 'timeline' ? (this.options.lineMetrics?.() ?? { lane: 0, gap: 0, min: 0 }) : null;
    for (const kind of this.options.resources?.kinds() ?? []) {
      void kind.useColorAsDefault;
      for (const item of kind.items) void kind.colorOf(item);
    }
    if (!days.length || !count) return;
    const kinds = this.options.resources?.kinds() ?? null;
    untracked(() => {
      this.kindsNow = kinds;
      const moved = draft && !draft.copy ? this.idOf(draft.item) : null;
      const extra = draft ? this.draftEntry(draft) : null;
      const range = { from: days[0], to: days[days.length - 1] + DAY };
      const entries = this.base.filter((e) => e.id !== moved);
      const shows = !!extra && extra.ws < range.to && (extra.we > range.from || (extra.we === extra.ws && extra.ws >= range.from));
      if (extra && shows) entries.splice(upperBound(entries, extra), 0, extra);
      if (groups.length) this.indexGroups(groups);
      const byGroup = this.byGroup(groups, view, moved, shows ? extra : null);
      const of = (group: SchedulerGroup | null) => (group ? (byGroup[group.index] ?? []) : entries);
      const strip = new Set<string>();
      if (kind === 'timeline') {
        this.state.timed = [];
        this.placeStrip(this.state.allDay, () => [], strip, room.allDay, view);
        const settings = [
          view.type,
          view.startDayHour,
          view.endDayHour,
          view.cellDuration,
          view.maxAppointmentsPerCell,
          ticks,
          slots,
          rows.length,
          metrics!.lane,
          metrics!.gap,
          metrics!.min,
          days[0],
          groups.length,
        ].join('|');
        const laid = this.laid;
        // A draft alone changes the rows it was and is in, and the ones the appointment left.
        let only: Set<number> | null = null;
        if (laid.revision === revision && laid.settings === settings) {
          only = new Set<number>();
          for (const entry of [laid.draft, shows ? extra : null, moved ? (this.baseById.get(moved) ?? null) : null]) {
            if (!entry) continue;
            if (!groups.length) only.add(0);
            else for (const g of this.groupsOf(entry, groups, view)) only.add(g);
          }
        }
        this.laid = { revision, settings, draft: shows ? extra : null };
        for (const row of rows) if (!only || only.has(row.index)) this.placeLine(row, of(row.group), view, metrics!);
        this.clearAgenda();
      } else {
        this.laid = { revision: -1, settings: '', draft: null };
        const timed = new Set<string>();
        if (kind === 'agenda') {
          this.state.timed = [];
          this.placeStrip(this.state.allDay, () => [], strip, room.allDay, view);
          this.placeAgenda(groups.length ? groups : [null], of);
        } else if (view.type === 'month') {
          this.state.timed = [];
          this.placeStrip(this.state.allDay, () => [], strip, room.allDay, view);
          this.state.weeks.forEach((week) => this.placeStrip(week, of, strip, room.month, view));
          this.clearAgenda();
        } else {
          const toStrip = (e: Entry<T>) => view.allDayPanel && (e.allDay || e.we - e.ws >= DAY);
          const split = new Map<SchedulerGroup | null, { strip: Entry<T>[]; timed: Entry<T>[] }>();
          const parts = (group: SchedulerGroup | null) => {
            let part = split.get(group);
            if (!part) {
              const list = of(group);
              split.set(group, (part = { strip: list.filter(toStrip), timed: list.filter((e) => !toStrip(e)) }));
            }
            return part;
          };
          this.placeStrip(this.state.allDay, (group) => parts(group).strip, strip, room.allDay, view);
          const counts = new Map<string, number>();
          const pieces: TimedPiece<T>[] = [];
          const at: number[] = [];
          for (const column of columns) {
            for (const piece of this.placeColumn(column, parts(column.group).timed, view, mode, timed, counts)) {
              pieces.push(piece);
              at.push(column.index);
            }
          }
          this.timedRaw = { pieces, columns: at };
          this.state.timed = pieces;
          this.clearAgenda();
        }
        for (const id of this.timedCache.keys()) if (!timed.has(id)) this.timedCache.delete(id);
        this.clearLines();
      }
      for (const id of this.stripCache.keys()) if (!strip.has(id)) this.stripCache.delete(id);
      const grouped = groups.length > 0;
      const shown = entries.filter((e) => !e.draft && (!grouped || this.groupsOf(e, groups, view).length > 0)).map((e) => e.item);
      if (!sameList(this.shownRaw, shown)) {
        this.state.shown = shown;
        this.shownRaw = shown;
      }
      this.kindsNow = null;
    });
  }

  /** The appointments read, by the group they are in: made again when they or the groups change; a draft changes only its own groups. */
  private byGroup(groups: SchedulerGroup[], view: ResolvedView, moved: string | null, extra: Entry<T> | null): Entry<T>[][] {
    if (!groups.length) return [];
    const key = this.indexGroups(groups);
    if (this.buckets.revision !== this.state.revision || this.buckets.groups !== key) {
      const byGroup: Entry<T>[][] = groups.map(() => []);
      for (const entry of this.base) for (const g of this.groupsOf(entry, groups, view)) byGroup[g].push(entry);
      this.buckets = { revision: this.state.revision, groups: key, byGroup };
    }
    const lists = this.buckets.byGroup;
    const old = moved ? this.baseById.get(moved) : undefined;
    if (!old && !extra) return lists;
    const out = lists.slice();
    const to = extra ? this.groupsOf(extra, groups, view) : [];
    for (const g of new Set<number>([...(old ? this.groupsOf(old, groups, view) : []), ...to])) {
      const list = (lists[g] ?? []).filter((e) => e.id !== moved);
      if (extra && to.includes(g)) list.splice(upperBound(list, extra), 0, extra);
      out[g] = list;
    }
    return out;
  }

  /** The groups by their key, made again when they change; the key of them all. */
  private indexGroups(groups: SchedulerGroup[]): string {
    const key = groups.map((g) => g.key).join('#');
    if (key !== this.groupIndex.key) this.groupIndex = { key, version: this.groupIndex.version + 1, keys: new Map(groups.map((g) => [g.key, g.index])) };
    return key;
  }

  /** The indices of the groups an appointment is in: one for each set of its values of the fields grouped by. */
  private groupsOf(entry: Entry<T>, groups: SchedulerGroup[], view: ResolvedView): number[] {
    const version = this.groupIndex.version;
    const known = this.groupsCache.get(entry);
    if (known && known.version === version && this.groupIndex.keys.size === groups.length) return known.list;
    const fields = groups[0]?.path.map((p) => p.field) ?? view.groups;
    if (fields.length === 1) {
      const list: number[] = [];
      for (const value of entry.values[fields[0]] ?? []) {
        const at = this.groupIndex.keys.get(`${fields[0]}=${String(value)}`);
        if (at !== undefined && !list.includes(at)) list.push(at);
      }
      this.groupsCache.set(entry, { version, list });
      return list;
    }
    let keys = [''];
    for (const field of fields) {
      const next: string[] = [];
      for (const key of keys) for (const value of entry.values[field] ?? []) next.push(`${key}${key ? '|' : ''}${field}=${String(value)}`);
      keys = next;
      if (!keys.length) break;
    }
    const list: number[] = [];
    for (const key of keys) {
      const at = this.groupIndex.keys.get(key);
      if (at !== undefined && !list.includes(at)) list.push(at);
    }
    this.groupsCache.set(entry, { version, list });
    return list;
  }

  /** Writes into each column the blocked times of its day that are for its group. */
  private placeBlocks(columns: SchedulerColumn[], spans: BlockedSpan[], view: ResolvedView): void {
    const grouped = new Set(view.groups);
    for (const column of columns) {
      if (!spans.length) {
        if (column.blocks.length) column.blocks = [];
        if (column.blocked) column.blocked = false;
        continue;
      }
      const day = column.day.wall;
      const own = spans
        .filter((s) => s.start < day + DAY && s.end > day && blockShows(s.block, column.group, grouped))
        .map((s) => ({ from: Math.max(0, (s.start - day) / MINUTE), to: Math.min(24 * 60, (s.end - day) / MINUTE), text: s.block.text ?? '' }));
      const blocked = own.some((b) => b.from <= 0 && b.to >= 24 * 60);
      if ((own.length || column.blocks.length) && JSON.stringify(own) !== JSON.stringify(column.blocks)) column.blocks = own;
      if (column.blocked !== blocked) column.blocked = blocked;
    }
  }

  /** The appointments between `from` and `to`, with the draft (where it would go, in place of the appointment moved). */
  private entries(from: Date, to: Date): Entry<T>[] {
    return this.read(from, to, this.options.draft?.() ?? null);
  }

  private read(from: Date, to: Date, draft: Draft<T> | null): Entry<T>[] {
    const fields = this.options.fields();
    const zone = this.zone;
    const kept = { fields: this.fieldsNow, zone: this.zoneNow };
    this.fieldsNow = fields;
    this.zoneNow = zone;
    try {
      return this.readWith(fields, zone, from, to, draft);
    } finally {
      this.fieldsNow = kept.fields;
      this.zoneNow = kept.zone;
    }
  }

  private readWith(fields: SchedulerFields, zone: TimeZone, from: Date, to: Date, draft: Draft<T> | null): Entry<T>[] {
    const resources = this.options.resources;
    const moved = draft && !draft.copy ? this.idOf(draft.item) : null;
    const touches = (start: Date, end: Date) => start < to && (end > from || (end.getTime() === start.getTime() && start >= from));
    const out: Entry<T>[] = [];
    const add = (item: T) => {
      const time = this.timeOf(item);
      if (!time || !touches(time.start, time.end)) return;
      const id = this.idOf(item);
      if (id === moved) return;
      out.push({
        id,
        item,
        ...time,
        ws: zone.wall(time.start),
        we: zone.wall(time.end),
        draft: false,
        invalid: false,
        values: resources?.allValuesOf(item) ?? {},
        ...this.lookOf(item),
      });
    };
    for (const item of this.options.items()) {
      const record = item as Record<string, unknown>;
      if (record?.[fields.visible] === false) continue;
      if (this.occurrences.ruleOf(item)) for (const occurrence of this.occurrences.of(item, from.getTime(), to.getTime())) add(occurrence);
      else add(item);
    }
    if (draft && touches(draft.start, draft.end)) out.push(this.draftEntry(draft));
    return out.sort(byTime);
  }

  /** A draft as the layout reads it: moved, it keeps its id (and its box); a copy is one more. */
  private draftEntry(draft: Draft<T>): Entry<T> {
    const zone = this.zone;
    return {
      id: this.idOf(draft.item) + (draft.copy ? '~copy' : ''),
      item: draft.item,
      start: draft.start,
      end: draft.end,
      ws: zone.wall(draft.start),
      we: zone.wall(draft.end),
      allDay: draft.allDay,
      draft: true,
      invalid: draft.invalid,
      values: this.options.resources?.allValuesOf({ ...(draft.item as object), ...(draft.resources ?? {}) }) ?? {},
      ...this.lookOf(draft.item),
    };
  }

  private lookOf(item: T): { text: string; color: string; disabled: boolean; series: boolean; exception: boolean } {
    const fields = this.fields();
    const record = item as Record<string, unknown>;
    const text = record?.[fields.text];
    const color = record?.[fields.color];
    return {
      text: text === undefined || text === null ? '' : String(text),
      color: typeof color === 'string' ? color : '',
      disabled: !!record?.[fields.disabled],
      series: !!this.occurrences.infoOf(item),
      exception: this.isException(item),
    };
  }

  /** An entry's colour in a column: its own, else its resources' (the group's item, where it is grouped by the colouring kind). */
  private colorIn(entry: Entry<T>, group: SchedulerGroup | null): string {
    return entry.color || this.options.resources?.colorOf(entry.values, group, this.kindsNow ?? undefined) || '';
  }

  /** Places the timed pieces of a column: of the appointments of its group, the ones on its day. */
  private placeColumn(
    column: SchedulerColumn,
    entries: Entry<T>[],
    view: ResolvedView,
    mode: OverlapMode,
    seen: Set<string>,
    counts: Map<string, number>,
  ): TimedPiece<T>[] {
    const zone = this.zone;
    const day = column.day.wall;
    const group = column.group;
    const dayEnd = day + DAY;
    const dayStarts = zone.date(day);
    const dayEnds = zone.date(dayEnd);
    const from = view.startDayHour * 60;
    const to = view.endDayHour * 60;
    const length = to - from;
    const spans: (TimedSpan & { entry: Entry<T>; s: Date; e: Date; last: number })[] = [];
    for (const entry of entries) {
      const zero = entry.we === entry.ws;
      if (!(entry.ws < dayEnd && (entry.we > day || (zero && entry.ws >= day)))) continue;
      const s = entry.start < dayStarts ? dayStarts : entry.start;
      const e = entry.end > dayEnds ? dayEnds : entry.end;
      const wallStart = (Math.max(entry.ws, day) - day) / MINUTE;
      // By the clock, but never shorter than it lasts (the hour put back shows twice on the clock).
      const wallEnd = Math.max((Math.min(entry.we, dayEnd) - day) / MINUTE, Math.min(24 * 60, wallStart + (e.getTime() - s.getTime()) / MINUTE));
      const startMinutes = Math.max(from, wallStart);
      const endMinutes = Math.min(to, wallEnd);
      if (startMinutes > to || endMinutes < from || (startMinutes >= to && !zero)) continue;
      const shortest = Math.min(30, view.cellDuration);
      spans.push({
        id: entry.id,
        start: startMinutes,
        end: Math.max(endMinutes, startMinutes + shortest),
        entry,
        s,
        e,
        last: endMinutes,
      });
    }
    const places = placeTimed(spans);
    const cascadeStep = (columns: number) => Math.min(0.25, 0.6 / Math.max(1, columns - 1));
    return spans.map((span) => {
      const place = places.get(span.id)!;
      const realEnd = span.last;
      const left = mode === 'cascade' ? place.column * cascadeStep(place.columns) : place.column / place.columns;
      const width = mode === 'cascade' ? 1 - left : place.spread / place.columns;
      // The n-th column of the appointment: its first piece stays the same object wherever it moves.
      const n = counts.get(span.id) ?? 0;
      counts.set(span.id, n + 1);
      const values: TimedPiece<T> = {
        id: `${span.id}@${n}`,
        item: span.entry.item,
        column: column.index,
        group: group?.index ?? -1,
        start: span.s,
        end: span.e,
        top: (span.start - from) / length,
        height: Math.max(0, realEnd - span.start) / length,
        left,
        width,
        before: span.entry.ws < day,
        after: span.entry.we > dayEnd,
        draft: span.entry.draft,
        invalid: span.entry.invalid,
        text: span.entry.text,
        color: this.colorIn(span.entry, group),
        disabled: span.entry.disabled,
        series: span.entry.series,
        exception: span.entry.exception,
      };
      seen.add(values.id);
      return this.keep(this.timedCache, values);
    });
  }

  /**
   * Places the bars over a row of columns (the all-day panel, a week of the month): in each group
   * on the days of its columns, each bar on the lowest line free; a bar over columns that do not
   * stand side by side (the groups under each date) is cut into a piece per run of them.
   */
  private placeStrip(row: StripRow<T>, entriesOf: (group: SchedulerGroup | null) => Entry<T>[], seen: Set<string>, room: number, view: ResolvedView): void {
    const columns = row.columns;
    const more = columns.map(() => 0);
    const moreAt = columns.map(() => 0);
    const pieces: StripPiece<T>[] = [];
    const tag = view.type === 'month' ? 'm' : 'a';
    // Each group's columns in the row, by their place.
    const byGroup = new Map<SchedulerGroup | null, { c: SchedulerColumn; at: number }[]>();
    columns.forEach((c, at) => {
      const group = c.group;
      const list = byGroup.get(group);
      if (list) list.push({ c, at });
      else byGroup.set(group, [{ c, at }]);
    });
    for (const [group, own] of byGroup) {
      const days = own.map((x) => x.c.day.wall);
      const spans: (LaneSpan & { entry: Entry<T> })[] = [];
      if (days.length) {
        const rowStart = days[0];
        const rowEnd = days[days.length - 1] + DAY;
        entriesOf(group).forEach((entry, order) => {
          const zero = entry.we === entry.ws;
          if (!(entry.ws < rowEnd && (entry.we > rowStart || (zero && entry.ws >= rowStart)))) return;
          const first = days.findIndex((d, i) => entry.ws < d + DAY && (i === 0 || entry.ws >= d));
          const lastTime = zero ? entry.we : entry.we - 1;
          let last = days.length - 1;
          for (let i = days.length - 1; i >= 0; i--) {
            if (days[i] <= lastTime) {
              last = i;
              break;
            }
          }
          // A work week leaves days out: a bar starts and ends on a day it shows.
          if (first < 0 || last < first) return;
          spans.push({ id: entry.id, first, last, order, entry });
        });
      }
      const lanes = placeLanes(spans);
      const limit = view.maxAppointmentsPerCell;
      const needed = days.map((_, d) => {
        let most = 0;
        for (const span of spans) if (span.first <= d && span.last >= d) most = Math.max(most, lanes.get(span.id)! + 1);
        return most;
      });
      const cut = needed.map((n) => (typeof limit === 'number' ? (n > limit ? Math.max(0, limit) : n) : n > room ? Math.max(0, room - 1) : n));
      const left = days.map(() => 0);
      for (const span of spans) {
        const lane = lanes.get(span.id)!;
        let hidden = false;
        for (let d = span.first; d <= span.last; d++) if (lane >= cut[d]) hidden = true;
        if (hidden) for (let d = span.first; d <= span.last; d++) left[d]++;
        const entry = span.entry;
        // Runs of columns side by side.
        let start = span.first;
        for (let d = span.first; d <= span.last; d++) {
          if (d < span.last && own[d + 1].at === own[d].at + 1) continue;
          const part = start === span.first ? '' : `/${start - span.first}`;
          const values: StripPiece<T> = {
            id: `${span.id}#${row.index}${tag}${group ? `:${group.index}` : ''}${part}`,
            item: entry.item,
            first: own[start].at,
            span: d - start + 1,
            group: group?.index ?? -1,
            lane,
            hidden,
            before: entry.ws < days[start],
            after: entry.we > days[d] + DAY,
            timed: !entry.allDay && sameDay(entry.ws, entry.we),
            start: entry.start,
            end: entry.end,
            draft: entry.draft,
            invalid: entry.invalid,
            text: entry.text,
            color: this.colorIn(entry, group),
            disabled: entry.disabled,
            series: entry.series,
            exception: entry.exception,
          };
          seen.add(values.id);
          pieces.push(this.keep(this.stripCache, values));
          start = d + 1;
        }
      }
      own.forEach((x, d) => {
        more[x.at] = left[d];
        moreAt[x.at] = cut[d];
      });
    }
    row.pieces = pieces;
    row.more = more;
    row.moreAt = moreAt;
    row.lanes = Math.max(0, ...moreAt.map((c, d) => c + (more[d] > 0 ? 1 : 0)));
  }

  /**
   * Lays out a row of a timeline on its own: each appointment of its group from where it starts to
   * where it ends along the row (cut to the days and hours shown), stacked on the lowest lane free;
   * the row is as tall as its lanes. With a number for `maxAppointmentsPerCell`, lanes past it are
   * left out and each day says how many ("+N more").
   */
  private placeLine(row: TimelineRow<T>, entries: Entry<T>[], view: ResolvedView, metrics: { lane: number; gap: number; min: number }): void {
    const along = this.along(view);
    const spans: (StackSpan & { entry: Entry<T>; before: boolean; after: boolean })[] = [];
    entries.forEach((entry, order) => {
      const at = along(entry);
      if (at) spans.push({ id: entry.id, start: at.from, end: at.to, order, entry, before: at.before, after: at.after });
    });
    const { lanes, count } = placeStack(spans);
    const limit = typeof view.maxAppointmentsPerCell === 'number' ? Math.max(0, view.maxAppointmentsPerCell) : Infinity;
    const days = this.state.days.length;
    const per = dayCells(view.type) ? 1 : Math.max(1, this.state.slots.length);
    const more = new Array<number>(days).fill(0);
    const group = row.group;
    const pieces = spans.map((span) => {
      const lane = lanes.get(span.id)!;
      const hidden = lane >= limit;
      if (hidden) for (let d = Math.floor(span.start / per); d < Math.min(days, Math.ceil(span.end / per)); d++) more[d]++;
      const entry = span.entry;
      const values: LinePiece<T> = {
        id: `${span.id}@r${row.index}`,
        item: entry.item,
        group: group?.index ?? -1,
        start: entry.start,
        end: entry.end,
        allDay: entry.allDay,
        from: span.start,
        span: span.end - span.start,
        lane,
        hidden,
        before: span.before,
        after: span.after,
        draft: entry.draft,
        invalid: entry.invalid,
        text: entry.text,
        color: this.colorIn(entry, group),
        disabled: entry.disabled,
        series: entry.series,
        exception: entry.exception,
      };
      return this.keep(this.lineCache, values);
    });
    const kept = new Set(pieces.map((p) => p.id));
    const before = this.rowPieces.get(row) ?? [];
    for (const piece of before) if (!kept.has(piece.id)) this.lineCache.delete(piece.id);
    const shown = Math.min(count, limit);
    const lines = shown + (more.some((n) => n > 0) ? 1 : 0);
    if (!sameList(before, pieces)) {
      row.pieces = pieces;
      this.rowPieces.set(row, pieces);
    }
    if (row.lanes !== lines) row.lanes = lines;
    const height = Math.max(metrics.min, metrics.gap + lines * (metrics.lane + metrics.gap));
    if (row.height !== height) row.height = height;
    const left = more.map((count, day) => ({ day, count })).filter((m) => m.count > 0);
    if (row.more.map((m) => `${m.day}:${m.count}`).join() !== left.map((m) => `${m.day}:${m.count}`).join()) row.more = left;
    if (row.moreLane !== shown) row.moreLane = shown;
  }

  /**
   * Where an appointment is along a timeline's row, in cells: from its start to its end, cut to the
   * days and hours shown (`before`, `after`: it goes on past them); `null` when none of it is shown.
   * In a timeline of days (the month) it takes its days whole.
   */
  private along(view: ResolvedView): (entry: Entry<T>) => { from: number; to: number; before: boolean; after: boolean } | null {
    const walls = this.state.days.map((d) => d.wall);
    const count = walls.length;
    if (dayCells(view.type)) {
      return (entry) => {
        const zero = entry.we === entry.ws;
        let first = -1;
        let last = -1;
        for (let d = 0; d < count; d++) {
          if (first < 0 && walls[d] + DAY > entry.ws) first = d;
          if (walls[d] < entry.we || (zero && walls[d] <= entry.ws)) last = d;
        }
        if (first < 0 || last < first) return null;
        return { from: first, to: last + 1, before: entry.ws < walls[first], after: entry.we > walls[last] + DAY };
      };
    }
    const { from, to, step } = this.hours();
    const per = Math.max(1, this.state.slots.length);
    const shortest = Math.min(30, step) / step;
    const open = (d: number) => walls[d] + from * MINUTE;
    const close = (d: number) => walls[d] + to * MINUTE;
    const at = (d: number, wall: number) => d * per + ((wall - walls[d]) / MINUTE - from) / step;
    return (entry) => {
      const zero = entry.we === entry.ws;
      let first = -1;
      for (let d = 0; d < count; d++) {
        if (close(d) > entry.ws || (zero && close(d) === entry.ws)) {
          first = d;
          break;
        }
      }
      if (first < 0) return null;
      let last = -1;
      for (let d = count - 1; d >= 0; d--) {
        if (open(d) < entry.we || (zero && open(d) <= entry.we)) {
          last = d;
          break;
        }
      }
      if (last < first) return null;
      const before = entry.ws < open(first);
      const after = entry.we > close(last);
      const start = before ? first * per : at(first, entry.ws);
      const end = after ? (last + 1) * per : at(last, entry.we);
      if (end < start || (end === start && !zero)) return null;
      return { from: start, to: Math.max(end, start + shortest), before, after };
    };
  }

  /** The agenda: in each group, each day with its appointments in time order (one that lasts days on each of them); a day with none is left out. */
  private placeAgenda(groups: (SchedulerGroup | null)[], entriesOf: (group: SchedulerGroup | null) => Entry<T>[]): void {
    const zone = this.zone;
    const days = this.state.days;
    const out: AgendaDay<T>[] = [];
    const seenDays = new Set<string>();
    const seen = new Set<string>();
    for (const group of groups) {
      const entries = entriesOf(group);
      let first = true;
      for (const day of days) {
        const end = day.wall + DAY;
        const items: AgendaPiece<T>[] = [];
        for (const entry of entries) {
          const zero = entry.we === entry.ws;
          if (!(entry.ws < end && (entry.we > day.wall || (zero && entry.ws >= day.wall)))) continue;
          const before = entry.ws < day.wall;
          const after = entry.we > end;
          const values: AgendaPiece<T> = {
            id: `${entry.id}@a${day.index}${group ? `:${group.index}` : ''}`,
            item: entry.item,
            group: group?.index ?? -1,
            start: before ? zone.date(day.wall) : entry.start,
            end: after ? zone.date(end) : entry.end,
            whole: entry.allDay || (entry.ws <= day.wall && entry.we >= end),
            before,
            after,
            draft: entry.draft,
            invalid: entry.invalid,
            text: entry.text,
            color: this.colorIn(entry, group),
            disabled: entry.disabled,
            series: entry.series,
            exception: entry.exception,
          };
          seen.add(values.id);
          items.push(this.keep(this.agendaCache, values));
        }
        if (!items.length) continue;
        // The ones that take the day first, then in time order.
        items.sort((a, b) => Number(b.whole) - Number(a.whole));
        const key = `${group?.key ?? ''}@${day.index}`;
        seenDays.add(key);
        const values = { key, day, group, first, label: group ? group.path.map((p) => p.text).join(', ') : '' };
        first = false;
        let made = this.agendaDays.get(key);
        if (made) {
          assign(made, values as AgendaDay<T>);
          if (!sameList(made.items, items)) made.items = items;
        } else {
          made = reactive({ ...values, items }) as AgendaDay<T>;
          this.agendaDays.set(key, made);
        }
        out.push(made);
      }
    }
    for (const id of this.agendaCache.keys()) if (!seen.has(id)) this.agendaCache.delete(id);
    for (const key of this.agendaDays.keys()) if (!seenDays.has(key)) this.agendaDays.delete(key);
    if (!sameList(this.state.agenda, out)) this.state.agenda = out;
  }

  private clearAgenda(): void {
    if (this.state.agenda.length) this.state.agenda = [];
    this.agendaCache.clear();
    this.agendaDays.clear();
  }

  private clearLines(): void {
    for (const row of this.state.rows) {
      if (!this.rowPieces.get(row)?.length) continue;
      row.pieces = [];
      this.rowPieces.set(row, []);
    }
    this.lineCache.clear();
  }

  /** The cached piece with the new values written into it (only what changed), or a new one. */
  private keep<P extends { id: string }>(cache: Map<string, P>, values: P): P {
    const known = cache.get(values.id);
    if (known) {
      // Told apart from what was written last (kept plain): a read of the piece itself would cost as much again.
      const last = this.written.get(known) as Record<string, unknown>;
      const target = known as unknown as Record<string, unknown>;
      for (const [key, value] of Object.entries(values as unknown as Record<string, unknown>)) {
        const old = last[key];
        if (old instanceof Date && value instanceof Date ? old.getTime() !== value.getTime() : old !== value) {
          target[key] = value;
          last[key] = value;
        }
      }
      return known;
    }
    const piece = reactive(values) as P;
    this.written.set(piece, { ...values });
    cache.set(values.id, piece);
    return piece;
  }
}

/** Whether an appointment's values put it in a group: it has the group's value of every field. */
function inGroup(values: Record<string, unknown[]>, group: SchedulerGroup): boolean {
  for (const [field, value] of Object.entries(group.values)) if (!(values[field] ?? []).some((v) => sameValue(v, value))) return false;
  return true;
}

/** Whether a blocked time is for an appointment with these values: it has one of the block's values of every field it names. */
function blockFor(block: SchedulerBlockedTime, values: Record<string, unknown[]>): boolean {
  for (const [field, wanted] of Object.entries(block.resources ?? {})) {
    const list = Array.isArray(wanted) ? wanted : [wanted];
    if (!(values[field] ?? []).some((v) => list.some((w) => sameValue(v, w)))) return false;
  }
  return true;
}

/** Whether a column shows a blocked time: it names only fields the columns are grouped by, and the column's group has them. */
function blockShows(block: SchedulerBlockedTime, group: SchedulerGroup | null, grouped: Set<string>): boolean {
  for (const [field, wanted] of Object.entries(block.resources ?? {})) {
    if (!group || !grouped.has(field)) return false;
    const list = Array.isArray(wanted) ? wanted : [wanted];
    if (!list.some((w) => sameValue(group.values[field], w))) return false;
  }
  return true;
}

/** The divider between two columns: by date, a new day is the outer one; by group, the level whose item changes. */
function edgeBetween([dayA, groupA]: [SchedulerDay, SchedulerGroup | null], [dayB, groupB]: [SchedulerDay, SchedulerGroup | null], byDate: boolean): ColumnEdge {
  if (!groupA || !groupB) return '';
  if (byDate) return dayA !== dayB ? 'outer' : 'inner';
  if (groupA === groupB) return '';
  const level = groupB.path.findIndex((p, i) => !sameValue(p.value, groupA.path[i]?.value));
  return level < 0 ? '' : level === 0 ? 'outer' : 'inner';
}

/** Writes the fields that differ (a `Date` by its time). */
function assign<T extends object>(target: T, values: T): void {
  const t = target as Record<string, unknown>;
  for (const [key, value] of Object.entries(values)) {
    const old = t[key];
    if (old instanceof Date && value instanceof Date ? old.getTime() !== value.getTime() : old !== value) t[key] = value;
  }
}

/** A group keeps its object: its values and path are written only when its key changed. */
function assignGroup(target: SchedulerGroup, values: SchedulerGroup): void {
  const same = target.key === values.key && target.path.every((p, i) => p.text === values.path[i]?.text && p.color === values.path[i]?.color);
  if (!same) {
    target.key = values.key;
    target.values = values.values;
    target.path = values.path;
  }
  for (const key of ['index', 'workStart', 'workEnd'] as const) if (target[key] !== values[key]) target[key] = values[key];
  if (target.workDays.join() !== values.workDays.join()) target.workDays = values.workDays;
}

/** Fills a list of heads in place: the head at a place keeps its object. */
function fillList(list: HeaderCell[], values: HeaderCell[]): void {
  values.forEach((cell, index) => {
    if (index < list.length) {
      const target = list[index] as unknown as Record<string, unknown>;
      for (const [key, value] of Object.entries(cell)) if (!sameHead(key, target[key], value)) target[key] = value;
    } else list.push(cell);
  });
  if (list.length > values.length) list.splice(values.length);
}

/** A head's field keeps its value: its group values and its resource by what they hold. */
function sameHead(key: string, a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (key === 'values') {
    const x = a as Record<string, unknown>;
    const y = b as Record<string, unknown>;
    return Object.keys(x).length === Object.keys(y).length && Object.keys(x).every((k) => sameValue(x[k], y[k]));
  }
  if (key === 'resource') {
    const x = a as GroupResource;
    const y = b as GroupResource;
    return x.field === y.field && sameValue(x.value, y.value) && x.item === y.item && x.text === y.text && x.color === y.color;
  }
  return false;
}

/** A timed appointment that ends on the day it starts (wall clock times). */
function sameDay(start: number, end: number): boolean {
  return Math.floor(start / DAY) === Math.floor(Math.max(start, end - 1) / DAY);
}

/** The time order of appointments: by start, the longer first. */
function byTime<T>(a: Entry<T>, b: Entry<T>): number {
  return a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime();
}

/** Where an entry goes in a list in time order: after the ones it ties with. */
function upperBound<T>(list: Entry<T>[], entry: Entry<T>): number {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (byTime(list[mid], entry) <= 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Whether two lists hold the same items in the same order. */
function sameList<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/** Fills a list of objects in place: the object at a place keeps itself, its fields written where they differ. */
function fillObjects<T extends object>(list: T[], values: T[]): void {
  values.forEach((value, index) => {
    if (index < list.length) assign(list[index], value);
    else list.push(value);
  });
  if (list.length > values.length) list.splice(values.length);
}
