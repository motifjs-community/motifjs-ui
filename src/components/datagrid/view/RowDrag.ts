import { ComponentBase, untracked } from '@motifx/core';
import { parseChord } from '../../../core/keyboard';
import { isNode } from '../../../core/node-kind';
import type { GridRowDragEventArgs } from '../grid-row-drag-event-args';
import type { GridRowDropEventArgs } from '../grid-row-drop-event-args';
import type { GridModel } from '../model/GridModel';
import type { GridBody } from './GridBody';
import type { RowDragHost } from './row-drag-host';
import { rowDropPlace } from './row-drop-place';
import { scrollStep } from '../../../parts/drag/scroll-step';
import { nextFrame, stopFrame } from './next-frame';

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
  target: HTMLElement | null;
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
  element: HTMLElement;
  /** The row's top and height, from the top of the rows, when it was taken. */
  top: number;
  height: number;
  /** Where the pointer took it, from its left (level with the rows) and top. */
  offset: { x: number; y: number };
  started: boolean;
  aim: Aim<T> | null;
  /** The handlers took no drop where it is now. */
  refused: boolean;
  frame: number;
  /** The drag template's component, disposed at the end. */
  content: ComponentBase | null;
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

/** An element given as itself or as a CSS selector. */
function elementOf(given: string | HTMLElement | undefined): HTMLElement | null {
  if (!given) return null;
  if (typeof given !== 'string') return given;
  try {
    return document.querySelector<HTMLElement>(given);
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

  dispose() {
    this.end(null, false);
    DRAGGERS.delete(this);
  }

  /** A click on a row: a drag may start once the pointer moves far enough. Returns whether it is watched. */
  press(e: PointerEvent): boolean {
    const { model, options } = this;
    if (e.button !== 0 || this.session || !untracked(() => options.enabled) || model.state.busy || model.state.session) return false;
    const target = e.target as HTMLElement;
    const view = this.body.rowOf(target);
    if (!view || view.index < 0 || view.row === undefined || view.rowId === undefined || model.isNew(view.rowId)) return false;
    const handle = untracked(() => options.get('handle'));
    if (handle) {
      const by = target.closest?.(handle);
      if (!by || !view.element.contains(by)) return false;
    } else if (untracked(() => options.showsIcons)) {
      if (!target.closest('.mx-data-grid__drag')) return false;
    } else if (target.closest('.mx-data-grid__action, .mx-data-grid__editor, .mx-data-grid__expand-button, .mx-data-grid__adaptive-button')) return false;
    const vp = this.host.viewport();
    const rect = view.element.getBoundingClientRect();
    const top = rect.top - this.body.element.getBoundingClientRect().top;
    this.session = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      fromIndex: view.index,
      item: view.row,
      element: view.element,
      top,
      height: rect.height || model.state.rowHeight,
      offset: { x: e.clientX - (vp?.getBoundingClientRect().left ?? rect.left), y: e.clientY - rect.top },
      started: false,
      aim: null,
      refused: false,
      frame: 0,
      content: null,
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
    // The window the grid is in (a window the app opened has its own events).
    const win = target.ownerDocument.defaultView ?? window;
    win.addEventListener('pointermove', move);
    win.addEventListener('pointerup', up);
    win.addEventListener('pointercancel', up);
    win.addEventListener('keydown', key, true);
    this.stops.push(() => {
      win.removeEventListener('pointermove', move);
      win.removeEventListener('pointerup', up);
      win.removeEventListener('pointercancel', up);
      win.removeEventListener('keydown', key, true);
    });
    // The drag icon does not select text or start the browser's own drag.
    if (target.closest('.mx-data-grid__drag')) e.preventDefault();
    return true;
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
    const aim: Aim<T> = { drag: this, local: model.localOf(toIndex), inside: false, toIndex, line: null, target: null };
    const element = this.host.grid.getRowElement(fromIndex) ?? this.host.root();
    const args = () => this.args(row, fromIndex, element, aim, event);
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
    this.track(e);
    const point = this.clamp(s.x, s.y);
    this.autoScroll(point.x, point.y);
  }

  private onUp(e: PointerEvent) {
    const s = this.session;
    if (!s || e.pointerId !== s.pointerId) return;
    if (!s.started) {
      this.end(null, false);
      return;
    }
    // The click that follows the drop is not a click on the row.
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    const view = (e.target as Node | null)?.ownerDocument?.defaultView ?? window;
    view.addEventListener('click', swallow, true);
    setTimeout(() => view.removeEventListener('click', swallow, true), 0);
    this.end(e, e.type === 'pointerup');
  }

  /** The drag passed the threshold: `onDragStart`, then the copy and the marks. Returns whether it goes on. */
  private start(e: PointerEvent): boolean {
    const s = this.session!;
    const aim: Aim<T> = { drag: this, local: this.model.localOf(s.fromIndex), inside: false, toIndex: s.fromIndex, line: null, target: null };
    if (!this.ask('onDragStart', this.args(s.item, s.fromIndex, s.element, aim, e))) {
      this.end(null, false);
      return false;
    }
    s.started = true;
    s.aim = aim;
    s.element.setPointerCapture?.(e.pointerId);
    this.host.root().toggleAttribute('data-row-dragging', true);
    this.showGhost(e);
    this.paint();
    return true;
  }

  /** The pointer moved while dragging: the copy follows, the grid under it shows the place, the rows scroll near the edges. */
  private track(e: PointerEvent | null) {
    const s = this.session;
    if (!s?.started) return;
    const point = this.clamp(s.x, s.y);
    const before = s.aim;
    const aim = this.aimAt(point.x, point.y);
    s.aim = aim;
    s.refused = false;
    const args = () => this.args(s.item, s.fromIndex, s.element, aim, e ?? undefined);
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
    stopFrame(s.frame);
    if (!s.started) return;
    this.host.ghost.hide();
    if (s.content && !s.content.isDisposed) void s.content.dispose({ skipLeaveTransition: true });
    if (s.element.hasPointerCapture?.(s.pointerId)) s.element.releasePointerCapture(s.pointerId);
    this.host.root().toggleAttribute('data-row-dragging', false);
    const aim = s.aim && !s.refused ? s.aim : null;
    const pending: PromiseLike<unknown>[] = [];
    if (drop) {
      const ended = this.ask('onDragEnd', this.args(s.item, s.fromIndex, s.element, aim, e ?? undefined));
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
      const args = on.args(s.item, s.fromIndex, s.element, aim, e ?? undefined, this);
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
  private args(item: T, fromIndex: number, element: HTMLElement, aim: Aim<T> | null, event: Event | undefined, from: RowDrag<T> = this): GridRowDragEventArgs<T> {
    const to = aim?.drag ?? null;
    const toIndex = aim ? aim.toIndex : -1;
    return {
      component: this.grid,
      fromComponent: from.grid,
      toComponent: to?.grid ?? null,
      itemData: item,
      itemKey: from.keyOf(item),
      itemElement: element,
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
  private aimAt(x: number, y: number): Aim<T> | null {
    const group = untracked(() => this.options.get('group'));
    for (const d of [this, ...DRAGGERS]) {
      if (d !== this && (!group || untracked(() => d.options.get('group')) !== group)) continue;
      const vp = d.host.viewport();
      if (!vp || !vp.isConnected) continue;
      const r = vp.getBoundingClientRect();
      if (x < r.left || x >= r.right || y < r.top || y >= r.bottom) continue;
      return d.placeAt(y, r, d === this ? this.session : null);
    }
    return null;
  }

  /** Where a row dragged to `y` would land among this grid's rows; `source` is the drag when it comes from this grid. */
  private placeAt(y: number, view: DOMRect, source: Session<T> | null): Aim<T> | null {
    const { model, options } = this;
    const own = source !== null;
    const reorder = untracked(() => options.get('allowReordering'));
    const insideOn = untracked(() => options.get('allowDropInsideItem'));
    if (own && !reorder && !insideOn) return null;
    const rows = this.body.placed().filter((p) => p.bottom > view.top && p.top < view.bottom && model.localOf(p.index) >= 0);
    const n = model.reachable();
    const bodyTop = this.body.element.getBoundingClientRect().top;
    if (!rows.length) {
      if (own) return null;
      return { drag: this, local: 0, inside: false, toIndex: n ? model.viewAt(0) : 0, line: 0, target: null };
    }
    const place = rowDropPlace(rows, y, (k) => insideOn && this.dataRowAt(rows[k].index) !== undefined && !(own && rows[k].index === source!.fromIndex));
    if (place.inside >= 0) {
      const p = rows[place.inside];
      return { drag: this, local: model.localOf(p.index), inside: true, toIndex: p.index, line: null, target: p.element };
    }
    if (own && !reorder) return null;
    const gap = place.gap < rows.length ? model.localOf(rows[place.gap].index) : model.localOf(rows[rows.length - 1].index) + 1;
    const line = (place.gap < rows.length ? rows[place.gap].top : rows[rows.length - 1].bottom) - bodyTop;
    if (own) {
      const s = model.localOf(source!.fromIndex);
      const local = gap > s ? gap - 1 : gap;
      return { drag: this, local, inside: false, toIndex: model.viewAt(local), line: local === s ? null : line, target: null };
    }
    const toIndex = gap < n ? model.viewAt(gap) : n ? model.viewAt(n - 1) + 1 : 0;
    return { drag: this, local: gap, inside: false, toIndex, line, target: null };
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
    this.host.root().toggleAttribute('data-row-dragging', true);
    body.markDropTarget(aim?.inside ? aim.target : null);
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
      const shift = to > from ? this.offsetBetween(source, aim, true) : to < from ? this.offsetBetween(source, aim, false) : 0;
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

  /** How far the dragged row moves to stand at the place it would land: to the bottom (`down`) or the top of the row there. */
  private offsetBetween(source: Session<T>, aim: Aim<T>, down: boolean): number {
    const bodyTop = this.body.element.getBoundingClientRect().top;
    const at = this.body.placed().find((p) => p.index === aim.toIndex);
    if (!at) return (aim.local - this.model.localOf(source.fromIndex)) * source.height;
    return down ? at.bottom - bodyTop - (source.top + source.height) : at.top - bodyTop - source.top;
  }

  private clearMarks() {
    if (!this.marked) return;
    this.marked = false;
    if (!this.session) this.host.root().toggleAttribute('data-row-dragging', false);
    this.body.markDropTarget(null);
    this.body.showDropLine(null);
    this.body.setDragLook(null, -1, false);
  }

  /** Scrolls the grid under the pointer (or this one) while the pointer is near its top or bottom edge, frame by frame. */
  private autoScroll(x: number, y: number) {
    const s = this.session;
    if (!s) return;
    stopFrame(s.frame);
    const d = s.aim?.drag ?? this;
    if (!untracked(() => d.options.get('autoScroll'))) return;
    const vp = d.host.viewport();
    if (!vp) return;
    const r = vp.getBoundingClientRect();
    if (x < r.left || x >= r.right) return;
    const head = d.headHeight();
    const step = scrollStep(y, r.top + head, r.bottom, untracked(() => d.options.get('scrollSensitivity')), untracked(() => d.options.get('scrollSpeed')));
    if (!step) return;
    const before = vp.scrollTop;
    vp.scrollTop = before + step;
    if (vp.scrollTop === before) return;
    d.body.onScroll();
    this.track(null);
    s.frame = nextFrame(() => {
      const point = this.clamp(s.x, s.y);
      this.autoScroll(point.x, point.y);
    });
  }

  /** The height of the sticky header over the rows. */
  private headHeight(): number {
    const head = this.host.viewport()?.querySelector<HTMLElement>(':scope > .mx-data-grid__head');
    return head?.getBoundingClientRect().height ?? 0;
  }

  /** The point kept inside `boundary`. */
  private clamp(x: number, y: number): { x: number; y: number } {
    const b = elementOf(untracked(() => this.options.get('boundary')))?.getBoundingClientRect();
    if (!b) return { x, y };
    return { x: Math.max(b.left, Math.min(b.right - 1, x)), y: Math.max(b.top, Math.min(b.bottom - 1, y)) };
  }

  /** The copy of the row (or the drag template) under the pointer. */
  private showGhost(e: PointerEvent) {
    const s = this.session!;
    const { options } = this;
    const vp = this.host.viewport();
    const template = options.handlers.dragTemplate;
    let content: Node;
    if (typeof template === 'function') {
      const made = untracked(() => template({ itemData: s.item, itemElement: s.element }));
      if (made instanceof ComponentBase) {
        this.grid.controls.add(made);
        s.content = made;
        content = made.element as Node;
      } else content = isNode(made) ? made : document.createTextNode(String(made ?? ''));
    } else {
      const rows = document.createElement('div');
      rows.className = 'mx-data-grid__ghost-rows';
      rows.dataset.gridId = this.host.root().dataset.gridId ?? '';
      if (vp) {
        rows.style.setProperty('--_columns', getComputedStyle(vp).getPropertyValue('--_columns'));
        rows.style.inlineSize = `${vp.clientWidth}px`;
      }
      rows.style.setProperty('--_row-height', getComputedStyle(this.host.root()).getPropertyValue('--_row-height'));
      const copy = this.host.ghost.copyOf(s.element, false);
      copy.style.transform = '';
      copy.style.translate = '';
      copy.hidden = false;
      copy.removeAttribute('data-drag-source');
      if (vp?.scrollLeft) copy.style.marginInlineStart = `${-vp.scrollLeft}px`;
      rows.append(copy);
      content = rows;
    }
    const offset = this.cursorOffset() ?? s.offset;
    const bounds = elementOf(untracked(() => options.get('boundary')))?.getBoundingClientRect() ?? null;
    this.host.ghost.showAt(content, 'row', e.clientX, e.clientY, {
      offset,
      root: elementOf(untracked(() => options.get('container'))),
      direction: untracked(() => options.get('dragDirection')),
      bounds,
    });
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
