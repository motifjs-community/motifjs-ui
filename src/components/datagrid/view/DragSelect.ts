import { untracked, type ComponentBase } from '@motifx/core';
import { canTakeFocus } from '../../../core/focus';
import { boxOf, everyFrame, isInPage, measure, rectOf } from '../../../core/measure';
import { mark, put } from '../../../core/part-writes';
import { onDocument, onWindow } from '../../../core/window-events';
import { autoScroll } from '../../../parts/drag/auto-scroll';
import { Field } from '../../../parts/field/Field';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, DRAG_FIELD, EXPAND_FIELD, SELECT_FIELD } from '../model/ColumnModel';
import type { GridModel } from '../model/GridModel';
import type { DragSelectHost } from './drag-select-host';
import type { GridBody } from './GridBody';
import type { GridRow } from './GridRow';
import { HeaderRow } from './HeaderRow';

/** A click that may become a drag selection. */
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
  timer: ReturnType<typeof setTimeout> | undefined;
}

/** The part of the viewport the rows show in. */
interface Area {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Selecting by dragging: a click on a row or a cell that moves past `dragSelectionThreshold` selects
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
  ) {
    // No text is selected from a press that may draw a selection: the rows cancel their own selectstart.
    body.motif.on('selectstart', (_, e) => {
      if (this.pressed) e.preventDefault();
    });
  }

  /** A drag selection is running (past the threshold). */
  get active(): boolean {
    return !!this.pressed?.started;
  }

  dispose() {
    this.end(false);
  }

  /** A click in the rows: watched when a drag selection may start from it. Returns whether it is. */
  press(e: PointerEvent): boolean {
    const { model } = this;
    if (e.button !== 0 || this.pressed || e.altKey || untracked(() => model.state.busy)) return false;
    // A press in a row's details is in none of the rows.
    const view = this.body.rowFrom(e);
    if (!view || view.index < 0 || view.row === undefined || view.rowId === undefined) return false;
    const field = untracked(() => model.columns.visible()).find((f) => view.cellPart(f)?.motif.isEventFrom(e));
    if (field === undefined || field === EXPAND_FIELD || field === ADAPTIVE_FIELD || field === DRAG_FIELD || field === ACTIONS_FIELD) return false;
    if (this.leftToCell(view, field, e)) return false;
    const kind = untracked(() => this.kindAt(view.index, field));
    if (!kind) return false;
    const touch = e.pointerType === 'touch';
    if (touch && untracked(() => model.settings.get('dragSelectionTouch')) !== 'longPress') return false;
    const ctrl = e.ctrlKey || e.metaKey;
    const multiple = untracked(() => model.settings.get('cellSelection')) === 'multiple';
    const how = kind === 'rows' ? (field === SELECT_FIELD ? 'paint' : e.shiftKey ? 'extend' : ctrl ? 'add' : 'replace') : e.shiftKey ? 'extend' : ctrl && multiple ? 'add' : 'replace';
    const p: Press = { pointerId: e.pointerId, kind, how, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, index: view.index, field, touch, started: false, at: null, timer: undefined };
    this.pressed = p;
    // The rows' text is not selectable while the press lasts (`user-select: none` in the grid's styles).
    mark(this.body, 'data-drag-select', true);
    this.listen();
    if (touch) p.timer = setTimeout(() => this.pressed === p && this.start(), Math.max(0, untracked(() => model.settings.get('dragSelectionLongPress'))));
    return true;
  }

  /**
   * A phone decides when the finger lands whether the page may scroll at once, by whether the place
   * has a touchmove listener that can stop it; one added on the press is too late. With the long press
   * the rows hold one from the start, and it stops the scroll only while a selection is drawn.
   * Returns what removes it.
   */
  holdTouch(rows: ComponentBase): () => void {
    const touchMove = (_: ComponentBase, e: TouchEvent | undefined) => {
      if (this.pressed?.started && e?.cancelable) e.preventDefault();
    };
    let held = false;
    const hold = () => {
      const want = this.model.settings.get('dragSelectionTouch') === 'longPress';
      if (want === held) return;
      held = want;
      if (want) void rows.motif.on('touchmove', touchMove);
      else void rows.motif.off('touchmove', touchMove);
    };
    untracked(hold);
    const stop = this.model.notices.on(() => untracked(hold));
    return () => {
      stop();
      if (held) void rows.motif.off('touchmove', touchMove);
    };
  }

  /** The rows changed while a drag runs (rows that were loading came): the selection is recreated where the pointer is, at the next frame. */
  refresh() {
    const p = this.pressed;
    if (p?.started) p.at = null;
  }

  /** What a click on grid row `index`, column `field` would select by dragging; `null` for nothing. */
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

  /**
   * Whether a click inside a cell is left to what the cell holds: the cell being edited is its editor's, and content
   * that takes focus (a link, a button, a grid inside) or is a kit field (its label included) takes its own clicks.
   */
  private leftToCell(view: GridRow<T>, field: string, e: Event): boolean {
    const editing = untracked(() => this.model.state.editing);
    if (editing && editing.rowId === view.rowId && editing.field === field) return true;
    let at: ComponentBase | undefined = view.cellPart(field);
    while (at) {
      at = at.controls.items.find((c) => c.motif.isEventFrom(e));
      if (at && (canTakeFocus(at) || at instanceof Field)) return true;
    }
    return false;
  }

  private listen() {
    const move = (e: PointerEvent) => this.onMove(e);
    const up = (e: PointerEvent) => this.onUp(e);
    const cancel = (e: PointerEvent) => e.pointerId === this.pressed?.pointerId && this.end(true);
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !this.pressed?.started) return;
      e.preventDefault();
      e.stopPropagation();
      this.end(false);
    };
    // Nothing is dragged by the browser from this press.
    const quiet = (e: Event) => e.preventDefault();
    const menu = (e: Event) => this.pressed?.started && e.preventDefault();
    const blur = () => this.end(true);
    // The drag goes on past the rows: the window and the document they are in are listened to while it runs.
    const at = this.body;
    this.stops.push(
      onWindow(at, 'pointermove', move),
      onWindow(at, 'pointerup', up),
      onWindow(at, 'pointercancel', cancel),
      onWindow(at, 'keydown', key, true),
      onWindow(at, 'blur', blur),
      onDocument(at, 'dragstart', quiet, true),
      onDocument(at, 'contextmenu', menu, true),
    );
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
      this.start();
    }
  }

  private onUp(e: PointerEvent) {
    const p = this.pressed;
    if (!p || e.pointerId !== p.pointerId) return;
    if (!p.started) {
      this.end(true);
      return;
    }
    // The click that follows is not a click on the cell.
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    setTimeout(onWindow(this.body, 'click', swallow, true), 0);
    // Where the pointer was let go is taken in with the next reads; the selection ends after that.
    p.x = e.clientX;
    p.y = e.clientY;
    this.stopAll();
    this.stops.push(measure(this.body, this.readAim, this.reachAndEnd));
  }

  /** Past the threshold (or the long press): the selection starts at the pressed cell. */
  private start() {
    const p = this.pressed!;
    clearTimeout(p.timer);
    if (!untracked(() => this.host.begin(p.kind, p.index, p.field, p.how))) {
      this.end(true);
      return;
    }
    p.started = true;
    p.at = { index: p.index, field: p.field };
    if (this.host.grid) put(this.host.grid, 'data-drag-selecting', p.kind);
    // The viewport, the body's parent, takes the pointer.
    if (!p.touch) this.body.parent?.attr.add({ setPointerCapture: p.pointerId });
    // From here the selection follows the pointer at every frame, and the rows scroll near the edges.
    this.stops.push(everyFrame(this.body, this.readAim, this.reach));
    this.scrollNearEdges(p);
  }

  /** Where the pointer is now (kept inside the rows' area), read with the frame's reads: the row and column the selection reaches. */
  private readonly readAim = (): Press['at'] => {
    const p = this.pressed;
    if (!p?.started) return null;
    const area = this.area();
    if (!area) return null;
    const index = this.rowAt(p.y, area);
    if (index < 0) return null;
    const field = p.kind === 'cells' ? this.fieldAt(p.x, area) ?? p.at?.field ?? p.field : p.field;
    return { index, field };
  };

  private readonly reach = (at: Press['at']) => {
    const p = this.pressed;
    if (!at || !p?.started) return;
    if (p.at && p.at.index === at.index && p.at.field === at.field) return;
    p.at = at;
    untracked(() => this.host.reach(p.kind, at.index, at.field));
  };

  private readonly reachAndEnd = (at: Press['at']) => {
    this.reach(at);
    this.end(true);
  };

  /** Scrolls the viewport while the pointer is near or past an edge, a step a frame: down and up, and sideways over cells. */
  private scrollNearEdges(p: Press) {
    const { model } = this;
    const settings = model.settings;
    const viewport = this.body.parent;
    if (!viewport || !untracked(() => settings.get('dragSelectionAutoScroll'))) return;
    const cols = model.columns;
    const pinned = untracked(() => cols.stickyWidths(cols.visible()));
    // In the viewport the header sits before the body and the totals after it.
    const foot = this.body.siblings.next();
    this.stops.push(
      autoScroll(
        this.body,
        viewport,
        () => (this.pressed === p ? p : null),
        // The viewport's scroll event lays the rows (and the columns) out again; the selection takes them in at the next frame.
        () => {},
        {
          axis: p.kind === 'cells' ? 'both' : 'y',
          zone: untracked(() => settings.get('dragSelectionScrollSensitivity')),
          speed: untracked(() => settings.get('dragSelectionScrollSpeed')),
          top: this.body.siblings.prev() ?? 0,
          bottom: foot && untracked(() => model.summaries.showsTotal()) ? foot : 0,
          start: pinned.start,
          end: pinned.end,
        },
      ),
    );
  }

  private stopAll() {
    for (const stop of this.stops.splice(0)) stop();
  }

  private end(kept: boolean) {
    const p = this.pressed;
    this.stopAll();
    if (!p) return;
    this.pressed = null;
    clearTimeout(p.timer);
    if (!this.body.isDisposed) mark(this.body, 'data-drag-select', false);
    if (!p.started) return;
    if (this.host.grid) put(this.host.grid, 'data-drag-selecting', null);
    if (!p.touch) this.body.parent?.attr.add({ releasePointerCapture: p.pointerId });
    untracked(() => this.host.finish(p.kind, kept));
  }

  /** Where the rows show in the viewport, the body's parent. Read with the frame's reads. */
  private area(): Area | null {
    const vp = this.body.parent;
    if (!vp) return null;
    const r = boxOf(vp);
    // In the viewport the header sits before the body and the totals after it.
    const headPart = this.body.siblings.prev();
    const footPart = this.body.siblings.next();
    const head = headPart ? rectOf(headPart).height : 0;
    const foot = footPart && untracked(() => this.model.summaries.showsTotal()) ? rectOf(footPart).height : 0;
    const width = r.clientWidth || r.width;
    const height = r.clientHeight || r.height;
    // The vertical scroll bar sits at the end: on the left right to left.
    const left = r.rtl ? r.right - width : r.left;
    return { left, right: left + width, top: r.top + head, bottom: r.top + height - foot };
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
    const header = this.headerRow();
    for (const field of axis) {
      const cell = header?.cellPart(field);
      if (!cell || !isInPage(cell)) continue;
      const r = rectOf(cell);
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

  /** The header row: in the header part, the body's previous sibling. */
  private headerRow(): HeaderRow<T> | undefined {
    return this.body.siblings.prev()?.controls.items.find((c): c is HeaderRow<T> => c instanceof HeaderRow);
  }
}
