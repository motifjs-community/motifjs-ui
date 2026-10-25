import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { TextBox } from '../textbox/TextBox';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number | null };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', width: 80, editable: false },
  { field: 'name', title: 'Name', flex: 1 },
  { field: 'amount', title: 'Amount', type: 'number' },
];

const makeRows = (n: number, from = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}`, amount: i * 10 }));

/** A pretend server: rows made when asked for; writes go to the handlers the test gives. */
class ServerAdapter extends data.DataAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  onUpdate: (key: number, changes: Partial<Row>, original: Row | undefined) => Promise<Partial<Row> | void> = async () => {};

  constructor(private readonly size: number) {
    super({ key: 'id' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: false, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: true, update: true, remove: true };
  }

  protected async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    const skip = options.skip ?? 0;
    const n = Math.max(0, Math.min(options.take ?? this.size, this.size - skip));
    return { rows: makeRows(n, skip + 1), total: options.count ? this.size : undefined };
  }

  protected override updateRow(key: number, changes: Partial<Row>, options: data.WriteOptions<Row>): Promise<Partial<Row> | void> {
    return this.onUpdate(key, changes, options.original);
  }

  protected override insertRow(values: Partial<Row>): Promise<Partial<Row>> {
    return Promise.resolve({ ...values, id: this.size + 1 });
  }
}

/** Rows in an array, with writes the test can watch and make fail. */
class TestRows extends data.ArrayAdapter<Row, number> {
  readonly calls: string[] = [];
  failUpdate: (changes: Partial<Row>) => string | null = () => null;
  failRemove: (key: number) => string | null = () => null;

  protected override updateRow(key: number, changes: Partial<Row>): Promise<Partial<Row>> {
    this.calls.push('update');
    const message = this.failUpdate(changes);
    return message ? Promise.reject(data.DataError.create('MJD202', { operation: 'update' }, message)) : super.updateRow(key, changes);
  }

  protected override insertRow(values: Partial<Row>): Promise<Partial<Row>> {
    this.calls.push('insert');
    return super.insertRow(values);
  }

  protected override removeRow(key: number): Promise<void> {
    this.calls.push('remove');
    const message = this.failRemove(key);
    return message ? Promise.reject(data.DataError.create('MJD202', { operation: 'remove' }, message)) : super.removeRow(key);
  }
}

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

/** jsdom has no layout: give the viewport a height (the grid measures it minus the header). */
function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

function make(props: Partial<DataGridProps<Row>>) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  layout(grid);
  return grid;
}

const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

/** Row element of grid row `i`. */
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
const text = (grid: DataGrid<any>, i: number, field: string) => cellOf(grid, i, field).firstChild?.textContent ?? '';

/** Where focus is: grid row, field and whether an editor has it. */
function where() {
  const el = document.activeElement as HTMLElement;
  const cell = el.closest('.mx-data-grid__cell') as HTMLElement | null;
  return {
    row: cell ? Number(cell.closest('[role="row"]')!.getAttribute('aria-rowindex')) - 2 : -1,
    field: cell?.dataset.field ?? '',
    editing: !!el.closest('.mx-data-grid__editor'),
  };
}

/** Types into the focused editor (replacing its text) and presses a key there. */
function enter(value: string, then?: string, init: KeyboardEventInit = {}) {
  const input = document.activeElement as HTMLInputElement;
  expect(input.closest('.mx-data-grid__editor')).not.toBeNull();
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  if (then) key(input, then, init);
}

/** Starts editing a cell by typing its first character. */
function typeInto(grid: DataGrid<any>, i: number, field: string, value: string, then?: string, init?: KeyboardEventInit) {
  const cell = cellOf(grid, i, field);
  cell.focus();
  key(cell, value[0]);
  enter(value, then, init);
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('editing', () => {
  it('types into a cell, keeps the edit in a draft and writes it into the row on leaving it', async () => {
    const rows = makeRows(5);
    const grid = make({ rows, settings: { editable: true } });
    await settle();
    typeInto(grid, 0, 'name', 'Xavier', 'Enter');
    await tick();
    expect(where()).toEqual({ row: 0, field: 'name', editing: false });
    expect(text(grid, 0, 'name')).toBe('Xavier');
    expect(cellOf(grid, 0, 'name').hasAttribute('data-changed')).toBe(true);
    expect(rows[0].name).toBe('Name 1');
    expect(grid.hasChanges).toBe(true);
    key(document.activeElement!, 'ArrowDown');
    await settle();
    expect(where().row).toBe(1);
    expect(rows[0].name).toBe('Xavier');
    expect(grid.hasChanges).toBe(false);
    await grid.dispose();
  });

  it('edits with the kit editors, drawn inside the cell', async () => {
    const grid = make({ rows: makeRows(2), settings: { editable: true } });
    await settle();
    typeInto(grid, 0, 'name', 'Ada');
    const field = document.activeElement!.closest('.mx-field') as HTMLElement;
    expect(field.classList.contains('mx-text-box')).toBe(true);
    expect(field.hasAttribute('data-in-cell')).toBe(true);
    expect(field.closest('.mx-data-grid__cell')).toBe(cellOf(grid, 0, 'name'));
    key(document.activeElement!, 'Tab');
    expect(document.activeElement!.closest('.mx-field')!.classList.contains('mx-number-box')).toBe(true);
    await grid.dispose();
  });

  it('Escape closes the editor without the value, then takes the row back', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    typeInto(grid, 0, 'name', 'First', 'Enter');
    typeInto(grid, 0, 'amount', '77', 'Escape');
    await tick();
    expect(where()).toEqual({ row: 0, field: 'amount', editing: false });
    expect(text(grid, 0, 'amount')).toBe('0');
    expect(text(grid, 0, 'name')).toBe('First');
    key(document.activeElement!, 'Escape');
    await tick();
    expect(text(grid, 0, 'name')).toBe('Name 1');
    expect(grid.hasChanges).toBe(false);
    await grid.dispose();
  });

  it('Tab goes through the editable cells with their editors and on to the next row', async () => {
    const rows = makeRows(3);
    const grid = make({ rows, settings: { editable: true } });
    await settle();
    typeInto(grid, 0, 'name', 'A', 'Tab');
    expect(where()).toEqual({ row: 0, field: 'amount', editing: true });
    enter('12.5', 'Tab');
    await settle();
    // `id` is not editable: the next row starts at `name`.
    expect(where()).toEqual({ row: 1, field: 'name', editing: true });
    expect(rows[0]).toEqual({ id: 1, name: 'A', amount: 12.5 });
    key(document.activeElement!, 'Tab', { shiftKey: true });
    expect(where()).toEqual({ row: 0, field: 'amount', editing: true });
    await grid.dispose();
  });

  it('Up and Down in a number editor keep the value and change the row', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true } });
    await settle();
    typeInto(grid, 1, 'amount', '42', 'ArrowDown');
    await settle();
    expect(where()).toEqual({ row: 2, field: 'amount', editing: false });
    expect(text(grid, 1, 'amount')).toBe('42');
    await grid.dispose();
  });

  it('reports a number it cannot read and keeps the editor open', async () => {
    const grid = make({ rows: makeRows(2), settings: { editable: true } });
    await settle();
    const cell = cellOf(grid, 0, 'amount');
    cell.focus();
    key(cell, 'Enter');
    enter('abc', 'Tab');
    await tick();
    expect(where()).toEqual({ row: 0, field: 'amount', editing: true });
    expect(cellOf(grid, 0, 'amount').getAttribute('data-error')).toBe(uiLocale.strings.gridInvalidNumber);
    await grid.dispose();
  });

  it('uses a custom editor and its value', async () => {
    const grid = make({
      rows: makeRows(2),
      settings: { editable: true },
      columns: [
        columns[0],
        {
          field: 'name',
          title: 'Name',
          editor: (ctx) => <input class="custom" value={String(ctx.value ?? '')} oninput={(e: Event) => ctx.setValue((e.target as HTMLInputElement).value.toUpperCase())} />,
        },
      ],
    });
    await settle();
    const cell = cellOf(grid, 0, 'name');
    cell.focus();
    key(cell, 'Enter');
    const input = document.activeElement as HTMLInputElement;
    expect(input.classList.contains('custom')).toBe(true);
    expect(input.value).toBe('Name 1');
    input.value = 'big';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    key(input, 'Enter');
    await tick();
    expect(text(grid, 0, 'name')).toBe('BIG');
    await grid.dispose();
  });

  it('takes any Field as a custom editor and reads its value', async () => {
    const grid = make({
      rows: makeRows(2),
      settings: { editable: true },
      columns: [columns[0], { field: 'name', title: 'Name', editor: () => new TextBox({ maxLength: 3 }) }],
    });
    await settle();
    const cell = cellOf(grid, 0, 'name');
    cell.focus();
    key(cell, 'Enter');
    expect((document.activeElement as HTMLInputElement).value).toBe('Name 1');
    enter('Zed', 'Enter');
    await tick();
    expect(text(grid, 0, 'name')).toBe('Zed');
    await grid.dispose();
  });

  it('Space toggles a check box column and Delete clears a cell', async () => {
    type B = { id: number; done: boolean; note: string };
    const rows: B[] = [{ id: 1, done: false, note: 'x' }];
    const grid = mount(
      new DataGrid<B>({
        rowKey: 'id',
        rowHeight: 36,
        rows,
        settings: { editable: true },
        columns: [
          { field: 'done', title: 'Done', type: 'boolean' },
          { field: 'note', title: 'Note' },
        ],
      }),
    );
    layout(grid);
    await settle();
    const done = cellOf(grid, 0, 'done');
    done.focus();
    key(done, ' ');
    await tick();
    expect(done.firstChild?.textContent).toBe('Yes');
    key(done, 'ArrowRight');
    key(document.activeElement!, 'Delete');
    await tick();
    expect(cellOf(grid, 0, 'note').firstChild?.textContent ?? '').toBe('');
    expect(grid.changes.updated[0].changed).toEqual({ done: true, note: null });
    await grid.dispose();
  });

  it('edits a list column with a drop-down of its options', async () => {
    type C = { id: number; city: string | null };
    const rows: C[] = [{ id: 1, city: 'Ankara' }];
    const grid = mount(
      new DataGrid<C>({
        rowKey: 'id',
        rowHeight: 36,
        rows,
        settings: { editable: true },
        columns: [{ field: 'city', title: 'City', type: 'list', options: ['Ankara', 'İstanbul', 'İzmir'] }],
      }),
    );
    layout(grid);
    await settle();
    const cell = cellOf(grid, 0, 'city');
    cell.focus();
    key(cell, 'İ');
    expect(document.activeElement!.closest('.mx-drop-down')).not.toBeNull();
    key(document.activeElement!, 'Tab');
    await settle();
    expect(rows[0].city).toBe('İstanbul');
    await grid.dispose();
  });
});

describe('new rows', () => {
  it('chains new rows with Tab, drops an untouched one, removes one with Escape', async () => {
    const rows = makeRows(3);
    let next = 100;
    const grid = make({ rows, settings: { editable: true, addRows: true }, newRow: { create: () => ({ id: next++ }) } });
    await settle();
    expect(await grid.addRow()).toBe(true);
    expect(where()).toEqual({ row: 3, field: 'name', editing: true });
    expect(rowEl(grid, 3).dataset.status).toBe('new');
    enter('N1', 'Tab');
    enter('5', 'Tab');
    await settle();
    // The first new row is saved (into the array) and the chain opened the next one below it.
    expect(where()).toEqual({ row: 4, field: 'name', editing: true });
    expect(rows).toHaveLength(4);
    expect(rows[3]).toMatchObject({ id: 100, name: 'N1', amount: 5 });
    expect(text(grid, 3, 'name')).toBe('N1');
    // Escape drops the new row; focus goes to the row above.
    key(document.activeElement!, 'Escape');
    await tick();
    expect(where()).toEqual({ row: 3, field: 'name', editing: false });
    expect(rowEl(grid, 4)).toBeNull();
    // A new row left untouched goes away by itself.
    await grid.addRow();
    expect(where().row).toBe(4);
    key(document.activeElement!, 'ArrowUp');
    await settle();
    expect(where().row).toBe(3);
    expect(rowEl(grid, 4)).toBeNull();
    expect(grid.total).toBe(4);
    await grid.dispose();
  });

  it('focuses the first column a new row can fill; that column stays closed in saved rows', async () => {
    type C = { id: number; code: string; name: string };
    const rows: C[] = [{ id: 1, code: 'A1', name: 'one' }];
    let next = 10;
    const grid = mount(
      new DataGrid<C>({
        rowKey: 'id',
        rowHeight: 36,
        rows,
        settings: { editable: true, addRows: true },
        newRow: { create: () => ({ id: next++ }) },
        columns: [
          { field: 'id', title: 'Id', editable: false },
          { field: 'code', title: 'Code', editable: false, creatable: true },
          { field: 'name', title: 'Name' },
        ],
      }),
    );
    layout(grid);
    await settle();
    await grid.addRow();
    expect(where()).toEqual({ row: 1, field: 'code', editing: true });
    enter('B2', 'Tab');
    expect(where()).toEqual({ row: 1, field: 'name', editing: true });
    enter('two', 'Escape');
    // Back on an existing row, `code` cannot be edited.
    const code = cellOf(grid, 0, 'code');
    code.focus();
    key(code, 'Enter');
    expect(where()).toEqual({ row: 0, field: 'code', editing: false });
    await grid.dispose();
  });

  it('Tab on the last cell of a real data row does not open a new row', async () => {
    const grid = make({ rows: makeRows(2), settings: { editable: true, addRows: true } });
    await settle();
    typeInto(grid, 1, 'amount', '9', 'Tab');
    await settle();
    expect(grid.element.querySelectorAll('.mx-data-grid__row[data-status="new"]')).toHaveLength(0);
    expect(where().row).toBe(-1);
    await grid.dispose();
  });

  it('a required field stops the row from being left', async () => {
    const grid = make({ rows: makeRows(2), columns: [columns[0], { ...columns[1], required: true }, columns[2]], settings: { editable: true, addRows: true } });
    await settle();
    await grid.addRow();
    key(document.activeElement!, 'Tab');
    enter('5', 'Tab');
    await tick();
    const required = uiLocale.strings.required;
    expect(where()).toEqual({ row: 2, field: 'name', editing: false });
    expect(cellOf(grid, 2, 'name').getAttribute('aria-invalid')).toBe('true');
    expect(cellOf(grid, 2, 'name').getAttribute('data-error')).toBe(required);
    const described = document.getElementById(cellOf(grid, 2, 'name').getAttribute('aria-describedby')!);
    expect(described?.textContent).toBe(required);
    expect(rowEl(grid, 3)).toBeNull();
    await grid.dispose();
  });

  it('a required column the row cannot fill gives no error (new row: creatable, saved row: editable)', async () => {
    type C = { id: number | null; code: string; name: string };
    const rows: C[] = [{ id: 1, code: '', name: 'one' }];
    const grid = mount(
      new DataGrid<C>({
        rowKey: 'id',
        rowHeight: 36,
        rows,
        settings: { editable: true, addRows: true },
        saveMode: 'wait',
        columns: [
          // The key is given when the row is saved: required, but nobody fills it.
          { field: 'id', title: 'Id', required: true, editable: false },
          // Entered only when the row is created; the saved row above has it empty.
          { field: 'code', title: 'Code', required: true, editable: false, creatable: true },
          { field: 'name', title: 'Name', required: true },
        ],
      }),
    );
    layout(grid);
    await settle();
    const updated = vi.fn();
    const inserted = vi.fn();
    grid.dataSource.adapter.onUpdated(updated);
    grid.dataSource.adapter.onInserted(inserted);
    // Saved row: only `name` is editable, so the empty `code` does not stop it.
    const name = cellOf(grid, 0, 'name');
    name.focus();
    key(name, 'x');
    enter('changed', 'Enter');
    expect(await grid.saveChanges()).toEqual({ saved: 1, failed: 0 });
    expect(updated).toHaveBeenCalledTimes(1);
    // New row: `id` is not creatable, so it is not asked for; `code` is.
    await grid.addRow();
    expect(where().field).toBe('code');
    enter('', 'Tab');
    enter('two', 'Tab');
    await tick();
    expect(where()).toEqual({ row: 1, field: 'code', editing: false });
    expect(cellOf(grid, 1, 'code').getAttribute('data-error')).toBe(uiLocale.strings.required);
    expect(cellOf(grid, 1, 'id').hasAttribute('data-error')).toBe(false);
    key(cellOf(grid, 1, 'code'), 'c');
    enter('C2', 'Tab');
    enter('two', 'Enter');
    expect(await grid.saveChanges()).toEqual({ saved: 1, failed: 0 });
    expect(inserted).toHaveBeenCalledTimes(1);
    // The grid gives a new row of number keys the next number.
    expect(rows[1]).toMatchObject({ id: 2, code: 'C2', name: 'two' });
    await grid.dispose();
  });

  it('opens at the top above the data; the chain continues below the finished row', async () => {
    const grid = make({ rows: makeRows(3), settings: { editable: true, addRows: true }, newRow: { position: 'top', create: () => ({ id: 50 }) } });
    await settle();
    await grid.addRow();
    expect(where()).toEqual({ row: 0, field: 'name', editing: true });
    expect(text(grid, 1, 'name')).toBe('Name 1');
    enter('T1', 'Tab');
    enter('1', 'Tab');
    await settle();
    expect(where()).toEqual({ row: 1, field: 'name', editing: true });
    expect(text(grid, 0, 'name')).toBe('T1');
    expect(text(grid, 2, 'name')).toBe('Name 1');
    await grid.dispose();
  });

  it('at the bottom of a million server rows asks only for the last block', async () => {
    const adapter = new ServerAdapter(1_000_000);
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 100 });
    const grid = make({ dataSource: source, settings: { editable: true, addRows: true } });
    await vi.waitFor(() => expect(grid.total).toBe(1_000_000));
    await settle();
    adapter.requests.length = 0;
    await grid.addRow();
    await vi.waitFor(() => expect(text(grid, 999_999, 'name')).toBe('Name 1000000'));
    expect(adapter.requests.map((r) => r.skip)).toEqual([999_900]);
    expect(where()).toEqual({ row: 1_000_000, field: 'name', editing: true });
    await grid.dispose();
    source.dispose();
  });

  it('in paged mode goes to the last page', async () => {
    const grid = make({ rows: makeRows(5), mode: 'paged', pageSize: 2, settings: { editable: true, addRows: true } });
    await settle();
    await grid.addRow();
    await tick();
    expect(grid.page).toBe(2);
    expect(where()).toEqual({ row: 5, field: 'name', editing: true });
    expect(text(grid, 4, 'name')).toBe('Name 5');
    await grid.dispose();
  });
});

describe('save modes', () => {
  it('wait: the move waits for the answer; a failed row keeps focus with its message', async () => {
    const adapter = new ServerAdapter(50);
    let answer!: (error?: unknown) => void;
    const update = vi.fn((_key: number, _changes: Partial<Row>, _original: Row | undefined) => new Promise<void>((done, fail) => (answer = (e) => (e ? fail(e) : done()))));
    adapter.onUpdate = update;
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 100 });
    const grid = make({ dataSource: source, settings: { editable: true }, saveMode: 'wait' });
    await vi.waitFor(() => expect(grid.total).toBe(50));
    await settle();
    typeInto(grid, 0, 'name', 'Taken', 'ArrowDown');
    await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    const [sentKey, changed, original] = update.mock.calls[0];
    expect(sentKey).toBe(1);
    expect(changed).toEqual({ name: 'Taken' });
    expect(original).toMatchObject({ id: 1, name: 'Name 1' });
    await tick();
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-busy')).toBe('true');
    expect(rowEl(grid, 0).dataset.status).toBe('saving');
    expect(where().row).toBe(0);
    answer(data.DataError.create('MJD202', { operation: 'update', fields: { name: 'Already used' } }, 'Already used'));
    await vi.waitFor(() => expect(cellOf(grid, 0, 'name').getAttribute('data-error')).toBe('Already used'));
    expect(where()).toEqual({ row: 0, field: 'name', editing: false });
    // Fixed: the next try goes through and the move happens.
    adapter.onUpdate = () => Promise.resolve();
    typeInto(grid, 0, 'name', 'Free', 'ArrowDown');
    await vi.waitFor(() => expect(where().row).toBe(1));
    expect(text(grid, 0, 'name')).toBe('Free');
    expect(grid.hasChanges).toBe(false);
    await grid.dispose();
    source.dispose();
  });

  it('background: moves on at once; failed rows are counted and found again', async () => {
    const adapter = new TestRows({ data: makeRows(10), key: 'id' });
    adapter.failUpdate = (changes) => (changes.name === 'bad' ? 'Rejected' : null);
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'all' });
    const grid = make({ dataSource: source, settings: { editable: true }, saveMode: 'background' });
    await settle();
    typeInto(grid, 0, 'name', 'good', 'ArrowDown');
    expect(where().row).toBe(1);
    typeInto(grid, 1, 'name', 'bad', 'ArrowDown');
    expect(where().row).toBe(2);
    await vi.waitFor(() => expect(grid.errorCount).toBe(1));
    expect(adapter.calls).toEqual(['update', 'update']);
    expect(rowEl(grid, 1).dataset.status).toBe('failed');
    expect(grid.element.querySelector('.mx-data-grid__errors')!.textContent).toContain('1 rows with errors');
    expect(grid.goToNextError()).toBe(true);
    expect(where().row).toBe(1);
    await grid.dispose();
    source.dispose();
  });

  it('batch: saveChanges sends deletions, updates and new rows, in that order, and keeps what failed', async () => {
    const rows = makeRows(4);
    const adapter = new TestRows({ data: rows, key: 'id', createKey: () => 100 });
    adapter.failRemove = (k) => (k === 4 ? 'Locked' : null);
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'all' });
    const grid = make({ dataSource: source, settings: { editable: true, addRows: true }, saveMode: 'batch' });
    await settle();
    typeInto(grid, 0, 'name', 'U1', 'ArrowDown');
    typeInto(grid, 1, 'amount', '5', 'ArrowDown');
    await grid.deleteRow(rows[3]);
    await grid.addRow();
    enter('Fresh', 'Enter');
    await tick();
    expect(rowEl(grid, 3).dataset.status).toBe('removed');
    expect(grid.changes.count).toBe(4);
    const save = grid.element.querySelector<HTMLButtonElement>('.mx-data-grid__toolbar .mx-data-grid__save')!;
    expect(save.disabled || save.getAttribute('aria-disabled') === 'true').toBe(false);
    expect(adapter.calls).toEqual([]);

    const result = await grid.saveChanges();
    expect(adapter.calls).toEqual(['remove', 'update', 'update', 'insert']);
    expect(result).toEqual({ saved: 3, failed: 1 });
    expect(rows[0].name).toBe('U1');
    expect(rows.find((r) => r.name === 'Fresh')?.id).toBe(100);
    await tick();
    expect(grid.errorCount).toBe(1);
    expect(rowEl(grid, 3).dataset.status).toBe('failed');
    grid.discardChanges();
    await tick();
    expect(rowEl(grid, 3).hasAttribute('data-status')).toBe(false);
    expect(grid.hasChanges).toBe(false);
    expect(save.disabled || save.getAttribute('aria-disabled') === 'true').toBe(true);
    await grid.dispose();
    source.dispose();
  });

  it('deletes a row of the rows in memory at once', async () => {
    const rows = makeRows(3);
    const grid = make({ rows, settings: { editable: true, confirmDelete: false } });
    await settle();
    expect(await grid.deleteRow(rows[1])).toBe(true);
    await settle();
    expect(rows.map((r) => r.id)).toEqual([1, 3]);
    expect(grid.total).toBe(2);
    await grid.dispose();
  });
});
