import { Component } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; city: string; phone: string; note: string };

const rows = (): Row[] => Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, city: ['Ankara', 'Bursa'][i % 2], phone: `555-${i}`, note: `Note ${i + 1}` }));

// 60 + 160 + 120 + 120 + 200 = 660 pixels of columns.
const columns = (): GridColumn<Row>[] => [
  { field: 'id', title: 'Id', type: 'number', width: 60 },
  { field: 'name', title: 'Name', width: 160 },
  { field: 'city', title: 'City', width: 120 },
  { field: 'phone', title: 'Phone', width: 120 },
  { field: 'note', title: 'Note', width: 200 },
];

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

function make(props: Partial<DataGridProps<Row>> = {}, width = 500) {
  const grid = mount(new DataGrid<Row>({ rows: rows(), rowKey: 'id', columns: columns(), rowHeight: 36, locale: 'en-US', ...props, settings: { columnHidingEnabled: true, ...props.settings } } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let w = width;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  Object.defineProperty(vp, 'clientWidth', { configurable: true, get: () => w });
  (grid as any).measure();
  return {
    grid,
    resize(next: number) {
      w = next;
      (grid as any).measure();
    },
  };
}

const shown = (grid: DataGrid<any>) => (grid as any).model.columns.visible() as string[];
const body = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__body')!;
const rowEl = (grid: DataGrid<any>, id: number) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')).find((r) => r.querySelector('[data-field="id"]')?.textContent === String(id))!;
const more = (grid: DataGrid<any>, id: number) => rowEl(grid, id).querySelector<HTMLElement>('[data-field="mx:adaptive"]')!;
const adaptiveRows = (grid: DataGrid<any>) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__adaptive-row:not([hidden])'));
const items = (grid: DataGrid<any>) =>
  Array.from(adaptiveRows(grid)[0]?.querySelectorAll<HTMLElement>('.mx-data-grid__adaptive-item') ?? []).map((el) => `${el.querySelector('.mx-data-grid__adaptive-label')!.textContent}: ${el.querySelector('.mx-data-grid__adaptive-value')!.textContent}`);
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('adaptive columns', () => {
  it('hides columns from the last one while the grid is narrower than they are, and shows a "…" column', async () => {
    const { grid, resize } = make({}, 700);
    await settle();
    expect(grid.adaptiveHiddenColumns).toEqual([]);
    expect(shown(grid)).toEqual(['id', 'name', 'city', 'phone', 'note']);
    resize(500);
    await settle();
    // 660 + the "…" column (36) is 696: Note goes (496).
    expect(grid.adaptiveHiddenColumns).toEqual(['note']);
    expect(shown(grid)).toEqual(['id', 'name', 'city', 'phone', 'mx:adaptive']);
    resize(400);
    await settle();
    expect(grid.adaptiveHiddenColumns).toEqual(['phone', 'note']);
    expect(grid.element.querySelector<HTMLElement>('.mx-data-grid__viewport')!.style.getPropertyValue('--_columns')).toBe('60px 160px 120px 36px');
    // Still shown columns everywhere else: the column list, getVisibleColumns, the export.
    expect(grid.getVisibleColumns().map((c) => c.field)).toEqual(['id', 'name', 'city', 'phone', 'note']);
    expect(grid.columnOption('note', 'visible')).toBe(true);
    resize(900);
    await settle();
    expect(grid.adaptiveHiddenColumns).toEqual([]);
    expect(shown(grid)).not.toContain('mx:adaptive');
  });

  it('with a hidingPriority on some columns, only those hide, the lowest first; pinned columns stay', async () => {
    const cols = columns();
    cols[1].hidingPriority = 1;
    cols[2].hidingPriority = 0;
    cols[4].sticky = 'end';
    cols[4].hidingPriority = 2;
    const { grid, resize } = make({ columns: cols, settings: { columnHidingEnabled: false } }, 600);
    await settle();
    expect(grid.adaptiveHiddenColumns).toEqual(['city']);
    resize(300);
    await settle();
    expect(grid.adaptiveHiddenColumns).toEqual(['name', 'city']);
    resize(100);
    await settle();
    // Note is pinned, the others have no priority: they stay, however narrow.
    expect(grid.adaptiveHiddenColumns).toEqual(['name', 'city']);
  });

  it('hides nothing without columnHidingEnabled and priorities, or before the grid is measured', async () => {
    const { grid } = make({ settings: { columnHidingEnabled: false } }, 300);
    await settle();
    expect(grid.adaptiveHiddenColumns).toEqual([]);
    const unmeasured = make({}, 0);
    await settle();
    expect(unmeasured.grid.adaptiveHiddenColumns).toEqual([]);
    grid.settings.columnHidingEnabled = true;
    await settle();
    expect(grid.adaptiveHiddenColumns.length).toBeGreaterThan(0);
  });

  it('the "…" opens a detail under the row with the hidden columns\' titles and values; one row at a time', async () => {
    const { grid } = make({}, 400);
    await settle();
    const button = more(grid, 3).querySelector<HTMLElement>('.mx-data-grid__adaptive-button')!;
    expect(button.getAttribute('role')).toBe('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    click(more(grid, 3));
    await settle();
    expect(adaptiveRows(grid)).toHaveLength(1);
    expect(items(grid)).toEqual(['Phone: 555-2', 'Note: Note 3']);
    expect(grid.isAdaptiveDetailRowExpanded(3)).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe(adaptiveRows(grid)[0].id);
    // Right after its row in the reading order, counted as a row.
    const owns = body(grid).getAttribute('aria-owns')!.split(' ');
    expect(owns[owns.indexOf(rowEl(grid, 3).id) + 1]).toBe(adaptiveRows(grid)[0].id);
    expect(adaptiveRows(grid)[0].getAttribute('aria-rowindex')).toBe('5');
    expect(rowEl(grid, 4).getAttribute('aria-rowindex')).toBe('6');
    expect(adaptiveRows(grid)[0].querySelector('[role="gridcell"]')!.getAttribute('aria-colspan')).toBe('4');
    expect(grid.getVisibleRows().find((r) => r.rowType === 'detailAdaptive')?.key).toBe(3);
    click(more(grid, 5));
    await settle();
    expect(grid.isAdaptiveDetailRowExpanded(3)).toBe(false);
    expect(items(grid)).toEqual(['Phone: 555-4', 'Note: Note 5']);
    expect(grid.collapseAdaptiveDetailRow()).toBe(true);
    await settle();
    expect(adaptiveRows(grid)).toHaveLength(0);
  });

  it('opens and closes from the keys of the "…" cell and programmatically, telling it before (cancelable) and after', async () => {
    const { grid } = make({}, 400);
    await settle();
    const log: string[] = [];
    grid.onAdaptiveDetailRowExpanding((e) => {
      log.push(`expanding ${String(e.key)}`);
      if (e.key === 7) e.cancel = true;
    });
    grid.onAdaptiveDetailRowExpanded((e) => log.push(`expanded ${String(e.key)}`));
    grid.onAdaptiveDetailRowCollapsing((e) => log.push(`collapsing ${String(e.key)}`));
    grid.onAdaptiveDetailRowCollapsed((e) => log.push(`collapsed ${String(e.key)}`));
    grid.focusCell(1, 'mx:adaptive');
    key(document.activeElement!, 'Enter');
    await settle();
    expect(grid.isAdaptiveDetailRowExpanded(2)).toBe(true);
    key(document.activeElement!, ' ');
    expect(grid.isAdaptiveDetailRowExpanded(2)).toBe(false);
    expect(grid.expandAdaptiveDetailRow(7)).toBe(false);
    expect(grid.expandAdaptiveDetailRow(8)).toBe(true);
    expect(log).toEqual(['expanding 2', 'expanded 2', 'collapsing 2', 'collapsed 2', 'expanding 7', 'expanding 8', 'expanded 8']);
    grid.adaptiveDetail.toggleKeys = ['F4'];
    grid.focusCell(7, 'mx:adaptive');
    key(document.activeElement!, 'Enter');
    expect(grid.isAdaptiveDetailRowExpanded(8)).toBe(true);
    key(document.activeElement!, 'F4');
    expect(grid.isAdaptiveDetailRowExpanded(8)).toBe(false);
  });

  it('Tab goes from the row into its detail, Escape back; widening the grid closes it', async () => {
    const { grid, resize } = make({}, 400);
    await settle();
    grid.expandAdaptiveDetailRow(2);
    await settle();
    grid.focusCell(1, 'name');
    key(document.activeElement!, 'Tab');
    const cell = adaptiveRows(grid)[0].querySelector<HTMLElement>('.mx-data-grid__detail-cell')!;
    expect(document.activeElement).toBe(cell);
    key(cell, 'Escape');
    expect(document.activeElement).toBe(rowEl(grid, 2).querySelector('[data-field="name"]'));
    resize(1000);
    await settle();
    expect(grid.isAdaptiveDetailRowExpanded(2)).toBe(false);
    expect(adaptiveRows(grid)).toHaveLength(0);
  });

  it('comes before the master detail of the same row; both open', async () => {
    class Detail extends Component<HTMLDivElement> {
      override onBuilt() {
        this.element.textContent = 'details';
      }
    }
    const { grid } = make({ masterDetail: { enabled: true, template: (_ctx) => new Detail('div') } }, 400);
    await settle();
    grid.expandRow(4);
    grid.expandAdaptiveDetailRow(4);
    await settle();
    const adaptive = adaptiveRows(grid)[0];
    const detail = grid.element.querySelector<HTMLElement>('.mx-data-grid__detail-row:not(.mx-data-grid__adaptive-row):not([hidden])')!;
    const owns = body(grid).getAttribute('aria-owns')!.split(' ');
    const at = owns.indexOf(rowEl(grid, 4).id);
    expect(owns.slice(at + 1, at + 3)).toEqual([adaptive.id, detail.id]);
    expect(Number(detail.getAttribute('aria-rowindex'))).toBe(Number(adaptive.getAttribute('aria-rowindex')) + 1);
    expect(grid.getVisibleRows().filter((r) => r.rowIndex === 3).map((r) => r.rowType)).toEqual(['data', 'detailAdaptive', 'detail']);
  });

  it('lets onAdaptiveDetailRowPreparing change the form, and follows the columns that hide while it is open', async () => {
    const { grid, resize } = make(
      {
        onAdaptiveDetailRowPreparing: (e) => {
          e.formOptions.items = [...e.formOptions.items].reverse();
          e.formOptions.colCount = 1;
        },
      },
      400,
    );
    await settle();
    grid.expandAdaptiveDetailRow(1);
    await settle();
    expect(items(grid)).toEqual(['Note: Note 1', 'Phone: 555-0']);
    resize(300);
    await settle();
    expect(items(grid)).toEqual(['Note: Note 1', 'Phone: 555-0', 'City: Ankara']);
  });

  it('shows editors for the cells the row can fill, writing into its draft; editing a row opens its detail', async () => {
    const { grid } = make({ settings: { editable: true }, saveMode: 'batch' }, 400);
    await settle();
    grid.editCell(2, 'name');
    await settle();
    expect(grid.isAdaptiveDetailRowExpanded(3)).toBe(true);
    const field = adaptiveRows(grid)[0].querySelector<HTMLElement>('.mx-data-grid__form-field[data-field="note"]')!;
    const input = field.querySelector('input')!;
    expect(input.value).toBe('Note 3');
    input.focus();
    input.value = 'Changed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await settle();
    expect(grid.cellValue(2, 'note')).toBe('Changed');
    expect(grid.changes.updated.length).toBe(1);
  });
});
