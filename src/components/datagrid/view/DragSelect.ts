import { untracked } from '@motifx/core';
import { scrollStep } from '../../../parts/drag/scroll-step';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, DRAG_FIELD, EXPAND_FIELD, SELECT_FIELD } from '../model/ColumnModel';
import type { GridModel } from '../model/GridModel';
import type { DragSelectHost } from './drag-select-host';
import type { GridBody } from './GridBody';
import { nextFrame, stopFrame } from './next-frame';

/** What a press inside a cell leaves to the cell's own content: links, buttons, fields, the editor. */
const OWN_CONTROLS =
  'a[href], button, input, select, textarea, label, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [role="switch"], [role="checkbox"]:not(.mx-data-grid__check), .mx-data-grid__editor';

/** A press that may become a drag selection. */
interface Press {
  pointerId: number;
  kind: 'rows' | 'cells';
  how: 'replace' | 'add' | 'extend' | 'paint';
  startX: number;
  startY: number;
  x: number;
  y: number;
  index: number;
  field: string;
  touch: boolean;
  started: boolean;
  /** The row and column the selection reached last. */
  at: { index: number; field: string } | null;
  frame: number;
  timer: ReturnType<typeof setTimeout> | undefined;
}

/** The part of the viewport the rows show in, and inside it the part that scrolls sideways (between the pinned columns). */
interface Area {
  left: number;
  right: number;
  top: number;
  bottom: number;
  innerLeft: number;
  innerRight: number;
}

/**
 * Selecting by dragging: a press on a row or a cell that moves past `dragSelectionThreshold` selects
 * the rows passed (multiple selection) or draws a range of cells (`cellSelection`), live; a shorter
 * move stays a click, so clicks that select or start editing work as before. Near or past an edge the
 * rows scroll, down and sideways, frame by frame, and the cells that come into view are taken in. On
 * a touch screen a drag scrolls, unless a long press starts the selection (`dragSelectionTouch`).
 * Escape gives the drag up. While it runs the browser selects no text; Alt+drag is left to it.
 */
export class DragSelect<T> {
  private pressed: Press | null = null;
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly model: GridModel<T>,
    private readonly body: GridBody<T>,
    private readonly host: DragSelectHost,
  ) {}

  /** A drag selection is running (past the threshold). */
  get active(): boolean {
    return !!this.pressed?.started;
  }

  dispose() {
    this.end(false);
  }

  /** A press in the rows: watched when a drag selection may start from it. Returns whether it is. */
  press(e: PointerEvent): boolean {
    const { model } = this;
    if (e.button !== 0 || this.pressed || e.altKey || untracked(() => model.state.busy)) return false;
    const target = e.target as HTMLElement;
    if (this.body.detailOf(target)) return false;
    const cell = target.closest?.('.mx-data-grid__cell') as HTMLElement | null;
    const view = cell ? this.body.rowOf(cell) : undefined;
    if (!cell || !view || view.index < 0 || view.row === undefined || view.rowId === undefined) return false;
    const field = cell.dataset.field ?? '';
    if (field === EXPAND_FIELD || field === ADAPTIVE_FIELD || field === DRAG_FIELD || field === ACTIONS_FIELD) return false;
    const own = target.closest(OWN_CONTROLS);
    if (own && cell.contains(own)) return false;
    const kind = untracked(() => this.kindAt(view.index, field));
    if (!kind) return false;
    const touch = e.pointerType === 'touch';
    if (touch && untracked(() => model.settings.get('dragSelectionTouch')) !== 'longPress') return false;
    const ctrl = e.ctrlKey || e.metaKey;
    const multiple = untracked(() => model.settings.get('cellSelection')) === 'multiple';
    const how = kind === 'rows' ? (field === SELECT_FIELD ? 'paint' : e.shiftKey ? 'extend' : ctrl ? 'add' : 'replace') : e.shiftKey ? 'extend' : ctrl && multiple ? 'add' : 'replace';
    const p: Press = { pointerId: e.pointerId, kind, how, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, index: view.index, field, touch, started: false, at: null, frame: 0, timer: undefined };
    this.pressed = p;
    this.listen(target.ownerDocument);
    if (touch) p.timer = setTimeout(() => this.pressed === p && this.start(), Math.max(0, untracked(() => model.settings.get('dragSelectionLongPress'))));
    return true;
  }

  /** The rows changed while a drag runs (rows that were loading came): the selection is made again where the pointer is. */
  refresh() {
    const p = this.pressed;
    if (!p?.started) return;
    p.at = null;
    this.track();
  }

  /** What a press on grid row `index`, column `field` would select by dragging; `null` for nothing. */
  private kindAt(index: number, field: string): 'rows' | 'cells' | null {
    const { model } = this;
    const settings = model.settings;
    const cells = settings.get('cellSelection') !== 'none';
    if (cells && model.cellRanges.axis().includes(field)) {
      if (!settings.get('cellDragSelection')) return null;
      if (!settings.get('dragSelectionOnEditableCells')) {
        const row = model.rowAt(index);
        const rowId = model.rowIdAt(index);
        if (row !== undefined && model.columns.canFill(field, row, model.isNew(rowId))) return null;
      }
      return 'cells';
    }
    const rows = settings.get('selection') === 'multiple' && settings.get('rowDragSelection') && !model.isNew(model.rowIdAt(index));
    return rows && (field === SELECT_FIELD || !cells) ? 'rows' : null;
  }

  private listen(doc: Document) {
    const win = doc.defaultView ?? window;
    const move = (e: PointerEvent) => this.onMove(e);
    const up = (e: PointerEvent) => this.onUp(e);
    const cancel = (e: PointerEvent) => e.pointerId === this.pressed?.pointerId && this.end(true);
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !this.pressed?.started) return;
      e.preventDefault();
      e.stopPropagation();
      this.end(false);
    };
    // No text is selected and nothing is dragged by the browser from this press.
    const quiet = (e: Event) => e.preventDefault();
    const touchMove = (e: TouchEvent) => this.pressed?.started && e.preventDefault();
    const menu = (e: Event) => this.pressed?.started && e.preventDefault();
    const blur = () => this.end(true);
    win.addEventListener('pointermove', move);
    win.addEventListener('pointerup', up);
    win.addEventListener('pointercancel', cancel);
    win.addEventListener('keydown', key, true);
    win.addEventListener('blur', blur);
    doc.addEventListener('selectstart', quiet, true);
    doc.addEventListener('dragstart', quiet, true);
    doc.addEventListener('touchmove', touchMove, { capture: true, passive: false });
    doc.addEventListener('contextmenu', menu, true);
    this.stops.push(() => {
      win.removeEventListener('pointermove', move);
      win.removeEventListener('pointerup', up);
      win.removeEventListener('pointercancel', cancel);
      win.removeEventListener('keydown', key, true);
      win.removeEventListener('blur', blur);
      doc.removeEventListener('selectstart', quiet, true);
      doc.removeEventListener('dragstart', quiet, true);
      doc.removeEventListener('touchmove', touchMove, true);
      doc.removeEventListener('contextmenu', menu, true);
    });
  }

  private onMove(e: PointerEvent) {
    const p = this.pressed;
    if (!p || e.pointerId !== p.pointerId) return;
    p.x = e.clientX;
    p.y = e.clientY;
    if (!p.started) {
      const threshold = untracked(() => this.model.settings.get('dragSelectionThreshold'));
      if (Math.max(Math.abs(p.x - p.startX), Math.abs(p.y - p.startY)) < threshold) return;
      // A finger that moves before the long press is over scrolls.
      if (p.touch) {
        this.end(true);
        return;
      }
      if (!this.start()) return;
    }
    this.track();
    this.autoScroll();
  }

  private onUp(e: PointerEvent) {
    const p = this.pressed;
    if (!p || e.pointerId !== p.pointerId) return;
    if (p.started) {
      // The click that follows is not a click on the cell.
      const view = (e.target as Node | null)?.ownerDocument?.defaultView ?? window;
      const swallow = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      view.addEventListener('click', swallow, true);
      setTimeout(() => view.removeEventListener('click', swallow, true), 0);
    }
    this.end(true);
  }

  /** Past the threshold (or the long press): the selection starts at the pressed cell. Returns whether it goes on. */
  private start(): boolean {
    const p = this.pressed!;
    clearTimeout(p.timer);
    if (!untracked(() => this.host.begin(p.kind, p.index, p.field, p.how))) {
      this.end(true);
      return false;
    }
    p.started = true;
    p.at = { index: p.index, field: p.field };
    const root = this.host.root();
    root.dataset.dragSelecting = p.kind;
    root.ownerDocument.getSelection?.()?.removeAllRanges();
    const vp = this.host.viewport();
    if (!p.touch) {
      try {
        vp?.setPointerCapture?.(p.pointerId);
      } catch {
        // A pointer the browser no longer knows: the window's events still come.
      }
    }
    return true;
  }

  /** Where the pointer is now (kept inside the rows' area): the row and column the selection reaches. */
  private track() {
    const p = this.pressed;
    if (!p?.started) return;
    const area = this.area();
    if (!area) return;
    const index = this.rowAt(p.y, area);
    if (index < 0) return;
    const field = p.kind === 'cells' ? this.fieldAt(p.x, area) ?? p.at?.field ?? p.field : p.field;
    if (p.at && p.at.index === index && p.at.field === field) return;
    p.at = { index, field };
    untracked(() => this.host.reach(p.kind, index, field));
  }

  /** Scrolls while the pointer is near or past an edge, a step a frame, and takes in the rows and columns that come. */
  private autoScroll() {
    const p = this.pressed;
    if (!p?.started) return;
    stopFrame(p.frame);
    p.frame = 0;
    const settings = this.model.settings;
    if (!untracked(() => settings.get('dragSelectionAutoScroll'))) return;
    const vp = this.host.viewport();
    const area = this.area();
    if (!vp || !area) return;
    const speed = untracked(() => settings.get('dragSelectionScrollSpeed'));
    const near = untracked(() => settings.get('dragSelectionScrollSensitivity'));
    const dy = scrollStep(p.y, area.top, area.bottom, near, speed);
    const dx = p.kind === 'cells' ? scrollStep(p.x, area.innerLeft, area.innerRight, near, speed) : 0;
    if (!dx && !dy) return;
    const top = vp.scrollTop;
    const left = vp.scrollLeft;
    if (dy) vp.scrollTop = top + dy;
    if (dx) vp.scrollLeft = left + dx;
    if (vp.scrollTop === top && vp.scrollLeft === left) return;
    this.body.onScroll();
    if (vp.scrollLeft !== left) this.host.columnsScrolled();
    this.track();
    p.frame = nextFrame(() => this.autoScroll());
  }

  private end(kept: boolean) {
    const p = this.pressed;
    for (const stop of this.stops.splice(0)) stop();
    if (!p) return;
    this.pressed = null;
    clearTimeout(p.timer);
    stopFrame(p.frame);
    if (!p.started) return;
    const root = this.host.root();
    delete root.dataset.dragSelecting;
    const vp = this.host.viewport();
    if (vp?.hasPointerCapture?.(p.pointerId)) vp.releasePointerCapture(p.pointerId);
    untracked(() => this.host.finish(p.kind, kept));
  }

  private area(): Area | null {
    const vp = this.host.viewport();
    if (!vp) return null;
    const r = vp.getBoundingClientRect();
    const head = vp.querySelector<HTMLElement>(':scope > .mx-data-grid__head')?.getBoundingClientRect().height ?? 0;
    const footEl = vp.querySelector<HTMLElement>(':scope > .mx-data-grid__foot');
    const foot = footEl && !footEl.hidden ? footEl.getBoundingClientRect().height : 0;
    const width = vp.clientWidth || r.width;
    const height = vp.clientHeight || r.height;
    const rtl = this.host.isRtl();
    // The vertical scroll bar sits at the end: on the left right to left.
    const left = rtl ? r.right - width : r.left;
    const right = left + width;
    const cols = this.model.columns;
    const pinned = untracked(() => cols.stickyWidths(cols.visible()));
    return { left, right, top: r.top + head, bottom: r.top + height - foot, innerLeft: left + (rtl ? pinned.end : pinned.start), innerRight: right - (rtl ? pinned.start : pinned.end) };
  }

  /** The grid row at height `y` (kept inside the rows shown): the last one starting above it. */
  private rowAt(y: number, area: Area): number {
    const at = Math.max(area.top, Math.min(area.bottom - 1, y));
    const rows = this.body.placed().filter((p) => p.bottom > area.top && p.top < area.bottom);
    if (!rows.length) return -1;
    let found = rows[0];
    for (const p of rows) if (p.top <= at) found = p;
    return found.index;
  }

  /** The selectable column at `x` (kept inside the viewport): a pinned one over the others, else the nearest. */
  private fieldAt(x: number, area: Area): string | null {
    const cols = this.model.columns;
    const axis = untracked(() => this.model.cellRanges.axis());
    const at = Math.max(area.left, Math.min(area.right - 1, x));
    let nearest: string | null = null;
    let distance = Infinity;
    let inside: string | null = null;
    for (const field of axis) {
      const cell = this.host.headerCell(field);
      if (!cell?.isConnected) continue;
      const r = cell.getBoundingClientRect();
      if (r.width <= 0) continue;
      if (at >= r.left && at < r.right) {
        if (untracked(() => cols.sideOf(field))) return field;
        inside ??= field;
        continue;
      }
      const d = at < r.left ? r.left - at : at - r.right;
      if (d < distance) {
        distance = d;
        nearest = field;
      }
    }
    return inside ?? nearest;
  }
}
