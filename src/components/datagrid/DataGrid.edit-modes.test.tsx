import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mount } from '../../../tests/helpers';
import { windowStack } from '../../core/window-stack';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number | null };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', editable: false },
  { field: 'name', title: 'Name' },
  { field: 'amount', title: 'Amount', type: 'number' },
];

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, amount: i * 10 }));

class TestRows extends data.ArrayAdapter<Row, number> {
  readonly calls: string[] = [];

  protected override updateRow(key: number, changes: Partial<Row>): Promise<Partial<Row>> {
    this.calls.push(`update ${key} ${JSON.stringify(changes)}`);
    return super.updateRow(key, changes);
  }

  protected override removeRow(key: number): Promise<void> {
    this.calls.push(`remove ${key}`);
    return super.removeRow(key);
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

function make(props: Partial<DataGridProps<Row>>, saveMode: data.SaveMode = 'wait') {
  const source = new data.DataSource<Row, number>({ adapter: new TestRows({ data: makeRows(5), key: 'id' }), loadMode: 'all' });
  const grid = mount(new DataGrid<Row>({ dataSource: source, columns, rowHeight: 36, locale: 'en-US', saveMode, ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  return { grid, adapter: source.adapter as TestRows, source };
}

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
const dialog = () => document.querySelector('dialog[open]') as HTMLDialogElement | null;
const button = (root: Element, text: string) => [...root.querySelectorAll('button')].find((b) => b.textContent?.trim() === text) as HTMLButtonElement;

/** Opens a cell's editor with F2 and types a value. */
function type(grid: DataGrid<any>, i: number, field: string, value: string) {
  const cell = cellOf(grid, i, field);
  cell.focus();
  key(cell, 'F2');
  const input = document.activeElement as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

afterEach(() => {
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
});

describe('edit modes', () => {
  it("'row' (default) saves on leaving the row; 'cell' saves each cell as it is left", async () => {
    const row = make({ settings: { editable: true } });
    await settle();
    expect(row.grid.settings.editMode).toBe('row');
    key(type(row.grid, 0, 'name', 'A'), 'Tab');
    await settle();
    key(document.activeElement!, 'Escape');
    expect(row.adapter.calls).toEqual([]);
    await row.grid.dispose();

    const { grid, adapter } = make({ settings: { editable: true, editMode: 'cell' } });
    await settle();
    key(type(grid, 0, 'name', 'A'), 'Tab');
    await settle();
    expect(adapter.calls).toEqual(['update 1 {"name":"A"}']);
    // Tab went on, into the next cell's editor.
    expect((document.activeElement as HTMLElement).closest('.mx-data-grid__cell')?.getAttribute('data-field')).toBe('amount');
    const amount = document.activeElement as HTMLInputElement;
    amount.value = '5';
    amount.dispatchEvent(new Event('input', { bubbles: true }));
    key(amount, 'Enter');
    await settle();
    expect(adapter.calls).toEqual(['update 1 {"name":"A"}', 'update 1 {"amount":5}']);
    await grid.dispose();
  });

  it("'batch' is saveMode 'batch'; changing the edit mode to or from it starts the data again", async () => {
    const { grid, adapter } = make({ settings: { editable: true, editMode: 'batch' } });
    await settle();
    expect(grid.changeTracker.saveMode).toBe('batch');
    key(type(grid, 0, 'name', 'A'), 'Enter');
    key(cellOf(grid, 0, 'name'), 'ArrowDown');
    await settle();
    expect(adapter.calls).toEqual([]);
    expect(grid.hasChanges).toBe(true);
    expect(await grid.saveEditData()).toBe(true);
    expect(adapter.calls).toEqual(['update 1 {"name":"A"}']);
    grid.settings.editMode = 'row';
    await settle();
    expect(grid.changeTracker.saveMode).toBe('wait');
    grid.settings.editMode = 'form';
    await settle();
    expect(grid.changeTracker.saveMode).toBe('wait');
    await grid.dispose();
  });

  it('asks before deleting (confirmDelete), not in batch mode', async () => {
    const { grid, adapter } = make({ settings: { editable: true }, actions: ['remove'] });
    await settle();
    const first = grid.deleteRow(grid.dataSource.rows[0]);
    await settle();
    const box = dialog()!;
    expect(box.textContent).toContain('Are you sure you want to delete this record?');
    button(box, 'No').click();
    expect(await first).toBe(false);
    expect(adapter.calls).toEqual([]);
    const second = grid.deleteRow(grid.dataSource.rows[0]);
    await settle();
    button(dialog()!, 'Yes').click();
    expect(await second).toBe(true);
    expect(adapter.calls).toEqual(['remove 1']);
    grid.settings.confirmDelete = false;
    await grid.deleteRow(grid.dataSource.rows[0]);
    expect(dialog()).toBeNull();
    expect(adapter.calls).toEqual(['remove 1', 'remove 2']);
    await grid.dispose();

    const batch = make({ settings: { editable: true } }, 'batch');
    await settle();
    expect(await batch.grid.deleteRow(batch.grid.dataSource.rows[0])).toBe(true);
    expect(dialog()).toBeNull();
    await batch.grid.dispose();
  });

  it('asks once for the rows the ready remove runs on', async () => {
    const { grid, adapter } = make({ settings: { selection: 'multiple', actionsLocation: 'toolbar' }, actions: ['remove'] });
    await settle();
    grid.selectedKeys = [2, 3];
    await settle();
    const ran = grid.runAction('remove');
    await settle();
    expect(dialog()!.textContent).toContain('Are you sure you want to delete these 2 records?');
    button(dialog()!, 'Yes').click();
    await ran;
    await settle();
    expect(dialog()).toBeNull();
    expect(adapter.calls).toEqual(['remove 2', 'remove 3']);
    await grid.dispose();
  });
});

describe('editing events and methods', () => {
  it('onEditingStart can keep a row from being edited, in the cells and in the form', async () => {
    const { grid } = make({ settings: { editable: true }, onEditingStart: (e) => (e.cancel = e.row.id === 1) });
    await settle();
    expect(grid.editRow(0)).toBe(true);
    await settle();
    expect(grid.editingCell).toBeNull();
    grid.editRow(1);
    expect(grid.editingCell?.rowIndex).toBe(1);
    grid.settings.editMode = 'form';
    await settle();
    grid.editRow(0);
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__form-row')).toBeNull();
    await grid.dispose();
  });

  it('onEditorPrepared comes for a cell editor and for every field of the form', async () => {
    const prepared = vi.fn();
    const { grid } = make({ settings: { editable: true }, onEditorPrepared: prepared });
    await settle();
    grid.editCell(0, 'name');
    expect(prepared).toHaveBeenCalledWith(expect.objectContaining({ field: 'name', place: 'cell', isNew: false }));
    expect(prepared.mock.calls[0][0].editor.element.classList.contains('mx-text-box')).toBe(true);
    key(document.activeElement!, 'Escape');
    prepared.mockClear();
    grid.settings.editMode = 'form';
    await settle();
    grid.editRow(1);
    await settle();
    expect(prepared.mock.calls.map((c) => [c[0].field, c[0].place])).toEqual([
      ['id', 'form'],
      ['name', 'form'],
      ['amount', 'form'],
    ]);
    await grid.dispose();
  });

  it('onEditorPreparing changes a form field or leaves it out', async () => {
    const { grid } = make({
      settings: { editable: true, editMode: 'form' },
      onEditorPreparing: (e) => {
        if (e.field === 'amount') e.cancel = true;
        if (e.field === 'name') e.options.placeholder = 'Who';
      },
    });
    await settle();
    grid.editRow(0);
    await settle();
    const form = grid.element.querySelector('.mx-data-grid__form-row')!;
    expect(form.querySelector('[data-field="name"] input')!.getAttribute('placeholder')).toBe('Who');
    expect(form.querySelector('[data-field="amount"] input')).toBeNull();
    await grid.dispose();
  });

  it('saveEditData and cancelEditData save and give up the row, the form and the batch', async () => {
    const { grid, adapter, source } = make({ settings: { editable: true } });
    await settle();
    type(grid, 0, 'name', 'A');
    expect(await grid.saveEditData()).toBe(true);
    expect(adapter.calls).toEqual(['update 1 {"name":"A"}']);
    type(grid, 1, 'name', 'B');
    key(document.activeElement!, 'Enter');
    grid.cancelEditData();
    await settle();
    expect(grid.hasChanges).toBe(false);
    expect(source.rows[1].name).toBe('Name 2');

    grid.settings.editMode = 'form';
    await settle();
    grid.editRow(2);
    await settle();
    const form = grid.element.querySelector('.mx-data-grid__form-row')!;
    const input = form.querySelector('[data-field="name"] input') as HTMLInputElement;
    input.value = 'C';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(await grid.saveEditData()).toBe(true);
    expect(adapter.calls).toEqual(['update 1 {"name":"A"}', 'update 3 {"name":"C"}']);
    expect(grid.element.querySelector('.mx-data-grid__form-row')).toBeNull();
    grid.editRow(3);
    await settle();
    grid.cancelEditData();
    expect(grid.element.querySelector('.mx-data-grid__form-row')).toBeNull();
    await grid.dispose();
  });

  it('closeEditCell keeps the value; editRowByKey edits the row with that key', async () => {
    const { grid } = make({ settings: { editable: true } });
    await settle();
    type(grid, 0, 'name', 'Kept');
    expect(grid.closeEditCell()).toBe(true);
    expect(grid.editingCell).toBeNull();
    expect(grid.cellValue(0, 'name')).toBe('Kept');
    expect(grid.editRowByKey(4)).toBe(true);
    await settle();
    expect(grid.editingCell).toMatchObject({ rowIndex: 3, field: 'name' });
    expect(grid.editRowByKey(99)).toBe(false);
    await grid.dispose();
  });

  it('selects the text when an editor opens, or puts the caret at its end (selectTextOnEditStart)', async () => {
    const { grid } = make({ settings: { editable: true } });
    await settle();
    grid.editCell(0, 'name');
    let input = document.activeElement as HTMLInputElement;
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 6]);
    key(input, 'Escape');
    grid.settings.selectTextOnEditStart = false;
    grid.editCell(0, 'name');
    input = document.activeElement as HTMLInputElement;
    expect([input.selectionStart, input.selectionEnd]).toEqual([6, 6]);
    await grid.dispose();
  });

  it('follows the popup and form options live, and tells onOptionChanged', async () => {
    const changed = vi.fn();
    const { grid } = make({ settings: { editable: true, editMode: 'popup' }, popup: { showTitle: false }, onOptionChanged: changed });
    await settle();
    grid.editRow(0);
    await settle();
    const win = document.querySelector('dialog.mx-data-grid__popup[open]')!;
    expect(win.getAttribute('aria-label')).toBe('Edit row');
    grid.popup.title = 'Order';
    grid.popup.showTitle = true;
    await settle();
    expect(win.textContent).toContain('Order');
    expect(win.hasAttribute('aria-label')).toBe(false);
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({ name: 'popup.title', value: 'Order' }));
    await grid.dispose();
  });
});
