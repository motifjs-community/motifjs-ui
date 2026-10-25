import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, tick } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number | null; day: string | null; paid: boolean; city: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', width: 80, editable: false },
  { field: 'name', title: 'Name' },
  { field: 'amount', title: 'Amount', type: 'number' },
  { field: 'day', title: 'Day', type: 'date' },
  { field: 'paid', title: 'Paid', type: 'boolean' },
  { field: 'city', title: 'City', type: 'list', options: [{ value: 'ank', label: 'Ankara' }, { value: 'izm', label: 'İzmir' }] },
];

const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, amount: 1000 + i, day: `2026-01-0${(i % 9) + 1}`, paid: i % 2 === 0, city: i % 2 ? 'izm' : 'ank' }));

/** Rows in an array whose writes the test can watch. */
class TestRows extends data.ArrayAdapter<Row, number> {
  readonly updates: Partial<Row>[] = [];

  protected override updateRow(key: number, changes: Partial<Row>): Promise<Partial<Row>> {
    this.updates.push(changes);
    return super.updateRow(key, changes);
  }
}

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

function make(props: Partial<DataGridProps<Row>>) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  return grid;
}

const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
const text = (grid: DataGrid<any>, i: number, field: string) => cellOf(grid, i, field).firstChild?.textContent ?? '';

/** A clipboard event as jsdom lacks one: `clipboardData` holds what was set. */
function clipboardEvent(type: 'copy' | 'paste', given: Record<string, string> = {}) {
  const store = { ...given };
  const e = new Event(type, { bubbles: true, cancelable: true }) as Event & { clipboardData: unknown };
  e.clipboardData = { setData: (t: string, v: string) => (store[t] = v), getData: (t: string) => store[t] ?? '' };
  return { event: e as unknown as ClipboardEvent, store };
}

/** `document.execCommand('copy')` raises a copy event, as browsers do; returns what it held. */
function fakeCopyCommand() {
  const held: Record<string, string>[] = [];
  (document as any).execCommand = vi.fn((command: string) => {
    if (command !== 'copy') return false;
    const { event, store } = clipboardEvent('copy');
    document.body.dispatchEvent(event);
    held.push(store);
    return true;
  });
  return held;
}

afterEach(() => {
  document.body.innerHTML = '';
  delete (document as any).execCommand;
});

describe('copy', () => {
  it('copies the active cell as it shows, or its value', async () => {
    const grid = make({ rows: makeRows(5) });
    await settle();
    cellOf(grid, 1, 'amount').focus();
    expect(grid.copy()).toBe('1,001');
    grid.settings.copyValues = 'raw';
    expect(grid.copy()).toBe('1001');
    cellOf(grid, 1, 'day').focus();
    expect(grid.copy()).toBe('2026-01-02');
    grid.settings.copyValues = 'shown';
    expect(grid.copy()).toBe('1/2/26');
    cellOf(grid, 1, 'city').focus();
    expect(grid.copy()).toBe('İzmir');
  });

  it('copies the selected rows in the grid order, tab-separated and as a table, with the copyable columns', async () => {
    const grid = make({ rows: makeRows(6), settings: { selection: 'multiple' }, sort: [{ field: 'id', dir: 'desc' }] });
    await settle();
    grid.selectedKeys = [2, 5];
    grid.columnSettings('day').copyable = false;
    grid.columnSettings('paid').copyable = false;
    grid.columnSettings('city').copyable = false;
    expect(grid.copy()).toBe('5\tName 5\t1,004\r\n2\tName 2\t1,001');
    grid.settings.copyHeaders = true;
    const held = fakeCopyCommand();
    cellOf(grid, 0, 'name').focus();
    expect(key(cellOf(grid, 0, 'name'), 'c', { ctrlKey: true })).toBe(false);
    expect(held[0]['text/plain']).toBe('Id\tName\tAmount\r\n5\tName 5\t1,004\r\n2\tName 2\t1,001');
    expect(held[0]['text/html']).toBe('<table><thead><tr><th>Id</th><th>Name</th><th>Amount</th></tr></thead><tbody><tr><td>5</td><td>Name 5</td><td>1,004</td></tr><tr><td>2</td><td>Name 2</td><td>1,001</td></tr></tbody></table>');
    grid.settings.copyable = false;
    grid.columnSettings('day').copyable = true;
    expect(grid.copy()).toBe('Day\r\n1/5/26\r\n1/2/26');
    grid.columnSettings('day').copyable = false;
    expect(grid.copy()).toBe('');
  });

  it('quotes a cell with a tab, a line break or a quote', async () => {
    const rows = makeRows(2);
    rows[0].name = 'two\nlines';
    rows[1].name = 'a "quote"';
    const grid = make({ rows, settings: { selection: 'multiple' }, columns: [columns[1]] });
    await settle();
    grid.selectAll();
    expect(grid.copy()).toBe('"two\nlines"\r\n"a ""quote"""');
  });

  it('copies nothing of "all" over data that loads in parts, and says to export', async () => {
    const source = new data.DataSource<Row, number>({ adapter: new data.ArrayAdapter<Row, number>({ data: makeRows(300), key: 'id' }), loadMode: 'blocks', pageSize: 50 });
    const grid = make({ dataSource: source, settings: { selection: 'multiple' } });
    await settle();
    grid.selectAll();
    expect(grid.copy()).toBe('');
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__live')!.textContent).toMatch(/use Export/);
    grid.clearSelection();
    grid.selectedKeys = [3, 1];
    expect(grid.copy()).toBe('1\tName 1\t1,000\t1/1/26\tYes\tAnkara\r\n3\tName 3\t1,002\t1/3/26\tYes\tAnkara');
  });
});

describe('paste', () => {
  it('writes tab-separated text into the editable cells from the active one, reading each type', async () => {
    const rows = makeRows(4);
    const grid = make({ rows, settings: { editable: true } });
    await settle();
    cellOf(grid, 0, 'id').focus();
    const n = grid.paste('99\tAda\t1,234.5\t3/4/2026\tno\tİzmir\r\n98\tGrace\t7\t2026-05-06\tyes\tank\r\n');
    await tick();
    // The id column cannot be edited: its cells keep their values.
    expect(n).toBe(10);
    expect([text(grid, 0, 'id'), text(grid, 0, 'name'), text(grid, 0, 'amount'), text(grid, 0, 'day'), text(grid, 0, 'paid'), text(grid, 0, 'city')]).toEqual(['1', 'Ada', '1,234.5', '3/4/26', 'No', 'İzmir']);
    expect(rows[1]).toMatchObject({ name: 'Grace', amount: 7, day: '2026-05-06', paid: true, city: 'ank' });
    // The active row is the row being edited: written when it is left.
    expect(rows[0].name).toBe('Name 1');
    expect(grid.hasChanges).toBe(true);
    key(cellOf(grid, 0, 'id'), 'ArrowDown');
    await settle();
    expect(rows[0]).toMatchObject({ name: 'Ada', amount: 1234.5, day: '2026-03-04', paid: false, city: 'izm' });
  });

  it('leaves a message on text it cannot read, and checks the rows', async () => {
    const adapter = new TestRows({ data: makeRows(4), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'all' });
    const grid = make({ dataSource: source, settings: { editable: true }, columns: columns.map((c) => (c.field === 'name' ? { ...c, required: true } : c)) });
    await settle();
    cellOf(grid, 1, 'name').focus();
    grid.paste('Ok\tlots\nBob\t5\n\t6');
    await settle();
    expect(cellOf(grid, 1, 'amount').getAttribute('aria-invalid')).toBe('true');
    // The rows below the active one are saved as the mode says: one passed, one has a message.
    expect(adapter.updates).toEqual([{ name: 'Bob', amount: 5 }]);
    expect(cellOf(grid, 3, 'name').getAttribute('aria-invalid')).toBe('true');
    expect(grid.errorCount).toBeGreaterThan(0);
  });

  it('pastes on Ctrl+V through the paste event, in a new row only when allowed, and not when turned off', async () => {
    const rows = makeRows(2);
    const grid = make({ rows, settings: { editable: true, addRows: true }, saveMode: 'batch' });
    await settle();
    const cell = cellOf(grid, 1, 'name');
    cell.focus();
    key(cell, 'v', { ctrlKey: true });
    const first = clipboardEvent('paste', { 'text/plain': 'B1\nB2\nB3' });
    document.body.dispatchEvent(first.event);
    await tick();
    expect(first.event.defaultPrevented).toBe(true);
    expect(text(grid, 1, 'name')).toBe('B1');
    expect(grid.total).toBe(2);
    expect(grid.changes.updated.length).toBe(1);

    grid.settings.pasteNewRows = true;
    const second = clipboardEvent('paste', { 'text/plain': 'C1\nC2\nC3' });
    cell.dispatchEvent(second.event);
    await tick();
    expect(grid.changes.added.map((r) => r.name)).toEqual(['C2', 'C3']);

    grid.settings.paste = false;
    cellOf(grid, 0, 'name').focus();
    const third = clipboardEvent('paste', { 'text/plain': 'D1' });
    cellOf(grid, 0, 'name').dispatchEvent(third.event);
    expect(third.event.defaultPrevented).toBe(false);
    expect(grid.paste('D1')).toBe(0);
    expect(text(grid, 0, 'name')).toBe('Name 1');
  });
});
