import { Component, untracked } from '@motifx/core';
import { ADAPTIVE_FIELD } from '../model/ColumnModel';
import { ExtraHeights } from '../model/ExtraHeights';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import { ScrollGeometry } from '../model/ScrollGeometry';
import type { ActionWidths } from './ActionWidths';
import type { DetailHost } from './detail-host';
import { DetailRow } from './DetailRow';
import { GridRow } from './GridRow';
import { GroupFooterRow } from './GroupFooterRow';
import { GroupRow } from './GroupRow';
import { nextId } from '../../../core/next-id';

/**
 * The body: a spacer as tall as the rows (capped, see `ScrollGeometry`) holding a small pool of
 * absolutely placed `GridRow`s. On every scroll the pool is filled again for the rows in view: rows
 * that stay in view keep their element, the others are reused. The DOM never grows with the row
 * count. The active row and the row holding focus are kept even when they scroll out, so focus is
 * never lost. A pooled row follows its row by id first (a new row opened above it moves it, the
 * editor inside goes along), then by position (a loading row that gets its data). Group rows and
 * group footers have pools of their own and follow their group by its id. A row's details
 * (`masterDetail`) are not pooled: each belongs to its row, sits under it, and is as tall as it was
 * measured (`ExtraHeights` keeps the sums), so the scroll bar and `reveal` stay right. The adaptive
 * detail of the one row that has it open (the columns the width hides) is a detail row too, right
 * under its row and before its details.
 */
export class GridBody<T> extends Component<HTMLDivElement> {
  /** Every row ever made; reused, never disposed before the grid. */
  readonly pool: GridRow<T>[] = [];
  /** Every group row ever made. */
  readonly groupPool: GroupRow<T>[] = [];
  /** Every group footer ever made. */
  readonly footerPool: GroupFooterRow<T>[] = [];
  private byIndex = new Map<number, GridRow<T>>();
  private groupsByIndex = new Map<number, GroupRow<T>>();
  private footersByIndex = new Map<number, GroupFooterRow<T>>();
  private readonly groupByElement = new WeakMap<Element, GroupRow<T>>();
  private readonly footerByElement = new WeakMap<Element, GroupFooterRow<T>>();
  private readonly byElement = new WeakMap<Element, GridRow<T>>();
  private virtualTop = 0;
  private expectedScrollTop = -1;
  /** Set while the body lays out again in the same frame for details measured for the first time. */
  private again = false;
  private visible: string[] = [];
  /** The edit form shown in place of a row (`editMode: 'form'`), and the height it was measured at. */
  private form: { rowId: string; row: T; index: number; element: HTMLDivElement; height: number; observer: ResizeObserver | null } | null = null;
  /** Rows' details by key text: made when first shown, kept while open (and closed, with `keepDetails`) up to `keepLimit` out of view. */
  private readonly details = new Map<string, DetailRow<T>>();
  private readonly detailByElement = new WeakMap<Element, DetailRow<T>>();
  /** Details drawn now, by grid index of their row. */
  private detailsByIndex = new Map<number, DetailRow<T>>();
  /** The open details of the rows laid out, and what they were found for. */
  private extras: ExtraHeights | null = null;
  private extrasFor = '';
  /** The data the kept details were last checked against. */
  private checkedFor = '';
  private detailObserver: ResizeObserver | null = null;
  /** The adaptive detail of the row that has it open, while it is laid out. */
  private adaptive: DetailRow<T> | null = null;
  private layouts = 0;
  private readonly detailHost: DetailHost<T>;
  /** While a row is dragged with `'push'`: how far each row moves to make room, by grid index. */
  private shiftOf: ((index: number) => number) | null = null;
  private shifted = new Map<HTMLElement, number>();
  /** Where each drawn row was laid out, from the top of the rows. */
  private readonly laidTop = new WeakMap<HTMLElement, number>();
  private dragSource = -1;
  private dragPush = false;
  /** The line where a dragged row would land (`'indicate'`), made the first time. */
  private dropLine: HTMLDivElement | null = null;
  /** The row a dragged row would be dropped onto. */
  private dropTarget: HTMLElement | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly viewport: () => HTMLElement | null,
    private readonly widths: ActionWidths,
    host: Omit<DetailHost<T>, 'owner'>,
  ) {
    super();
    this.detailHost = { owner: this, grid: host.grid, collapse: (key) => host.collapse(key), adaptiveContent: (rowId, row) => host.adaptiveContent(rowId, row) };
  }

  override onConfigured() {
    this.class.add('mx-data-grid__body');
    this.attr.add({ role: 'rowgroup' });
    this.motif.setDisposable(() => {
      for (const row of this.pool) row.dispose();
      for (const row of this.groupPool) row.dispose();
      for (const row of this.footerPool) row.dispose();
      this.detailObserver?.disconnect();
      for (const detail of this.details.values()) detail.dispose();
      this.details.clear();
      this.adaptive?.dispose();
    });
    this.grid.ariaRowIndex = (i) => this.ariaRowIndex(i);
    this.grid.openDetailCount = () => untracked(() => (this.openExtras()?.size ?? 0) + (this.adaptiveLocal() >= 0 ? 1 : 0));
    // Lookup keys came: only the cells that show them are drawn again.
    const resolved = this.grid.lookups.onChanged(({ items, keys }) => {
      for (const row of this.byIndex.values()) row.drawLookups(items, keys);
      for (const row of this.groupsByIndex.values()) row.drawLookup();
    });
    this.motif.setDisposable(() => resolved.dispose());
  }

  /** Geometry of the rows the body lays out (all rows, or one page); the edit form's row is as tall as the form, open details and the adaptive detail add their height. */
  geometry(): ScrollGeometry {
    const grid = this.grid;
    const rowHeight = grid.state.rowHeight;
    const at = this.formIndex();
    const local = at < 0 ? -1 : grid.mode === 'virtual' ? at : grid.localOf(at);
    const tall = local >= 0 && this.form ? { at: local, extra: Math.max(0, this.form.height - rowHeight) } : null;
    const a = this.adaptiveLocal();
    const adaptive = a >= 0 ? { at: a, height: this.adaptive?.id === grid.adaptive.state.rowId ? this.adaptive.height : 0 } : null;
    return new ScrollGeometry(grid.reachable(), rowHeight, Math.max(rowHeight, grid.state.viewport), ScrollGeometry.MAX_HEIGHT, tall, this.openExtras(), adaptive);
  }

  /** The details drawn now, the adaptive detail among them, in grid order (a row's adaptive detail before its details). */
  drawnDetails(): DetailRow<T>[] {
    const all = [...this.detailsByIndex.values()];
    if (this.adaptive?.shown && this.adaptive.index >= 0) all.push(this.adaptive);
    return all.sort((a, b) => a.index - b.index || Number(a.kind === 'detail') - Number(b.kind === 'detail'));
  }

  /** The adaptive detail drawn under grid row `index`. */
  adaptiveAt(index: number): DetailRow<T> | undefined {
    const a = this.adaptive;
    return a?.shown && a.index === index ? a : undefined;
  }

  /** The adaptive detail of the row that has it open, drawn or not. */
  adaptiveDetail(): DetailRow<T> | null {
    return this.adaptive;
  }

  /** What is drawn under grid row `index`: its adaptive detail, then its details. */
  detailsUnder(index: number): DetailRow<T>[] {
    const out: DetailRow<T>[] = [];
    const a = this.adaptiveAt(index);
    if (a) out.push(a);
    const d = this.detailsByIndex.get(index);
    if (d) out.push(d);
    return out;
  }

  /** The details drawn under grid row `index`. */
  detailAt(index: number): DetailRow<T> | undefined {
    return this.detailsByIndex.get(index);
  }

  /** The details of this grid an element is in (not those of a grid inside them). */
  detailOf(el: Element | null): DetailRow<T> | undefined {
    let node: Element | null = el;
    while (node && node !== this.element) {
      const detail = this.detailByElement.get(node);
      if (detail) return detail;
      node = node.parentElement;
    }
    return undefined;
  }

  /** The options or the open rows changed in a way the body cannot see: the details are found again. */
  refreshDetails() {
    this.extrasFor = '';
    this.relayout(true);
  }

  /** Disposes every row's details (another template); they are made again when they show. */
  dropDetails() {
    for (const detail of [...this.details.values()]) this.dropDetail(detail);
    this.refreshDetails();
  }

  /** Measures the details drawn now (the ResizeObserver does it as their content changes); the rows after one that changed move. */
  measureDetails(only?: Iterable<DetailRow<T>>): boolean {
    let changed = false;
    for (const detail of only ?? this.detailsByIndex.values()) changed = this.measureDetail(detail) || changed;
    if (changed) this.relayout(true);
    return changed;
  }

  /** Shows `content` (the edit form) in place of grid row `index` (the row `row`, `rowId`), across the grid, as tall as it is. */
  showForm(rowId: string, row: T, index: number, content: HTMLElement) {
    this.hideForm();
    const el = document.createElement('div');
    el.className = 'mx-data-grid__form-row';
    el.setAttribute('role', 'row');
    el.id = nextId('grid-row');
    const cell = el.appendChild(document.createElement('div'));
    cell.className = 'mx-data-grid__form-cell';
    cell.setAttribute('role', 'gridcell');
    cell.tabIndex = -1;
    cell.append(content);
    this.element.append(el);
    const form: NonNullable<GridBody<T>['form']> = { rowId, row, index, element: el, height: 0, observer: null };
    this.form = form;
    if (typeof ResizeObserver !== 'undefined') {
      form.observer = new ResizeObserver(() => this.measureForm());
      form.observer.observe(el);
    }
    this.relayout(true);
    this.measureForm();
  }

  /** `aria-rowindex` of grid row `i`: the open details and the adaptive detail above it count as rows. */
  private ariaRowIndex(i: number): number {
    const grid = this.grid;
    const n = i + 1 + grid.headRows;
    const extras = this.extras;
    const a = this.adaptiveLocal();
    if (!extras?.size && a < 0) return n;
    const local = grid.mode === 'virtual' ? i : grid.localOf(i);
    if (local < 0) return n;
    return n + (extras?.size ? extras.countBefore(local) : 0) + (a >= 0 && a < local ? 1 : 0);
  }

  /** Grid index of the row whose adaptive detail is open, while columns are hidden; -1 for none. */
  private adaptiveIndex(): number {
    return untracked(() => {
      const grid = this.grid;
      const id = grid.adaptive.state.rowId;
      if (id === null || !grid.columns.state.adaptive.length) return -1;
      return grid.adaptiveIndex(this.adaptive?.index ?? -1);
    });
  }

  /** Its place among the rows laid out (all rows, or the page); -1 for none. */
  private adaptiveLocal(): number {
    const i = this.adaptiveIndex();
    return i < 0 ? -1 : this.grid.mode === 'virtual' ? i : this.grid.localOf(i);
  }

  /** The open details of the rows laid out (all rows, or one page), found again when the rows or the open ones change. */
  private openExtras(): ExtraHeights | null {
    return untracked(() => {
      const grid = this.grid;
      const details = grid.details;
      if (!details.on) return (this.extras = null);
      const st = grid.state;
      const key = `${st.version}|${st.connection}|${st.added}|${st.page}|${details.state.version}|${grid.mode}|${grid.reachable()}`;
      if (this.extras && key === this.extrasFor) return this.extras;
      this.extrasFor = key;
      this.extras = this.findExtras();
      return this.extras;
    });
  }

  private findExtras(): ExtraHeights {
    const grid = this.grid;
    const details = grid.details;
    const virtual = grid.mode === 'virtual';
    const at: number[] = [];
    if (details.allOpen) {
      const n = grid.reachable();
      for (let l = 0; l < n; l++) if (grid.isDetailOpen(virtual ? l : grid.viewAt(l))) at.push(l);
    } else {
      for (const key of details.exceptions()) {
        const i = grid.indexOfDetailKey(key);
        const l = i < 0 ? -1 : virtual ? i : grid.localOf(i);
        if (l >= 0 && grid.isDetailOpen(i)) at.push(l);
      }
      at.sort((a, b) => a - b);
    }
    const extras = new ExtraHeights(at);
    // A height of their own counts at once; the details drawn before keep what they measured.
    const fixed = details.options.get('height');
    if (fixed !== undefined) {
      at.forEach((l, slot) => {
        const row = grid.rowAt(virtual ? l : grid.viewAt(l));
        if (row !== undefined) extras.set(slot, typeof fixed === 'function' ? fixed(row) : fixed);
      });
    }
    for (const detail of this.details.values()) {
      if (detail.height <= 0) continue;
      const i = grid.indexOfDetailKey(detail.key);
      const slot = i < 0 ? -1 : extras.slotOf(virtual ? i : grid.localOf(i));
      if (slot >= 0) extras.set(slot, detail.height);
    }
    extras.estimate = extras.average ?? Math.max(0, details.options.get('estimatedHeight'));
    return extras;
  }

  private measureDetail(detail: DetailRow<T>): boolean {
    if (!detail.shown || detail.index < 0) return false;
    const height = detail.element.offsetHeight;
    if (height <= 0 || height === detail.height) return false;
    detail.height = height;
    if (detail.kind === 'adaptive') return true;
    const extras = this.extras;
    if (extras) {
      const grid = this.grid;
      const slot = extras.slotOf(grid.mode === 'virtual' ? detail.index : grid.localOf(detail.index));
      if (slot >= 0) {
        extras.set(slot, height);
        extras.estimate = extras.average ?? Math.max(0, grid.details.options.get('estimatedHeight'));
      }
    }
    return true;
  }

  private dropDetail(detail: DetailRow<T>) {
    this.detailObserver?.unobserve(detail.element);
    this.details.delete(detail.id);
    for (const [i, d] of this.detailsByIndex) if (d === detail) this.detailsByIndex.delete(i);
    detail.dispose();
  }

  /** Takes the edit form away; its row shows again. */
  hideForm() {
    const form = this.form;
    if (!form) return;
    this.form = null;
    form.observer?.disconnect();
    form.element.remove();
    this.relayout(true);
  }

  /** The cell that holds the edit form: the active cell while the form's row is the active row. */
  formCell(): HTMLElement | null {
    return (this.form?.element.firstElementChild as HTMLElement | null) ?? null;
  }

  /** The grid index of the row the edit form stands for, or -1. */
  formIndex(): number {
    const form = this.form;
    if (!form) return -1;
    const at = this.grid.indexOfKey(form.rowId, form.index);
    form.index = at >= 0 ? at : this.grid.indexOfRow(form.row);
    return form.index;
  }

  /** The form's height changed (fields shown, messages): the rows after it move. */
  private measureForm() {
    const form = this.form;
    if (!form) return;
    const height = form.element.offsetHeight;
    if (height === form.height) return;
    form.height = height;
    this.relayout(true);
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

  /** The cell element of grid row `index`, if that row is drawn; a group row's one cell, or a group footer itself, for any field. */
  cellElement(index: number, field: string): HTMLElement | undefined {
    return this.byIndex.get(index)?.cells.get(field) ?? this.groupsByIndex.get(index)?.cell ?? this.footersByIndex.get(index)?.element;
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

  /** The pooled group footer an element belongs to. */
  footerRowOf(el: Element | null): GroupFooterRow<T> | undefined {
    const rowEl = el?.closest?.('.mx-data-grid__group-footer');
    return rowEl ? this.footerByElement.get(rowEl) : undefined;
  }

  /** The group footer drawn for grid row `index`. */
  footerRowAt(index: number): GroupFooterRow<T> | undefined {
    return this.footersByIndex.get(index);
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

  /** The rows drawn now, data rows, group rows and group footers, in grid order. */
  drawn(): { index: number; element: HTMLElement; group: GroupNode | null }[] {
    const out: { index: number; element: HTMLElement; group: GroupNode | null }[] = [];
    for (const [index, row] of this.byIndex) out.push({ index, element: row.element, group: null });
    for (const [index, row] of this.groupsByIndex) out.push({ index, element: row.element, group: row.node });
    for (const [index, row] of this.footersByIndex) out.push({ index, element: row.element, group: row.node });
    return out.sort((a, b) => a.index - b.index);
  }

  /** The rows drawn now, top to bottom, where they are laid out on the screen (the room made for a dragged row, moving or not, left out). */
  placed(): { index: number; element: HTMLElement; top: number; bottom: number }[] {
    const base = this.element.getBoundingClientRect().top;
    return this.drawn().map(({ index, element }) => {
      const laid = this.laidTop.get(element);
      const r = element.getBoundingClientRect();
      const top = laid === undefined ? r.top - (this.shifted.get(element) ?? 0) : base + laid;
      return { index, element, top, bottom: top + (element.offsetHeight || r.height) };
    });
  }

  /**
   * The look of a row drag: rows moved by what `shift` gives for their index (the room made for the
   * row, `'push'`), now and as they scroll, until it is `null`; grid row `source` marked as the one
   * dragged (-1: none), as a gap with `push`.
   */
  setDragLook(shift: ((index: number) => number) | null, source: number, push: boolean) {
    this.shiftOf = shift;
    this.dragSource = source;
    this.dragPush = push;
    this.applyShift();
  }

  private applyShift() {
    const shift = this.shiftOf;
    const want = new Map<HTMLElement, number>();
    for (const { index, element } of this.drawn()) {
      const px = shift ? Math.round(shift(index)) : 0;
      if (px) want.set(element, px);
      const look = index === this.dragSource ? (this.dragPush ? 'push' : 'indicate') : null;
      if (element.dataset.dragSource !== (look ?? undefined)) {
        if (look) element.dataset.dragSource = look;
        else delete element.dataset.dragSource;
      }
    }
    for (const el of this.shifted.keys()) if (!want.has(el)) el.style.translate = '';
    for (const [el, px] of want) if (this.shifted.get(el) !== px) el.style.translate = `0 ${px}px`;
    this.shifted = want;
    // Rows gone back to the pool keep no mark.
    for (const row of this.pool) if (row.index < 0) delete row.element.dataset.dragSource;
  }

  /** The line where a dragged row would land, `y` pixels from the top of the rows; `null` hides it. */
  showDropLine(y: number | null) {
    if (y === null) {
      if (this.dropLine) this.dropLine.hidden = true;
      return;
    }
    if (!this.dropLine) {
      const line = document.createElement('div');
      line.className = 'mx-data-grid__row-drop';
      line.setAttribute('aria-hidden', 'true');
      this.element.append(line);
      this.dropLine = line;
    }
    this.dropLine.style.transform = `translateY(${Math.round(y)}px)`;
    this.dropLine.hidden = false;
  }

  /** Marks the row a dragged row would be dropped onto, or none. */
  markDropTarget(el: HTMLElement | null) {
    if (this.dropTarget === el) return;
    this.dropTarget?.removeAttribute('data-drop-target');
    this.dropTarget = el;
    el?.setAttribute('data-drop-target', '');
  }

  /** Draws every row in use again. */
  repaint() {
    for (const row of this.byIndex.values()) row.redraw();
    for (const row of this.groupsByIndex.values()) row.redraw();
    for (const row of this.footersByIndex.values()) row.redraw();
    this.relayout(true);
  }

  /** A column added at run time: every pooled row gets its cell. */
  addColumn(field: string) {
    for (const row of this.pool) row.addColumn(field);
    for (const row of this.footerPool) row.addColumn(field);
  }

  /** A column taken out, or made again: its cells go from every pooled row. */
  removeColumn(field: string) {
    for (const row of this.pool) row.removeColumn(field);
    for (const row of this.groupPool) row.removeColumn(field);
    for (const row of this.footerPool) row.removeColumn(field);
  }

  /** Display order of the cells, after a column layout change. */
  arrange(visible: string[]) {
    // The "…" column came or went: the rows show their "…" again.
    const adaptive = visible.includes(ADAPTIVE_FIELD) !== this.visible.includes(ADAPTIVE_FIELD);
    this.visible = visible;
    for (const row of this.pool) row.arrange(visible);
    for (const row of this.groupPool) row.arrange(visible);
    for (const row of this.footerPool) row.arrange(visible);
    if (adaptive) this.relayout(true);
  }

  /** Gives the spacer the height of the rows, before a scroll position is written too (a row added at the end makes the rows taller). */
  private sizeSpacer(g: ScrollGeometry) {
    this.element.style.height = `${this.grid.mode === 'virtual' ? g.spacerHeight : g.contentHeight}px`;
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
      top = (local) => g.offsetOf(local);
      const range = grid.dataRange();
      data.ensure(range.first, loading ? range.first + Math.max(1, grid.pageSize) : Math.max(range.end, range.first + 1), true);
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
    const formAt = this.formIndex();
    // Focus in a row's details keeps the row and its details drawn.
    const inDetail = this.detailOf(document.activeElement);
    const detailRow = !inDetail ? -1 : inDetail.index >= 0 ? inDetail.index : inDetail.kind === 'adaptive' ? grid.adaptiveIndex() : grid.indexOfDetailKey(inDetail.key);
    for (const i of new Set([active, focused, formAt, detailRow])) if (i >= 0 && localOf(i) >= 0 && !inWindow(i)) wanted.push(i);
    const pinned = formAt >= 0 ? formAt : active;
    data.pin(pinned >= 0 ? grid.dataIndex(pinned) : -1);

    // Group rows and footers go to their pools, matched by their group.
    const groups = new Map<number, GroupNode>();
    const footers = new Map<number, GroupNode>();
    const rows: number[] = [];
    for (const i of wanted) {
      const node = grid.groupAt(i);
      const footer = node ? null : grid.footerAt(i);
      if (node) groups.set(i, node);
      else if (footer) footers.set(i, footer);
      else if (i !== formAt) rows.push(i);
    }
    this.placeForm(formAt, formAt >= 0 && localOf(formAt) >= 0 ? top(localOf(formAt)) : -1, vp);
    this.placeGroups(groups, top, localOf);
    this.placeFooters(footers, top, localOf);

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
      const at = top(localOf(i));
      row.use(i, grid.rowAt(i), idOf[n], at);
      this.laidTop.set(row.element, at);
      keep.set(i, row);
    });
    for (const row of free) row.release();
    this.byIndex = keep;
    const adaptiveAt = this.adaptiveIndex();
    const freshAdaptive = this.placeAdaptive(adaptiveAt, rows, top, localOf, g, vp);
    const fresh = this.placeDetails(formAt >= 0 ? [...rows, formAt] : rows, top, localOf, g, vp);
    if (freshAdaptive) fresh.push(freshAdaptive);
    const adaptiveOn = this.visible.includes(ADAPTIVE_FIELD);
    const drawn = this.adaptiveAt(adaptiveAt);
    for (const [i, row] of keep) row.drawAdaptive(adaptiveOn && row.row !== undefined, adaptiveOn && i === adaptiveAt, i === adaptiveAt && drawn ? drawn.element.id : null);
    if (this.shiftOf || this.shifted.size || this.dragSource >= 0) this.applyShift();
    // Rows stay where they are in the DOM: a moved row is styled again from scratch, on every
    // scroll. Assistive technology gets the reading order through aria-owns; a row's details
    // come right after it, and count as a row in `aria-rowindex`.
    const all: [number, HTMLElement][] = [];
    for (const [i, r] of keep) all.push([i, r.element]);
    if (this.form && formAt >= 0) all.push([formAt, this.form.element]);
    for (const [i, r] of this.groupsByIndex) all.push([i, r.element]);
    for (const [i, r] of this.footersByIndex) all.push([i, r.element]);
    const detailsOn = this.detailsByIndex.size > 0 || !!drawn;
    if (drawn) all.push([adaptiveAt + 0.25, drawn.element]);
    for (const [i, d] of this.detailsByIndex) all.push([i + 0.5, d.element]);
    const shown = all.sort((a, b) => a[0] - b[0]).map(([, el]) => el.id);
    const owns = shown.join(' ');
    if (this.element.getAttribute('aria-owns') !== owns) this.element.setAttribute('aria-owns', owns);
    if (detailsOn || this.extras) {
      for (const [i, el] of all) {
        // A row's adaptive detail comes right after it, its details after that.
        const row = Math.floor(i);
        const under = i - row === 0.5 && drawn && adaptiveAt === row ? 2 : 1;
        const index = String(Number.isInteger(i) ? this.ariaRowIndex(i) : this.ariaRowIndex(row) + under);
        if (el.getAttribute('aria-rowindex') !== index) el.setAttribute('aria-rowindex', index);
      }
    }
    // Details drawn for the first time are measured at once, so the rows after them are placed in this frame.
    if (!this.again && fresh.length && fresh.some((d) => this.measureDetail(d))) {
      this.again = true;
      try {
        this.layout(vp, immediate);
      } finally {
        this.again = false;
      }
    }
  }

  /**
   * Details under the rows that show theirs (made the first time); the others are parked, and those
   * not wanted any more disposed. Returns the details drawn now that were not before.
   */
  private placeDetails(rows: number[], top: (local: number) => number, localOf: (i: number) => number, g: ScrollGeometry, vp: HTMLElement): DetailRow<T>[] {
    const grid = this.grid;
    const on = grid.details.on;
    const shown = new Map<number, DetailRow<T>>();
    const fresh: DetailRow<T>[] = [];
    this.layouts++;
    if (on) {
      const columns = this.visible.length;
      for (const i of rows) {
        if (!grid.isDetailOpen(i)) continue;
        const id = grid.detailId(i);
        const row = grid.rowAt(i);
        if (id === undefined || row === undefined) continue;
        const detail = this.details.get(id) ?? this.createDetail(id, row);
        const l = localOf(i);
        const was = detail.index;
        detail.use(i, row, top(l) + g.rowHeightOf(l) + g.adaptiveAt(l), vp.scrollLeft, vp.clientWidth, columns);
        detail.seen = this.layouts;
        shown.set(i, detail);
        if (was !== i) fresh.push(detail);
      }
    }
    const drawn = new Set(shown.values());
    for (const detail of this.details.values()) if (!drawn.has(detail)) detail.park();
    this.detailsByIndex = shown;
    for (const [i, row] of this.byIndex) {
      if (!on) {
        if (row.element.hasAttribute('aria-expanded')) row.drawExpand(false, false, null);
        continue;
      }
      const can = grid.detailId(i) !== undefined;
      row.drawExpand(can, can && grid.isDetailOpen(i), shown.get(i)?.element.id ?? null);
    }
    this.tidyDetails(drawn);
    const ev = grid.events;
    if (ev.listened(ev.rowPrepared)) {
      for (const detail of fresh) {
        const row = detail.row;
        ev.rowPrepared.fire({ row, rowIndex: detail.index, rowType: 'detail', isSelected: grid.selection.isSelected(grid.selectId(row)), element: detail.element });
      }
    }
    return fresh;
  }

  /** Disposes the details not wanted any more: closed ones (without `keepDetails`), those whose row is gone, the ones seen longest ago past `keepLimit`. */
  private tidyDetails(drawn: Set<DetailRow<T>>) {
    const grid = this.grid;
    const details = grid.details;
    if (!details.on) {
      for (const detail of [...this.details.values()]) this.dropDetail(detail);
      return;
    }
    const st = grid.state;
    const data = `${st.version}|${st.connection}`;
    const check = data !== this.checkedFor;
    this.checkedFor = data;
    const keep = details.options.get('keepDetails');
    const kept: DetailRow<T>[] = [];
    for (const detail of [...this.details.values()]) {
      if (drawn.has(detail)) continue;
      // The row left the data (filtered out, deleted, not loaded any more): its details go with it.
      if ((!keep && !details.isOpen(detail.id)) || (check && grid.data.rowByKey(detail.key) === undefined)) this.dropDetail(detail);
      else kept.push(detail);
    }
    const limit = Math.max(0, Math.floor(details.options.get('keepLimit')));
    if (kept.length <= limit) return;
    kept.sort((a, b) => a.seen - b.seen);
    for (const detail of kept.slice(0, kept.length - limit)) this.dropDetail(detail);
  }

  /**
   * The adaptive detail under grid row `at` while that row is drawn (made the first time, made again
   * for another row or another row object), parked while it is not; gone once it is closed. Returns
   * it when it is drawn now and was not before.
   */
  private placeAdaptive(at: number, rows: number[], top: (local: number) => number, localOf: (i: number) => number, g: ScrollGeometry, vp: HTMLElement): DetailRow<T> | null {
    const grid = this.grid;
    const id = grid.adaptive.state.rowId;
    const row = at >= 0 ? grid.rowAt(at) : undefined;
    let detail = this.adaptive;
    if (detail && (id === null || detail.id !== id || !grid.columns.state.adaptive.length || (row !== undefined && detail.row !== row))) {
      this.dropAdaptive();
      detail = null;
    }
    if (at < 0 || id === null || row === undefined || !rows.includes(at)) {
      detail?.park();
      return null;
    }
    detail ??= this.createAdaptive(id, row);
    const l = localOf(at);
    const was = detail.index;
    detail.use(at, row, top(l) + g.rowHeightOf(l), vp.scrollLeft, vp.clientWidth, this.visible.length);
    return was !== at ? detail : null;
  }

  private createAdaptive(id: string, row: T): DetailRow<T> {
    const grid = this.grid;
    const adapter = grid.data.source.adapter;
    const key = grid.isNew(id) || !adapter.keys.hasKey(row) ? undefined : adapter.keyOf(row);
    const detail = new DetailRow<T>(grid, this.detailHost, id, key, row, nextId('grid-row'), 'adaptive', () => this.detailHost.adaptiveContent(id, row));
    this.element.append(detail.element);
    this.detailByElement.set(detail.element, detail);
    this.observe(detail);
    this.adaptive = detail;
    return detail;
  }

  private dropAdaptive() {
    const detail = this.adaptive;
    if (!detail) return;
    this.adaptive = null;
    this.detailObserver?.unobserve(detail.element);
    detail.dispose();
  }

  private createDetail(id: string, row: T): DetailRow<T> {
    const adapter = this.grid.data.source.adapter;
    const detail = new DetailRow<T>(this.grid, this.detailHost, id, adapter.keyOf(row), row, nextId('grid-row'));
    this.element.append(detail.element);
    this.details.set(id, detail);
    this.detailByElement.set(detail.element, detail);
    this.observe(detail);
    return detail;
  }

  /** Measures a detail row again whenever its content changes size. */
  private observe(detail: DetailRow<T>) {
    if (!this.detailObserver && typeof ResizeObserver !== 'undefined') {
      this.detailObserver = new ResizeObserver((entries) => {
        if (this.isDisposed) return;
        const measured: DetailRow<T>[] = [];
        for (const entry of entries) {
          const d = this.detailByElement.get(entry.target);
          if (d) measured.push(d);
        }
        this.measureDetails(measured);
      });
    }
    this.detailObserver?.observe(detail.element);
  }

  /** The edit form's row: at its row's place, as wide as the viewport and kept in it while the rows scroll sideways. */
  private placeForm(index: number, top: number, vp: HTMLElement) {
    const form = this.form;
    if (!form) return;
    const el = form.element;
    el.hidden = top < 0;
    if (top < 0) return;
    el.setAttribute('aria-rowindex', String(this.ariaRowIndex(index)));
    el.firstElementChild?.setAttribute('aria-colspan', String(Math.max(1, this.visible.length)));
    el.style.inlineSize = `${vp.clientWidth}px`;
    el.style.transform = `translate(${vp.scrollLeft}px, ${top}px)`;
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
      const at = top(localOf(i));
      row.use(i, node, at);
      this.laidTop.set(row.element, at);
      keep.set(i, row);
    }
    for (const row of free) row.release();
    this.groupsByIndex = keep;
  }

  /** Group footers: the one that showed a group's footer keeps it, the others take the rest. */
  private placeFooters(footers: Map<number, GroupNode>, top: (local: number) => number, localOf: (i: number) => number) {
    const ids = new Map<string, number>();
    for (const [i, node] of footers) ids.set(node.id, i);
    const keep = new Map<number, GroupFooterRow<T>>();
    const free: GroupFooterRow<T>[] = [];
    for (const row of this.footerPool) {
      const i = row.node ? ids.get(row.node.id) : undefined;
      if (i !== undefined && !keep.has(i)) keep.set(i, row);
      else free.push(row);
    }
    for (const [i, node] of footers) {
      const row = keep.get(i) ?? free.pop() ?? this.createFooterRow();
      const at = top(localOf(i));
      row.use(i, node, at);
      this.laidTop.set(row.element, at);
      keep.set(i, row);
    }
    for (const row of free) row.release();
    this.footersByIndex = keep;
  }

  private createFooterRow(): GroupFooterRow<T> {
    const row = new GroupFooterRow(this.grid);
    row.element.id = nextId('grid-row');
    this.element.append(row.element);
    row.arrange(this.visible);
    this.footerPool.push(row);
    this.footerByElement.set(row.element, row);
    return row;
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
