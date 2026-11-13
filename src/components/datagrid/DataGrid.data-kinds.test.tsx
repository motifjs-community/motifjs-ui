import { Component, effect, untracked } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataKinds } from '../../../tests/data-kinds';
import { mount } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { CellContext } from './cell-context';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', editable: false },
  { field: 'name', title: 'Name' },
  { field: 'amount', title: 'Amount', type: 'number' },
];

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, amount: (i + 1) * 10 }));

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(rows: Row[], props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"]`) as HTMLElement;
const cellText = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`)!.textContent;
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

afterEach(() => {
  document.body.innerHTML = '';
});

describe.each(dataKinds)('DataGrid with %s data', (_, kind) => {
  it('gives back the very rows: events, cell contents, getters', async () => {
    const rows = kind(makeRows(3));
    const prepared: Row[] = [];
    const cells: CellContext<Row>[] = [];
    const grid = await make(rows, {
      columns: [...columns, { field: 'note', title: 'Note', cell: (ctx) => (cells.push(ctx), '') }],
      settings: { selection: 'multiple' },
      onRowPrepared: (e) => e.row && prepared.push(e.row),
    });
    expect(prepared).toContain(rows[0]);
    expect(cells.map((c) => c.row)).toContain(rows[1]);
    expect(grid.getVisibleRows()[2].row).toBe(rows[2]);
    grid.selectedKeys = [2];
    expect(grid.selectedRows[0]).toBe(rows[1]);
    grid.focusCell(0, 'name');
    expect(grid.activeRow).toBe(rows[0]);
    await grid.dispose();
  });

  it('shows a change made in place after repaint, repaintRows or refresh, and not before', async () => {
    const rows = kind(makeRows(3));
    const grid = await make(rows);
    rows[0].name = 'Changed';
    rows[1].name = 'Other';
    await settle();
    expect(cellText(grid, 0, 'name')).toBe('Name 1');
    grid.repaintRows([1]);
    await settle();
    expect([cellText(grid, 0, 'name'), cellText(grid, 1, 'name')]).toEqual(['Changed', 'Name 2']);
    grid.repaint();
    await settle();
    expect(cellText(grid, 1, 'name')).toBe('Other');
    rows.push({ id: 4, name: 'New', amount: 40 });
    await settle();
    expect(grid.total).toBe(3);
    grid.refresh();
    await settle();
    expect(grid.total).toBe(4);
    expect(cellText(grid, 3, 'name')).toBe('New');
    await grid.dispose();
  });

  it('edits, deletes and selects the rows themselves; the editing events get the row and the entered values apart', async () => {
    const rows = kind(makeRows(3));
    const starts: { row: Row; values: Partial<Row> }[] = [];
    const preparing: { row: Row; values: Partial<Row> }[] = [];
    const setCellValue = vi.fn();
    const grid = await make(rows, {
      columns: [columns[0], { ...columns[1], setCellValue }, columns[2]],
      saveMode: 'batch',
      settings: { editable: true, confirmDelete: false, selection: 'multiple' },
      onEditingStart: (e) => starts.push({ row: e.row, values: e.values }),
      onEditorPreparing: (e) => preparing.push({ row: e.row, values: e.values }),
    });
    grid.cellValue(0, 'amount', 99);
    expect(grid.editCell(0, 'name')).toBe(true);
    expect(starts.at(-1)!.row).toBe(rows[0]);
    expect(starts.at(-1)!.values).toEqual({ amount: 99 });
    expect(preparing.at(-1)!.row).toBe(rows[0]);
    const input = grid.element.querySelector('.mx-data-grid__editor input') as HTMLInputElement;
    input.value = 'Typed';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    key(input, 'Enter');
    await settle();
    const [values, value, row, context] = setCellValue.mock.calls.at(-1)!;
    expect([values, value]).toEqual([{ name: 'Typed' }, 'Typed']);
    expect(row).toBe(rows[0]);
    expect(context.getValue('amount')).toBe(99);
    // The row keeps its own values until it is saved.
    expect(rows[0].name).toBe('Name 1');
    expect(grid.changes.updated[0].row).toBe(rows[0]);
    expect(grid.changes.updated[0].changed).toEqual({ amount: 99, name: 'Typed' });
    await grid.deleteRow(rows[2]);
    expect(grid.changes.removed[0]).toBe(rows[2]);
    await grid.saveChanges();
    await settle();
    expect(rows[0]).toMatchObject({ name: 'Typed', amount: 99 });
    expect(rows.map((r) => r.id)).toEqual([1, 2]);
    grid.selectedKeys = [1];
    expect(grid.selectedRows[0]).toBe(rows[0]);
    await grid.dispose();
  });

  it('keeps a class-instance row as it is in the editing events', async () => {
    class Item {
      constructor(
        public id: number,
        public name: string,
        public amount: number,
      ) {}
      get label() {
        return `#${this.id}`;
      }
    }
    const rows = kind([new Item(1, 'A', 1), new Item(2, 'B', 2)]) as unknown as Row[];
    let seen: unknown;
    const grid = await make(rows, { settings: { editable: true }, onEditingStart: (e) => (seen = e.row) });
    grid.editCell(1, 'name');
    expect(seen).toBe(rows[1]);
    expect(seen).toBeInstanceOf(Item);
    expect((seen as Item).label).toBe('#2');
    await grid.dispose();
  });

  it('keeps the options as given: the toolbar items, filter values, filter builder operations', async () => {
    const items = kind([{ name: 'hello', text: 'Hello' }] as { name: string; text: string }[]);
    const picked = kind([10, 20]);
    const customOperations = kind([{ name: 'big', caption: 'Big', calculateFilterExpression: () => null }]);
    const grid = await make(makeRows(3), {
      toolbar: { items },
      settings: { headerFilter: true },
      filters: { amount: { values: picked } },
      filterBuilder: { customOperations } as never,
    });
    expect(grid.toolbar.items).toBe(items);
    expect(grid.filters.amount.values).toEqual([10, 20]);
    expect((grid.filterBuilder as { customOperations: unknown }).customOperations).toBe(customOperations);
    const texts = () => [...grid.element.querySelectorAll('.mx-data-grid__toolbar button')].map((b) => b.textContent);
    expect(texts()).toEqual(['Hello']);
    items.push({ name: 'more', text: 'More' });
    await settle();
    expect(texts()).toEqual(['Hello']);
    grid.repaint();
    await settle();
    expect(texts()).toEqual(['Hello', 'More']);
    items[0].text = 'Hi';
    grid.repaint();
    await settle();
    expect(texts()).toEqual(['Hi', 'More']);
    await grid.dispose();
  });

  it('works the summaries out again on refreshSummary, after the rows changed in place', async () => {
    const rows = kind(makeRows(3));
    const totalItems = kind([{ column: 'amount', summaryType: 'sum' as const }]);
    const grid = await make(rows, { summary: { totalItems } });
    expect(grid.getTotalSummaryValue('amount')).toBe(60);
    rows[0].amount = 110;
    await settle();
    expect(grid.getTotalSummaryValue('amount')).toBe(60);
    grid.refreshSummary();
    await settle();
    expect(grid.getTotalSummaryValue('amount')).toBe(160);
    totalItems[0].summaryType = 'max' as never;
    grid.refreshSummary();
    await settle();
    expect(grid.getTotalSummaryValue('amount')).toBe(110);
    await grid.dispose();
  });

  it('gives the detail template the row itself; its getters read it again on repaint', async () => {
    const rows = kind(makeRows(2));
    const seen: Row[] = [];
    const grid = await make(rows, {
      masterDetail: {
        enabled: true,
        autoExpandAll: true,
        template: (ctx) => {
          seen.push(ctx.row);
          const part = new Component<HTMLSpanElement>('span');
          part.class.add('detail-text');
          effect(() => {
            const row = ctx.row;
            part.setText(untracked(() => row.name));
          });
          return part;
        },
      },
    });
    expect(seen).toContain(rows[0]);
    const text = () => grid.element.querySelector('.detail-text')!.textContent;
    expect(text()).toBe('Name 1');
    rows[0].name = 'Changed';
    grid.repaint();
    await settle();
    expect(text()).toBe('Changed');
    await grid.dispose();
  });
});
