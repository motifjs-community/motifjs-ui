import { addDays } from '../../../parts/dates/add-days';
import { dayStart } from '../../../parts/dates/day-start';
import type { Draft } from '../model/draft';
import type { ResolvedView } from '../model/resolved-view';
import type { SchedulerModel } from '../model/SchedulerModel';

const MINUTE = 60_000;
/** Pixels the pointer moves before a press becomes a drag. */
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
  root(): HTMLElement;
  scroller(): HTMLElement | null;
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
  /** The time (or the day) under the pointer when it was pressed. */
  at: Date | null;
  atDay: Date | null;
  started: boolean;
  touchTimer?: ReturnType<typeof setTimeout>;
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
  private frame = 0;
  /** The click that ends a drag is not a click on the appointment. */
  private endedAt = 0;

  constructor(private readonly host: DragHost<T>) {}

  /** A drag is going on (a finger's then keeps the page from scrolling). */
  get active(): boolean {
    return !!this.press?.started;
  }

  /** Whether a click now is the end of a drag. */
  get justEnded(): boolean {
    return Date.now() - this.endedAt < 300;
  }

  /** A press on an appointment (or on one of its edges): it becomes a drag once the pointer moves. */
  begin(item: T, mode: DragMode, e: PointerEvent): void {
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
      started: false,
    };
    const doc = this.host.root().ownerDocument;
    doc.addEventListener('pointermove', this.onMove);
    doc.addEventListener('pointerup', this.onUp);
    doc.addEventListener('pointercancel', this.onCancel);
    doc.addEventListener('keydown', this.onKey, true);
    if (e.pointerType === 'touch') {
      this.press.touchTimer = setTimeout(() => this.start(), LONG_PRESS);
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
      clearTimeout(press.touchTimer);
      press.touchTimer = undefined;
    }
    const draft: Draft<T> = { item: press.item, start: press.start, end: press.end, allDay: press.allDay, copy: false, invalid: false };
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
    if (press?.touchTimer) clearTimeout(press.touchTimer);
    this.press = null;
    this.draft = null;
    this.last = null;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    const doc = this.host.root().ownerDocument;
    doc.removeEventListener('pointermove', this.onMove);
    doc.removeEventListener('pointerup', this.onUp);
    doc.removeEventListener('pointercancel', this.onCancel);
    doc.removeEventListener('keydown', this.onKey, true);
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
    const draft: Draft<T> = { item: press.item, ...next, copy, invalid: false };
    const current = this.draft;
    if (current && same(current, draft)) return;
    draft.invalid = !this.host.over(press.mode, draft);
    this.draft = draft;
    this.host.setDraft(draft);
  }

  private moved(press: Press<T>, cell: CellAt): { start: Date; end: Date; allDay: boolean } | null {
    const view = this.host.view();
    const duration = press.end.getTime() - press.start.getTime();
    if (cell.time && press.at) {
      // Over the hours: keeps the distance from where it was taken; from the all-day panel it gets a slot's length.
      if (press.allDay) {
        const start = this.snap(cell.time);
        return { start, end: new Date(start.getTime() + Math.max(view.cellDuration, 30) * MINUTE * 2), allDay: false };
      }
      const start = this.snap(new Date(press.start.getTime() + (cell.time.getTime() - press.at.getTime())));
      return { start, end: new Date(start.getTime() + duration), allDay: false };
    }
    if (cell.time) {
      const start = this.snap(cell.time);
      return { start, end: new Date(start.getTime() + (press.allDay ? view.cellDuration * 2 * MINUTE : duration)), allDay: false };
    }
    // Over a day: by whole days, keeping the time of day.
    const from = press.atDay ?? dayStart(press.start);
    const days = Math.round((cell.day.getTime() - from.getTime()) / 86_400_000);
    if (view.type !== 'month' && !press.allDay) {
      // A timed one dropped on the all-day panel becomes an all-day one of that day.
      return { start: cell.day, end: addDays(cell.day, 1), allDay: true };
    }
    return { start: addDays(press.start, days), end: addDays(press.end, days), allDay: press.allDay };
  }

  private resized(press: Press<T>, cell: CellAt): { start: Date; end: Date; allDay: boolean } | null {
    const least = this.host.minDuration() * MINUTE;
    if (cell.time && !press.allDay) {
      const at = this.snap(cell.time, press.mode === 'end');
      if (press.mode === 'end') return { start: press.start, end: new Date(Math.max(at.getTime(), press.start.getTime() + least)), allDay: false };
      return { start: new Date(Math.min(at.getTime(), press.end.getTime() - least)), end: press.end, allDay: false };
    }
    // By days: the bar of an all-day appointment, or a timed one over days in the month.
    const day = cell.day;
    if (press.mode === 'end') {
      const end = press.allDay ? addDays(day, 1) : new Date(day.getTime() + (press.end.getTime() - dayStart(press.end).getTime()));
      return { start: press.start, end: end <= press.start ? (press.allDay ? addDays(dayStart(press.start), 1) : press.end) : end, allDay: press.allDay };
    }
    const start = press.allDay ? day : new Date(day.getTime() + (press.start.getTime() - dayStart(press.start).getTime()));
    return { start: start >= press.end ? press.start : start, end: press.end, allDay: press.allDay };
  }

  /** A time on the snap step from the day's start (`up`: the step that has it, its end). */
  private snap(time: Date, up = false): Date {
    const step = Math.max(1, this.host.snapMinutes());
    const day = dayStart(time);
    const minutes = (time.getTime() - day.getTime()) / MINUTE;
    const snapped = up ? Math.ceil(minutes / step) * step : Math.round(minutes / step) * step;
    return new Date(day.getTime() + snapped * MINUTE);
  }

  /** The cell under a point of the screen: its day, and the time there for a cell of the hours. */
  private cellAt(x: number, y: number): CellAt | null {
    const root = this.host.root();
    const el = root.ownerDocument.elementsFromPoint(x, y).find((node) => node instanceof HTMLElement && node.dataset.cell && root.contains(node)) as
      HTMLElement | undefined;
    if (!el) return null;
    const [dayIndex, slotIndex] = el.dataset.cell!.split(':').map(Number);
    const model = this.host.model;
    const day = model.state.days[dayIndex];
    if (!day) return null;
    const slot = slotIndex >= 0 ? model.state.slots[slotIndex] : undefined;
    if (!slot || this.host.view().type === 'month') return { day: day.date, time: null };
    const box = el.getBoundingClientRect();
    const share = box.height > 0 ? Math.max(0, Math.min(1, (y - box.top) / box.height)) : 0;
    const minutes = slot.minutes + share * this.host.view().cellDuration;
    return { day: day.date, time: new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), 0, minutes) };
  }

  /** Near an edge of the scroll box it scrolls, a frame at a time, and the draft follows. */
  private scrollNearEdges(): void {
    if (this.frame) return;
    const tick = () => {
      this.frame = 0;
      const scroller = this.host.scroller();
      const last = this.last;
      if (!scroller || !last || !this.press?.started) return;
      const box = scroller.getBoundingClientRect();
      const by = (near: number) => (near < EDGE ? Math.ceil(((EDGE - near) / EDGE) * SPEED) : 0);
      const down = by(box.bottom - last.y) - by(last.y - box.top);
      const right = by(box.right - last.x) - by(last.x - box.left);
      if (!down && !right) return;
      const top = scroller.scrollTop;
      const left = scroller.scrollLeft;
      scroller.scrollTop += down;
      scroller.scrollLeft += right;
      if (scroller.scrollTop === top && scroller.scrollLeft === left) return;
      this.follow();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
}

interface CellAt {
  day: Date;
  time: Date | null;
}

function same<T>(a: Draft<T>, b: Draft<T>): boolean {
  return a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime() && a.allDay === b.allDay && a.copy === b.copy;
}
