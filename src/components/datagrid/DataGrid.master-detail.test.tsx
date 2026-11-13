import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { DetailContext } from './detail-context';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; city: string; qty: number };
type Order = { id: number; customer: number; item: string };

const makeRows = (n = 40): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Customer ${i + 1}`, city: ['ank', 'brs', 'izm'][i % 3], qty: (i + 1) * 10 }));
const columns = (): GridColumn<Row>[] => [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
  { field: 'city', title: 'City' },
  { field: 'qty', title: 'Qty', type: 'number' },
];

let made = 0;
let disposed = 0;

/** A detail with a name, a button and a field, counting how often it is made and disposed. */
class Detail extends Component<HTMLDivElement> {
  constructor(readonly ctx: DetailContext<Row>) {
    super('div');
    made++;
  }
  override onConfigured() {
    this.class.add('detail');
  }
  override onBuilt() {
    this.element.innerHTML = '<span class="d-name"></span><button class="d-first">Open</button><input class="d-last">';
    this.element.querySelector('.d-name')!.textContent = this.ctx.row.name;
  }
  override onDisposing() {
    disposed++;
  }
}

async function settle() {
  await settled(6);
}

function make(props: Partial<DataGridProps<Row>> = {}, rows: Row[] = makeRows(), viewport = 360) {
  const grid = mount(
    new DataGrid<Row>({
      rowKey: 'id',
      columns: columns(),
      rows,
      rowHeight: 36,
      locale: 'en-US',
      masterDetail: { enabled: true, template: (ctx) => new Detail(ctx) },
      ...props,
    } as DataGridProps<Row>),
  );
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  Object.defineProperty(vp, 'clientWidth', { configurable: true, get: () => 800 });
  (grid as any).measure();
  return {
    grid,
    vp,
    scrollTo(px: number) {
      vp.scrollTop = px;
      vp.dispatchEvent(new Event('scroll'));
    },
  };
}

const body = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__body')!;
const rowEl = (grid: DataGrid<any>, id: number) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')).find((r) => r.querySelector('[data-field="id"]')?.textContent === String(id));
const cellOf = (grid: DataGrid<any>, id: number, field: string) => rowEl(grid, id)!.querySelector<HTMLElement>(`[data-field="${field}"]`)!;
const details = (grid: DataGrid<any>) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__detail-row:not([hidden])'));
const detailOf = (grid: DataGrid<any>, id: number) => details(grid).find((d) => d.querySelector('.d-name')?.textContent === `Customer ${id}`);
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));
const headers = (grid: DataGrid<any>) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__row--header .mx-data-grid__header-cell')).filter((h) => h.hasAttribute('aria-colindex')).map((h) => h.dataset.field);

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  made = 0;
  disposed = 0;
});

describe('master-detail rows', () => {
  it('shows an expand column after the status and check box columns, pinned, while it is enabled', async () => {
    const { grid } = make({ settings: { editable: true, selection: 'multiple' } });
    await settle();
    expect(headers(grid).slice(0, 4)).toEqual(['mx:status', 'mx:select', 'mx:expand', 'id']);
    const head = grid.element.querySelector<HTMLElement>('.mx-data-grid__header-cell[data-field="mx:expand"]')!;
    expect(head.textContent).toBe('Details');
    const button = cellOf(grid, 1, 'mx:expand').querySelector<HTMLElement>('.mx-data-grid__expand-button')!;
    expect(button.getAttribute('role')).toBe('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.hidden).toBe(false);
    // ARIA allows aria-expanded on the rows of a treegrid only: the arrow carries it.
    expect(rowEl(grid, 1)!.hasAttribute('aria-expanded')).toBe(false);
    grid.masterDetail.enabled = false;
    await settle();
    expect(headers(grid)).not.toContain('mx:expand');
    await grid.dispose();
  });

  it('opens and closes by click, tells it before (cancellable) and after, and draws the details under their row', async () => {
    const told: string[] = [];
    const { grid } = make({
      onRowExpanding: (e) => {
        told.push(`expanding ${e.kind} ${String(e.key)}`);
        if (e.kind === 'detail' && e.key === 3) e.cancel = true;
      },
      onRowExpanded: (e) => told.push(`expanded ${e.kind} ${String(e.key)} ${(e.row as Row).name}`),
      onRowCollapsing: (e) => told.push(`collapsing ${e.kind} ${String(e.key)}`),
      onRowCollapsed: (e) => told.push(`collapsed ${e.kind} ${String(e.key)}`),
    });
    await settle();
    cellOf(grid, 2, 'mx:expand').click();
    await settle();
    expect(told).toEqual(['expanding detail 2', 'expanded detail 2 Customer 2']);
    const detail = detailOf(grid, 2)!;
    expect(detail).toBeDefined();
    expect(made).toBe(1);
    const master = rowEl(grid, 2)!;
    const button = master.querySelector<HTMLElement>('.mx-data-grid__expand-button')!;
    expect(master.hasAttribute('data-expanded')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe(detail.id);
    // The details are a row of their own in the reading order: right after their row, numbered after it.
    expect(master.getAttribute('aria-rowindex')).toBe('3');
    expect(detail.getAttribute('role')).toBe('row');
    expect(detail.getAttribute('aria-rowindex')).toBe('4');
    expect(rowEl(grid, 3)!.getAttribute('aria-rowindex')).toBe('5');
    const owns = body(grid).getAttribute('aria-owns')!.split(' ');
    expect(owns.indexOf(detail.id)).toBe(owns.indexOf(master.id) + 1);
    const cell = detail.querySelector<HTMLElement>('.mx-data-grid__detail-cell')!;
    expect(cell.getAttribute('role')).toBe('gridcell');
    expect(cell.getAttribute('aria-colspan')).toBe('5');
    expect(cell.querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('Details of row 2');
    expect(grid.element.querySelector('.mx-data-grid__viewport')!.getAttribute('aria-rowcount')).toBe(String(40 + 1 + 1));
    // Under its row, as wide as the viewport; the rows after it move down.
    expect(detail.style.transform).toBe('translate(0px, 72px)');
    expect(detail.style.inlineSize).toBe('800px');
    expect(rowEl(grid, 3)!.style.transform).toBe(`translateY(${72 + 200}px)`);
    // Cancelled: stays closed.
    cellOf(grid, 3, 'mx:expand').click();
    await settle();
    expect(detailOf(grid, 3)).toBeUndefined();
    expect(told.at(-1)).toBe('expanding detail 3');
    cellOf(grid, 2, 'mx:expand').click();
    await settle();
    expect(told.slice(-2)).toEqual(['collapsing detail 2', 'collapsed detail 2']);
    expect(details(grid)).toHaveLength(0);
    expect(rowEl(grid, 2)!.hasAttribute('data-expanded')).toBe(false);
    expect(rowEl(grid, 3)!.getAttribute('aria-rowindex')).toBe('4');
    // A click on the arrow leaves the selection as it is.
    expect(grid.selectedCount).toBe(0);
    await grid.dispose();
  });

  it('opens and closes from the keyboard on the expand cell, and moves on with the arrows', async () => {
    const { grid } = make();
    await settle();
    grid.focusCell(0, 'mx:expand');
    const cell = () => document.activeElement as HTMLElement;
    expect(cell().dataset.field).toBe('mx:expand');
    key(cell(), 'Enter');
    await settle();
    expect(grid.isRowExpanded(1)).toBe(true);
    key(cell(), ' ');
    await settle();
    expect(grid.isRowExpanded(1)).toBe(false);
    // Right opens a closed row, then moves; Left closes an open one, then moves.
    key(cell(), 'ArrowRight');
    await settle();
    expect(grid.isRowExpanded(1)).toBe(true);
    expect(grid.activeField).toBe('mx:expand');
    key(cell(), 'ArrowRight');
    await settle();
    expect(grid.activeField).toBe('id');
    key(cell(), 'ArrowLeft');
    expect(grid.activeField).toBe('mx:expand');
    key(cell(), 'ArrowLeft');
    await settle();
    expect(grid.isRowExpanded(1)).toBe(false);
    expect(grid.activeField).toBe('mx:expand');
    // Down goes to the next row, not into the details.
    key(cell(), 'ArrowRight');
    await settle();
    key(cell(), 'ArrowDown');
    expect(grid.focusedRowIndex).toBe(1);
    // The keys are options.
    grid.masterDetail.arrowKeys = false;
    grid.masterDetail.toggleKeys = ['+'];
    key(cell(), 'ArrowRight');
    expect(grid.activeField).toBe('id');
    key(cell(), 'ArrowLeft');
    key(cell(), 'Enter');
    await settle();
    expect(grid.isRowExpanded(2)).toBe(false);
    key(cell(), '+');
    await settle();
    expect(grid.isRowExpanded(2)).toBe(true);
    await grid.dispose();
  });

  it('opens and closes programmatically, all at once, by autoExpandAll, and only rows that canExpand', async () => {
    const told: string[] = [];
    const { grid } = make({
      masterDetail: { enabled: true, template: (ctx) => new Detail(ctx), canExpand: (row: Row) => row.city !== 'izm' },
      onRowExpanded: (e) => told.push(`expanded ${String(e.key)}`),
    });
    await settle();
    expect(cellOf(grid, 3, 'mx:expand').querySelector<HTMLElement>('.mx-data-grid__expand-button')!.hidden).toBe(true);
    expect(rowEl(grid, 3)!.hasAttribute('aria-expanded')).toBe(false);
    expect(grid.expandRow(3)).toBe(false);
    expect(grid.expandRow(1)).toBe(true);
    expect(grid.expandRow(1)).toBe(false);
    expect(told).toEqual(['expanded 1']);
    await settle();
    expect(grid.isRowExpanded(1)).toBe(true);
    expect(detailOf(grid, 1)).toBeDefined();
    expect(grid.collapseRow(1)).toBe(true);
    expect(grid.isRowExpanded(1)).toBe(false);
    grid.expandAllRows();
    await settle();
    expect(grid.isRowExpanded(2)).toBe(true);
    expect(grid.isRowExpanded(3)).toBe(false);
    expect(details(grid).map((d) => d.querySelector('.d-name')!.textContent).slice(0, 3)).toEqual(['Customer 1', 'Customer 2', 'Customer 4']);
    grid.collapseAllRows();
    await settle();
    expect(details(grid)).toHaveLength(0);
    // autoExpandAll opens every row; changing it opens or closes them all again.
    grid.masterDetail.autoExpandAll = true;
    await settle();
    expect(grid.isRowExpanded(5)).toBe(true);
    grid.collapseRow(5);
    grid.masterDetail.autoExpandAll = false;
    await settle();
    expect(grid.isRowExpanded(1)).toBe(false);
    // Off, the user cannot open them; code still can.
    grid.masterDetail.enabled = false;
    await settle();
    expect(grid.expandRow(2)).toBe(true);
    await grid.dispose();
  });

  it('keeps a closed row’s details with keepDetails, disposes them without it, and with the grid', async () => {
    const { grid } = make();
    await settle();
    grid.expandRow(1);
    await settle();
    const first = detailOf(grid, 1)!.querySelector('.detail');
    grid.collapseRow(1);
    await settle();
    expect(disposed).toBe(0);
    grid.expandRow(1);
    await settle();
    expect(detailOf(grid, 1)!.querySelector('.detail')).toBe(first);
    expect(made).toBe(1);
    grid.masterDetail.keepDetails = false;
    grid.collapseRow(1);
    await settle();
    expect(disposed).toBe(1);
    grid.expandRow(1);
    await settle();
    expect(made).toBe(2);
    grid.expandRow(2);
    await settle();
    await grid.dispose();
    expect(disposed).toBe(3);
  });

  it('disposes the details of the page left, or keeps them with keepAcrossPages; a row stays open', async () => {
    const { grid } = make({ mode: 'paged', pageSize: 5 });
    await settle();
    grid.expandRow(1);
    await settle();
    expect(made).toBe(1);
    grid.page = 1;
    await settle();
    expect(disposed).toBe(1);
    grid.page = 0;
    await settle();
    expect(grid.isRowExpanded(1)).toBe(true);
    expect(made).toBe(2);
    grid.masterDetail.keepAcrossPages = true;
    grid.page = 1;
    await settle();
    grid.page = 0;
    await settle();
    expect(disposed).toBe(1);
    expect(made).toBe(2);
    await grid.dispose();
  });

  it('keeps the open rows by key across sort and filter; a row filtered out takes its details with it', async () => {
    const { grid } = make({ settings: { filterRow: true } });
    await settle();
    grid.expandRow(3);
    await settle();
    grid.sort = [{ field: 'id', dir: 'desc' }];
    await settle();
    expect(grid.isRowExpanded(3)).toBe(true);
    const at = grid.getRowIndexByKey(3);
    expect(at).toBe(37);
    grid.sort = [];
    await settle();
    expect(detailOf(grid, 3)).toBeDefined();
    expect(made).toBe(1);
    grid.filters = { city: { op: '=', value: 'ank' } };
    await settle();
    expect(disposed).toBe(1);
    expect(grid.isRowExpanded(3)).toBe(true);
    grid.clearFilters();
    await settle();
    expect(detailOf(grid, 3)).toBeDefined();
    expect(made).toBe(2);
    // The search keeps them too.
    grid.searchText = 'Customer 3';
    await settle();
    expect(grid.isRowExpanded(3)).toBe(true);
    await grid.dispose();
  });

  it('measures tall details into the scroll geometry: the scroll height, the rows after them and reveal stay right', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('mx-data-grid__detail-row') && !this.hidden ? 500 : 0;
    });
    const { grid, scrollTo } = make({}, makeRows(200));
    await settle();
    grid.expandRow(2);
    await settle();
    expect(body(grid).style.height).toBe(`${200 * 36 + 500}px`);
    expect(rowEl(grid, 3)!.style.transform).toBe(`translateY(${72 + 500}px)`);
    // A detail not drawn yet counts at the average of those measured.
    grid.expandRow(150);
    await settle();
    expect(body(grid).style.height).toBe(`${200 * 36 + 1000}px`);
    // Scrolling into a tall detail keeps its row (and the detail) drawn.
    scrollTo(36 + 400);
    await settle();
    expect(detailOf(grid, 2)).toBeDefined();
    expect(rowEl(grid, 2)).toBeDefined();
    // Going to a row below an open detail scrolls by the detail too.
    grid.focusCell(160, 'name');
    await settle();
    const vp = grid.element.querySelector<HTMLElement>('.mx-data-grid__viewport')!;
    const rowTop = 160 * 36 + 1000;
    expect(vp.scrollTop).toBe(rowTop + 36 - 360);
    expect(rowEl(grid, 161)!.style.transform).toBe(`translateY(${rowTop}px)`);
    // The first detail is out of view: parked, not drawn, its content kept.
    expect(detailOf(grid, 2)).toBeUndefined();
    expect(disposed).toBe(0);
    expect(grid.element.querySelectorAll('.mx-data-grid__detail-row').length).toBe(2);
    await grid.dispose();
  });

  it('disposes the details seen longest ago past keepLimit', async () => {
    const { grid, scrollTo } = make({ masterDetail: { enabled: true, template: (ctx) => new Detail(ctx), keepLimit: 1, estimatedHeight: 36 } }, makeRows(200));
    await settle();
    grid.expandRow(2);
    grid.expandRow(3);
    await settle();
    expect(made).toBe(2);
    scrollTo(3000);
    await settle();
    expect(disposed).toBe(1);
    scrollTo(0);
    await settle();
    expect(made).toBe(3);
    await grid.dispose();
  });

  it('works in paged mode: the page is as tall as its rows and their details', async () => {
    const { grid } = make({ mode: 'paged', pageSize: 10 }, makeRows(30));
    await settle();
    grid.expandRow(12);
    expect(grid.page).toBe(0);
    grid.page = 1;
    await settle();
    expect(grid.expandRow(12)).toBe(false);
    expect(body(grid).style.height).toBe(`${10 * 36 + 200}px`);
    expect(detailOf(grid, 12)).toBeDefined();
    expect(rowEl(grid, 13)!.style.transform).toBe(`translateY(${2 * 36 + 200}px)`);
    await grid.dispose();
  });

  it('lets focus into the details with Tab and back with Escape or Shift+Tab, and leaves their keys to them', async () => {
    const { grid } = make();
    await settle();
    grid.expandRow(2);
    await settle();
    grid.focusCell(1, 'name');
    key(document.activeElement!, 'Tab');
    const detail = detailOf(grid, 2)!;
    expect(document.activeElement).toBe(detail.querySelector('.d-first'));
    // Keys in the details are theirs: the grid does not move.
    key(document.activeElement!, 'ArrowDown');
    key(document.activeElement!, 'Enter');
    expect(grid.focusedRowIndex).toBe(1);
    expect(grid.isRowExpanded(2)).toBe(true);
    key(document.activeElement!, 'Escape');
    expect(document.activeElement).toBe(cellOf(grid, 2, 'name'));
    key(document.activeElement!, 'Tab');
    key(document.activeElement!, 'Tab', { shiftKey: true });
    expect(document.activeElement).toBe(cellOf(grid, 2, 'name'));
    // Focus put into the details makes their row the active one.
    grid.focusCell(5, 'qty');
    (detail.querySelector('.d-last') as HTMLElement).focus();
    expect(grid.focusedRowIndex).toBe(1);
    expect(grid.activeField).toBe('qty');
    // Closing the details takes focus back to their row.
    grid.collapseRow(2);
    expect(document.activeElement).toBe(cellOf(grid, 2, 'qty'));
    await grid.dispose();
  });

  it('holds a nested grid whose clicks and keys stay its own, and lists the details among the visible rows', async () => {
    const orders: Order[] = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, customer: (i % 3) + 1, item: `Item ${i + 1}` }));
    let inner: DataGrid<Order> | null = null;
    const prepared: string[] = [];
    const { grid } = make({
      settings: { selection: 'single' },
      masterDetail: {
        enabled: true,
        template: (ctx) =>
          (inner = new DataGrid<Order>({ rowKey: 'id', rows: orders.filter((o) => o.customer === ctx.key), columns: [{ field: 'item', title: 'Item' }], rowHeight: 36, label: 'Orders' })),
      },
      onRowPrepared: (e) => e.rowType === 'detail' && prepared.push(`${e.rowIndex}`),
    });
    await settle();
    grid.expandRow(1);
    await settle();
    expect(inner).not.toBeNull();
    expect(inner!.total).toBe(4);
    expect(prepared).toEqual(['0']);
    grid.focusCell(3, 'name');
    const innerCell = detailOf(grid, 1) ?? details(grid)[0];
    const cell = innerCell.querySelector<HTMLElement>('.mx-data-grid__body .mx-data-grid__cell[data-field="item"]')!;
    cell.click();
    cell.focus();
    key(cell, 'ArrowDown');
    expect(grid.focusedRowIndex).toBe(0);
    expect(grid.selectedCount).toBe(1);
    expect(grid.selectedKeys).toEqual([1]);
    expect(grid.activeField).toBe('name');
    const visible = grid.getVisibleRows();
    expect(visible[0].rowType).toBe('data');
    expect(visible[1]).toMatchObject({ rowIndex: 0, rowType: 'detail', key: 1 });
    await grid.dispose();
    expect(inner!.isDisposed).toBe(true);
  });

  it('gives a height of its own, and keeps an edit form row with the details under it', async () => {
    const { grid } = make({ masterDetail: { enabled: true, template: (ctx) => new Detail(ctx), height: (row: Row) => (row.id === 1 ? 120 : 80) } });
    await settle();
    grid.expandRow(1);
    grid.expandRow(2);
    await settle();
    const cell = detailOf(grid, 1)!.querySelector<HTMLElement>('.mx-data-grid__detail-cell')!;
    expect(cell.style.blockSize).toBe('120px');
    expect(cell.hasAttribute('data-fixed')).toBe(true);
    expect(body(grid).style.height).toBe(`${40 * 36 + 200}px`);
    expect(rowEl(grid, 3)!.style.transform).toBe(`translateY(${72 + 200}px)`);
    await grid.dispose();
  });

  it('keeps the open rows when grouped, and says aria-expanded on the rows of the tree', async () => {
    const { grid } = make();
    await settle();
    grid.expandRow(4);
    grid.groupBy('city');
    await settle();
    expect(grid.isRowExpanded(4)).toBe(true);
    const at = grid.getRowIndexByKey(4);
    expect(grid.getVisibleRows().find((r) => r.rowType === 'detail')).toMatchObject({ rowIndex: at, key: 4 });
    expect(rowEl(grid, 4)!.getAttribute('aria-expanded')).toBe('true');
    expect(rowEl(grid, 1)!.getAttribute('aria-expanded')).toBe('false');
    const detail = detailOf(grid, 4)!;
    expect(detail.getAttribute('aria-rowindex')).toBe(String(Number(rowEl(grid, 4)!.getAttribute('aria-rowindex')) + 1));
    await grid.dispose();
  });

  it('keeps a row edited in the edit form with its details under the form', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.hidden) return 0;
      return this.classList.contains('mx-data-grid__form-row') ? 200 : this.classList.contains('mx-data-grid__detail-row') ? 100 : 0;
    });
    const { grid } = make({ settings: { editable: true, editMode: 'form' } });
    await settle();
    grid.expandRow(2);
    await settle();
    grid.editRow(1);
    await settle();
    const form = grid.element.querySelector<HTMLElement>('.mx-data-grid__form-row:not([hidden])')!;
    expect(form.style.transform).toContain('36px)');
    const detail = details(grid)[0];
    expect(detail.style.transform).toContain(`, ${36 + 200}px)`);
    expect(rowEl(grid, 3)!.style.transform).toBe(`translateY(${36 + 200 + 100}px)`);
    expect(grid.isRowExpanded(2)).toBe(true);
    await grid.dispose();
  });

  it('tells masterDetail changes through onOptionChanged', async () => {
    const told: string[] = [];
    const { grid } = make({ onOptionChanged: (e) => told.push(`${e.name}=${String(e.value)}`) });
    await settle();
    grid.masterDetail.keepLimit = 5;
    expect(told).toEqual(['masterDetail.keepLimit=5']);
    expect(grid.masterDetail.keepLimit).toBe(5);
    await grid.dispose();
  });
});
