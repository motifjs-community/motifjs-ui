import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
import { windowStack } from '../../core/window-stack';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridValidationRule } from './grid-validation-rule';

type Row = { id: number; name: string; amount: number | null };

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, amount: i * 10 }));

class TestRows extends data.ArrayAdapter<Row, number> {
  readonly calls: string[] = [];

  protected override updateRow(key: number, changes: Partial<Row>): Promise<Partial<Row>> {
    this.calls.push(`update ${key} ${JSON.stringify(changes)}`);
    return super.updateRow(key, changes);
  }

  protected override insertRow(values: Partial<Row>): Promise<Partial<Row>> {
    this.calls.push(`insert ${values.name}`);
    return super.insertRow({ ...values, id: 100 + this.calls.length });
  }
}

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

async function settle() {
  for (let i = 0; i < 8; i++) await new Promise((r) => setTimeout(r, 0));
}

function make(rules: GridValidationRule<Row>[], props: Partial<DataGridProps<Row>> = {}, saveMode: data.SaveMode = 'wait') {
  const columns: GridColumn<Row>[] = [
    { field: 'id', title: 'Id', type: 'number', editable: false },
    { field: 'name', title: 'Name', validationRules: rules },
    { field: 'amount', title: 'Amount', type: 'number' },
  ];
  const source = new data.DataSource<Row, number>({ adapter: new TestRows({ data: makeRows(5), key: 'id' }), loadMode: 'all' });
  const grid = mount(new DataGrid<Row>({ dataSource: source, columns, rowHeight: 36, locale: 'en-US', saveMode, settings: { editable: true, addRows: true }, ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  return { grid, adapter: source.adapter as TestRows };
}

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
const message = (grid: DataGrid<any>, i: number, field: string) => (grid as any).model.error((grid as any).model.rowIdAt(i), field) as string;

/** Types a value into a cell's editor and keeps it with Enter. */
function type(grid: DataGrid<any>, i: number, field: string, value: string) {
  const cell = cellOf(grid, i, field);
  cell.focus();
  key(cell, 'F2');
  const input = document.activeElement as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  key(input, 'Enter');
}

afterEach(() => {
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
});

describe('validation rules', () => {
  it('shows a rule message on the cell and keeps the row from being left or saved', async () => {
    const { grid, adapter } = make([{ type: 'stringLength', min: 3 }]);
    await settle();
    type(grid, 1, 'name', 'ab');
    await settle();
    expect(message(grid, 1, 'name')).toBe('Enter at least 3 characters.');
    expect(cellOf(grid, 1, 'name').getAttribute('aria-invalid')).toBe('true');
    key(cellOf(grid, 1, 'name'), 'ArrowDown');
    await settle();
    expect(grid.focusedRowIndex).toBe(1);
    expect(adapter.calls).toEqual([]);
    type(grid, 1, 'name', 'abc');
    key(cellOf(grid, 1, 'name'), 'ArrowDown');
    await settle();
    expect(adapter.calls).toEqual(['update 2 {"name":"abc"}']);
    await grid.dispose();
  });

  it('keeps working with required and validate on the same column', async () => {
    const columns: GridColumn<Row>[] = [
      { field: 'id', title: 'Id', editable: false },
      { field: 'name', title: 'Name', required: true, validate: (v) => (v === 'bad' ? 'Not that' : null), validationRules: [{ type: 'email' }] },
    ];
    const { grid } = make([], { columns });
    await settle();
    type(grid, 0, 'name', '');
    await settle();
    expect(message(grid, 0, 'name')).toBe('This field is required.');
    type(grid, 0, 'name', 'bad');
    await settle();
    expect(message(grid, 0, 'name')).toBe('Not that');
    type(grid, 0, 'name', 'a@b');
    await settle();
    expect(message(grid, 0, 'name')).toBe('Enter a valid email address.');
    await grid.dispose();
  });

  it('waits for an async rule before the row is sent; the cell shows it is busy', async () => {
    type Answer = boolean | { isValid: boolean; message?: string };
    let answer: (v: Answer) => void = () => {};
    const callback = vi.fn(() => new Promise<Answer>((resolve) => (answer = resolve)));
    const { grid, adapter } = make([{ type: 'async', validationCallback: callback }]);
    await settle();
    type(grid, 0, 'name', 'Taken');
    await settle();
    expect(cellOf(grid, 0, 'name').getAttribute('aria-busy')).toBe('true');
    key(cellOf(grid, 0, 'name'), 'ArrowDown');
    await settle();
    expect(adapter.calls).toEqual([]);
    expect(grid.saving).toBe(true);
    answer({ isValid: false, message: 'The name is taken' });
    await settle();
    expect(grid.saving).toBe(false);
    expect(message(grid, 0, 'name')).toBe('The name is taken');
    expect(grid.focusedRowIndex).toBe(0);
    expect(adapter.calls).toEqual([]);

    type(grid, 0, 'name', 'Free');
    await settle();
    answer(true);
    await settle();
    key(cellOf(grid, 0, 'name'), 'ArrowDown');
    await settle();
    // `reevaluate` (on for async rules): checked again before the row is sent.
    expect(callback).toHaveBeenCalledTimes(3);
    answer(true);
    await settle();
    expect(adapter.calls).toEqual(['update 1 {"name":"Free"}']);
    expect(grid.focusedRowIndex).toBe(1);
    await grid.dispose();
  });

  it('runs a rule without reevaluate once per value', async () => {
    const callback = vi.fn(() => true);
    const { grid } = make([{ type: 'custom', validationCallback: callback }], {}, 'batch');
    await settle();
    type(grid, 0, 'name', 'One');
    await settle();
    expect(callback).toHaveBeenCalledTimes(1);
    key(cellOf(grid, 0, 'name'), 'ArrowDown');
    await settle();
    await grid.saveChanges();
    expect(callback).toHaveBeenCalledTimes(1);
    const again = vi.fn(() => true);
    const { grid: other } = make([{ type: 'custom', validationCallback: again, reevaluate: true }], {}, 'batch');
    await settle();
    type(other, 0, 'name', 'One');
    await settle();
    key(cellOf(other, 0, 'name'), 'ArrowDown');
    await settle();
    await other.saveChanges();
    expect(again.mock.calls.length).toBeGreaterThanOrEqual(3);
    await grid.dispose();
    await other.dispose();
  });

  it('checks the rules of a new row before saveChanges sends it (batch)', async () => {
    const { grid, adapter } = make([{ type: 'required' }], {}, 'batch');
    await settle();
    await grid.addRow({ amount: 5 });
    await settle();
    key(document.activeElement as Element, 'Escape');
    await settle();
    await grid.addRow({ amount: 5 } as Partial<Row>);
    await settle();
    const result = await grid.saveChanges();
    expect(result.failed).toBe(1);
    expect(adapter.calls).toEqual([]);
    expect(message(grid, 5, 'name')).toBe('This field is required.');
    await grid.dispose();
  });

  it('asks onRowValidating once per check; it adds messages and can say no', async () => {
    const seen: any[] = [];
    let mode: 'field' | 'row' | 'ok' = 'field';
    const { grid, adapter } = make([], {
      onRowValidating: (e) => {
        seen.push({ key: e.key, changed: [...e.changed], isValid: e.isValid });
        if (mode === 'field') e.errors.amount = 'Too much for this name';
        if (mode === 'row') {
          e.isValid = false;
          e.errorText = 'Not today';
        }
      },
    });
    await settle();
    type(grid, 0, 'amount', '500');
    key(cellOf(grid, 0, 'amount'), 'ArrowDown');
    await settle();
    expect(seen).toEqual([{ key: 1, changed: ['amount'], isValid: true }]);
    expect(message(grid, 0, 'amount')).toBe('Too much for this name');
    expect(adapter.calls).toEqual([]);
    mode = 'row';
    key(cellOf(grid, 0, 'amount'), 'ArrowDown');
    await settle();
    expect(message(grid, 0, '')).toBe('Not today');
    mode = 'ok';
    key(cellOf(grid, 0, 'amount'), 'ArrowDown');
    await settle();
    expect(adapter.calls).toEqual(['update 1 {"amount":500}']);
    expect(seen.length).toBe(3);
    await grid.dispose();
  });

  it('shows rule messages on the fields of the edit form and in the window', async () => {
    const { grid, adapter } = make([{ type: 'async', validationCallback: ({ value }) => Promise.resolve(value !== 'Taken') , message: 'The name is taken' }], { settings: { editable: true, editMode: 'popup' } });
    await settle();
    grid.editRow(0);
    await settle();
    const win = document.querySelector('dialog.mx-data-grid__popup[open]')!;
    const input = win.querySelector('.mx-data-grid__form-field[data-field="name"] input') as HTMLInputElement;
    input.value = 'Taken';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    (win.querySelector('.mx-data-grid__form-buttons button') as HTMLButtonElement).click();
    await settle();
    expect(document.querySelector('dialog.mx-data-grid__popup[open]')).not.toBeNull();
    expect(win.querySelector('.mx-data-grid__form-field[data-field="name"]')!.textContent).toContain('The name is taken');
    expect(adapter.calls).toEqual([]);
    input.value = 'Fine';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    (win.querySelector('.mx-data-grid__form-buttons button') as HTMLButtonElement).click();
    await settle();
    expect(document.querySelector('dialog.mx-data-grid__popup[open]')).toBeNull();
    expect(adapter.calls).toEqual(['update 1 {"name":"Fine"}']);
    await grid.dispose();
  });
});
