import { Component, ComponentBase, untracked } from '@motifx/core';
import { put, text } from '../../../core/draw-parts';
import { chevronDown, chevronUp, filterMark, moreMark } from '../../../core/glyphs';
import { isNode } from '../../../core/node-kind';
import type { GridColumn } from '../grid-column';
import type { HeaderCellContext } from '../header-cell-context';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, DRAG_FIELD, EXPAND_FIELD, SELECT_FIELD } from '../model/ColumnModel';
import { HEADER_ROW, type GridModel } from '../model/GridModel';
import { createCheck, setCheck } from './check-mark';
import { dropPlace } from './drop-place';
import type { HeaderHost } from './header-host';
import type { GhostTarget } from './ghost-target';
import { placeInOrder } from './place-in-order';

/**
 * Puts the parts that are wanted in `cell`, in their order, after its other children, and takes out the others.
 */
function present(cell: HTMLElement, parts: HTMLElement[], wanted: boolean[]) {
  parts.forEach((part, i) => {
    if (!wanted[i]) {
      if (part.parentNode === cell) part.remove();
      return;
    }
    if (part.parentNode === cell) return;
    const next = parts.slice(i + 1).find((later) => later.parentNode === cell) ?? null;
    cell.insertBefore(part, next);
  });
}

/** What a header keeps of its parts to draw them again. */
interface HeaderParts {
  col: GridColumn<unknown>;
  title: HTMLElement;
  mark: HTMLElement;
  filter: HTMLButtonElement;
  menu: HTMLButtonElement;
  resize: HTMLElement;
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
  private indicator!: ComponentBase;
  private suppressClick = false;
  /** The parts of each header that show what changes, by field. */
  private readonly drawn = new Map<string, HeaderParts>();
  /** The "select all" check box and its header, while the grid has a selection column. */
  private select: { cell: HTMLElement; check: HTMLSpanElement } | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: HeaderHost,
  ) {
    super();
  }

  override onConfigured() {
    this.element.className = 'mx-data-grid__row mx-data-grid__row--header';
    this.element.setAttribute('role', 'row');
    this.motif.setDisposable(this.grid.notices.on(() => this.draw()));
  }

  // Headers are direct children of the row (no fragment in between), so `arrange` can move them.
  override initializeComponent() {
    const cells: ComponentBase[] = [];
    // While columns are virtual a header is created when its column is first drawn.
    for (const field of this.grid.columns.state.order) if (this.grid.columnWindow.has(field)) cells.push(this.cell(this.grid.columns.get(field)));
    const indicator = new Component<HTMLDivElement>('div');
    indicator.element.className = 'mx-data-grid__drop';
    indicator.element.setAttribute('aria-hidden', 'true');
    indicator.element.hidden = true;
    this.indicator = indicator;
    this.controls.add(...cells, this.indicator);
    this.draw();
  }

  /** Draws the row and every header as the grid is now. */
  draw() {
    if (this.isDisposed) return;
    untracked(() => {
      const { grid } = this;
      const el = this.element;
      // Under the bands' rows.
      put(el, 'aria-rowindex', String(grid.columns.bandDepth() + 1));
      if (grid.state.activeRow === HEADER_ROW && !grid.columns.isBand(grid.state.activeField)) {
        if (!el.hasAttribute('data-active')) el.setAttribute('data-active', '');
      } else if (el.hasAttribute('data-active')) el.removeAttribute('data-active');
      for (const field of this.drawn.keys()) this.drawCell(field);
      this.drawSelect();
    });
  }

  // A column's own header content replaces the title once the headers are built.
  override onBuilt() {
    for (const field of this.grid.columns.state.order) {
      const col = this.grid.columns.get(field);
      const span = col.headerCell ? this.cellElement(field)?.querySelector<HTMLElement>('.mx-data-grid__title') : null;
      if (span) this.ownTitle(col, span);
    }
  }

  /** Puts the headers in display order and numbers the visible ones; while columns are virtual, only the columns drawn have their header in the row. */
  arrange(visible: string[]) {
    if (!this.indicator) return;
    const drawn = this.grid.columnWindow;
    const shown = new Set(visible);
    const desired: Element[] = [];
    visible.forEach((field, i) => {
      if (!drawn.has(field)) return;
      if (!this.cells.has(field)) this.addColumn(field);
      const el = this.cellElement(field);
      if (!el) return;
      desired.push(el);
      el.setAttribute('aria-colindex', String(i + 1));
    });
    for (const [field] of this.cells) {
      if (shown.has(field) && drawn.has(field)) continue;
      const el = this.cellElement(field)!;
      el.removeAttribute('aria-colindex');
      if (drawn.all) desired.push(el);
      else el.remove();
    }
    placeInOrder(this.element, [...desired, this.indicator.element as Element]);
  }

  /** A column's own `headerCell` content in place of the title text. */
  private ownTitle(col: GridColumn<T>, span: HTMLElement) {
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
    span.textContent = '';
    if (content instanceof ComponentBase) {
      this.controls.add(content);
      span.append(content.element as Node);
      this.titles.set(col.field, content);
    } else if (isNode(content)) span.append(content);
    else if (content !== undefined && content !== null) span.append(String(content));
  }

  cellElement(field: string): HTMLElement | undefined {
    return this.cells.get(field)?.element as HTMLElement | undefined;
  }

  /** A column added at run time gets its header (placed by the next `arrange`). */
  addColumn(field: string) {
    if (this.cells.has(field) || !this.indicator || !this.grid.columnWindow.has(field)) return;
    const col = this.grid.columns.get(field);
    const cell = this.cell(col);
    this.controls.add(cell);
    this.element.insertBefore(cell.element as Node, this.indicator.element as Node);
    const span = col.headerCell ? (cell.element as HTMLElement).querySelector<HTMLElement>('.mx-data-grid__title') : null;
    if (span) this.ownTitle(col, span);
    untracked(() => (field === SELECT_FIELD ? this.drawSelect() : this.drawCell(field)));
  }

  /** A column removed loses its header, and its own header content. */
  removeColumn(field: string) {
    const cell = this.cells.get(field);
    this.cells.delete(field);
    this.drawn.delete(field);
    if (field === SELECT_FIELD) this.select = null;
    const own = this.titles.get(field);
    this.titles.delete(field);
    if (own && !own.isDisposed) void own.dispose({ skipLeaveTransition: true });
    if (cell && !cell.isDisposed) void cell.dispose({ skipLeaveTransition: true });
  }

  private cell(col: GridColumn<T>): ComponentBase {
    const field = col.field;
    if (field === SELECT_FIELD) return this.selectCell();
    const internal = this.grid.columns.isInternal(field);
    const cell = new Component<HTMLDivElement>('div');
    const el = cell.element;
    el.className = 'mx-data-grid__header-cell';
    el.setAttribute('role', 'columnheader');
    el.setAttribute('tabindex', '-1');
    el.dataset.field = field;
    el.addEventListener('pointerdown', (e) => this.pressHeader(col, e));
    el.addEventListener('click', (e) => this.clickHeader(col, e));
    const title = el.appendChild(document.createElement('span'));
    title.className = internal ? 'mx-data-grid__title mx-data-grid__hidden-text' : 'mx-data-grid__title';
    const sort = el.appendChild(document.createElement('span'));
    sort.className = 'mx-data-grid__sort';
    sort.setAttribute('aria-hidden', 'true');
    const up = chevronUp();
    up.classList.add('mx-data-grid__sort-up');
    const down = chevronDown();
    down.classList.add('mx-data-grid__sort-down');
    // The position of the sort comes after the arrows, as a text of its own.
    const mark = document.createTextNode('');
    sort.append(up, down, mark);
    const button = (className: string, popup: string, glyph: Element, open: (anchor: HTMLElement) => void) => {
      const b = el.appendChild(document.createElement('button'));
      b.type = 'button';
      b.className = className;
      b.setAttribute('tabindex', '-1');
      b.setAttribute('aria-haspopup', popup);
      b.append(glyph);
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        open(b);
      });
      return b;
    };
    const filter = button('mx-data-grid__filter-button', 'dialog', filterMark(), (anchor) => this.host.openHeaderFilter(field, anchor));
    const menu = button('mx-data-grid__menu-button', 'menu', moreMark(), (anchor) => this.host.openMenu(field, anchor));
    const resize = el.appendChild(document.createElement('span'));
    resize.className = 'mx-data-grid__resize';
    resize.setAttribute('aria-hidden', 'true');
    resize.addEventListener('pointerdown', (e) => this.pressHandle(col, e));
    resize.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (!this.grid.columns.can(field, 'resizable')) return;
      this.host.autoSize(field);
      this.grid.layoutChanged();
    });
    this.cells.set(field, cell);
    this.drawn.set(field, { col: col as GridColumn<unknown>, title, mark: mark as unknown as HTMLElement, filter, menu, resize });
    return cell;
  }

  /** A header as the grid is now: its title, sort, buttons and handle. */
  private drawCell(field: string) {
    const parts = this.drawn.get(field);
    const el = this.cellElement(field);
    if (!parts || !el) return;
    const { grid } = this;
    const cols = grid.columns;
    const { col } = parts;
    const name = this.titleOf(field);
    const sort = grid.sortOf(field);
    put(el, 'data-sort', sort?.dir ?? null);
    if (cols.can(field, 'sortable')) {
      if (!el.hasAttribute('data-sortable')) el.setAttribute('data-sortable', '');
    } else if (el.hasAttribute('data-sortable')) el.removeAttribute('data-sortable');
    put(el, 'aria-sort', sort && sort.position === 1 ? (sort.dir === 'asc' ? 'ascending' : 'descending') : null);
    put(el, 'aria-label', col.headerCell ? name : null);
    // A column's own header content stands in the title's place.
    if (!col.headerCell) text(parts.title, name);
    const position = this.sortMark(field);
    const mark = parts.mark as unknown as Text;
    if (mark.data !== position) mark.data = position;
    const title = cols.title(field);
    put(parts.filter, 'aria-label', grid.text('gridFilterFor', { title }));
    if (grid.filters.isActive(field)) {
      if (!parts.filter.hasAttribute('data-active')) parts.filter.setAttribute('data-active', '');
    } else if (parts.filter.hasAttribute('data-active')) parts.filter.removeAttribute('data-active');
    put(parts.menu, 'aria-label', grid.text('gridColumnMenu', { title }));
    // A button or handle that does nothing is not there at all; one that comes back takes its place again.
    present(el, [parts.filter, parts.menu, parts.resize], [grid.hasHeaderFilter(field), this.host.hasMenu(field), cols.can(field, 'resizable')]);
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
    const cell = new Component<HTMLDivElement>('div');
    const el = cell.element;
    el.className = 'mx-data-grid__header-cell mx-data-grid__select';
    el.setAttribute('role', 'columnheader');
    el.setAttribute('tabindex', '-1');
    el.dataset.field = SELECT_FIELD;
    el.addEventListener('click', () => {
      if (grid.settings.get('selectAll')) this.host.toggleAll();
    });
    el.append(check);
    this.select = { cell: el, check };
    this.cells.set(SELECT_FIELD, cell);
    return cell;
  }

  private drawSelect() {
    const select = this.select;
    if (!select) return;
    const grid = this.grid;
    const on = grid.settings.get('selectAll');
    select.check.hidden = !on;
    if (on) setCheck(select.check, this.host.allState(), grid.text('gridSelectAll'));
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
    if ((e.target as HTMLElement).closest('.mx-data-grid__resize, .mx-data-grid__menu-button, .mx-data-grid__filter-button')) return;
    this.grid.toggleSort(col.field, e.shiftKey);
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
    if ((e.target as HTMLElement).closest('.mx-data-grid__resize, .mx-data-grid__menu-button, .mx-data-grid__filter-button')) return;
    const panel = grid.canGroupNow(field) ? this.host.groupTarget() : null;
    const [lo, hi] = cols.moveRange(field);
    const movable = cols.can(field, 'movable') && lo !== hi;
    if (!movable && !panel) return;
    const source = this.cellElement(field)!;
    const startX = e.clientX;
    const startY = e.clientY;
    const units = cols.siblings(field);
    // Captured at once: the pointer may leave the header before the drag threshold is reached.
    source.setPointerCapture?.(e.pointerId);
    let dragging = false;
    const from = units.indexOf(field);
    let target = from;
    let place = -1;
    const indicator = this.indicator.element as HTMLElement;
    const rtl = this.host.isRtl();

    const ghost = this.host.ghost;
    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.max(Math.abs(ev.clientX - startX), panel ? Math.abs(ev.clientY - startY) : 0) < grid.settings.get('dragThreshold')) return;
        dragging = true;
        source.toggleAttribute('data-dragging', true);
        panel?.showReady(true);
        ghost.show(source, ev.clientX, ev.clientY, 'header');
      }
      ghost.move(ev.clientX, ev.clientY, aim(ev));
    };
    /** Marks where a drop at the pointer lands, and says what it would do. */
    const aim = (ev: PointerEvent): GhostTarget => {
      place = panel ? panel.dropIndexAt(ev.clientX, ev.clientY) : -1;
      panel?.showDrop(place);
      if (place >= 0 || !movable) {
        target = from;
        indicator.hidden = true;
        return place >= 0 ? 'group' : 'none';
      }
      const drop = dropPlace(units.map((u) => this.unitRect(u)), from, lo, hi, ev.clientX, rtl);
      target = drop.target;
      if (drop.x === null) {
        indicator.hidden = true;
        return 'none';
      }
      // The mark sits on the boundary the column would land on.
      indicator.style.left = `${drop.x - this.element.getBoundingClientRect().left}px`;
      indicator.hidden = false;
      return 'move';
    };
    const up = (ev: PointerEvent) => {
      source.removeEventListener('pointermove', move);
      source.removeEventListener('pointerup', up);
      source.removeEventListener('pointercancel', up);
      indicator.hidden = true;
      panel?.showDrop(-1);
      panel?.showReady(false);
      ghost.hide();
      source.toggleAttribute('data-dragging', false);
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
    source.addEventListener('pointermove', move);
    source.addEventListener('pointerup', up);
    source.addEventListener('pointercancel', up);
  }

  /**
   * Where a grouped column dragged back over the headers would land: its place among the visible
   * columns of its zone and band; -1 when the point is not over the headers.
   */
  chipDropIndex(field: string, x: number, y?: number): number {
    if (Number.isNaN(x)) return -1;
    const box = this.element.getBoundingClientRect();
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
    const el = this.cellElement(field);
    if (el?.isConnected) return el.getBoundingClientRect();
    const cols = this.grid.columns;
    const visible = cols.visible();
    if (!visible.includes(field)) return null;
    const row = this.element.getBoundingClientRect();
    const start = this.grid.columnWindow.offsetOf(field, visible);
    const width = cols.width(field);
    return this.host.isRtl() ? { left: row.right - start - width, right: row.right - start } : { left: row.left + start, right: row.left + start + width };
  }

  /** Marks where a grouped column dragged over the headers lands; whether the point is over them (NaN hides the mark). */
  showChipDrop(field: string, x: number, y: number): boolean {
    const indicator = this.indicator.element as HTMLElement;
    const at = this.chipDropIndex(field, x, y);
    if (at < 0) {
      indicator.hidden = true;
      this.element.toggleAttribute('data-drop', false);
      return false;
    }
    const units = this.grid.columns.siblings(field);
    const rtl = this.host.isRtl();
    const base = this.element.getBoundingClientRect();
    const before = units[at] !== undefined ? this.unitRect(units[at]) : undefined;
    const after = units[at - 1] !== undefined ? this.unitRect(units[at - 1]) : undefined;
    const edge = before ? (rtl ? before.right : before.left) : after ? (rtl ? after.left : after.right) : base.left;
    indicator.style.left = `${edge - base.left}px`;
    indicator.hidden = false;
    this.element.toggleAttribute('data-drop', true);
    return true;
  }

  /** Width the column takes on screen; more than its setting while it flexes. */
  shownWidth(field: string): number {
    const w = this.cellElement(field)?.getBoundingClientRect().width;
    return w ? Math.round(w) : this.grid.columns.width(field);
  }

  /** Drag the edge to resize: the column alone, or against the next one. */
  private pressHandle(col: GridColumn<T>, e: PointerEvent) {
    const cols = this.grid.columns;
    if (e.button !== 0 || !cols.can(col.field, 'resizable')) return;
    e.stopPropagation();
    e.preventDefault();
    const handle = e.currentTarget as HTMLElement;
    handle.setPointerCapture?.(e.pointerId);
    const startX = e.clientX;
    const next = cols.partnerOf(col.field);
    // From the width on screen: a flexing column is wider than its setting.
    const startWidth = this.shownWidth(col.field);
    const total = next ? startWidth + this.shownWidth(next) : 0;
    const sign = this.host.isRtl() ? -1 : 1;
    const cell = this.cellElement(col.field)!;
    cell.toggleAttribute('data-resizing', true);
    const move = (ev: PointerEvent) => {
      const px = startWidth + sign * (ev.clientX - startX);
      if (next) cols.resizeWithNext(col.field, next, total, px);
      else cols.resize(col.field, px);
    };
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      cell.toggleAttribute('data-resizing', false);
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false));
      if (cols.width(col.field) !== startWidth) this.grid.layoutChanged();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }
}
