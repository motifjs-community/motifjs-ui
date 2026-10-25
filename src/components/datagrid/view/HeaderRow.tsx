import { Component, ComponentBase, effect } from '@motifx/core';
import { chevronDown, chevronUp, filterMark, moreMark } from '../../../core/glyphs';
import type { GridColumn } from '../grid-column';
import { ACTIONS_FIELD, SELECT_FIELD } from '../model/ColumnModel';
import { HEADER_ROW, type GridModel } from '../model/GridModel';
import { createCheck, setCheck } from './check-mark';
import type { HeaderHost } from './header-host';
import { placeInOrder } from './place-in-order';

const DRAG_THRESHOLD = 5;

/**
 * The header row: a header per column with its title, sort mark, filter and menu buttons and resize
 * handle. A click sorts (Shift adds to the sort), dragging a header moves the column inside its
 * sticky zone, dragging the edge resizes it, a double-click on the edge fits it to its content. The
 * selection column's header is the "select all" check box. Each follows the grid's settings and the
 * column's own value live.
 */
export class HeaderRow<T> extends Component<HTMLDivElement> {
  readonly cells = new Map<string, ComponentBase>();
  private indicator!: ComponentBase;
  private suppressClick = false;
  private stopCheck: (() => void) | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: HeaderHost,
  ) {
    super();
  }

  override onConfigured() {
    this.class.add('mx-data-grid__row mx-data-grid__row--header');
    this.attr.add({ role: 'row', 'aria-rowindex': '1', 'data-active': () => (this.grid.state.activeRow === HEADER_ROW ? '' : null) });
    this.motif.setDisposable(() => this.stopCheck?.());
  }

  // Headers are direct children of the row (no fragment in between), so `arrange` can move them.
  override initializeComponent() {
    const cells: ComponentBase[] = [];
    for (const field of this.grid.columns.state.order) cells.push(this.cell(this.grid.columns.get(field)));
    this.indicator = (<div class="mx-data-grid__drop" aria-hidden="true" hidden />) as unknown as ComponentBase;
    this.controls.add(...cells, this.indicator);
  }

  /** Puts the headers in display order and numbers the visible ones. */
  arrange(visible: string[]) {
    if (!this.indicator) return;
    const shown = new Set(visible);
    const desired: Element[] = [];
    visible.forEach((field, i) => {
      const el = this.cellElement(field);
      if (!el) return;
      desired.push(el);
      el.setAttribute('aria-colindex', String(i + 1));
    });
    for (const [field] of this.cells) {
      if (shown.has(field)) continue;
      const el = this.cellElement(field)!;
      desired.push(el);
      el.removeAttribute('aria-colindex');
    }
    placeInOrder(this.element, [...desired, this.indicator.element as Element]);
  }

  cellElement(field: string): HTMLElement | undefined {
    return this.cells.get(field)?.element as HTMLElement | undefined;
  }

  private cell(col: GridColumn<T>): ComponentBase {
    const { grid } = this;
    const cols = grid.columns;
    const field = col.field;
    if (field === SELECT_FIELD) return this.selectCell();
    const internal = cols.isInternal(field);
    const title = () => (field === ACTIONS_FIELD ? grid.text('gridActions') : internal ? grid.text('gridRowStatus') : cols.title(field));
    const sort = () => grid.sortOf(field);
    const ariaSort = () => {
      const s = sort();
      return s && s.position === 1 ? (s.dir === 'asc' ? 'ascending' : 'descending') : null;
    };
    const arrows = (c: ComponentBase) => {
      const up = chevronUp();
      up.classList.add('mx-data-grid__sort-up');
      const down = chevronDown();
      down.classList.add('mx-data-grid__sort-down');
      (c.element as HTMLElement).prepend(up, down);
    };
    const cell = (
      <div
        class="mx-data-grid__header-cell"
        role="columnheader"
        tabindex="-1"
        data-field={field}
        data-sort={() => sort()?.dir ?? null}
        data-sortable={() => (cols.can(field, 'sortable') ? '' : null)}
        aria-sort={ariaSort}
        onpointerdown={(e: PointerEvent) => this.pressHeader(col, e)}
        onclick={(e: MouseEvent) => this.clickHeader(col, e)}
      >
        <span class={internal ? 'mx-data-grid__title mx-data-grid__hidden-text' : 'mx-data-grid__title'}>{title}</span>
        <span class="mx-data-grid__sort" aria-hidden="true" ref={arrows}>
          {() => this.sortMark(field)}
        </span>
        <button
          type="button"
          class="mx-data-grid__filter-button"
          tabindex="-1"
          aria-haspopup="dialog"
          aria-label={() => grid.text('gridFilterFor', { title: cols.title(field) })}
          data-active={() => (grid.filters.isActive(field) ? '' : null)}
          x-display={() => grid.hasHeaderFilter(field)}
          ref={(c: ComponentBase) => (c.element as HTMLElement).append(filterMark())}
          onpointerdown={(e: PointerEvent) => e.stopPropagation()}
          onclick={(s: ComponentBase, e: MouseEvent) => {
            e.stopPropagation();
            this.host.openHeaderFilter(field, s.element as HTMLElement);
          }}
        />
        <button
          type="button"
          class="mx-data-grid__menu-button"
          tabindex="-1"
          aria-haspopup="menu"
          aria-label={() => grid.text('gridColumnMenu', { title: cols.title(field) })}
          x-display={() => this.host.hasMenu(field)}
          ref={(c: ComponentBase) => (c.element as HTMLElement).append(moreMark())}
          onpointerdown={(e: PointerEvent) => e.stopPropagation()}
          onclick={(s: ComponentBase, e: MouseEvent) => {
            e.stopPropagation();
            this.host.openMenu(field, s.element as HTMLElement);
          }}
        />
        <span
          class="mx-data-grid__resize"
          aria-hidden="true"
          x-display={() => cols.can(field, 'resizable')}
          onpointerdown={(e: PointerEvent) => this.pressHandle(col, e)}
          ondblclick={(e: MouseEvent) => {
            e.stopPropagation();
            if (!cols.can(field, 'resizable')) return;
            this.host.autoSize(field);
            grid.layoutChanged();
          }}
        />
      </div>
    ) as unknown as ComponentBase;
    this.cells.set(field, cell);
    return cell;
  }

  /** The header of the selection column: the "select all" check box, shown while select all is on. */
  private selectCell(): ComponentBase {
    const grid = this.grid;
    const check = createCheck(grid.text('gridSelectAll'));
    const cell = (
      <div
        class="mx-data-grid__header-cell mx-data-grid__select"
        role="columnheader"
        tabindex="-1"
        data-field={SELECT_FIELD}
        onclick={() => {
          if (grid.settings.get('selectAll')) this.host.toggleAll();
        }}
      />
    ) as unknown as ComponentBase;
    const el = cell.element as HTMLElement;
    el.append(check);
    this.stopCheck = effect(() => {
      const on = grid.settings.get('selectAll');
      check.hidden = !on;
      if (on) setCheck(check, this.host.allState(), grid.text('gridSelectAll'));
      el.setAttribute('aria-label', grid.text('gridSelectAll'));
    });
    this.cells.set(SELECT_FIELD, cell);
    return cell;
  }

  /** The sort position, shown next to the arrow when more than one column is sorted. */
  private sortMark(field: string): string {
    const s = this.grid.sortOf(field);
    return s && this.grid.state.sort.length > 1 ? String(s.position) : '';
  }

  private clickHeader(col: GridColumn<T>, e: MouseEvent) {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    if ((e.target as HTMLElement).closest('.mx-data-grid__resize, .mx-data-grid__menu-button, .mx-data-grid__filter-button')) return;
    this.grid.toggleSort(col.field, e.shiftKey);
  }

  /** Drag a header to move the column within its zone, not across columns that cannot move. */
  private pressHeader(col: GridColumn<T>, e: PointerEvent) {
    const cols = this.grid.columns;
    if (e.button !== 0 || !cols.can(col.field, 'movable')) return;
    if ((e.target as HTMLElement).closest('.mx-data-grid__resize, .mx-data-grid__menu-button, .mx-data-grid__filter-button')) return;
    const source = this.cellElement(col.field)!;
    const startX = e.clientX;
    const zone = cols.zone(cols.zoneOf(col.field));
    const [lo, hi] = cols.moveRange(col.field);
    if (lo === hi) return;
    // Captured at once: the pointer may leave the header before the drag threshold is reached.
    source.setPointerCapture?.(e.pointerId);
    let dragging = false;
    const from = zone.indexOf(col.field);
    let target = from;
    const indicator = this.indicator.element as HTMLElement;
    const rtl = this.host.isRtl();

    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.abs(ev.clientX - startX) < DRAG_THRESHOLD) return;
        dragging = true;
        source.toggleAttribute('data-dragging', true);
      }
      // Target = number of zone columns whose centre lies before the pointer.
      const rects = zone.map((f) => this.cellElement(f)!.getBoundingClientRect());
      let count = 0;
      for (const r of rects) {
        const centre = r.left + r.width / 2;
        if (rtl ? ev.clientX < centre : ev.clientX > centre) count++;
      }
      target = Math.max(lo, Math.min(hi, count > from ? count - 1 : count));
      if (target === from) {
        indicator.hidden = true;
        return;
      }
      // The mark sits on the boundary the column would land on.
      const base = this.element.getBoundingClientRect();
      const r = rects[target];
      const after = target > from;
      const x = rtl ? (after ? r.left : r.right) : after ? r.right : r.left;
      indicator.style.left = `${x - base.left}px`;
      indicator.hidden = false;
    };
    const up = () => {
      source.removeEventListener('pointermove', move);
      source.removeEventListener('pointerup', up);
      source.removeEventListener('pointercancel', up);
      indicator.hidden = true;
      source.toggleAttribute('data-dragging', false);
      if (!dragging) return;
      this.suppressClick = true;
      if (cols.move(col.field, target)) {
        const z = cols.zone(cols.zoneOf(col.field));
        this.grid.announce(this.grid.text('gridMovedTo', { title: cols.title(col.field), position: z.indexOf(col.field) + 1, count: z.length }));
        this.grid.layoutChanged();
      }
    };
    source.addEventListener('pointermove', move);
    source.addEventListener('pointerup', up);
    source.addEventListener('pointercancel', up);
  }

  /** Drag the edge to resize. */
  private pressHandle(col: GridColumn<T>, e: PointerEvent) {
    const cols = this.grid.columns;
    if (e.button !== 0 || !cols.can(col.field, 'resizable')) return;
    e.stopPropagation();
    e.preventDefault();
    const handle = e.currentTarget as HTMLElement;
    handle.setPointerCapture?.(e.pointerId);
    const startX = e.clientX;
    const startWidth = cols.width(col.field);
    const sign = this.host.isRtl() ? -1 : 1;
    const cell = this.cellElement(col.field)!;
    cell.toggleAttribute('data-resizing', true);
    const move = (ev: PointerEvent) => cols.resize(col.field, startWidth + sign * (ev.clientX - startX));
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
