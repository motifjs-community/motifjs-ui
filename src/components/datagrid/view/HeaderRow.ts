import { Component, ComponentBase, untracked } from '@motifx/core';
import { glyphPart, loose, part, textPart } from '../../../core/draw-parts';
import { css, kept, mark, put, text } from '../../../core/part-writes';
import { isInPage, measure, rectOf } from '../../../core/measure';
import type { GridColumn } from '../grid-column';
import type { HeaderCellContext } from '../header-cell-context';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, DRAG_FIELD, EXPAND_FIELD, SELECT_FIELD } from '../model/ColumnModel';
import { HEADER_ROW, type GridModel } from '../model/GridModel';
import { createCheck, drawCheck } from './check-mark';
import { dropPlace } from './drop-place';
import type { HeaderHost } from './header-host';
import type { GhostTarget } from './ghost-target';
import type { GroupDrop } from './group-drop';
import { orderControls } from '../../../core/order-controls';

/**
 * Puts the parts that are wanted in `cell`, in their order, after `first`, and takes out the others; they stay
 * alive to come back.
 */
/** No drop on the group panel. */
const NO_DROP: GroupDrop = Object.freeze({ index: -1, offset: 0 });

function present(cell: ComponentBase, first: ComponentBase[], parts: ComponentBase[], wanted: boolean[]) {
  const desired = [...first];
  parts.forEach((part, i) => {
    if (wanted[i]) desired.push(part);
    else if (part.parent === cell) cell.controls.silentDetach(part);
  });
  orderControls(cell, desired);
}

/** Disposes the buttons and the handle of a header that are taken out of it now. */
function dropTakenOut(parts: HeaderParts) {
  for (const part of [parts.filter, parts.menu, parts.resize]) if (!part.parent && !part.isDisposed) void part.dispose();
}

/** What a header keeps of its parts to draw them again. */
interface HeaderParts {
  col: GridColumn<unknown>;
  title: Component<HTMLSpanElement>;
  sort: Component<HTMLSpanElement>;
  mark: ComponentBase;
  filter: Component<HTMLButtonElement>;
  menu: Component<HTMLButtonElement>;
  resize: Component<HTMLSpanElement>;
}

/**
 * The header row: a header per column with its title, sort mark, filter and menu buttons and resize
 * handle. A click sorts (Shift adds to the sort), dragging a header moves the column inside its
 * sticky zone and its band (or, dropped on the group panel, groups by it), dragging the edge resizes it, a
 * double-click on the edge fits it to its content. The selection column's header is the "select all"
 * check box. It follows nothing: made in code, it draws itself again whenever the grid tells a change.
 */
export class HeaderRow<T> extends Component<HTMLDivElement> {
  readonly cells = new Map<string, ComponentBase>();
  /** The columns' own header contents (`headerCell`) that are components, by field. */
  private readonly titles = new Map<string, ComponentBase>();
  /** The title of each header, a component: a column's own `headerCell` content is added to it. */
  private readonly titleParts = new Map<string, Component<HTMLSpanElement>>();
  private indicator!: ComponentBase;
  private suppressClick = false;
  /** The parts of each header that show what changes, by field. */
  private readonly drawn = new Map<string, HeaderParts>();
  /** The "select all" check box and its header, while the grid has a selection column. */
  private select: { cell: Component<HTMLDivElement>; check: Component<HTMLSpanElement> } | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: HeaderHost,
  ) {
    super();
  }

  override onConfigured() {
    this.class.add('mx-data-grid__row mx-data-grid__row--header');
    this.attr.add({ role: 'row' });
    this.motif.setDisposable(this.grid.notices.on(() => this.draw()));
    // Buttons taken out of their header go with the row too.
    this.motif.setDisposable(() => {
      for (const parts of this.drawn.values()) dropTakenOut(parts);
    });
  }

  // Headers are direct children of the row (no fragment in between), so `arrange` can move them.
  override initializeComponent() {
    const cells: ComponentBase[] = [];
    // While columns are virtual a header is created when its column is first drawn.
    for (const field of this.grid.columns.state.order) if (this.grid.columnWindow.has(field)) cells.push(this.cell(this.grid.columns.get(field)));
    const indicator = new Component<HTMLDivElement>('div');
    indicator.class.add('mx-data-grid__drop');
    indicator.attr.add({ 'aria-hidden': 'true' });
    kept(indicator, false);
    this.indicator = indicator;
    this.controls.add(...cells, this.indicator);
    this.draw();
  }

  /** Draws the row and every header as the grid is now. */
  draw() {
    if (this.isDisposed) return;
    untracked(() => {
      const { grid } = this;
      // Under the bands' rows.
      put(this, 'aria-rowindex', String(grid.columns.bandDepth() + 1));
      mark(this, 'data-active', grid.state.activeRow === HEADER_ROW && !grid.columns.isBand(grid.state.activeField));
      for (const field of this.drawn.keys()) this.drawCell(field);
      this.drawSelect();
    });
  }

  // A column's own header content replaces the title once the headers are built.
  override onBuilt() {
    for (const field of this.grid.columns.state.order) {
      const col = this.grid.columns.get(field);
      const title = col.headerCell ? this.titleParts.get(field) : undefined;
      if (title) this.ownTitle(col, title);
    }
  }

  /** Puts the headers in display order and numbers the visible ones; while columns are virtual, only the columns drawn have their header in the row. */
  arrange(visible: string[]) {
    if (!this.indicator) return;
    const drawn = this.grid.columnWindow;
    const shown = new Set(visible);
    const desired: ComponentBase[] = [];
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      if (!this.cells.has(field)) this.addColumn(field);
      const cell = this.cells.get(field);
      if (!cell) return;
      desired.push(cell);
      put(cell, 'aria-colindex', String(i + 1));
    });
    for (const [field, cell] of this.cells) {
      if (shown.has(field) && drawn.has(field)) continue;
      put(cell, 'aria-colindex', null);
      if (drawn.all) desired.push(cell);
      else if (cell.parent === this) this.controls.silentDetach(cell);
    }
    orderControls(this, [...desired, this.indicator]);
  }

  /** A column's own `headerCell` content in place of the title text. */
  private ownTitle(col: GridColumn<T>, title: Component<HTMLSpanElement>) {
    const { grid } = this;
    const ctx: HeaderCellContext<T> = {
      column: col,
      get title() {
        return grid.columns.title(col.field);
      },
      get sort() {
        return grid.sortOf(col.field)?.dir ?? null;
      },
    };
    const content = col.headerCell!(ctx);
    text(title, '');
    if (content instanceof ComponentBase) {
      title.controls.add(content);
      this.titles.set(col.field, content);
    } else if (content !== undefined && content !== null) textPart(title, String(content));
  }

  /** The header of a column, while it has one. */
  cellPart(field: string): ComponentBase | undefined {
    return this.cells.get(field);
  }

  /** The title of a column's header, which holds its own header content; the selection column's header has none. */
  titlePart(field: string): Component<HTMLSpanElement> | undefined {
    return this.titleParts.get(field);
  }

  /** The text a column's header title shows; `undefined` when the column has header content of its own, or a title only assistive technology reads. */
  titleText(field: string): string | undefined {
    const drawn = this.drawn.get(field);
    return drawn && !drawn.col.headerCell && !this.grid.columns.isInternal(field) ? this.titleOf(field) : undefined;
  }

  /** A column added at run time gets its header (placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.cells.has(field) || !this.indicator || !this.grid.columnWindow.has(field)) return;
    const col = this.grid.columns.get(field);
    const cell = this.cell(col);
    // Before the drop indicator.
    this.controls.insert(this.controls.items.indexOf(this.indicator), cell);
    const title = col.headerCell ? this.titleParts.get(field) : undefined;
    if (title) this.ownTitle(col, title);
    untracked(() => (field === SELECT_FIELD ? this.drawSelect() : this.drawCell(field)));
  }

  /** A column removed loses its header, and its own header content. */
  removeColumn(field: string) {
    const cell = this.cells.get(field);
    this.cells.delete(field);
    const drawn = this.drawn.get(field);
    if (drawn) dropTakenOut(drawn);
    this.drawn.delete(field);
    if (field === SELECT_FIELD) this.select = null;
    this.titles.delete(field);
    this.titleParts.delete(field);
    // Its own header content goes with it.
    if (cell?.parent) cell.parent.controls.remove(cell);
    else if (cell && !cell.isDisposed) void cell.dispose({ skipLeaveTransition: true });
  }

  private cell(col: GridColumn<T>): ComponentBase {
    const field = col.field;
    if (field === SELECT_FIELD) return this.selectCell();
    const internal = this.grid.columns.isInternal(field);
    const cell = loose<HTMLDivElement>('div', 'mx-data-grid__header-cell');
    cell.attr.add({ role: 'columnheader', tabindex: '-1', 'data-field': field });
    cell.motif.on('pointerdown', (_, e) => this.pressHeader(col, e));
    cell.motif.on('click', (_, e) => this.clickHeader(col, e));
    // The parts are components in their order: the title holds a column's own header content.
    const title = part<HTMLSpanElement>(cell, 'span', internal ? 'mx-data-grid__title mx-data-grid__hidden-text' : 'mx-data-grid__title');
    const sort = part<HTMLSpanElement>(cell, 'span', 'mx-data-grid__sort');
    sort.attr.add({ 'aria-hidden': 'true' });
    glyphPart(sort, 'chevron-up', 'mx-data-grid__sort-up');
    glyphPart(sort, 'chevron-down', 'mx-data-grid__sort-down');
    // The position of the sort comes after the arrows, as a text of its own.
    const mark = textPart(sort, '');
    const button = (className: string, popup: string, glyph: string, open: (anchor: ComponentBase) => void) => {
      const b = part<HTMLButtonElement>(cell, 'button', className);
      b.attr.add({ type: 'button', tabindex: '-1', 'aria-haspopup': popup });
      glyphPart(b, glyph);
      b.motif.on('pointerdown', (_, e) => e.stopPropagation());
      b.motif.on('click', (_, e) => {
        e.stopPropagation();
        open(b);
      });
      return b;
    };
    const filter = button('mx-data-grid__filter-button', 'dialog', 'filter', (anchor) => this.host.openHeaderFilter(field, anchor));
    const menu = button('mx-data-grid__menu-button', 'menu', 'more', (anchor) => this.host.openMenu(field, anchor));
    const resize = part<HTMLSpanElement>(cell, 'span', 'mx-data-grid__resize');
    resize.attr.add({ 'aria-hidden': 'true' });
    resize.motif.on('pointerdown', (_, e) => this.pressHandle(col, resize, e));
    resize.motif.on('dblclick', (_, e) => {
      e.stopPropagation();
      if (!this.grid.columns.can(field, 'resizable')) return;
      this.host.autoSize(field);
      this.grid.layoutChanged();
    });
    this.cells.set(field, cell);
    this.titleParts.set(field, title);
    this.drawn.set(field, { col: col as GridColumn<unknown>, title, sort, mark, filter, menu, resize });
    return cell;
  }

  /** A header as the grid is now: its title, sort, buttons and handle. */
  private drawCell(field: string) {
    const parts = this.drawn.get(field);
    const cell = this.cells.get(field);
    if (!parts || !cell) return;
    const { grid } = this;
    const cols = grid.columns;
    const { col } = parts;
    const name = this.titleOf(field);
    const sort = grid.sortOf(field);
    put(cell, 'data-sort', sort?.dir ?? null);
    mark(cell, 'data-sortable', cols.can(field, 'sortable'));
    put(cell, 'aria-sort', sort && sort.position === 1 ? (sort.dir === 'asc' ? 'ascending' : 'descending') : null);
    put(cell, 'aria-label', col.headerCell ? name : null);
    // A column's own header content stands in the title's place.
    if (!col.headerCell) text(parts.title, name);
    text(parts.mark, this.sortMark(field));
    const title = cols.title(field);
    put(parts.filter, 'aria-label', grid.text('gridFilterFor', { title }));
    mark(parts.filter, 'data-active', grid.filters.isActive(field));
    put(parts.menu, 'aria-label', grid.text('gridColumnMenu', { title }));
    // A button or handle that does nothing is not there at all; one that comes back takes its place again.
    present(cell, [parts.title, parts.sort], [parts.filter, parts.menu, parts.resize], [grid.hasHeaderFilter(field), this.host.hasMenu(field), cols.can(field, 'resizable')]);
  }

  /** What a header says: a column's title, or the name of one of the grid's own columns. */
  private titleOf(field: string): string {
    const { grid } = this;
    if (field === ACTIONS_FIELD) return grid.text('gridActions');
    if (field === EXPAND_FIELD) return grid.text('gridDetails');
    if (field === ADAPTIVE_FIELD) return grid.text('gridAdaptive');
    if (field === DRAG_FIELD) return grid.text('gridDragColumn');
    if (grid.columns.isInternal(field)) return grid.text('gridRowStatus');
    return grid.columns.title(field);
  }

  /** The header of the selection column: the "select all" check box, shown while select all is on. */
  private selectCell(): ComponentBase {
    const grid = this.grid;
    const check = createCheck(grid.text('gridSelectAll'));
    const cell = loose<HTMLDivElement>('div', 'mx-data-grid__header-cell mx-data-grid__select');
    cell.attr.add({ role: 'columnheader', tabindex: '-1', 'data-field': SELECT_FIELD });
    cell.motif.on('click', () => {
      if (grid.settings.get('selectAll')) this.host.toggleAll();
    });
    cell.controls.add(check);
    this.select = { cell, check };
    this.cells.set(SELECT_FIELD, cell);
    return cell;
  }

  private drawSelect() {
    const select = this.select;
    if (!select) return;
    const grid = this.grid;
    const on = grid.settings.get('selectAll');
    kept(select.check, on);
    if (on) drawCheck(select.check, this.host.allState(), grid.text('gridSelectAll'));
    put(select.cell, 'aria-label', grid.text('gridSelectAll'));
  }

  /** The sort position, shown next to the arrow when more than one column is sorted. */
  private sortMark(field: string): string {
    const s = this.grid.sortOf(field);
    return s && s.position > 0 && this.grid.state.sort.length > 1 ? String(s.position) : '';
  }

  private clickHeader(col: GridColumn<T>, e: MouseEvent) {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    if (this.fromButton(col.field, e)) return;
    this.grid.toggleSort(col.field, e.shiftKey);
  }

  /** Whether an event started on a header's filter or menu button, or on its resize handle. */
  private fromButton(field: string, e: Event): boolean {
    const parts = this.drawn.get(field);
    return !!parts && [parts.filter, parts.menu, parts.resize].some((part) => part.motif.isEventFrom(e));
  }

  /**
   * Drag a header to move the column within its zone and its band, not across columns that cannot
   * move; onto the group panel to group by it.
   */
  private pressHeader(col: GridColumn<T>, e: PointerEvent) {
    const { grid } = this;
    const cols = grid.columns;
    const field = col.field;
    if (e.button !== 0) return;
    if (this.fromButton(field, e)) return;
    const panel = grid.canGroupNow(field) ? this.host.groupTarget() : null;
    const [lo, hi] = cols.moveRange(field);
    const movable = cols.can(field, 'movable') && lo !== hi;
    if (!movable && !panel) return;
    const sourcePart = this.cells.get(field)!;
    const startX = e.clientX;
    const startY = e.clientY;
    const units = cols.siblings(field);
    // Captured at once: the pointer may leave the header before the drag threshold is reached.
    sourcePart.attr.add({ setPointerCapture: e.pointerId });
    let dragging = false;
    const from = units.indexOf(field);
    let target = from;
    let place = -1;
    const indicator = this.indicator;
    const rtl = this.host.isRtl();

    const ghost = this.host.ghost;
    let point = { x: startX, y: startY };
    let stopAim = () => {};
    /** Where a drop at the pointer lands: on the group panel, or the column's new place and the boundary it lands on (from the row's start). */
    const readAim = () => {
      // The panel's drop is read here with its mark's place, so the write measures nothing.
      const onPanel = panel ? panel.dropAt(point.x, point.y) : NO_DROP;
      if (onPanel.index >= 0 || !movable) return { place: onPanel.index, panelDrop: onPanel, target: from, x: null };
      const drop = dropPlace(units.map((u) => this.unitRect(u)), from, lo, hi, point.x, rtl);
      return { place: onPanel.index, panelDrop: onPanel, target: drop.target, x: drop.x === null ? null : drop.x - rectOf(this).left };
    };
    /** Marks where the drop lands, and the ghost says what it would do. */
    const drawAim = (aim: ReturnType<typeof readAim>) => {
      place = aim.place;
      target = aim.target;
      panel?.showDropAt(aim.panelDrop);
      // The mark sits on the boundary the column would land on.
      if (aim.x !== null) css(indicator, 'left', `${aim.x}px`);
      kept(indicator, aim.x !== null);
      const says: GhostTarget = place >= 0 ? 'group' : aim.x === null ? 'none' : 'move';
      ghost.move(point.x, point.y, says);
    };
    const move = (_: ComponentBase, ev: PointerEvent) => {
      if (!dragging) {
        if (Math.max(Math.abs(ev.clientX - startX), panel ? Math.abs(ev.clientY - startY) : 0) < grid.settings.get('dragThreshold')) return;
        dragging = true;
        // The ghost copies the header cell's size before anything is written for the drag.
        ghost.show(sourcePart, ev.clientX, ev.clientY, 'header');
        mark(sourcePart, 'data-dragging', true);
        panel?.showReady(true);
      }
      point = { x: ev.clientX, y: ev.clientY };
      stopAim = measure(this, readAim, drawAim);
    };
    const up = (_: ComponentBase, ev: PointerEvent) => {
      stopAim();
      // The drop lands where the last move pointed, measured or not yet.
      if (dragging) {
        const last = readAim();
        place = last.place;
        target = last.target;
      }
      void sourcePart.motif.off('pointermove', move);
      void sourcePart.motif.off('pointerup', up);
      void sourcePart.motif.off('pointercancel', up);
      kept(indicator, false);
      panel?.showDropAt(NO_DROP);
      panel?.showReady(false);
      ghost.hide();
      mark(sourcePart, 'data-dragging', false);
      if (!dragging) return;
      this.suppressClick = true;
      if (place >= 0 && ev.type !== 'pointercancel') {
        if (grid.groupDropAllowed(field, 'header', 'panel', place)) grid.groupBy(field, place, true);
        return;
      }
      if (cols.move(col.field, target)) {
        const beside = cols.siblings(col.field);
        this.grid.announce(this.grid.text('gridMovedTo', { title: cols.title(col.field), position: beside.indexOf(col.field) + 1, count: beside.length }));
        this.grid.layoutChanged();
      }
    };
    void sourcePart.motif.on('pointermove', move);
    void sourcePart.motif.on('pointerup', up);
    void sourcePart.motif.on('pointercancel', up);
  }

  /**
   * Where a grouped column dragged back over the headers would land: its place among the visible
   * columns of its zone and band; -1 when the point is not over the headers.
   */
  chipDropIndex(field: string, x: number, y?: number): number {
    if (Number.isNaN(x)) return -1;
    const box = rectOf(this);
    if (y !== undefined && (y < box.top || y > box.bottom || x < box.left || x > box.right)) return -1;
    const rtl = this.host.isRtl();
    let n = 0;
    for (const u of this.grid.columns.siblings(field)) {
      const r = this.unitRect(u);
      if (r.right > r.left && (rtl ? x < (r.left + r.right) / 2 : x > (r.left + r.right) / 2)) n++;
    }
    return n;
  }

  /** Where a column, or a band's columns together, sit on the screen. */
  unitRect(id: string): { left: number; right: number } {
    const cols = this.grid.columns;
    const fields = cols.isBand(id) ? cols.leavesIn(id, cols.visible()) : [id];
    let left = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    for (const f of fields) {
      const r = this.placeOf(f);
      if (!r) continue;
      left = Math.min(left, r.left);
      right = Math.max(right, r.right);
    }
    return left <= right ? { left, right } : { left: 0, right: 0 };
  }

  /** Where a column's header sits on the screen; a column without cells (virtual, out of view) by the widths. */
  private placeOf(field: string): { left: number; right: number } | null {
    const cell = this.cellPart(field);
    if (cell && isInPage(cell)) return rectOf(cell);
    const cols = this.grid.columns;
    const visible = cols.visible();
    if (!visible.includes(field)) return null;
    const row = rectOf(this);
    const start = this.grid.columnWindow.offsetOf(field, visible);
    const width = cols.width(field);
    return this.host.isRtl() ? { left: row.right - start - width, right: row.right - start } : { left: row.left + start, right: row.left + start + width };
  }

  /**
   * Where a grouped column dragged over the headers lands, and where its mark goes (from the row's left); reads
   * only, -1 when the point is not over them (NaN). Read it first in a handler, then write it with `showChipDrop`.
   */
  chipDropAt(field: string, x: number, y: number): GroupDrop {
    const at = this.chipDropIndex(field, x, y);
    if (at < 0) return NO_DROP;
    const units = this.grid.columns.siblings(field);
    const rtl = this.host.isRtl();
    const base = rectOf(this);
    const before = units[at] !== undefined ? this.unitRect(units[at]) : undefined;
    const after = units[at - 1] !== undefined ? this.unitRect(units[at - 1]) : undefined;
    const edge = before ? (rtl ? before.right : before.left) : after ? (rtl ? after.left : after.right) : base.left;
    return { index: at, offset: edge - base.left };
  }

  /** Marks where a drop read with `chipDropAt` lands; one at -1 hides the mark. */
  showChipDrop(drop: GroupDrop) {
    const indicator = this.indicator;
    mark(this, 'data-drop', drop.index >= 0);
    if (drop.index >= 0) css(indicator, 'left', `${drop.offset}px`);
    kept(indicator, drop.index >= 0);
  }

  /** Width the column takes on screen; more than its setting while it flexes. */
  shownWidth(field: string): number {
    const cell = this.cellPart(field);
    const w = cell ? rectOf(cell).width : 0;
    return w ? Math.round(w) : this.grid.columns.width(field);
  }

  /** Drag the edge to resize: the column alone, or against the next one. */
  private pressHandle(col: GridColumn<T>, handlePart: ComponentBase, e: PointerEvent) {
    const cols = this.grid.columns;
    if (e.button !== 0 || !cols.can(col.field, 'resizable')) return;
    e.stopPropagation();
    e.preventDefault();
    handlePart.attr.add({ setPointerCapture: e.pointerId });
    const startX = e.clientX;
    const next = cols.partnerOf(col.field);
    // From the width on screen: a flexing column is wider than its setting.
    const startWidth = this.shownWidth(col.field);
    const total = next ? startWidth + this.shownWidth(next) : 0;
    const sign = this.host.isRtl() ? -1 : 1;
    const cell = this.cells.get(col.field)!;
    mark(cell, 'data-resizing', true);
    const move = (_: ComponentBase, ev: PointerEvent) => {
      const px = startWidth + sign * (ev.clientX - startX);
      if (next) cols.resizeWithNext(col.field, next, total, px);
      else cols.resize(col.field, px);
    };
    const up = () => {
      void handlePart.motif.off('pointermove', move);
      void handlePart.motif.off('pointerup', up);
      void handlePart.motif.off('pointercancel', up);
      mark(cell, 'data-resizing', false);
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false));
      if (cols.width(col.field) !== startWidth) this.grid.layoutChanged();
    };
    void handlePart.motif.on('pointermove', move);
    void handlePart.motif.on('pointerup', up);
    void handlePart.motif.on('pointercancel', up);
  }
}
