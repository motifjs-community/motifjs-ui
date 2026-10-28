import { effect, reactive, untracked } from '@motifx/core';
import { addDays } from '../../../parts/dates/add-days';
import { dayStart } from '../../../parts/dates/day-start';
import type { SchedulerCell } from '../scheduler-cell';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerRange } from '../scheduler-range';
import type { CellPlace } from './cell-place';
import type { Draft } from './draft';
import type { OverlapMode } from './overlap-mode';
import { placeLanes, type LaneSpan } from './place-lanes';
import { placeTimed, type TimedSpan } from './place-timed';
import type { ResolvedView } from './resolved-view';
import type { SchedulerDay } from './scheduler-day';
import type { StripPiece } from './strip-piece';
import type { StripRow } from './strip-row';
import type { TimeSlot } from './time-slot';
import type { TimedPiece } from './timed-piece';
import { toDate } from './to-date';
import { viewDates } from './view-dates';

const DAY = 86_400_000;
const MINUTE = 60_000;

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
}

/** An appointment as the layout reads it. */
interface Entry<T> {
  id: string;
  item: T;
  start: Date;
  end: Date;
  allDay: boolean;
  draft: boolean;
  invalid: boolean;
  /** What its box writes and paints, read here so a plain object's change reaches the box too. */
  text: string;
  color: string;
  disabled: boolean;
}

interface ModelState<T> {
  /** Now, in milliseconds; moved on by the scheduler's clock. */
  now: number;
  days: SchedulerDay[];
  slots: TimeSlot[];
  /** The timed pieces of every day column, in one list: a piece keeps its object (and its box) when it moves to another day. */
  timed: TimedPiece<T>[];
  allDay: StripRow<T>;
  weeks: StripRow<T>[];
  /** The cell with keyboard focus, and the other end of the selection. */
  focus: CellPlace;
  anchor: CellPlace | null;
  /** The appointments in the range, in time order. */
  shown: T[];
}

/**
 * The scheduler without its DOM: the days and times the view shows, where every appointment goes
 * (filled in place: a day, a cell row and an appointment's piece stay the same objects while they
 * stay on screen), the focused cell and the selection.
 */
export class SchedulerModel<T> {
  readonly state: ModelState<T>;
  private readonly timedCache = new Map<string, TimedPiece<T>>();
  private readonly stripCache = new Map<string, StripPiece<T>>();
  private readonly ids = new WeakMap<object, string>();
  private nextId = 0;
  private readonly stops: (() => void)[] = [];

  constructor(private readonly options: SchedulerModelOptions<T>) {
    this.state = reactive({
      now: Date.now(),
      days: [],
      slots: [],
      timed: [],
      allDay: {
        index: 0,
        days: [],
        pieces: [],
        more: [],
        moreAt: [],
        lanes: 0,
      },
      weeks: [],
      focus: { day: 0, slot: 0 },
      anchor: null,
      shown: [],
    }) as ModelState<T>;
  }

  /** Starts following the options; call `dispose` to stop. */
  start(): void {
    if (this.stops.length) return;
    this.stops.push(effect(() => this.fillDays()));
    this.stops.push(effect(() => this.fillSlots()));
    this.stops.push(effect(() => this.layout()));
  }

  dispose(): void {
    for (const stop of this.stops.splice(0)) stop();
  }

  get view(): ResolvedView {
    return this.options.view();
  }

  /** The days shown, `end` not included. Reactive. */
  range(): SchedulerRange {
    const days = this.state.days;
    if (!days.length) {
      const date = dayStart(this.options.date());
      return { start: date, end: addDays(date, 1) };
    }
    return { start: days[0].date, end: addDays(days[days.length - 1].date, 1) };
  }

  /** Today's start, in milliseconds. Reactive. */
  today(): number {
    return dayStart(new Date(this.state.now)).getTime();
  }

  /** The day column of today, or -1. Reactive. */
  todayIndex(): number {
    return this.state.days.findIndex((d) => d.today);
  }

  /** Where now is in a day column (0–1), or `null` outside the hours shown. Reactive. */
  nowAt(): number | null {
    const view = this.view;
    const now = new Date(this.state.now);
    const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const from = view.startDayHour * 60;
    const to = view.endDayHour * 60;
    return minutes < from || minutes > to ? null : (minutes - from) / (to - from);
  }

  /** The key the layout uses for an appointment. */
  idOf(item: T): string {
    const key = (item as Record<string, unknown>)?.[this.options.fields().key];
    if (key !== undefined && key !== null) return `k${String(key)}`;
    const object = item as unknown as object;
    let id = this.ids.get(object);
    if (!id) this.ids.set(object, (id = `o${this.nextId++}`));
    return id;
  }

  /** An appointment's start and end, `end` never before `start`. */
  timeOf(item: T): { start: Date; end: Date; allDay: boolean } | null {
    const fields = this.options.fields();
    const record = item as Record<string, unknown>;
    const start = toDate(record[fields.start]);
    if (!start) return null;
    const end = toDate(record[fields.end]) ?? start;
    const allDay = !!record[fields.allDay];
    const to = end < start ? start : end;
    if (!allDay) return { start, end: to, allDay };
    // An all-day appointment covers its days whole.
    const first = dayStart(start);
    const last = dayStart(to);
    return {
      start: first,
      end: last.getTime() === to.getTime() && to > start ? last : addDays(last, 1),
      allDay,
    };
  }

  /** The appointments between `start` and `end` (any part of them). */
  appointmentsIn(start: Date, end: Date): T[] {
    return this.entries(start, end).map((e) => e.item);
  }

  // Cells.

  /** The time of a cell: `slot` -1 is the all-day panel (and every day of the month view). */
  cellOf(place: CellPlace): SchedulerCell | null {
    const day = this.state.days[place.day];
    if (!day) return null;
    const slot = this.state.slots[place.slot];
    if (place.slot < 0 || this.view.type === 'month' || !slot) return { start: day.date, end: addDays(day.date, 1), allDay: true };
    const start = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), 0, slot.minutes);
    return {
      start,
      end: new Date(start.getTime() + this.view.cellDuration * MINUTE),
      allDay: false,
    };
  }

  /** The cells between the anchor and the focus, as one time; `null` without a selection. Reactive. */
  selection(): SchedulerCell | null {
    const anchor = this.state.anchor;
    if (!anchor) return null;
    const focus = this.state.focus;
    const a = this.cellOf(anchor);
    const b = this.cellOf(focus);
    if (!a || !b) return null;
    if (a.allDay || b.allDay) {
      const first = Math.min(anchor.day, focus.day);
      const last = Math.max(anchor.day, focus.day);
      return {
        start: this.state.days[first].date,
        end: addDays(this.state.days[last].date, 1),
        allDay: true,
      };
    }
    return a.start <= b.start ? { start: a.start, end: b.end, allDay: false } : { start: b.start, end: a.end, allDay: false };
  }

  /** Whether a cell is in the selection. Reactive. */
  isSelected(day: number, slot: number): boolean {
    const selection = this.selection();
    if (!selection) return false;
    const cell = this.cellOf({ day, slot });
    if (!cell) return false;
    if (selection.allDay !== cell.allDay) return false;
    return cell.start >= selection.start && cell.end <= selection.end;
  }

  /** Puts the focus on a cell; `extend` keeps the anchor (a range), otherwise the cell alone is selected. */
  focusCell(place: CellPlace, extend = false): void {
    const days = this.state.days.length;
    const slots = this.state.slots.length;
    const month = this.view.type === 'month';
    const day = Math.max(0, Math.min(days - 1, place.day));
    const slot = month ? -1 : Math.max(this.view.allDayPanel ? -1 : 0, Math.min(slots - 1, place.slot));
    const anchor = extend && this.state.anchor ? this.state.anchor : { day, slot };
    this.state.focus = { day, slot };
    this.state.anchor = anchor;
  }

  clearSelection(): void {
    this.state.anchor = null;
  }

  // Effects.

  private fillDays(): void {
    const view = this.options.view();
    const date = this.options.date();
    const dates = viewDates(view, date, this.options.firstDayOfWeek(), this.options.workDays());
    const workDays = this.options.workDays();
    const holiday = this.options.isHoliday();
    const today = this.today();
    const month = view.type === 'month' ? date.getMonth() : -1;
    const shownMonths = new Set<number>();
    if (view.type === 'month') {
      for (let i = 0; i < Math.max(1, view.intervalCount); i++) shownMonths.add((month + i) % 12);
    }
    untracked(() => {
      const days = this.state.days;
      // The focus keeps its date when the days change, else goes to the date shown.
      const focusedDate = days[this.state.focus.day]?.date;
      const keep = (focusedDate && dates.findIndex((d) => d.getTime() === focusedDate.getTime())) ?? -1;
      const shown = dates.findIndex((d) => d.getTime() === dayStart(date).getTime());
      dates.forEach((date, index) => {
        const values: SchedulerDay = {
          index,
          date,
          today: date.getTime() === today,
          past: date.getTime() < today,
          work: workDays.includes(date.getDay()),
          weekend: date.getDay() === 0 || date.getDay() === 6,
          holiday: !!holiday?.(date),
          outside: month >= 0 && !shownMonths.has(date.getMonth()),
        };
        if (index < days.length) assign(days[index], values);
        else days.push(values);
      });
      if (days.length > dates.length) days.splice(dates.length);
      this.fillWeeks();
      const focus = this.state.focus;
      const day = keep >= 0 ? keep : shown >= 0 ? shown : Math.min(focus.day, dates.length - 1);
      const slot = view.type === 'month' ? -1 : focus.slot;
      if (day !== focus.day || slot !== focus.slot) this.state.focus = { day, slot };
    });
  }

  private fillWeeks(): void {
    const days = this.state.days;
    const weeks = this.state.weeks;
    const count = this.view.type === 'month' ? Math.ceil(days.length / 7) : 0;
    for (let w = 0; w < count; w++) {
      const slice = days.slice(w * 7, w * 7 + 7);
      if (w < weeks.length) weeks[w].days = slice;
      else
        weeks.push({
          index: w,
          days: slice,
          pieces: [],
          more: [],
          moreAt: [],
          lanes: 0,
        });
    }
    if (weeks.length > count) weeks.splice(count);
    this.state.allDay.days = this.view.type === 'month' ? [] : days.slice();
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
      if (this.state.focus.slot >= index) this.state.focus = { day: this.state.focus.day, slot: index - 1 };
    });
  }

  /** Reads every appointment and places it: all of it runs again when anything it reads changes. */
  private layout(): void {
    const view = this.options.view();
    const days = this.state.days.map((d) => d.date);
    void this.state.slots.length;
    if (!days.length) return;
    const rangeStart = days[0];
    const rangeEnd = addDays(days[days.length - 1], 1);
    const entries = this.entries(rangeStart, rangeEnd);
    const room = this.options.room();
    const mode = this.options.overlapMode();
    untracked(() => {
      const timed = new Set<string>();
      const strip = new Set<string>();
      if (view.type === 'month') {
        this.state.timed = [];
        this.placeStrip(this.state.allDay, [], [], strip, room.allDay, view);
        this.state.weeks.forEach((week) => {
          const dates = week.days.map((d) => d.date);
          this.placeStrip(week, dates, entries, strip, room.month, view);
        });
      } else {
        const toStrip = entries.filter((e) => view.allDayPanel && (e.allDay || e.end.getTime() - e.start.getTime() >= DAY));
        const inColumns = entries.filter((e) => !toStrip.includes(e));
        this.placeStrip(this.state.allDay, days, toStrip, strip, room.allDay, view);
        const counts = new Map<string, number>();
        this.state.timed = days.flatMap((day, index) => this.placeColumn(day, index, inColumns, view, mode, timed, counts));
      }
      for (const id of this.timedCache.keys()) if (!timed.has(id)) this.timedCache.delete(id);
      for (const id of this.stripCache.keys()) if (!strip.has(id)) this.stripCache.delete(id);
      this.state.shown = entries.map((e) => e.item);
    });
  }

  private entries(from: Date, to: Date): Entry<T>[] {
    const fields = this.options.fields();
    const draft = this.options.draft?.() ?? null;
    const moved = draft && !draft.copy ? draft.item : null;
    const touches = (start: Date, end: Date) => start < to && (end > from || (end.getTime() === start.getTime() && start >= from));
    const out: Entry<T>[] = [];
    for (const item of this.options.items()) {
      const record = item as Record<string, unknown>;
      if (item === moved || record?.[fields.visible] === false) continue;
      const time = this.timeOf(item);
      if (time && touches(time.start, time.end)) out.push({ id: this.idOf(item), item, ...time, draft: false, invalid: false, ...this.lookOf(item) });
    }
    if (draft && touches(draft.start, draft.end)) {
      // Moved, it keeps its id (and its box); a copy is one more.
      const id = this.idOf(draft.item) + (draft.copy ? '~copy' : '');
      out.push({
        id,
        item: draft.item,
        start: draft.start,
        end: draft.end,
        allDay: draft.allDay,
        draft: true,
        invalid: draft.invalid,
        ...this.lookOf(draft.item),
      });
    }
    return out.sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
  }

  private lookOf(item: T): { text: string; color: string; disabled: boolean } {
    const fields = this.options.fields();
    const record = item as Record<string, unknown>;
    const text = record?.[fields.text];
    const color = record?.[fields.color];
    return {
      text: text === undefined || text === null ? '' : String(text),
      color: typeof color === 'string' ? color : '',
      disabled: !!record?.[fields.disabled],
    };
  }

  private placeColumn(
    day: Date,
    index: number,
    entries: Entry<T>[],
    view: ResolvedView,
    mode: OverlapMode,
    seen: Set<string>,
    counts: Map<string, number>,
  ): TimedPiece<T>[] {
    const dayEnd = addDays(day, 1);
    const from = view.startDayHour * 60;
    const to = view.endDayHour * 60;
    const length = to - from;
    const spans: (TimedSpan & { entry: Entry<T>; s: Date; e: Date })[] = [];
    for (const entry of entries) {
      const zero = entry.end.getTime() === entry.start.getTime();
      if (!(entry.start < dayEnd && (entry.end > day || (zero && entry.start >= day)))) continue;
      const s = entry.start < day ? day : entry.start;
      const e = entry.end > dayEnd ? dayEnd : entry.end;
      const startMinutes = Math.max(from, minutesInto(day, s));
      const endMinutes = Math.min(to, e.getTime() === dayEnd.getTime() ? 24 * 60 : minutesInto(day, e));
      if (startMinutes > to || endMinutes < from || (startMinutes >= to && !zero)) continue;
      const shortest = Math.min(30, view.cellDuration);
      spans.push({
        id: entry.id,
        start: startMinutes,
        end: Math.max(endMinutes, startMinutes + shortest),
        entry,
        s,
        e,
      });
    }
    const places = placeTimed(spans);
    const cascadeStep = (columns: number) => Math.min(0.25, 0.6 / Math.max(1, columns - 1));
    return spans.map((span) => {
      const place = places.get(span.id)!;
      const realEnd = Math.min(to, span.e.getTime() === dayEnd.getTime() ? 24 * 60 : minutesInto(day, span.e));
      const left = mode === 'cascade' ? place.column * cascadeStep(place.columns) : place.column / place.columns;
      const width = mode === 'cascade' ? 1 - left : place.spread / place.columns;
      // The n-th day of the appointment: its first piece stays the same object wherever it moves.
      const n = counts.get(span.id) ?? 0;
      counts.set(span.id, n + 1);
      const values: TimedPiece<T> = {
        id: `${span.id}@${n}`,
        item: span.entry.item,
        day: index,
        start: span.s,
        end: span.e,
        top: (span.start - from) / length,
        height: Math.max(0, realEnd - span.start) / length,
        left,
        width,
        before: span.entry.start < day,
        after: span.entry.end > dayEnd,
        draft: span.entry.draft,
        invalid: span.entry.invalid,
        text: span.entry.text,
        color: span.entry.color,
        disabled: span.entry.disabled,
      };
      seen.add(values.id);
      return this.keep(this.timedCache, values);
    });
  }

  private placeStrip(row: StripRow<T>, days: Date[], entries: Entry<T>[], seen: Set<string>, room: number, view: ResolvedView): void {
    const spans: (LaneSpan & { entry: Entry<T> })[] = [];
    if (days.length) {
      const rowStart = days[0];
      const rowEnd = addDays(days[days.length - 1], 1);
      entries.forEach((entry, order) => {
        const zero = entry.end.getTime() === entry.start.getTime();
        if (!(entry.start < rowEnd && (entry.end > rowStart || (zero && entry.start >= rowStart)))) return;
        const first = days.findIndex((d, i) => entry.start < addDays(d, 1) && (i === 0 || entry.start >= d));
        const lastTime = zero ? entry.end.getTime() : entry.end.getTime() - 1;
        let last = days.length - 1;
        for (let i = days.length - 1; i >= 0; i--) {
          if (days[i].getTime() <= lastTime) {
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
    const more = days.map(() => 0);
    const rowStart = days[0];
    const pieces = spans.map((span) => {
      const lane = lanes.get(span.id)!;
      let hidden = false;
      for (let d = span.first; d <= span.last; d++) if (lane >= cut[d]) hidden = true;
      if (hidden) for (let d = span.first; d <= span.last; d++) more[d]++;
      const entry = span.entry;
      const values: StripPiece<T> = {
        id: `${span.id}#${row.index}${view.type === 'month' ? 'm' : 'a'}`,
        item: entry.item,
        first: span.first,
        span: span.last - span.first + 1,
        lane,
        hidden,
        before: entry.start < (rowStart ?? entry.start),
        after: entry.end > addDays(days[span.last], 1),
        timed: !entry.allDay && sameDayTime(entry.start, entry.end),
        start: entry.start,
        end: entry.end,
        draft: entry.draft,
        invalid: entry.invalid,
        text: entry.text,
        color: entry.color,
        disabled: entry.disabled,
      };
      seen.add(values.id);
      return this.keep(this.stripCache, values);
    });
    row.pieces = pieces;
    row.more = more;
    row.moreAt = cut;
    row.lanes = Math.max(0, ...cut.map((c, d) => c + (more[d] > 0 ? 1 : 0)));
  }

  /** The cached piece with the new values written into it (only what changed), or a new one. */
  private keep<P extends { id: string }>(cache: Map<string, P>, values: P): P {
    const known = cache.get(values.id);
    if (known) {
      assign(known, values);
      return known;
    }
    const piece = reactive(values) as P;
    cache.set(values.id, piece);
    return piece;
  }
}

/** Writes the fields that differ (a `Date` by its time). */
function assign<T extends object>(target: T, values: T): void {
  const t = target as Record<string, unknown>;
  for (const [key, value] of Object.entries(values)) {
    const old = t[key];
    if (old instanceof Date && value instanceof Date ? old.getTime() !== value.getTime() : old !== value) t[key] = value;
  }
}

function minutesInto(day: Date, time: Date): number {
  return (time.getTime() - day.getTime()) / MINUTE + (day.getTimezoneOffset() - time.getTimezoneOffset());
}

/** A timed appointment that ends on the day it starts. */
function sameDayTime(start: Date, end: Date): boolean {
  return dayStart(start).getTime() === dayStart(new Date(Math.max(start.getTime(), end.getTime() - 1))).getTime();
}
