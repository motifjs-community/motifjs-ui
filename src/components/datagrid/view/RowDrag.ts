import { ComponentBase, untracked } from '@motifx/core';
import { loose, textPart } from '../../../core/draw-parts';
import { css, kept, mark, put } from '../../../core/part-writes';
import { parseChord } from '../../../core/keyboard';
import { onWindow } from '../../../core/window-events';
import type { GridRowDragEventArgs } from '../grid-row-drag-event-args';
import type { GridRowDropEventArgs } from '../grid-row-drop-event-args';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, DRAG_FIELD, EXPAND_FIELD } from '../model/ColumnModel';
import type { GridModel } from '../model/GridModel';
import type { GridBody } from './GridBody';
import type { GridRow } from './GridRow';
import type { RowDragHost } from './row-drag-host';
import { rowDropPlace } from './row-drop-place';
import { boxOf, isInPage, measure, onLayout, rectOf, styleOf, type Point, type Rect } from '../../../core/measure';
import { autoScroll } from '../../../parts/drag/auto-scroll';
import { DragBoxes } from '../../../parts/drag/drag-boxes';
import { stackCover } from '../../../parts/drag/stack-cover';

/** Every grid that drags rows, so a drag finds the grids of its group under the pointer. */
const DRAGGERS = new Set<RowDrag<any>>();

/** Where a dragged row would land in a grid. */
interface Aim<T> {
  drag: RowDrag<T>;
  /** Its place among the reachable rows: before it, or (`inside`) onto it. */
  local: number;
  inside: boolean;
  toIndex: number;
  /** Where the drop line goes, from the top of the rows; `null` for none. */
  line: number | null;
  /** The row dropped onto. */
  target: ComponentBase | null;
  /** How far the dragged row moves to stand at the place, with `'push'`, when it comes from this grid. */
  shift: number;
}

/** What a frame of a drag reads: where the row would land, and the look of its copy before it shows. */
interface FrameRead<T> {
  session: Session<T>;
  aim: Aim<T> | null;
  ghost: { columns: string | null; width: number; scrolled: number; rowHeight: string; bounds: Rect | null } | null;
}

/** A row being dragged with the pointer. */
interface Session<T> {
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  fromIndex: number;
  item: T;
  /** The row's component: it holds the pointer while the row is dragged. */
  part: ComponentBase;
  /** The row's top and height, from the top of the rows, when it was taken. */
  top: number;
  height: number;
  /** Where the pointer took it, from its left (level with the rows) and top. */
  offset: { x: number; y: number };
  started: boolean;
  aim: Aim<T> | null;
  /** The handlers took no drop where it is now. */
  refused: boolean;
  /** The pointer moved (or the rows scrolled) since the last frame: the place is worked out again. */
  pending: boolean;
  /** The last pointer move, for the handlers; `null` when the rows scrolled under a still pointer. */
  event: PointerEvent | null;
  /** The copy follows the pointer. */
  ghostShown: boolean;
  /** The drag template's component, disposed at the end. */
  content: ComponentBase | null;
  /** The app's `boundary` as a component, fixed when the drag starts; `null` for none. */
  boundary: ComponentBase | null;
  /** The rows of the grids it may land in, on the screen. */
  boxes: DragBoxes | null;
  /** The grid scrolled near its edges, and what stops that. */
  edgeOf: RowDrag<T> | null;
  stopEdge: (() => void) | null;
  stopScroll: (() => void) | null;
}

const KEY_ALIASES: Record<string, string> = { up: 'arrowup', down: 'arrowdown' };

/** Whether a key event is one of the chords (`'Ctrl+Shift+ArrowUp'`, `'Mod+Alt+Up'`). */
function pressed(chords: readonly string[], e: KeyboardEvent): boolean {
  for (const text of chords) {
    let chord: ReturnType<typeof parseChord>;
    try {
      chord = parseChord(text);
    } catch {
      continue;
    }
    const key = KEY_ALIASES[chord.key] ?? chord.key;
    if (e.ctrlKey === chord.ctrl && e.altKey === chord.alt && e.shiftKey === chord.shift && e.metaKey === chord.meta && e.key.toLowerCase() === key) return true;
  }
  return false;
}

/** The first component of the tree `from` is in whose element matches `selector`. */
function componentOf(from: ComponentBase, selector: string): ComponentBase | null {
  let root = from;
  while (root.parent) root = root.parent;
  try {
    return root.$(selector).fromComponent()[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Row drag and drop (`rowDragging`): a row taken by its drag icon (or anywhere, or by `handle`) and
 * dragged past `dragThreshold` follows the pointer as a copy; the grid under the pointer shows where
 * it would land (a line between the rows, the rows making room with `'push'`, or the row it would go
 * onto) and scrolls near its edges. Dropped, it raises `onReorder` here, or `onRemove` here and
 * `onAdd` on another grid of the same `group`; the handlers move the data. The same moves come from
 * the keyboard (`moveUpKeys` / `moveDownKeys`) and `moveRow()`, with the same events, and are
 * announced.
 */
export class RowDrag<T> {
  private session: Session<T> | null = null;
  private readonly stops: (() => void)[] = [];
  /** This grid shows marks of a drag. */
  private marked = false;

  constructor(
    private readonly model: GridModel<T>,
    private readonly body: GridBody<T>,
    private readonly host: RowDragHost<T>,
  ) {
    DRAGGERS.add(this);
  }

  get options() {
    return this.model.rowDrag;
  }

  get grid() {
    return this.host.grid;
  }

  /** The part that scrolls the rows: the body's parent. */
  private get viewport(): ComponentBase | null {
    return this.body.parent;
  }

  dispose() {
    this.end(null, false);
    DRAGGERS.delete(this);
  }

  /** A click on a row: a drag may start once the pointer moves far enough. Returns whether it is watched. */
  press(e: PointerEvent): boolean {
    const { model, options } = this;
    if (e.button !== 0 || this.session || !untracked(() => options.enabled) || model.state.busy || model.state.session) return false;
    const view = this.body.rowFrom(e);
    if (!view || view.index < 0 || view.row === undefined || view.rowId === undefined || model.isNew(view.rowId)) return false;
    const onIcon = !!view.cellPart(DRAG_FIELD)?.motif.isEventFrom(e);
    const handle = untracked(() => options.get('handle'));
    if (handle) {
      // The app's handle: the parts of the row its selector matches.
      if (!view.part.$(handle).fromComponent().some((by) => by.motif.isEventFrom(e))) return false;
    } else if (untracked(() => options.showsIcons)) {
      if (!onIcon) return false;
    } else if (this.fromControl(view, e)) return false;
    const viewport = this.viewport;
    const rect = rectOf(view.part);
    const top = rect.top - rectOf(this.body).top;
    const left = viewport ? rectOf(viewport).left : rect.left;
    this.session = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      fromIndex: view.index,
      item: view.row,
      part: view.part,
      top,
      height: rect.height || model.state.rowHeight,
      offset: { x: e.clientX - left, y: e.clientY - rect.top },
      started: false,
      aim: null,
      refused: false,
      pending: false,
      event: null,
      ghostShown: false,
      content: null,
      boundary: null,
      boxes: null,
      edgeOf: null,
      stopEdge: null,
      stopScroll: null,
    };
    const move = (ev: PointerEvent) => this.onMove(ev);
    const up = (ev: PointerEvent) => this.onUp(ev);
    const key = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && this.session?.started) {
        ev.preventDefault();
        ev.stopPropagation();
        this.end(ev, false);
        this.model.announce(this.model.text('gridRowDragCanceled'));
      }
    };
    // The window the grid is in: the drag goes on past the grid, onto another one too.
    const grid = this.grid;
    this.stops.push(onWindow(grid, 'pointermove', move), onWindow(grid, 'pointerup', up), onWindow(grid, 'pointercancel', up), onWindow(grid, 'keydown', key, true));
    // The drag icon does not select text or start the browser's own drag.
    if (onIcon) e.preventDefault();
    return true;
  }

  /** Whether a press on a row started on one of its own controls: an action button, the details arrow, the "…" or the editor. */
  private fromControl(view: GridRow<T>, e: Event): boolean {
    const editing = this.model.state.editing;
    const fields = [ACTIONS_FIELD, EXPAND_FIELD, ADAPTIVE_FIELD];
    if (editing && editing.rowId === view.rowId) fields.push(editing.field);
    // Their parts, not the cells: the space around them still takes the row.
    return fields.some((field) => !!view.cellPart(field)?.controls.items.some((part) => part.motif.isEventFrom(e)));
  }

  /** A key on a row: Ctrl+Shift+Up / Down (`moveUpKeys`, `moveDownKeys`) move it a place. Returns whether it was one. */
  onKey(e: KeyboardEvent, index: number): boolean {
    const { options } = this;
    if (!options.get('keyboard') || !options.get('allowReordering')) return false;
    const up = pressed(options.get('moveUpKeys'), e);
    const down = !up && pressed(options.get('moveDownKeys'), e);
    if (!up && !down) return false;
    e.preventDefault();
    const to = this.nextDataRow(index, up ? -1 : 1);
    if (to < 0) {
      this.model.announce(this.model.text(up ? 'gridRowMoveFirst' : 'gridRowMoveLast'));
      return true;
    }
    void this.move(index, to, e);
    return true;
  }

  /**
   * Moves grid row `fromIndex` to `toIndex` as a drop there would: `onDragStart`, `onDragChange`
   * and `onDragEnd` (any of them can cancel it), then `onReorder`, which moves the data. The row
   * stays the active one. Resolves to whether `onReorder` was raised.
   */
  async move(fromIndex: number, toIndex: number, event?: Event): Promise<boolean> {
    const { model } = this;
    const row = this.dataRowAt(fromIndex);
    if (row === undefined || toIndex === fromIndex || !model.hasRow(toIndex)) return false;
    const aim: Aim<T> = { drag: this, local: model.localOf(toIndex), inside: false, toIndex, line: null, target: null, shift: 0 };
    const part = this.grid.getRowPart(fromIndex) ?? this.grid;
    const args = () => this.args(row, fromIndex, part, aim, event);
    if (!this.ask('onDragStart', args()) || !this.ask('onDragChange', args()) || !this.ask('onDragEnd', args())) return false;
    const e = args() as GridRowDropEventArgs<T>;
    delete (e as { cancel?: boolean }).cancel;
    this.tell('onReorder', e);
    if (e.promise) await Promise.resolve(e.promise).catch(() => undefined);
    this.announceMove(toIndex);
    await this.follow(row, fromIndex);
    return true;
  }

  private onMove(e: PointerEvent) {
    const s = this.session;
    if (!s || e.pointerId !== s.pointerId) return;
    s.x = e.clientX;
    s.y = e.clientY;
    if (!s.started) {
      const threshold = this.model.settings.get('dragThreshold');
      if (Math.max(Math.abs(e.clientX - s.startX), Math.abs(e.clientY - s.startY)) < threshold) return;
      if (!this.start(e)) return;
    }
    s.event = e;
    s.pending = true;
    measure(this.grid, this.readFrame, this.drawFrame);
  }

  private onUp(e: PointerEvent) {
    const s = this.session;
    if (!s || e.pointerId !== s.pointerId) return;
    if (!s.started) {
      this.end(null, false);
      return;
    }
    // A move not drawn yet still counts: the drop goes where the pointer is.
    if (s.pending) this.drawFrame(this.readFrame());
    // The click that follows the drop is not a click on the row.
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    setTimeout(onWindow(this.grid, 'click', swallow, true), 0);
    this.end(e, e.type === 'pointerup');
  }

  /** The drag passed the threshold: `onDragStart`, then the marks; the copy shows with the next frame. Returns whether it goes on. */
  private start(e: PointerEvent): boolean {
    const s = this.session!;
    const aim: Aim<T> = { drag: this, local: this.model.localOf(s.fromIndex), inside: false, toIndex: s.fromIndex, line: null, target: null, shift: 0 };
    if (!this.ask('onDragStart', this.args(s.item, s.fromIndex, s.part, aim, e))) {
      this.end(null, false);
      return false;
    }
    s.started = true;
    s.aim = aim;
    // The app's boundary is fixed for the drag after `onDragStart`, which may still set it.
    s.boundary = this.appPart('boundary');
    s.boxes = new DragBoxes(this.grid, this.aimable, stackCover);
    s.stopScroll = onLayout(this.grid, 'scroll', this.rowsScrolled);
    s.part.attr.add({ setPointerCapture: e.pointerId });
    mark(this.grid, 'data-row-dragging', true);
    return true;
  }

  /** The grids of the drag that it may land in (this one, then those of its group in the page), by the parts that scroll their rows. */
  private readonly aimable = (): ComponentBase[] => {
    const group = untracked(() => this.options.get('group'));
    const out: ComponentBase[] = [];
    for (const d of [this, ...DRAGGERS]) {
      if (d !== this && (!group || untracked(() => d.options.get('group')) !== group)) continue;
      const viewport = d.viewport;
      if (viewport && !out.includes(viewport) && isInPage(viewport)) out.push(viewport);
    }
    return out;
  };

  /** Something scrolled under the dragged row: where it would land is worked out again. */
  private readonly rowsScrolled = () => {
    const s = this.session;
    if (!s?.started) return;
    if (!s.pending) s.event = null;
    s.pending = true;
    measure(this.grid, this.readFrame, this.drawFrame);
  };

  private readonly readFrame = (): FrameRead<T> | null => {
    const s = this.session;
    if (!s?.started || !s.boxes) return null;
    return { session: s, aim: this.aimAt(s.boxes, this.clamp(s)), ghost: s.ghostShown ? null : this.readGhost(s) };
  };

  /** The frame of a drag: the copy shows (the first time) and follows, the grid under it shows the place, the grid there scrolls near its edges. */
  private readonly drawFrame = (read: FrameRead<T> | null) => {
    const s = read?.session;
    if (!read || !s || s !== this.session) return;
    s.pending = false;
    if (read.ghost) this.showGhost(s, read.ghost);
    this.track(s, read.aim);
    this.followEdges(s);
  };

  /** The pointer moved while dragging: the copy follows, the grid under it shows the place. */
  private track(s: Session<T>, aim: Aim<T> | null) {
    const e = s.event;
    const before = s.aim;
    s.aim = aim;
    s.refused = false;
    const args = () => this.args(s.item, s.fromIndex, s.part, aim, e ?? undefined);
    if (!this.ask('onDragMove', args())) s.refused = true;
    const changed = (before?.drag ?? null) !== (aim?.drag ?? null) || before?.toIndex !== aim?.toIndex || before?.inside !== aim?.inside;
    if (changed && !s.refused && !this.ask('onDragChange', args())) s.refused = true;
    this.host.ghost.move(s.x, s.y, aim && !s.refused ? 'move' : 'none');
    this.paint();
  }

  /** Ends the drag: drops when `drop` and the place takes it, then clears the copy and the marks. */
  private end(e: Event | null, drop: boolean) {
    const s = this.session;
    for (const stop of this.stops.splice(0)) stop();
    if (!s) return;
    this.session = null;
    s.stopEdge?.();
    s.stopScroll?.();
    s.boxes?.stop();
    if (!s.started) return;
    this.host.ghost.hide();
    if (s.content && !s.content.isDisposed) void s.content.dispose({ skipLeaveTransition: true });
    s.part.attr.add({ releasePointerCapture: s.pointerId });
    mark(this.grid, 'data-row-dragging', false);
    const aim = s.aim && !s.refused ? s.aim : null;
    const pending: PromiseLike<unknown>[] = [];
    if (drop) {
      const ended = this.ask('onDragEnd', this.args(s.item, s.fromIndex, s.part, aim, e ?? undefined));
      if (ended && aim) pending.push(...this.drop(s, aim, e));
    }
    // The marks stay while the handlers' work runs.
    const clear = () => {
      for (const d of DRAGGERS) d.clearMarks();
    };
    if (pending.length) void Promise.allSettled(pending.map((p) => Promise.resolve(p))).then(clear);
    else clear();
  }

  /** The drop: `onReorder` here, or `onRemove` here and `onAdd` on the grid it went to. Returns their promises. */
  private drop(s: Session<T>, aim: Aim<T>, e: Event | null): PromiseLike<unknown>[] {
    const out: PromiseLike<unknown>[] = [];
    const make = (on: RowDrag<T>) => {
      const args = on.args(s.item, s.fromIndex, s.part, aim, e ?? undefined, this);
      delete (args as { cancel?: boolean }).cancel;
      return args as GridRowDropEventArgs<T>;
    };
    if (aim.drag === this) {
      if (!aim.inside && aim.toIndex === s.fromIndex) return out;
      const ev = make(this);
      this.tell('onReorder', ev);
      if (ev.promise) out.push(ev.promise);
      if (aim.inside) this.model.announce(this.model.text('gridRowDroppedOnto', { position: this.model.formatter.count(this.model.localOf(aim.toIndex) + 1) }));
      else this.announceMove(aim.toIndex);
      void Promise.allSettled([Promise.resolve(ev.promise)]).then(() => this.follow(s.item, s.fromIndex));
      return out;
    }
    const removed = make(this);
    this.tell('onRemove', removed);
    if (removed.promise) out.push(removed.promise);
    const added = make(aim.drag);
    aim.drag.tell('onAdd', added);
    if (added.promise) out.push(added.promise);
    this.model.announce(this.model.text('gridRowMovedTo', { grid: aim.drag.host.label() }));
    return out;
  }

  /** The arguments of an event of this grid's handlers about the dragged row; `from` is the grid it comes from. */
  private args(item: T, fromIndex: number, part: ComponentBase, aim: Aim<T> | null, event: Event | undefined, from: RowDrag<T> = this): GridRowDragEventArgs<T> {
    const to = aim?.drag ?? null;
    const toIndex = aim ? aim.toIndex : -1;
    return {
      component: this.grid,
      fromComponent: from.grid,
      toComponent: to?.grid ?? null,
      itemData: item,
      itemKey: from.keyOf(item),
      itemPart: part,
      fromIndex,
      toIndex,
      toItemData: to && toIndex >= 0 ? to.dataRowAt(toIndex) : undefined,
      dropInsideItem: !!aim?.inside,
      fromData: untracked(() => from.options.get('data')),
      toData: to ? untracked(() => to.options.get('data')) : undefined,
      event,
      cancel: false,
    };
  }

  /** Raises a cancelable handler; whether it may go on. */
  private ask(name: 'onDragStart' | 'onDragMove' | 'onDragChange' | 'onDragEnd', e: GridRowDragEventArgs<T>): boolean {
    const handler = this.options.handlers[name];
    if (typeof handler !== 'function') return true;
    untracked(() => handler(e));
    return !e.cancel;
  }

  private tell(name: 'onReorder' | 'onAdd' | 'onRemove', e: GridRowDropEventArgs<T>) {
    const handler = this.options.handlers[name];
    if (typeof handler === 'function') untracked(() => handler(e));
  }

  /** Where a row dragged to the point would land in a grid of the drag (this one, or one of its group), or `null`. */
  private aimAt(boxes: DragBoxes, point: Point): Aim<T> | null {
    const viewport = boxes.at(point, this.grid);
    if (!viewport) return null;
    const rect = boxes.rectOf(viewport);
    for (const d of [this, ...DRAGGERS]) if (d.viewport === viewport) return rect ? d.placeAt(point.y, rect, d === this ? this.session : null) : null;
    return null;
  }

  /** Where a row dragged to `y` would land among this grid's rows (`view`: the part of them on the screen); `source` is the drag when it comes from this grid. */
  private placeAt(y: number, view: Rect, source: Session<T> | null): Aim<T> | null {
    const { model, options } = this;
    const own = source !== null;
    const reorder = untracked(() => options.get('allowReordering'));
    const insideOn = untracked(() => options.get('allowDropInsideItem'));
    if (own && !reorder && !insideOn) return null;
    const placed = this.body.placed();
    const rows = placed.filter((p) => p.bottom > view.top && p.top < view.bottom && model.localOf(p.index) >= 0);
    const n = model.reachable();
    const bodyTop = rectOf(this.body).top;
    if (!rows.length) {
      if (own) return null;
      return { drag: this, local: 0, inside: false, toIndex: n ? model.viewAt(0) : 0, line: 0, target: null, shift: 0 };
    }
    const place = rowDropPlace(rows, y, (k) => insideOn && this.dataRowAt(rows[k].index) !== undefined && !(own && rows[k].index === source!.fromIndex));
    if (place.inside >= 0) {
      const p = rows[place.inside];
      return { drag: this, local: model.localOf(p.index), inside: true, toIndex: p.index, line: null, target: p.part, shift: 0 };
    }
    if (own && !reorder) return null;
    const gap = place.gap < rows.length ? model.localOf(rows[place.gap].index) : model.localOf(rows[rows.length - 1].index) + 1;
    const line = (place.gap < rows.length ? rows[place.gap].top : rows[rows.length - 1].bottom) - bodyTop;
    if (own) {
      const s = model.localOf(source!.fromIndex);
      const local = gap > s ? gap - 1 : gap;
      const toIndex = model.viewAt(local);
      // The row at the place: the dragged row stands at its bottom when it goes down, at its top when it goes up.
      const at = placed.find((p) => p.index === toIndex);
      const shift = local === s ? 0 : !at ? (local - s) * source!.height : local > s ? at.bottom - bodyTop - (source!.top + source!.height) : at.top - bodyTop - source!.top;
      return { drag: this, local, inside: false, toIndex, line: local === s ? null : line, target: null, shift };
    }
    const toIndex = gap < n ? model.viewAt(gap) : n ? model.viewAt(n - 1) + 1 : 0;
    return { drag: this, local: gap, inside: false, toIndex, line, target: null, shift: 0 };
  }

  /** Draws the marks of every grid of the drag: the place it would land, the room made for it, the row it came from. */
  private paint() {
    const s = this.session;
    const aim = s?.aim && !s.refused ? s.aim : null;
    for (const d of DRAGGERS) {
      if (d !== this && d !== aim?.drag && !d.marked) continue;
      d.markAim(d === aim?.drag ? aim : null, d === this ? s : null);
    }
  }

  /** Shows where a row would land in this grid (`aim`), and, while it comes from here, where it was. */
  private markAim(aim: Aim<T> | null, source: Session<T> | null) {
    const { model, body } = this;
    const push = untracked(() => this.options.get('dropFeedbackMode')) === 'push' && !untracked(() => this.options.get('allowDropInsideItem'));
    this.marked = true;
    mark(this.grid, 'data-row-dragging', true);
    body.markDropRow(aim?.inside ? aim.target : null);
    body.showDropLine(!push && aim && !aim.inside ? aim.line : null);
    const from = source ? model.localOf(source.fromIndex) : -1;
    if (!push || !aim || aim.inside) {
      body.setDragLook(null, source ? source.fromIndex : -1, push);
      return;
    }
    const height = source?.height ?? model.state.rowHeight;
    if (source) {
      // Within the grid: the rows between make room, the row itself shows where it would go.
      const to = aim.local;
      const shift = aim.shift;
      body.setDragLook((i) => {
        const l = model.localOf(i);
        if (l === from) return shift;
        if (to > from && l > from && l <= to) return -height;
        if (to < from && l >= to && l < from) return height;
        return 0;
      }, source.fromIndex, true);
      return;
    }
    // Another grid's row: the rows from the place on move down to make room.
    body.setDragLook((i) => (model.localOf(i) >= aim.local ? height : 0), -1, true);
  }

  private clearMarks() {
    if (!this.marked) return;
    this.marked = false;
    if (!this.session) mark(this.grid, 'data-row-dragging', false);
    this.body.markDropRow(null);
    this.body.showDropLine(null);
    this.body.setDragLook(null, -1, false);
  }

  /**
   * Scrolls the grid under the pointer (or this one) while the pointer is near its top or bottom edge, below its sticky
   * header, frame by frame; the scroll tells where the row would land again.
   */
  private followEdges(s: Session<T>) {
    const d = s.aim?.drag ?? this;
    if (s.edgeOf === d) return;
    s.stopEdge?.();
    s.edgeOf = d;
    s.stopEdge = null;
    const viewport = d.viewport;
    if (!viewport || !untracked(() => d.options.get('autoScroll'))) return;
    s.stopEdge = autoScroll(this.grid, viewport, () => (this.session === s ? this.clamp(s) : null), () => s.boxes?.moved(), {
      axis: 'y',
      top: d.host.head?.() ?? undefined,
      zone: untracked(() => d.options.get('scrollSensitivity')),
      speed: untracked(() => d.options.get('scrollSpeed')),
      whileOver: true,
    });
  }

  /** The pointer kept inside `boundary`; read with the window's reads. */
  private clamp(s: Session<T>): Point {
    if (!s.boundary) return { x: s.x, y: s.y };
    const b = rectOf(s.boundary);
    return { x: Math.max(b.left, Math.min(b.right - 1, s.x)), y: Math.max(b.top, Math.min(b.bottom - 1, s.y)) };
  }

  /** What the copy of the row takes from the grid: its columns, its width and sideways scroll, the row height, and the box it stays in. */
  private readGhost(s: Session<T>): FrameRead<T>['ghost'] {
    const viewport = this.viewport;
    const box = viewport ? boxOf(viewport) : null;
    return {
      columns: viewport ? styleOf(viewport, ['--_columns'])['--_columns'] : null,
      width: box?.clientWidth ?? 0,
      scrolled: box?.scrollStart ?? 0,
      rowHeight: styleOf(this.grid, ['--_row-height'])['--_row-height'],
      bounds: s.boundary ? rectOf(s.boundary) : null,
    };
  }

  /** The copy of the row (or the drag template) under the pointer. */
  private showGhost(s: Session<T>, look: NonNullable<FrameRead<T>['ghost']>) {
    const { options } = this;
    s.ghostShown = true;
    const template = options.handlers.dragTemplate;
    let content: ComponentBase;
    if (typeof template === 'function') {
      const made = untracked(() => template({ itemData: s.item, itemPart: s.part }));
      if (made instanceof ComponentBase) {
        // The copy's box holds it, and it goes with the box.
        s.content = made;
        content = made;
      } else {
        content = loose<HTMLSpanElement>('span');
        textPart(content, String(made ?? ''));
      }
    } else {
      const rowsPart = loose<HTMLDivElement>('div', 'mx-data-grid__ghost-rows');
      rowsPart.attr.add({ 'data-grid-id': this.host.gridId ?? '' });
      if (look.columns !== null) {
        css(rowsPart, '--_columns', look.columns);
        css(rowsPart, 'inline-size', `${look.width}px`);
      }
      css(rowsPart, '--_row-height', look.rowHeight);
      const copy = this.host.ghost.copyPart(s.part, false);
      copy.style({ transform: '', translate: '' });
      put(copy, 'data-drag-source', null);
      if (look.scrolled) css(copy, 'margin-inline-start', `${-look.scrolled}px`);
      rowsPart.controls.add(copy);
      content = rowsPart;
    }
    const offset = this.cursorOffset() ?? s.offset;
    this.host.ghost.showAt(content, 'row', s.x, s.y, {
      offset,
      root: this.appPart('container'),
      direction: untracked(() => options.get('dragDirection')),
      bounds: look.bounds,
    });
  }

  /** The app's `boundary` or `container` as a component: the one it gives, or the one its selector finds. */
  private appPart(name: 'boundary' | 'container'): ComponentBase | null {
    const given = untracked(() => this.options.get(name));
    if (!given) return null;
    return typeof given === 'string' ? componentOf(this.grid, given) : given;
  }

  /** `cursorOffset` as `{ x, y }`, or `null` when it is not given. */
  private cursorOffset(): { x: number; y: number } | null {
    const given = untracked(() => this.options.get('cursorOffset'));
    if (given === undefined || given === null || given === '') return null;
    if (typeof given === 'string') {
      const [x = 0, y = 0] = given.trim().split(/\s+/).map(Number);
      return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
    }
    return { x: given.x ?? 0, y: given.y ?? 0 };
  }

  /** The data row at grid index `i`, `undefined` for a group row, a footer, a new row or one still loading. */
  dataRowAt(i: number): T | undefined {
    const { model } = this;
    if (i < 0 || model.groupAt(i) || model.footerAt(i)) return undefined;
    const rowId = model.rowIdAt(i);
    return rowId === undefined || model.isNew(rowId) ? undefined : model.rowAt(i);
  }

  private keyOf(row: T): unknown {
    const adapter = this.model.data.source.adapter;
    return adapter.keys.hasKey(row) ? adapter.keyOf(row) : undefined;
  }

  /** The next data row from `i` in direction `dir` among the reachable rows, or -1. */
  private nextDataRow(i: number, dir: 1 | -1): number {
    const { model } = this;
    const n = model.reachable();
    for (let l = model.localOf(i) + dir; l >= 0 && l < n; l += dir) {
      const at = model.viewAt(l);
      if (this.dataRowAt(at) !== undefined) return at;
      if (model.groupAt(at)) return -1;
    }
    return -1;
  }

  private announceMove(toIndex: number) {
    const { model } = this;
    model.announce(model.text('gridRowMoved', { position: model.formatter.count(model.localOf(toIndex) + 1), count: model.formatter.count(model.reachable()) }));
  }

  /** After the data moved the row, it stays the active row where it is now. */
  private async follow(row: T, from: number) {
    const { model } = this;
    const key = this.keyOf(row);
    for (let k = 0; k < 20; k++) {
      await new Promise((r) => setTimeout(r, 0));
      if (this.grid.isDisposed) return;
      const at = key !== undefined ? this.grid.getRowIndexByKey(key) : model.indexOfRow(row);
      if (at >= 0 && at !== from) {
        if (model.state.activeRow === from) this.host.focusRow(at);
        return;
      }
    }
  }
}
