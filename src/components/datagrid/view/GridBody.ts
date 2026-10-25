import { Component, untracked } from '@motifx/core';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import { ScrollGeometry } from '../model/ScrollGeometry';
import type { ActionWidths } from './ActionWidths';
import { GridRow } from './GridRow';
import { GroupRow } from './GroupRow';
import { nextId } from '../../../core/next-id';

/**
 * The body: a spacer as tall as the rows (capped, see `ScrollGeometry`) holding a small pool of
 * absolutely placed `GridRow`s. On every scroll the pool is filled again for the rows in view: rows
 * that stay in view keep their element, the others are reused. The DOM never grows with the row
 * count. The active row and the row holding focus are kept even when they scroll out, so focus is
 * never lost. A pooled row follows its row by id first (a new row opened above it moves it, the
 * editor inside goes along), then by position (a loading row that gets its data). Group rows have a
 * pool of their own and follow their group by its id.
 */
export class GridBody<T> extends Component<HTMLDivElement> {
  /** Every row ever made; reused, never disposed before the grid. */
  readonly pool: GridRow<T>[] = [];
  /** Every group row ever made. */
  readonly groupPool: GroupRow<T>[] = [];
  private byIndex = new Map<number, GridRow<T>>();
  private groupsByIndex = new Map<number, GroupRow<T>>();
  private readonly groupByElement = new WeakMap<Element, GroupRow<T>>();
  private readonly byElement = new WeakMap<Element, GridRow<T>>();
  private virtualTop = 0;
  private expectedScrollTop = -1;
  private visible: string[] = [];

  constructor(
    private readonly grid: GridModel<T>,
    private readonly viewport: () => HTMLElement | null,
    private readonly widths: ActionWidths,
  ) {
    super();
  }

  override onConfigured() {
    this.class.add('mx-data-grid__body');
    this.attr.add({ role: 'rowgroup' });
    this.motif.setDisposable(() => {
      for (const row of this.pool) row.dispose();
      for (const row of this.groupPool) row.dispose();
    });
    // Lookup keys came: only the cells that show them are drawn again.
    const resolved = this.grid.lookups.onChanged(({ items, keys }) => {
      for (const row of this.byIndex.values()) row.drawLookups(items, keys);
      for (const row of this.groupsByIndex.values()) row.drawLookup();
    });
    this.motif.setDisposable(() => resolved.dispose());
  }

  /** Geometry of the rows the body lays out (all rows, or one page). */
  geometry(): ScrollGeometry {
    const rowHeight = this.grid.state.rowHeight;
    return new ScrollGeometry(this.grid.reachable(), rowHeight, Math.max(rowHeight, this.grid.state.viewport));
  }

  /** Works out again which rows show and where. Safe to call from anywhere; reads are untracked. */
  relayout(immediate = false) {
    const vp = this.viewport();
    if (!vp || this.isDisposed || !this.isBuilt) return;
    untracked(() => this.layout(vp, immediate));
  }

  /** The browser scrolled (scroll bar, touch, focus). */
  onScroll() {
    this.relayout(false);
  }

  /** Wheel input while the scroll bar is scaled: moves by the real amount in the full content, so a notch still moves a few rows. */
  onWheel(e: WheelEvent): boolean {
    const vp = this.viewport();
    if (!vp || this.grid.mode !== 'virtual') return false;
    const g = this.geometry();
    if (!g.scaled) return false;
    let dy = e.deltaY;
    let dx = e.deltaX;
    if (e.deltaMode === 1) {
      dy *= g.rowHeight;
      dx *= g.rowHeight;
    } else if (e.deltaMode === 2) {
      dy *= g.viewport;
      dx *= vp.clientWidth;
    }
    if (e.shiftKey && dx === 0) {
      dx = dy;
      dy = 0;
    }
    e.preventDefault();
    if (dx) vp.scrollLeft += dx;
    if (dy) this.setVirtualTop(vp, g, this.virtualTop + dy, false);
    return true;
  }

  /** Scrolls so that grid row `index` is fully visible (in paged mode, after going to its page). */
  reveal(index: number, align: 'nearest' | 'start' | 'end' = 'nearest') {
    const vp = this.viewport();
    if (!vp) return;
    const grid = this.grid;
    if (grid.mode === 'paged') {
      const page = grid.pageOf(index);
      if (page !== grid.state.page) grid.setPage(page, false);
      const g = this.geometry();
      const local = grid.localOf(index);
      if (local < 0) return;
      this.sizeSpacer(g);
      vp.scrollTop = g.revealRow(vp.scrollTop, local, align);
      this.relayout(true);
      return;
    }
    const g = this.geometry();
    this.sizeSpacer(g);
    this.setVirtualTop(vp, g, g.revealRow(this.virtualTop, index, align), true);
  }

  /** Back to the first row (after a sort change). */
  toStart() {
    const vp = this.viewport();
    if (!vp) return;
    this.virtualTop = 0;
    this.expectedScrollTop = 0;
    vp.scrollTop = 0;
  }

  /** Rows the viewport shows fully, for PageUp/PageDown. */
  pageRows(): number {
    const g = this.geometry();
    return Math.max(1, Math.floor(g.viewport / g.rowHeight) - 1);
  }

  /** The pooled row that shows grid row `index`, if it is drawn. */
  rowAt(index: number): GridRow<T> | undefined {
    return this.byIndex.get(index);
  }

  /** The cell element of grid row `index`, if that row is drawn; a group row's one cell for any field. */
  cellElement(index: number, field: string): HTMLElement | undefined {
    return this.byIndex.get(index)?.cells.get(field) ?? this.groupsByIndex.get(index)?.cell;
  }

  /** The pooled row an element belongs to. */
  rowOf(el: Element | null): GridRow<T> | undefined {
    const rowEl = el?.closest?.('.mx-data-grid__row');
    return rowEl ? this.byElement.get(rowEl) : undefined;
  }

  /** The pooled group row an element belongs to. */
  groupRowOf(el: Element | null): GroupRow<T> | undefined {
    const rowEl = el?.closest?.('.mx-data-grid__group-row');
    return rowEl ? this.groupByElement.get(rowEl) : undefined;
  }

  /** The group row drawn for grid row `index`. */
  groupRowAt(index: number): GroupRow<T> | undefined {
    return this.groupsByIndex.get(index);
  }

  /** Cells of a column in the rows drawn now (for fitting the column to its content). */
  renderedCells(field: string): HTMLElement[] {
    const out: HTMLElement[] = [];
    for (const row of this.byIndex.values()) {
      if (row.row === undefined) continue;
      const el = row.cells.get(field);
      if (el) out.push(el);
    }
    return out;
  }

  /** The rows drawn now, data and group rows, in grid order. */
  drawn(): { index: number; element: HTMLElement; group: GroupNode | null }[] {
    const out: { index: number; element: HTMLElement; group: GroupNode | null }[] = [];
    for (const [index, row] of this.byIndex) out.push({ index, element: row.element, group: null });
    for (const [index, row] of this.groupsByIndex) out.push({ index, element: row.element, group: row.node });
    return out.sort((a, b) => a.index - b.index);
  }

  /** Draws every row in use again. */
  repaint() {
    for (const row of this.byIndex.values()) row.redraw();
    for (const row of this.groupsByIndex.values()) row.redraw();
    this.relayout(true);
  }

  /** Display order of the cells, after a column layout change. */
  arrange(visible: string[]) {
    this.visible = visible;
    for (const row of this.pool) row.arrange(visible);
    for (const row of this.groupPool) row.arrange(visible);
  }

  /** Gives the spacer the height of the rows, before a scroll position is written too (a row added at the end makes the rows taller). */
  private sizeSpacer(g: ScrollGeometry) {
    this.element.style.height = `${this.grid.mode === 'virtual' ? g.spacerHeight : g.total * g.rowHeight}px`;
  }

  private setVirtualTop(vp: HTMLElement, g: ScrollGeometry, v: number, immediate: boolean) {
    this.virtualTop = Math.max(0, Math.min(g.maxVirtualTop, v));
    const top = g.scrollFromVirtual(this.virtualTop);
    this.expectedScrollTop = top;
    vp.scrollTop = top;
    this.relayout(immediate);
  }

  private layout(vp: HTMLElement, immediate: boolean) {
    const grid = this.grid;
    const data = grid.data;
    const g = this.geometry();
    const loading = grid.state.status === 'loading';
    const scrollTop = vp.scrollTop;
    // Rows to show by their position among the reachable rows (virtual: the grid index itself).
    let start: number;
    let end: number;
    let top: (local: number) => number;

    this.sizeSpacer(g);
    if (grid.mode === 'virtual') {
      // Our own writes keep the exact virtual offset; anything else (bar drag, touch, focus) is mapped back.
      if (this.expectedScrollTop < 0 || Math.abs(scrollTop - this.expectedScrollTop) > 1) this.virtualTop = g.virtualFromScroll(scrollTop);
      this.expectedScrollTop = -1;
      this.virtualTop = Math.max(0, Math.min(g.maxVirtualTop, this.virtualTop));
      const vis = g.visibleRange(this.virtualTop);
      const extra = Math.max(0, Math.floor(grid.settings.get('extraRows')));
      start = Math.max(0, vis.first - extra);
      end = Math.min(g.total, vis.end + extra);
      const vt = this.virtualTop;
      top = (i) => g.rowTop(i, scrollTop, vt);
      const need = Math.ceil(g.viewport / g.rowHeight) + 1;
      // The data counts its own places only: map the window to them.
      const offset = grid.newRowPosition === 'top' ? grid.state.added : 0;
      const dataOf = (i: number) => Math.max(0, Math.min(data.total, i - offset));
      if (loading) data.ensure(0, need, true);
      else if (end > start && dataOf(end) > dataOf(start)) data.ensure(dataOf(start), dataOf(end), immediate);
    } else {
      start = 0;
      end = g.total;
      top = (local) => local * g.rowHeight;
      const range = grid.dataRange();
      data.ensure(range.first, loading ? range.first + grid.pageSize : Math.max(range.end, range.first + 1), true);
    }
    const viewAt = (local: number) => (grid.mode === 'virtual' ? local : grid.viewAt(local));
    const localOf = (i: number) => (grid.mode === 'virtual' ? (i < g.total ? i : -1) : grid.localOf(i));

    // Rows to show: the window, plus the active row and the focused row wherever they are.
    const wanted: number[] = [];
    for (let l = start; l < end; l++) wanted.push(viewAt(l));
    const inWindow = (i: number) => {
      const l = localOf(i);
      return l >= start && l < end;
    };
    const active = grid.state.activeRow;
    const focused = this.rowOf(document.activeElement)?.index ?? -1;
    for (const i of new Set([active, focused])) if (i >= 0 && localOf(i) >= 0 && !inWindow(i)) wanted.push(i);
    data.pin(active >= 0 ? grid.dataIndex(active) : -1);

    // Group rows go to the group pool, matched by their group.
    const groups = new Map<number, GroupNode>();
    const rows: number[] = [];
    for (const i of wanted) {
      const node = grid.groupAt(i);
      if (node) groups.set(i, node);
      else rows.push(i);
    }
    this.placeGroups(groups, top, localOf);

    // Match pooled rows to wanted rows: by id first, then by position, then any free one.
    const idOf = rows.map((i) => grid.rowIdAt(i));
    const byId = new Map<string, number>();
    idOf.forEach((rowId, n) => rowId !== undefined && byId.set(rowId, n));
    const wantedAt = new Map<number, number>();
    rows.forEach((i, n) => wantedAt.set(i, n));
    const assigned: (GridRow<T> | undefined)[] = new Array(rows.length);
    const rest: GridRow<T>[] = [];
    for (const row of this.pool) {
      const n = row.rowId !== undefined ? byId.get(row.rowId) : undefined;
      if (n !== undefined && !assigned[n]) assigned[n] = row;
      else rest.push(row);
    }
    const free: GridRow<T>[] = [];
    for (const row of rest) {
      const n = row.index >= 0 ? wantedAt.get(row.index) : undefined;
      if (n !== undefined && !assigned[n]) assigned[n] = row;
      else free.push(row);
    }
    const keep = new Map<number, GridRow<T>>();
    rows.forEach((i, n) => {
      const row = assigned[n] ?? free.pop() ?? this.createRow();
      row.use(i, grid.rowAt(i), idOf[n], top(localOf(i)));
      keep.set(i, row);
    });
    for (const row of free) row.release();
    this.byIndex = keep;
    // Rows stay where they are in the DOM: a moved row is styled again from scratch, on every
    // scroll. Assistive technology gets the reading order through aria-owns.
    const all: [number, HTMLElement][] = [];
    for (const [i, r] of keep) all.push([i, r.element]);
    for (const [i, r] of this.groupsByIndex) all.push([i, r.element]);
    const shown = all.sort((a, b) => a[0] - b[0]).map(([, el]) => el.id);
    const owns = shown.join(' ');
    if (this.element.getAttribute('aria-owns') !== owns) this.element.setAttribute('aria-owns', owns);
  }

  /** Group rows: the one that showed a group keeps it, the others take the rest. */
  private placeGroups(groups: Map<number, GroupNode>, top: (local: number) => number, localOf: (i: number) => number) {
    const ids = new Map<string, number>();
    for (const [i, node] of groups) ids.set(node.id, i);
    const keep = new Map<number, GroupRow<T>>();
    const free: GroupRow<T>[] = [];
    for (const row of this.groupPool) {
      const i = row.node ? ids.get(row.node.id) : undefined;
      if (i !== undefined && !keep.has(i)) keep.set(i, row);
      else free.push(row);
    }
    for (const [i, node] of groups) {
      const row = keep.get(i) ?? free.pop() ?? this.createGroupRow();
      row.use(i, node, top(localOf(i)));
      keep.set(i, row);
    }
    for (const row of free) row.release();
    this.groupsByIndex = keep;
  }

  private createGroupRow(): GroupRow<T> {
    const row = new GroupRow(this.grid, this);
    row.element.id = nextId('grid-row');
    this.element.append(row.element);
    row.arrange(this.visible);
    this.groupPool.push(row);
    this.groupByElement.set(row.element, row);
    return row;
  }

  private createRow(): GridRow<T> {
    const row = new GridRow(this.grid, this, this.widths);
    row.element.id = nextId('grid-row');
    this.element.append(row.element);
    row.arrange(this.visible);
    this.pool.push(row);
    this.byElement.set(row.element, row);
    return row;
  }
}
