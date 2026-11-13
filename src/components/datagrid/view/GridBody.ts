import { Component, ComponentBase, untracked } from '@motifx/core';
import { ADAPTIVE_FIELD } from '../model/ColumnModel';
import { ExtraHeights } from '../model/ExtraHeights';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import { ScrollGeometry } from '../model/ScrollGeometry';
import { GROUP_FOOTER, GROUP_LOOK, GROUP_SUMMARY, GROUP_TEXT, ROW_CELLS, ROW_ACTIONS, ROW_LOOK, ROW_RANGES } from './row-notices';
import type { ActionWidths } from './ActionWidths';
import type { DetailHost } from './detail-host';
import { DetailRow } from './DetailRow';
import { GridRow } from './GridRow';
import { GroupFooterRow } from './GroupFooterRow';
import { GroupRow } from './GroupRow';
import { isWithin } from '../../../core/component-tree';
import { holdsFocus } from '../../../core/focus';
import { nextId } from '../../../core/next-id';
import { part } from '../../../core/draw-parts';
import { boxOf, measure, onLayout, rectOf, scrollBy, scrollTo, type Size } from '../../../core/measure';
import { css, kept, mark, put } from '../../../core/part-writes';

/** Every grid alive now: an event from a grid inside another is that grid's. */
const grids = new Set<ComponentBase>();

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
 * under its row and before its details. The viewport is read with the measuring layer: a layout asked for
 * runs at once with the viewport as last read (and as the body scrolled it), and again with the next round
 * if the viewport turns out to be elsewhere; the sizes of details and of the edit form are watched.
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
  /** The id each row's element was given: `aria-owns` lists them, a row's arrow names its details by it. */
  private readonly elementIds = new WeakMap<ComponentBase, string>();
  /** Rows whose details state was drawn: drawn closed once the details are turned off. */
  private readonly expandDrawn = new WeakSet<GridRow<T>>();
  private virtualTop = 0;
  private expectedScrollTop = -1;
  /** The viewport as last read (how far it is scrolled down and sideways, its inner width), with the scrolls the body wrote since. */
  private lastView = { top: 0, left: 0, width: 0 };
  /** Set when the next round lays the rows out again even if the viewport stayed where it was (a size watched changed). */
  private stale = false;
  /** Set when the layout of the next round loads what it shows at once. */
  private loadNow = false;
  /** The row a paged grid scrolls to with the next round, once the viewport is read. */
  private revealing: { index: number; align: 'nearest' | 'start' | 'end' } | null = null;
  private visible: string[] = [];
  /** The edit form shown in place of a row (`editMode: 'form'`), its row and its cell, and the height it was measured at. */
  private form: { rowId: string; row: T; index: number; part: Component<HTMLDivElement>; cell: Component<HTMLDivElement>; height: number } | null = null;
  /** Rows' details by key text: made when first shown, kept while open (and closed, with `keepDetails`) up to `keepLimit` out of view. */
  private readonly details = new Map<string, DetailRow<T>>();
  /** Details drawn now, by grid index of their row. */
  private detailsByIndex = new Map<number, DetailRow<T>>();
  /** The open details of the rows laid out, and what they were found for. */
  private extras: ExtraHeights | null = null;
  private extrasFor = '';
  /** The data the kept details were last checked against. */
  private checkedFor = '';
  /** The page (and page size) of a paged grid the details were last tidied for. */
  private pageFor: string | null = null;
  /** The adaptive detail of the row that has it open, while it is laid out. */
  private adaptive: DetailRow<T> | null = null;
  private layouts = 0;
  private readonly detailHost: DetailHost<T>;
  /** While a row is dragged with `'push'`: how far each row moves to make room, by grid index. */
  private shiftOf: ((index: number) => number) | null = null;
  private shifted = new Map<ComponentBase, number>();
  /** Where each drawn row was laid out, from the top of the rows. */
  private readonly laidTop = new WeakMap<ComponentBase, number>();
  private dragSource = -1;
  private dragPush = false;
  /** The line where a dragged row would land (`'indicate'`), made the first time. */
  private dropLine: Component<HTMLDivElement> | null = null;
  /** The row a dragged row would be dropped onto. */
  private dropRow: ComponentBase | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    /** The grid's viewport, the scroller the body sits in; `null` before it is made. */
    private readonly viewport: () => ComponentBase | null,
    private readonly widths: ActionWidths,
    host: Omit<DetailHost<T>, 'owner'>,
  ) {
    super();
    this.detailHost = { owner: this, grid: host.grid, collapse: (key) => host.collapse(key), adaptiveContent: (rowId, row) => host.adaptiveContent(rowId, row) };
  }

  override onConfigured() {
    this.class.add('mx-data-grid__body');
    this.attr.add({ role: 'rowgroup' });
    grids.add(this.detailHost.grid);
    this.motif.setDisposable(() => grids.delete(this.detailHost.grid));
    this.motif.setDisposable(() => {
      for (const row of this.pool) row.dispose();
      for (const row of this.groupPool) row.dispose();
      for (const row of this.footerPool) row.dispose();
      for (const detail of this.details.values()) detail.dispose();
      this.details.clear();
      this.adaptive?.dispose();
    });
    // The rows follow nothing: told what changed, the parts of them that read it are drawn again.
    this.motif.setDisposable(this.grid.notices.on((told) => this.drawTold(told)));
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
    const local = at < 0 ? -1 : grid.mode !== 'paged' ? at : grid.localOf(at);
    const tall = local >= 0 && this.form ? { at: local, extra: Math.max(0, this.form.height - rowHeight) } : null;
    const a = this.adaptiveLocal();
    const adaptive = a >= 0 ? { at: a, height: this.adaptive?.id === grid.adaptive.state.rowId ? this.adaptive.height : 0 } : null;
    const tail = grid.moreState() ? rowHeight : 0;
    return new ScrollGeometry(grid.reachable(), rowHeight, Math.max(rowHeight, grid.state.viewport), ScrollGeometry.MAX_HEIGHT, tall, this.openExtras(), adaptive, tail);
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

  /** The details of this grid an event came from (not those of a grid inside them). */
  detailFrom(e: Event): DetailRow<T> | undefined {
    if (!this.motif.isEventFrom(e)) return undefined;
    for (const detail of this.details.values()) if (detail.part.motif.isEventFrom(e)) return detail;
    return this.adaptive?.part.motif.isEventFrom(e) ? this.adaptive : undefined;
  }

  /** The details of this grid focus is in (not those of a grid inside them). */
  focusedDetail(): DetailRow<T> | undefined {
    if (!holdsFocus(this)) return undefined;
    for (const detail of this.details.values()) if (holdsFocus(detail.part)) return detail;
    return this.adaptive && holdsFocus(this.adaptive.part) ? this.adaptive : undefined;
  }

  /** The options or the open rows changed in a way the body cannot see: the details are found again. */
  refreshDetails() {
    this.extrasFor = '';
    this.relayout(true);
  }

  /** Disposes every row's details (another template); they are recreated when they show. */
  dropDetails() {
    for (const detail of [...this.details.values()]) this.dropDetail(detail);
    this.refreshDetails();
  }

  /** Shows `content` (the edit form) in place of grid row `index` (the row `row`, `rowId`), across the grid, as tall as it is. */
  showForm(rowId: string, row: T, index: number, content: ComponentBase) {
    this.hideForm();
    const part = new Component<HTMLDivElement>('div');
    part.class.add('mx-data-grid__form-row');
    part.attr.add({ role: 'row' });
    this.giveId(part);
    const cellPart = new Component<HTMLDivElement>('div');
    cellPart.class.add('mx-data-grid__form-cell');
    cellPart.attr.add({ role: 'gridcell' });
    put(cellPart, 'tabindex', '-1');
    cellPart.controls.add(content);
    part.controls.add(cellPart);
    this.controls.add(part);
    const form: NonNullable<GridBody<T>['form']> = { rowId, row, index, part, cell: cellPart, height: 0 };
    this.form = form;
    // The watch ends with the form's row.
    onLayout(part, 'size', (size) => this.formResized(form, size), { owner: this });
    this.relayout(true);
  }

  /** `aria-rowindex` of grid row `i`: the open details and the adaptive detail above it count as rows. */
  private ariaRowIndex(i: number): number {
    const grid = this.grid;
    const n = i + 1 + grid.headRows;
    const extras = this.extras;
    const a = this.adaptiveLocal();
    if (!extras?.size && a < 0) return n;
    const local = grid.mode !== 'paged' ? i : grid.localOf(i);
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
    return i < 0 ? -1 : this.grid.mode !== 'paged' ? i : this.grid.localOf(i);
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
    const virtual = grid.mode !== 'paged';
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

  /** A detail row came out another size (drawn the first time, its content changed): the rows after it move with the next round. */
  private detailResized(detail: DetailRow<T>, size: Size) {
    const height = Math.round(size.height);
    if (this.isDisposed || height <= 0 || height === detail.height) return;
    detail.height = height;
    if (detail.kind === 'detail') this.setExtra(detail, height);
    this.layoutSoon(true);
  }

  /** Gives the details of a row their height among the open details laid out. */
  private setExtra(detail: DetailRow<T>, height: number) {
    const extras = this.extras;
    if (!extras) return;
    const grid = this.grid;
    const i = detail.index >= 0 ? detail.index : grid.indexOfDetailKey(detail.key);
    const slot = i < 0 ? -1 : extras.slotOf(grid.mode !== 'paged' ? i : grid.localOf(i));
    if (slot < 0) return;
    extras.set(slot, height);
    extras.estimate = extras.average ?? Math.max(0, grid.details.options.get('estimatedHeight'));
  }

  private dropDetail(detail: DetailRow<T>) {
    this.details.delete(detail.id);
    for (const [i, d] of this.detailsByIndex) if (d === detail) this.detailsByIndex.delete(i);
    detail.dispose();
  }

  /** Takes the edit form away; its row shows again. */
  hideForm() {
    const form = this.form;
    if (!form) return;
    this.form = null;
    // The form goes with its row, and its size watch with it.
    this.controls.remove(form.part);
    this.relayout(true);
  }

  /** The cell that holds the edit form: the active cell while the form's row is the active row. */
  formCellPart(): Component<HTMLDivElement> | null {
    return this.form?.cell ?? null;
  }

  /** The grid index of the row the edit form stands for, or -1. */
  formIndex(): number {
    const form = this.form;
    if (!form) return -1;
    const at = this.grid.indexOfKey(form.rowId, form.index);
    form.index = at >= 0 ? at : this.grid.indexOfRow(form.row);
    return form.index;
  }

  /** The form's height changed (shown the first time, fields shown, messages): the rows after it move with the next round. */
  private formResized(form: NonNullable<GridBody<T>['form']>, size: Size) {
    const height = Math.round(size.height);
    if (this.form !== form || height === form.height) return;
    form.height = height;
    this.layoutSoon(true);
  }

  /**
   * Works out again which rows show and where: at once, with the viewport as last read, so the rows asked for are
   * drawn when it returns; again with the next round if the viewport is read elsewhere. Safe to call from anywhere;
   * reads are untracked.
   */
  relayout(immediate = false) {
    if (this.isDisposed || !this.isBuilt || !this.scroller()) return;
    untracked(() => this.layout(this.lastView, immediate));
    measure(this, this.readView, this.writeView);
  }

  /** Something scrolled the viewport (scroll bar, touch, focus, a drag): the rows are laid out with the next round, where it is then. */
  onScroll() {
    measure(this, this.readView, this.writeView);
  }

  /** Lays the rows out again with the next round, wherever the viewport is then. */
  private layoutSoon(immediate = false) {
    this.stale = true;
    if (immediate) this.loadNow = true;
    measure(this, this.readView, this.writeView);
  }

  /** The grid's viewport, the scroller the body sits in. */
  private scroller(): ComponentBase | null {
    const vp = this.viewport();
    return vp?.isBuilt ? vp : null;
  }

  private readonly readView = (): GridBody<T>['lastView'] | null => {
    const vp = this.scroller();
    if (!vp) return null;
    const box = boxOf(vp);
    // Sideways as the element counts it: right to left, the scroll from the start is to the left.
    return { top: box.scrollTop, left: box.rtl ? -box.scrollStart : box.scrollStart, width: box.clientWidth };
  };

  private readonly writeView = (view: GridBody<T>['lastView'] | null) => {
    if (!view || !this.isBuilt) return;
    const was = this.lastView;
    this.lastView = view;
    const due = this.stale || view.top !== was.top || view.left !== was.left || view.width !== was.width;
    const immediate = this.loadNow;
    this.stale = false;
    this.loadNow = false;
    if (due) this.layout(view, immediate);
  };

  private readonly readTop = (): number | null => {
    const vp = this.scroller();
    return vp ? boxOf(vp).scrollTop : null;
  };

  /** A paged grid's row asked for by `reveal`: scrolled into view, the viewport read. */
  private readonly revealPaged = (scrollTop: number | null) => {
    const wanted = this.revealing;
    this.revealing = null;
    const vp = this.scroller();
    if (scrollTop === null || !wanted || !vp) return;
    const local = this.grid.localOf(wanted.index);
    if (local < 0) return;
    const top = this.geometry().revealRow(scrollTop, local, wanted.align);
    if (top === scrollTop) return;
    scrollTo(vp, { top });
    this.lastView = { ...this.lastView, top };
    this.relayout(true);
  };

  /** Wheel input while the scroll bar is scaled: moves by the real amount in the full content, so a notch still moves a few rows. */
  onWheel(e: WheelEvent): boolean {
    const vp = this.scroller();
    if (!vp || this.grid.mode === 'paged') return false;
    const g = this.geometry();
    if (!g.scaled) return false;
    // Read before anything is written.
    const box = boxOf(vp);
    let dy = e.deltaY;
    let dx = e.deltaX;
    if (e.deltaMode === 1) {
      dy *= g.rowHeight;
      dx *= g.rowHeight;
    } else if (e.deltaMode === 2) {
      dy *= g.viewport;
      dx *= box.clientWidth;
    }
    if (e.shiftKey && dx === 0) {
      dx = dy;
      dy = 0;
    }
    e.preventDefault();
    // A step to the right, right to left too.
    if (dx) scrollBy(vp, { start: box.rtl ? -dx : dx });
    if (dy) this.setVirtualTop(vp, g, this.virtualTop + dy, false);
    return true;
  }

  /** Scrolls so that grid row `index` is fully visible (in paged mode, after going to its page, with the next round). */
  reveal(index: number, align: 'nearest' | 'start' | 'end' = 'nearest') {
    const vp = this.scroller();
    if (!vp) return;
    const grid = this.grid;
    if (grid.mode === 'paged') {
      const page = grid.pageOf(index);
      if (page !== grid.state.page) grid.setPage(page, false);
      if (grid.localOf(index) < 0) return;
      this.sizeSpacer(this.geometry());
      // The page's rows are drawn at once; the scroll to the row waits for the viewport to be read.
      this.relayout(true);
      this.revealing = { index, align };
      measure(this, this.readTop, this.revealPaged);
      return;
    }
    const g = this.geometry();
    this.sizeSpacer(g);
    this.setVirtualTop(vp, g, g.revealRow(this.virtualTop, index, align), true);
  }

  /** Back to the first row (after a sort change); the rows follow with the next round. */
  toStart() {
    const vp = this.scroller();
    if (!vp) return;
    // Already at the top as last read (or written): nothing to scroll. Core would call `scrollTo` right after the
    // rows were written, and the browser would lay the whole page out for it there and then.
    const away = this.lastView.top !== 0 || this.virtualTop !== 0;
    this.virtualTop = 0;
    this.expectedScrollTop = 0;
    if (away) scrollTo(vp, { top: 0 });
    this.lastView = { ...this.lastView, top: 0 };
    this.layoutSoon();
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

  /** The cell of grid row `index`, if that row is drawn; a group row's one cell, or a group footer itself, for any field. */
  cellAt(index: number, field: string): Component<HTMLDivElement> | undefined {
    return this.byIndex.get(index)?.cellPart(field) ?? this.groupsByIndex.get(index)?.cellPart ?? this.footersByIndex.get(index)?.part;
  }

  /** The cell component of data row `index` for `field`, if that row is drawn: what is shown in the cell is added to it. */
  cellPart(index: number, field: string): ComponentBase | undefined {
    return this.byIndex.get(index)?.cellPart(field);
  }

  /** The pooled row an event came from (not from a grid inside it). */
  rowFrom(e: Event): GridRow<T> | undefined {
    return this.motif.isEventFrom(e) && !this.fromInnerGrid(e) ? this.pool.find((row) => row.part.motif.isEventFrom(e)) : undefined;
  }

  /** The pooled row a component is in (a cell's content, an editor in a cell). */
  rowHolding(part: ComponentBase): GridRow<T> | undefined {
    for (let c: ComponentBase | null = part; c && c !== this; c = c.parent) {
      const row = this.pool.find((r) => r.part === c);
      if (row) return row;
    }
    return undefined;
  }

  /** The pooled row focus is in. */
  focusedRow(): GridRow<T> | undefined {
    return holdsFocus(this) ? this.pool.find((row) => holdsFocus(row.part)) : undefined;
  }

  /** The pooled group row an event came from (not from a grid inside it). */
  groupRowFrom(e: Event): GroupRow<T> | undefined {
    return this.motif.isEventFrom(e) && !this.fromInnerGrid(e) ? this.groupPool.find((row) => row.part.motif.isEventFrom(e)) : undefined;
  }

  /** The group row drawn for grid row `index`. */
  groupRowAt(index: number): GroupRow<T> | undefined {
    return this.groupsByIndex.get(index);
  }

  /** The pooled group footer an event came from (not from a grid inside it). */
  footerRowFrom(e: Event): GroupFooterRow<T> | undefined {
    return this.motif.isEventFrom(e) && !this.fromInnerGrid(e) ? this.footerPool.find((row) => row.part.motif.isEventFrom(e)) : undefined;
  }

  /** The group footer drawn for grid row `index`. */
  footerRowAt(index: number): GroupFooterRow<T> | undefined {
    return this.footersByIndex.get(index);
  }

  /** Whether an event came from a grid inside this one (in a cell or in details): it is that grid's. */
  private fromInnerGrid(e: Event): boolean {
    for (const grid of grids) if (isWithin(grid, this) && grid.motif.isEventFrom(e)) return true;
    return false;
  }

  /** Cells of a column in the rows drawn now, each with the text it shows (none for content of its own), for fitting the column to its content. */
  renderedCells(field: string): { part: ComponentBase; text: string | undefined }[] {
    const out: { part: ComponentBase; text: string | undefined }[] = [];
    for (const row of this.byIndex.values()) {
      if (row.row === undefined) continue;
      const cell = row.cellPart(field);
      if (cell) out.push({ part: cell, text: row.shownText(field) });
    }
    return out;
  }

  /** The rows drawn now, data rows, group rows and group footers, in grid order. */
  drawn(): { index: number; element: HTMLElement; part: ComponentBase; group: GroupNode | null }[] {
    const out: { index: number; element: HTMLElement; part: ComponentBase; group: GroupNode | null }[] = [];
    for (const [index, row] of this.byIndex) out.push({ index, element: row.element, part: row.part, group: null });
    for (const [index, row] of this.groupsByIndex) out.push({ index, element: row.element, part: row.part, group: row.node });
    for (const [index, row] of this.footersByIndex) out.push({ index, element: row.element, part: row.part, group: row.node });
    return out.sort((a, b) => a.index - b.index);
  }

  /**
   * The rows drawn now, top to bottom, where they are laid out on the screen (the room made for a dragged row, moving
   * or not, omitted). A layout read: in the read of a `measure`, or in an event handler before anything is written.
   */
  placed(): { index: number; part: ComponentBase; top: number; bottom: number }[] {
    const base = rectOf(this).top;
    return this.drawn().map(({ index, part }) => {
      const laid = this.laidTop.get(part);
      const box = boxOf(part);
      const top = laid === undefined ? box.top - (this.shifted.get(part) ?? 0) : base + laid;
      return { index, part, top, bottom: top + (box.offsetHeight || box.height) };
    });
  }

  /**
   * The appearance of a row drag: rows moved by what `shift` gives for their index (the room made for the
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
    const want = new Map<ComponentBase, number>();
    for (const { index, part } of this.drawn()) {
      const px = shift ? Math.round(shift(index)) : 0;
      if (px) want.set(part, px);
      const look = index === this.dragSource ? (this.dragPush ? 'push' : 'indicate') : null;
      put(part, 'data-drag-source', look);
    }
    for (const part of this.shifted.keys()) if (!want.has(part)) css(part, 'translate', '');
    for (const [part, px] of want) if (this.shifted.get(part) !== px) css(part, 'translate', `0 ${px}px`);
    this.shifted = want;
    // Rows gone back to the pool keep no mark.
    for (const row of this.pool) if (row.index < 0) put(row.part, 'data-drag-source', null);
  }

  /** The line where a dragged row would land, `y` pixels from the top of the rows; `null` hides it. */
  showDropLine(y: number | null) {
    if (y === null) {
      if (this.dropLine) kept(this.dropLine, false);
      return;
    }
    if (!this.dropLine) {
      const line = part<HTMLDivElement>(this, 'div', 'mx-data-grid__row-drop');
      line.attr.add({ 'aria-hidden': 'true' });
      this.dropLine = line;
    }
    css(this.dropLine, 'transform', `translateY(${Math.round(y)}px)`);
    kept(this.dropLine, true);
  }

  /** Marks the row a dragged row would be dropped onto, or none. */
  markDropRow(part: ComponentBase | null) {
    if (this.dropRow === part) return;
    if (this.dropRow) mark(this.dropRow, 'data-drop-target', false);
    this.dropRow = part;
    if (part) mark(part, 'data-drop-target', true);
  }

  /** Draws every row in use again, with the rows' details and adaptive detail. */
  repaint() {
    for (const row of this.byIndex.values()) row.redraw();
    for (const row of this.groupsByIndex.values()) row.redraw();
    for (const row of this.footersByIndex.values()) row.redraw();
    for (const detail of this.details.values()) detail.redraw();
    this.adaptive?.redraw();
    this.relayout(true);
  }

  /** Draws the rows with these ids again (their key as text), with their details and adaptive detail; the others stay as they are. */
  repaintRows(ids: ReadonlySet<string>) {
    for (const row of this.byIndex.values()) if (row.rowId !== undefined && ids.has(row.rowId)) row.redraw();
    for (const [id, detail] of this.details) if (ids.has(id)) detail.redraw();
    if (this.adaptive && ids.has(this.adaptive.id)) this.adaptive.redraw();
    this.relayout(true);
  }

  /** The rows drawn now draw again the parts that read what was told. */
  private drawTold(told: ReadonlySet<string>) {
    const any = (names: ReadonlySet<string>) => [...told].some((name) => names.has(name));
    const look = any(ROW_LOOK);
    const cells = any(ROW_CELLS);
    const ranges = any(ROW_RANGES);
    const actions = any(ROW_ACTIONS);
    const groupLook = any(GROUP_LOOK);
    const groupText = any(GROUP_TEXT);
    const groupSummary = any(GROUP_SUMMARY);
    const footer = any(GROUP_FOOTER);
    untracked(() => {
      if (look || cells || ranges || actions) {
        for (const row of this.byIndex.values()) {
          if (look) row.drawLook();
          if (cells) row.drawCells();
          if (ranges) row.drawRanges();
          if (actions) row.drawActions();
        }
      }
      if (groupLook || groupText || groupSummary) {
        for (const row of this.groupsByIndex.values()) {
          if (groupLook) row.drawLook();
          if (groupText) row.drawText();
          if (groupSummary) row.drawSummary();
        }
      }
      if (footer) for (const row of this.footersByIndex.values()) row.draw();
    });
  }

  /** A column added at run time: every pooled row gets its cell. */
  addColumn(field: string) {
    for (const row of this.pool) row.addColumn(field);
    for (const row of this.footerPool) row.addColumn(field);
  }

  /** A column removed, or recreated: its cells go from every pooled row. */
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
    css(this, 'height', `${this.grid.mode !== 'paged' ? g.spacerHeight : g.contentHeight}px`);
  }

  private setVirtualTop(vp: ComponentBase, g: ScrollGeometry, v: number, immediate: boolean) {
    this.virtualTop = Math.max(0, Math.min(g.maxVirtualTop, v));
    const top = g.scrollFromVirtual(this.virtualTop);
    this.expectedScrollTop = top;
    scrollTo(vp, { top });
    this.lastView = { ...this.lastView, top };
    this.relayout(immediate);
  }

  private layout(view: GridBody<T>['lastView'], immediate: boolean) {
    const grid = this.grid;
    const data = grid.data;
    const g = this.geometry();
    const loading = grid.state.status === 'loading';
    const scrollTop = view.top;
    // Rows to show by their position among the reachable rows (virtual: the grid index itself).
    let start: number;
    let end: number;
    let top: (local: number) => number;

    this.sizeSpacer(g);
    if (grid.mode !== 'paged') {
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
      // `preloadEnabled`: a part more on each side, so scrolling seldom waits.
      const pre = grid.settings.get('preloadEnabled') ? Math.max(0, data.pageSize) : 0;
      if (loading) data.ensure(0, need, true);
      else if (end > start && dataOf(end) > dataOf(start)) data.ensure(Math.max(0, dataOf(start) - pre), dataOf(end) + pre, immediate);
      // Infinite: near the end of the rows shown, the next part loads.
      if (grid.mode === 'infinite' && !loading && data.total - dataOf(vis.end) <= Math.max(0, grid.settings.get('loadMoreDistance')) + pre) grid.loadMore();
    } else {
      start = 0;
      end = g.total;
      top = (local) => g.offsetOf(local);
      const range = grid.dataRange();
      data.ensure(range.first, loading ? range.first + Math.max(1, grid.pageSize) : Math.max(range.end, range.first + 1), true);
    }
    const viewAt = (local: number) => (grid.mode !== 'paged' ? local : grid.viewAt(local));
    const localOf = (i: number) => (grid.mode !== 'paged' ? (i < g.total ? i : -1) : grid.localOf(i));

    // Rows to show: the window, plus the active row and the focused row wherever they are.
    const wanted: number[] = [];
    for (let l = start; l < end; l++) wanted.push(viewAt(l));
    const inWindow = (i: number) => {
      const l = localOf(i);
      return l >= start && l < end;
    };
    const active = grid.state.activeRow;
    const focused = this.focusedRow()?.index ?? -1;
    const formAt = this.formIndex();
    // Focus in a row's details keeps the row and its details drawn.
    const inDetail = this.focusedDetail();
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
    this.placeForm(formAt, formAt >= 0 && localOf(formAt) >= 0 ? top(localOf(formAt)) : -1, view);
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
      this.laidTop.set(row.part, at);
      keep.set(i, row);
    });
    for (const row of free) row.release();
    this.byIndex = keep;
    const adaptiveAt = this.adaptiveIndex();
    this.placeAdaptive(adaptiveAt, rows, top, localOf, g, view);
    this.placeDetails(formAt >= 0 ? [...rows, formAt] : rows, top, localOf, g, view);
    const adaptiveOn = this.visible.includes(ADAPTIVE_FIELD);
    const drawn = this.adaptiveAt(adaptiveAt);
    for (const [i, row] of keep) row.drawAdaptive(adaptiveOn && row.row !== undefined, adaptiveOn && i === adaptiveAt, i === adaptiveAt ? this.idOf(drawn?.part) : null);
    if (this.shiftOf || this.shifted.size || this.dragSource >= 0) this.applyShift();
    // Rows stay where they are in the DOM: a moved row is styled again from scratch, on every
    // scroll. Assistive technology gets the reading order through aria-owns; a row's details
    // come right after it, and count as a row in `aria-rowindex`.
    const all: [number, Component<HTMLDivElement>][] = [];
    for (const [i, r] of keep) all.push([i, r.part]);
    if (this.form && formAt >= 0) all.push([formAt, this.form.part]);
    for (const [i, r] of this.groupsByIndex) all.push([i, r.part]);
    for (const [i, r] of this.footersByIndex) all.push([i, r.part]);
    const detailsOn = this.detailsByIndex.size > 0 || !!drawn;
    if (drawn) all.push([adaptiveAt + 0.25, drawn.part]);
    for (const [i, d] of this.detailsByIndex) all.push([i + 0.5, d.part]);
    const shown = all.sort((a, b) => a[0] - b[0]).map(([, part]) => this.idOf(part));
    const owns = shown.join(' ');
    put(this, 'aria-owns', owns);
    if (detailsOn || this.extras) {
      for (const [i, part] of all) {
        // A row's adaptive detail comes right after it, its details after that.
        const row = Math.floor(i);
        const under = i - row === 0.5 && drawn && adaptiveAt === row ? 2 : 1;
        const index = String(Number.isInteger(i) ? this.ariaRowIndex(i) : this.ariaRowIndex(row) + under);
        put(part, 'aria-rowindex', index);
      }
    }
  }

  /**
   * Details under the rows that show theirs (made the first time); the others are parked, and those
   * not wanted any more disposed. Those drawn now that were not before are told to `rowPrepared`.
   */
  private placeDetails(rows: number[], top: (local: number) => number, localOf: (i: number) => number, g: ScrollGeometry, view: GridBody<T>['lastView']) {
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
        detail.use(i, row, top(l) + g.rowHeightOf(l) + g.adaptiveAt(l), view.left, view.width, columns);
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
        if (this.expandDrawn.delete(row)) row.drawExpand(false, false, null);
        continue;
      }
      const can = grid.detailId(i) !== undefined;
      row.drawExpand(can, can && grid.isDetailOpen(i), this.idOf(shown.get(i)?.part));
      this.expandDrawn.add(row);
    }
    this.tidyDetails(drawn);
    const ev = grid.events;
    if (ev.listened(ev.rowPrepared)) {
      for (const detail of fresh) {
        const row = detail.row;
        ev.rowPrepared.fire({ row, rowIndex: detail.index, rowType: 'detail', isSelected: grid.selection.isSelected(grid.selectId(row)), part: detail.part });
      }
    }
  }

  /**
   * Disposes the details not wanted any more: closed ones (without `keepDetails`), those of the page left (without
   * `keepAcrossPages`), those whose row is gone, the ones seen longest ago past `keepLimit`.
   */
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
    const page = grid.mode === 'paged' ? `${st.page}|${st.pageSize}` : null;
    const pageLeft = this.pageFor !== null && page !== this.pageFor && !details.options.get('keepAcrossPages');
    this.pageFor = page;
    const kept: DetailRow<T>[] = [];
    for (const detail of [...this.details.values()]) {
      if (drawn.has(detail)) continue;
      // The row left the data (filtered out, deleted, not loaded any more): its details go with it.
      if ((!keep && !details.isOpen(detail.id)) || pageLeft || (check && grid.data.rowByKey(detail.key) === undefined)) this.dropDetail(detail);
      else kept.push(detail);
    }
    const limit = Math.max(0, Math.floor(details.options.get('keepLimit')));
    if (kept.length <= limit) return;
    kept.sort((a, b) => a.seen - b.seen);
    for (const detail of kept.slice(0, kept.length - limit)) this.dropDetail(detail);
  }

  /**
   * The adaptive detail under grid row `at` while that row is drawn (made the first time, recreated
   * for another row or another row object), parked while it is not; gone once it is closed.
   */
  private placeAdaptive(at: number, rows: number[], top: (local: number) => number, localOf: (i: number) => number, g: ScrollGeometry, view: GridBody<T>['lastView']) {
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
      return;
    }
    detail ??= this.createAdaptive(id, row);
    const l = localOf(at);
    detail.use(at, row, top(l) + g.rowHeightOf(l), view.left, view.width, this.visible.length);
  }

  private createAdaptive(id: string, row: T): DetailRow<T> {
    const grid = this.grid;
    const adapter = grid.data.source.adapter;
    const key = grid.isNew(id) || !adapter.keys.hasKey(row) ? undefined : adapter.keyOf(row);
    const elementId = nextId('grid-row');
    const detail = new DetailRow<T>(grid, this.detailHost, id, key, row, elementId, 'adaptive', () => this.detailHost.adaptiveContent(id, row));
    this.elementIds.set(detail.part, elementId);
    this.controls.add(detail.part);
    this.watchSize(detail);
    this.adaptive = detail;
    return detail;
  }

  private dropAdaptive() {
    const detail = this.adaptive;
    if (!detail) return;
    this.adaptive = null;
    detail.dispose();
  }

  private createDetail(id: string, row: T): DetailRow<T> {
    const adapter = this.grid.data.source.adapter;
    const elementId = nextId('grid-row');
    const detail = new DetailRow<T>(this.grid, this.detailHost, id, adapter.keyOf(row), row, elementId);
    this.elementIds.set(detail.part, elementId);
    this.controls.add(detail.part);
    this.details.set(id, detail);
    this.watchSize(detail);
    return detail;
  }

  /** Measures a detail row when it is first drawn and whenever its size changes; the watch ends with the row. */
  private watchSize(detail: DetailRow<T>) {
    onLayout(detail.part, 'size', (size) => this.detailResized(detail, size), { owner: this });
  }

  /** The edit form's row: at its row's place, as wide as the viewport and kept in it while the rows scroll sideways. */
  private placeForm(index: number, top: number, view: GridBody<T>['lastView']) {
    const form = this.form;
    if (!form) return;
    kept(form.part, top >= 0);
    if (top < 0) return;
    put(form.part, 'aria-rowindex', String(this.ariaRowIndex(index)));
    put(form.cell, 'aria-colspan', String(Math.max(1, this.visible.length)));
    css(form.part, 'inline-size', `${view.width}px`);
    css(form.part, 'transform', `translate(${view.left}px, ${top}px)`);
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
      this.laidTop.set(row.part, at);
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
      this.laidTop.set(row.part, at);
      keep.set(i, row);
    }
    for (const row of free) row.release();
    this.footersByIndex = keep;
  }

  private createFooterRow(): GroupFooterRow<T> {
    const row = new GroupFooterRow(this.grid);
    this.giveId(row.part);
    this.controls.add(row.part);
    row.arrange(this.visible);
    this.footerPool.push(row);
    return row;
  }

  private createGroupRow(): GroupRow<T> {
    const row = new GroupRow(this.grid);
    this.giveId(row.part);
    this.controls.add(row.part);
    row.arrange(this.visible);
    this.groupPool.push(row);
    return row;
  }

  private createRow(): GridRow<T> {
    const row = new GridRow(this.grid, this.widths);
    this.giveId(row.part);
    this.controls.add(row.part);
    row.arrange(this.visible);
    this.pool.push(row);
    return row;
  }

  /** Gives a row's element an id of its own. */
  private giveId(part: ComponentBase) {
    const id = nextId('grid-row');
    part.attr.add({ id });
    this.elementIds.set(part, id);
  }

  /** The id a row's element was given, `null` for none. */
  private idOf(part: ComponentBase | undefined): string | null {
    return (part && this.elementIds.get(part)) ?? null;
  }
}
