import { ComponentBase } from '@motifx/core';
import { later } from '../../../core/later';
import { measure, shareAlong, type Point } from '../../../core/measure';
import { onDocument } from '../../../core/window-events';
import { autoScroll } from '../../../parts/drag/auto-scroll';
import type { CellPlace } from '../model/cell-place';
import type { Draft } from '../model/draft';
import type { ResolvedView } from '../model/resolved-view';
import type { SchedulerModel } from '../model/SchedulerModel';
import { dayCells } from '../model/view-kind';

const MINUTE = 60_000;
const DAY = 86_400_000;
/** Pixels the pointer moves before a click becomes a drag. */
const THRESHOLD = 4;
/** A finger held this long starts a drag (a shorter touch scrolls or taps). */
const LONG_PRESS = 450;
/** The edge band of the scroll box that scrolls while dragging, and the most it scrolls in a frame. */
const EDGE = 40;
const SPEED = 16;

/** What is dragged: the whole appointment, or its start or its end. */
export type DragMode = 'move' | 'start' | 'end';

/** What the drag uses of its scheduler. */
export interface DragHost<T> {
  /** The scheduler: the document it is in is listened to while a drag runs. */
  root(): ComponentBase<HTMLElement>;
  /** The view's scroll box. Given as an element it is deprecated: give the component. */
  scroller(): ComponentBase | HTMLElement | null;
  model: SchedulerModel<T>;
  view(): ResolvedView;
  snapMinutes(): number;
  minDuration(): number;
  canCopy(): boolean;
  setDraft(draft: Draft<T> | null): void;
  /** `false` stops it before it begins. */
  starting(mode: DragMode, draft: Draft<T>): boolean;
  /** `false`: it may not go there. */
  over(mode: DragMode, draft: Draft<T>): boolean;
  /** Let go: saves it (or not); the draft goes when this settles. */
  drop(mode: DragMode, draft: Draft<T>): Promise<void>;
}

/** What the drag reads of the view shown. */
export interface DragView {
  /** The cell under a point of the screen, from the cells the view keeps, and its place. */
  cellUnder(point: Point): { place: CellPlace; cell: ComponentBase } | null;
  /** The view's scroll box: scrolled near its edges when the host gives an element. */
  scroller(): ComponentBase | null;
}

interface Press<T> {
  item: T;
  mode: DragMode;
  x: number;
  y: number;
  pointerId: number;
  /** The appointment's time when it was pressed. */
  start: Date;
  end: Date;
  allDay: boolean;
  /** The time (or the day) under the pointer when it was pressed, and the group of the piece pressed (-1 without groups). */
  at: Date | null;
  atDay: Date | null;
  group: number;
  started: boolean;
  /** A finger pressed it. */
  touch: boolean;
  touchTimer?: () => void;
}

/**
 * Moves and resizes appointments with the pointer. It builds nothing: while a drag goes on it
 * writes a draft (where the appointment would go) that the layout shows with the appointment's own
 * box, and it listens on the document until the pointer is let go. Escape takes it back, Ctrl drops
 * a copy, the scroll box scrolls near its edges, a finger starts it with a long press.
 */
export class AppointmentDrag<T> {
  private press: Press<T> | null = null;
  private draft: Draft<T> | null = null;
  private last: { x: number; y: number; copy: boolean } | null = null;
  private stopScroll: (() => void) | null = null;
  /** The click that ends a drag is not a click on the appointment. */
  private endedAt = 0;

  /** After a scroll near an edge the draft follows the pointer, once the scroll is made. */
  private readonly readPointer = (): { x: number; y: number } | null => this.last;
  private readonly followPointer = (): void => this.follow();

  constructor(
    private readonly host: DragHost<T>,
    private readonly shown: DragView,
  ) {}

  /** A drag is going on (a finger's then keeps the page from scrolling). */
  get active(): boolean {
    return !!this.press?.started;
  }

  /** Whether a click now is the end of a drag. */
  get justEnded(): boolean {
    return Date.now() - this.endedAt < 300;
  }

  /**
   * A click on an appointment (or on one of its edges) in a group: it becomes a drag once the pointer
   * moves; a finger's once it is held (`now`: a handle, once it moves).
   */
  begin(item: T, mode: DragMode, e: PointerEvent, group = -1, now = false): void {
    if (e.button !== 0 || this.press) return;
    const time = this.host.model.timeOf(item);
    if (!time) return;
    const cell = this.cellAt(e.clientX, e.clientY);
    this.press = {
      item,
      mode,
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      start: time.start,
      end: time.end,
      allDay: time.allDay,
      at: cell?.time ?? null,
      atDay: cell?.day ?? null,
      group,
      started: false,
      touch: e.pointerType === 'touch',
    };
    // The drag goes on past the scheduler: its document is listened to while it runs.
    const root = this.host.root();
    this.stopPage = [onDocument(root, 'pointermove', this.onMove), onDocument(root, 'pointerup', this.onUp), onDocument(root, 'pointercancel', this.onCancel), onDocument(root, 'keydown', this.onKey, true)];
    if (e.pointerType === 'touch' && !now) {
      this.press.touchTimer = later(() => this.start(), LONG_PRESS);
    }
  }

  /** Stops a drag and takes the appointment back. */
  cancel(): void {
    this.stop();
    this.host.setDraft(null);
  }

  dispose(): void {
    this.cancel();
  }

  /** Stops listening to the document while a drag runs. */
  private stopPage: (() => void)[] = [];

  private onMove = (e: PointerEvent) => {
    const press = this.press;
    if (!press || e.pointerId !== press.pointerId) return;
    if (!press.started) {
      const far = Math.hypot(e.clientX - press.x, e.clientY - press.y) > THRESHOLD;
      // A finger that moves before the long press scrolls the page: no drag.
      if (press.touchTimer) {
        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) this.stop();
        return;
      }
      if (!far || !this.start()) return;
    }
    e.preventDefault();
    this.last = { x: e.clientX, y: e.clientY, copy: e.ctrlKey || e.metaKey };
    this.follow();
    this.scrollNearEdges();
  };

  private onUp = (e: PointerEvent) => {
    const press = this.press;
    if (!press || e.pointerId !== press.pointerId) return;
    const draft = this.draft;
    const started = press.started;
    this.stop();
    if (!started || !draft) return;
    this.endedAt = Date.now();
    if (draft.invalid) {
      this.host.setDraft(null);
      return;
    }
    void this.host.drop(press.mode, draft).finally(() => this.host.setDraft(null));
  };

  private onCancel = () => this.cancel();

  private onKey = (e: KeyboardEvent) => {
    if (!this.press?.started) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.cancel();
    } else if ((e.key === 'Control' || e.key === 'Meta') && this.last) {
      this.last.copy = true;
      this.follow();
    }
  };

  private start(): boolean {
    const press = this.press;
    if (!press) return false;
    if (press.touchTimer) {
      press.touchTimer();
      press.touchTimer = undefined;
    }
    const draft: Draft<T> = { item: press.item, start: press.start, end: press.end, allDay: press.allDay, copy: false, invalid: false, touch: press.touch };
    if (!this.host.starting(press.mode, draft)) {
      this.stop();
      return false;
    }
    press.started = true;
    this.draft = draft;
    this.host.setDraft(draft);
    return true;
  }

  private stop(): void {
    const press = this.press;
    press?.touchTimer?.();
    this.press = null;
    this.draft = null;
    this.last = null;
    this.stopScroll?.();
    this.stopScroll = null;
    for (const stop of this.stopPage.splice(0)) stop();
  }

  /** Works out where the appointment would go for the pointer now, and shows it there. */
  private follow(): void {
    const press = this.press;
    const last = this.last;
    if (!press || !last) return;
    const cell = this.cellAt(last.x, last.y);
    if (!cell) return;
    const next = press.mode === 'move' ? this.moved(press, cell) : this.resized(press, cell);
    if (!next) return;
    const copy = press.mode === 'move' && last.copy && this.host.canCopy();
    // Moved into another group, it takes that group's resources.
    const model = this.host.model;
    const resources = press.mode === 'move' ? model.movedValues(press.item, model.state.groups[press.group] ?? null, model.groupOf(cell.column)) : null;
    const draft: Draft<T> = { item: press.item, ...next, copy, invalid: false, resources, touch: press.touch };
    const current = this.draft;
    if (current && same(current, draft)) return;
    draft.invalid = !this.host.over(press.mode, draft);
    this.draft = draft;
    this.host.setDraft(draft);
  }

  private moved(press: Press<T>, cell: CellAt): { start: Date; end: Date; allDay: boolean } | null {
    const view = this.host.view();
    const zone = this.host.model.zone;
    const duration = press.end.getTime() - press.start.getTime();
    // In a timeline an all-day appointment stays one: it moves by whole days.
    if (this.host.model.kind === 'timeline' && press.allDay) {
      const from = press.atDay ?? zone.dayStart(press.start);
      const days = Math.round((zone.wall(zone.dayStart(cell.day)) - zone.wall(from)) / DAY);
      return { start: zone.addDays(press.start, days), end: zone.addDays(press.end, days), allDay: true };
    }
    if (cell.time && press.at) {
      // Over the hours: keeps the distance from where it was taken; from the all-day panel it gets a slot's length.
      if (press.allDay) {
        const start = this.snap(cell.time);
        return { start, end: new Date(start.getTime() + Math.max(view.cellDuration, 30) * MINUTE * 2), allDay: false };
      }
      // The distance on the clock, so a move over the change of summer time keeps the hour it shows.
      const start = this.snap(zone.date(zone.wall(press.start) + (zone.wall(cell.time) - zone.wall(press.at))));
      return { start, end: new Date(start.getTime() + duration), allDay: false };
    }
    if (cell.time) {
      const start = this.snap(cell.time);
      return { start, end: new Date(start.getTime() + (press.allDay ? view.cellDuration * 2 * MINUTE : duration)), allDay: false };
    }
    // Over a day: by whole days, keeping the time of day.
    const from = press.atDay ?? zone.dayStart(press.start);
    const days = Math.round((zone.wall(cell.day) - zone.wall(from)) / DAY);
    if (!dayCells(view.type) && !press.allDay) {
      // A timed one dropped on the all-day panel becomes an all-day one of that day.
      return { start: cell.day, end: zone.addDays(cell.day, 1), allDay: true };
    }
    return { start: zone.addDays(press.start, days), end: zone.addDays(press.end, days), allDay: press.allDay };
  }

  private resized(press: Press<T>, cell: CellAt): { start: Date; end: Date; allDay: boolean } | null {
    const least = this.host.minDuration() * MINUTE;
    if (cell.time && !press.allDay) {
      const at = this.snap(cell.time, press.mode === 'end');
      if (press.mode === 'end') return { start: press.start, end: new Date(Math.max(at.getTime(), press.start.getTime() + least)), allDay: false };
      return { start: new Date(Math.min(at.getTime(), press.end.getTime() - least)), end: press.end, allDay: false };
    }
    // By days: the bar of an all-day appointment, or a timed one over days in the month.
    const zone = this.host.model.zone;
    const day = cell.day;
    /** The day of the cell at the clock time of `time`. */
    const at = (time: Date) => zone.date(zone.wall(day) + (zone.wall(time) - zone.wall(zone.dayStart(time))));
    if (press.mode === 'end') {
      const end = press.allDay ? zone.addDays(day, 1) : at(press.end);
      return { start: press.start, end: end <= press.start ? (press.allDay ? zone.addDays(zone.dayStart(press.start), 1) : press.end) : end, allDay: press.allDay };
    }
    const start = press.allDay ? day : at(press.start);
    return { start: start >= press.end ? press.start : start, end: press.end, allDay: press.allDay };
  }

  /** A time on the snap step from the day's start on the clock (`up`: the step that has it, its end). */
  private snap(time: Date, up = false): Date {
    const zone = this.host.model.zone;
    const step = Math.max(1, this.host.snapMinutes());
    const wall = zone.wall(time);
    const day = Math.floor(wall / DAY) * DAY;
    const minutes = (wall - day) / MINUTE;
    const snapped = up ? Math.ceil(minutes / step) * step : Math.round(minutes / step) * step;
    return zone.date(day + snapped * MINUTE);
  }

  /** The cell under a point of the screen: its day, and the time there for a cell of the hours. */
  private cellAt(x: number, y: number): CellAt | null {
    const hit = this.shown.cellUnder({ x, y });
    if (!hit) return null;
    const { column: columnIndex, slot: slotIndex } = hit.place;
    const model = this.host.model;
    const day = model.state.columns[columnIndex]?.day;
    if (!day) return null;
    const slot = slotIndex >= 0 ? model.state.slots[slotIndex] : undefined;
    if (!slot || dayCells(this.host.view().type)) return { day: day.date, time: null, column: columnIndex };
    // Down the day columns; along a timeline's row (from its end, right to left).
    const share = shareAlong(hit.cell, { x, y }, model.kind === 'timeline' ? 'x' : 'y');
    const minutes = slot.minutes + share * this.host.view().cellDuration;
    return { day: day.date, time: model.zone.date(day.wall + minutes * MINUTE), column: columnIndex };
  }

  /** Near an edge of the scroll box it scrolls, a frame at a time, and the draft follows. */
  private scrollNearEdges(): void {
    if (this.stopScroll) return;
    const root = this.host.root();
    this.stopScroll = autoScroll(
      root,
      () => this.scrollBox(),
      () => (this.press?.started ? this.last : null),
      () => measure(root, this.readPointer, this.followPointer),
      { zone: EDGE, speed: SPEED },
    );
  }

  /** The view's scroll box now, as a component (a host giving the deprecated element has the view's). */
  private scrollBox(): ComponentBase | null {
    const scroller = this.host.scroller();
    return scroller instanceof ComponentBase ? scroller : this.shown.scroller();
  }
}

interface CellAt {
  day: Date;
  time: Date | null;
  column: number;
}

function same<T>(a: Draft<T>, b: Draft<T>): boolean {
  return (
    a.start.getTime() === b.start.getTime() &&
    a.end.getTime() === b.end.getTime() &&
    a.allDay === b.allDay &&
    a.copy === b.copy &&
    JSON.stringify(a.resources ?? null) === JSON.stringify(b.resources ?? null)
  );
}
