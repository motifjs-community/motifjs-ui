import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mount, settled, tick } from '../../../tests/helpers';
import { windowStack } from '../../core/window-stack';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number | null; note?: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', width: 80, editable: false },
  { field: 'name', title: 'Name', flex: 1, required: true },
  { field: 'amount', title: 'Amount', type: 'number' },
];

const makeRows = (n: number, from = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}`, amount: i * 10 }));

/** Rows in an array, with the writes the test can watch. */
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

  protected override removeRow(key: number): Promise<void> {
    this.calls.push(`remove ${key}`);
    return super.removeRow(key);
  }
}

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.show = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

async function settle() {
  await settled(6);
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

function make(props: Partial<DataGridProps<Row>>, rows = makeRows(5)) {
  const source = new data.DataSource<Row, number>({ adapter: new TestRows({ data: rows, key: 'id' }), loadMode: 'all' });
  const grid = mount(new DataGrid<Row>({ dataSource: source, columns, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  layout(grid);
  return { grid, adapter: source.adapter as TestRows, source };
}

const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement | null;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i)!.querySelector(`[data-field="${field}"]`) as HTMLElement;
const formRow = (grid: DataGrid<any>) => grid.element.querySelector('.mx-data-grid__form-row:not([hidden])') as HTMLElement | null;
const field = (root: Element, name: string) => root.querySelector(`.mx-data-grid__form-field[data-field="${name}"]`) as HTMLElement;
const input = (root: Element, name: string) => field(root, name).querySelector('input') as HTMLInputElement;
const popup = () => document.querySelector('dialog.mx-data-grid__popup[open]') as HTMLDialogElement | null;
const button = (root: Element, text: string) => [...root.querySelectorAll('button')].find((b) => b.textContent?.trim() === text) as HTMLButtonElement;

/** Types a value into a form field and leaves it. */
function fill(root: Element, name: string, value: string) {
  const el = input(root, name);
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
}

afterEach(() => {
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
});

describe('form mode', () => {
  it('opens a form in place of the row, with a field per column, and focus in it', async () => {
    const started = vi.fn();
    const { grid } = make({ settings: { editable: true, editMode: 'form' }, onEditingStart: started });
    await settle();
    const cell = cellOf(grid, 1, 'name');
    cell.focus();
    key(cell, 'Enter');
    await settle();
    const form = formRow(grid)!;
    expect(form).not.toBeNull();
    expect(form.getAttribute('aria-rowindex')).toBe('3');
    expect(rowEl(grid, 1)).toBeNull();
    expect([...form.querySelectorAll('.mx-data-grid__form-field')].map((f) => (f as HTMLElement).dataset.field)).toEqual(['id', 'name', 'amount']);
    expect(input(form, 'name').value).toBe('Name 2');
    expect(document.activeElement).toBe(input(form, 'name'));
    expect(started).toHaveBeenCalledWith(expect.objectContaining({ field: '', rowIndex: 1, isNew: false }));
    // A column the user cannot edit is shown, read-only.
    expect(input(form, 'id').readOnly).toBe(true);
    await grid.dispose();
  });

  it('saves with Save, writes the row and gives focus back to it', async () => {
    const { grid, adapter, source } = make({ settings: { editable: true, editMode: 'form' } });
    await settle();
    expect(grid.editRow(0)).toBe(true);
    await settle();
    const form = formRow(grid)!;
    fill(form, 'name', 'Ada');
    button(form, 'Save').click();
    await settle();
    expect(formRow(grid)).toBeNull();
    expect(adapter.calls).toEqual(['update 1 {"name":"Ada"}']);
    expect(source.rows[0].name).toBe('Ada');
    expect(cellOf(grid, 0, 'name').textContent).toBe('Ada');
    expect((document.activeElement as HTMLElement).closest('.mx-data-grid__row')).toBe(rowEl(grid, 0));
    await grid.dispose();
  });

  it('Enter saves, Escape cancels and drops the edits', async () => {
    const { grid, adapter } = make({ settings: { editable: true, editMode: 'form' } });
    await settle();
    grid.editRow(2);
    await settle();
    let form = formRow(grid)!;
    fill(form, 'name', 'Changed');
    key(input(form, 'amount'), 'Escape');
    await settle();
    expect(formRow(grid)).toBeNull();
    expect(grid.hasChanges).toBe(false);
    expect(cellOf(grid, 2, 'name').textContent).toBe('Name 3');
    expect(adapter.calls).toEqual([]);
    grid.editRow(2);
    await settle();
    form = formRow(grid)!;
    const amount = input(form, 'amount');
    amount.focus();
    amount.value = '77';
    amount.dispatchEvent(new Event('input', { bubbles: true }));
    key(amount, 'Enter');
    await settle();
    expect(formRow(grid)).toBeNull();
    expect(adapter.calls).toEqual(['update 3 {"amount":77}']);
    await grid.dispose();
  });

  it('shows the messages on the fields and keeps the form open', async () => {
    const { grid, adapter } = make({ settings: { editable: true, editMode: 'form' } });
    await settle();
    grid.editRow(0);
    await settle();
    const form = formRow(grid)!;
    fill(form, 'name', '');
    button(form, 'Save').click();
    await settle();
    expect(formRow(grid)).not.toBeNull();
    expect(field(form, 'name').textContent).toContain('This field is required.');
    expect(input(form, 'name').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(input(form, 'name'));
    expect(adapter.calls).toEqual([]);
    // Fixed, it saves.
    fill(form, 'name', 'Fixed');
    button(form, 'Save').click();
    await settle();
    expect(formRow(grid)).toBeNull();
    expect(adapter.calls).toEqual(['update 1 {"name":"Fixed"}']);
    await grid.dispose();
  });

  it('opens a new row in the form; Cancel takes it away', async () => {
    const { grid, adapter } = make({ settings: { editable: true, addRows: true, editMode: 'form' } });
    await settle();
    await grid.addRow();
    await settle();
    const form = formRow(grid)!;
    expect(form.getAttribute('aria-rowindex')).toBe('7');
    expect(form.querySelector('form')!.getAttribute('aria-label')).toBe('New row');
    button(form, 'Cancel').click();
    await settle();
    expect(formRow(grid)).toBeNull();
    expect(grid.total).toBe(5);
    await grid.addRow();
    await settle();
    fill(formRow(grid)!, 'name', 'Grace');
    button(formRow(grid)!, 'Save').click();
    await settle();
    expect(adapter.calls).toEqual(['insert Grace']);
    await grid.dispose();
  });

  it('lays the form out from `form` and the columns\' `formItem`', async () => {
    const cols: GridColumn<Row>[] = [
      ...columns,
      { field: 'note', title: 'Note', hidden: true, formItem: { colSpan: 'all', label: 'Remarks', helpText: 'Anything else' } },
    ];
    const { grid } = make({ columns: cols, settings: { editable: true, editMode: 'form' }, form: { colCount: 3, items: [{ group: 'Order', columns: 2, items: [{ field: 'name' }, { field: 'amount' }] }, 'note'] } });
    await settle();
    grid.editRow(0);
    await settle();
    const form = formRow(grid)!;
    expect(form.querySelector('legend')!.textContent).toBe('Order');
    expect([...form.querySelectorAll('.mx-data-grid__form-field')].map((f) => (f as HTMLElement).dataset.field)).toEqual(['name', 'amount', 'note']);
    expect(field(form, 'note').textContent).toContain('Remarks');
    expect(field(form, 'note').textContent).toContain('Anything else');
    expect(field(form, 'note').closest('.mx-form-layout__item')!.getAttribute('data-span')).toBe('all');
    expect((form.querySelector('form') as HTMLElement).style.getPropertyValue('--_form-columns')).toBe('3');
    grid.form.colCount = 1;
    await tick();
    expect((form.querySelector('form') as HTMLElement).style.getPropertyValue('--_form-columns')).toBe('1');
    await grid.dispose();
  });

  it('moves the rows after the form down by its height in the virtual list', async () => {
    const { grid } = make({ settings: { editable: true, editMode: 'form' } }, makeRows(50));
    await settle();
    const before = rowEl(grid, 3)!.style.transform;
    expect(before).toBe('translateY(108px)');
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('mx-data-grid__form-row') ? 200 : 0;
    });
    grid.editRow(1);
    await settle();
    expect(formRow(grid)!.style.transform).toContain('36px)');
    expect(rowEl(grid, 3)!.style.transform).toBe(`translateY(${108 + 200 - 36}px)`);
    expect(grid.element.querySelector<HTMLElement>('.mx-data-grid__body')!.style.height).toBe(`${50 * 36 + 200 - 36}px`);
    vi.restoreAllMocks();
    await grid.dispose();
  });
  it('never sends the form element; Enter in its only field saves', async () => {
    const { grid, adapter } = make({ settings: { editable: true, editMode: 'form' }, form: { items: ['name'] } });
    await settle();
    grid.editRow(0);
    await settle();
    const form = formRow(grid)!;
    const submitted = vi.fn();
    form.querySelector('form')!.addEventListener('submit', submitted);
    form.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submitted).not.toHaveBeenCalled();
    const name = input(form, 'name');
    name.value = '';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    key(name, 'Enter');
    await settle();
    // The grid's message, once: the field does not check itself.
    expect(field(form, 'name').textContent!.match(/This field is required\./g)?.length).toBe(1);
    expect(adapter.calls).toEqual([]);
    await grid.dispose();
  });
});

describe('popup mode', () => {
  it('opens the form in a modal window and gives focus back when it closes', async () => {
    const { grid, adapter } = make({ settings: { editable: true, editMode: 'popup' }, popup: { title: 'Order', width: 480 } });
    await settle();
    const cell = cellOf(grid, 1, 'amount');
    cell.focus();
    key(cell, 'F2');
    await settle();
    const win = popup()!;
    expect(win).not.toBeNull();
    expect(win.textContent).toContain('Order');
    expect(document.activeElement).toBe(input(win, 'amount'));
    expect(formRow(grid)).toBeNull();
    fill(win, 'amount', '5');
    button(win, 'Save').click();
    await settle();
    expect(popup()).toBeNull();
    expect(adapter.calls).toEqual(['update 2 {"amount":5}']);
    expect(document.activeElement).toBe(cellOf(grid, 1, 'amount'));
    await grid.dispose();
  });

  it('opens a new row in the window; Escape cancels it', async () => {
    const init = vi.fn((e) => (e.data.amount = 9));
    const { grid } = make({ settings: { editable: true, addRows: true, editMode: 'popup' }, onInitNewRow: init });
    await settle();
    await grid.addRow();
    await settle();
    const win = popup()!;
    expect(win.textContent).toContain('New row');
    expect(input(win, 'amount').value).toBe('9');
    key(input(win, 'name'), 'Escape');
    await settle();
    expect(popup()).toBeNull();
    expect(grid.total).toBe(5);
    expect(grid.changes.added.length).toBe(0);
    await grid.dispose();
  });

  it('keeps the window open when onEditCanceling cancels', async () => {
    const { grid } = make({ settings: { editable: true, editMode: 'popup' }, onEditCanceling: (e) => (e.cancel = true) });
    await settle();
    grid.editRow(0);
    await settle();
    button(popup()!, 'Cancel').click();
    await settle();
    expect(popup()).not.toBeNull();
    await grid.dispose();
  });
});
