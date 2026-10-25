import { readFileSync } from 'node:fs';
import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, mountHost } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridSelection } from './grid-selection';

type Row = { id: number; name: string; city: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
  { field: 'city', title: 'City' },
];

const makeRows = (n: number, from = 1): Row[] => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `Name ${from + i}`, city: i % 2 ? 'Ankara' : 'Bursa' }));

/** A pretend server of `size` rows that loads by blocks. */
class ServerAdapter extends data.DataAdapter<Row, number> {
  constructor(private readonly size: number) {
    super({ key: 'id' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: false, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: false, update: false, remove: false };
  }

  protected async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    const skip = options.skip ?? 0;
    const n = Math.max(0, Math.min(options.take ?? this.size, this.size - skip));
    return { rows: makeRows(n, skip + 1), total: options.count ? this.size : undefined };
  }
}

async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(props: Partial<DataGridProps<Row>> = {}, rows: Row[] = makeRows(6)) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, settings: { selection: 'multiple' }, ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row:not([hidden])[aria-rowindex="${i + 2}"]`) as HTMLElement;
const cell = (grid: DataGrid<any>, i: number, f: string) => rowEl(grid, i).querySelector(`[data-field="${f}"]`) as HTMLElement;
const click = (el: Element, init: MouseEventInit = {}) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const headerCheck = (grid: DataGrid<any>) => grid.element.querySelector('[role="columnheader"][data-field="mx:select"] [role="checkbox"]') as HTMLElement;

afterEach(() => {
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

describe('DataGrid selection', () => {
  it('selects with clicks: one row, Ctrl adds, Shift takes the range; rows say so', async () => {
    const changes: GridSelection[] = [];
    const grid = await make({ onSelectionChanged: (e) => changes.push(e.selection) });
    const vp = grid.element.querySelector('[role="grid"]')!;
    expect(vp.getAttribute('aria-multiselectable')).toBe('true');
    click(cell(grid, 0, 'name'));
    click(cell(grid, 2, 'name'), { ctrlKey: true });
    expect(grid.selectedKeys).toEqual([1, 3]);
    click(cell(grid, 4, 'name'), { shiftKey: true });
    expect(grid.selectedKeys).toEqual([1, 3, 4, 5]);
    await settle();
    expect(rowEl(grid, 3).getAttribute('aria-selected')).toBe('true');
    expect(rowEl(grid, 1).getAttribute('aria-selected')).toBe('false');
    expect(cell(grid, 3, 'mx:select').querySelector('[role="checkbox"]')!.getAttribute('aria-checked')).toBe('true');
    expect(grid.selectedRows.map((r) => r.id)).toEqual([1, 3, 4, 5]);
    expect(grid.selectedCount).toBe(4);
    expect(changes.at(-1)).toEqual({ all: false, keys: [1, 3, 4, 5], except: [], filter: null });
    click(cell(grid, 0, 'mx:select'));
    expect(grid.selectedKeys).toEqual([3, 4, 5]);
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__selected')!.textContent).toBe('3 selected');
    await grid.dispose();
  });

  it('maps selected rows to the selection roles of the design language; an active row stays selected', async () => {
    const grid = await make();
    grid.selectedKeys = [2, 3];
    grid.focusedRowIndex = 2;
    await settle();
    expect([1, 2, 3].map((i) => [rowEl(grid, i).hasAttribute('data-selected'), rowEl(grid, i).hasAttribute('data-active')])).toEqual([
      [true, false],
      [true, true],
      [false, false],
    ]);
    expect(grid.element.getAttribute('data-selection')).toBe('multiple');
    const tokens = JSON.parse(readFileSync('tokens/component/datagrid.tokens.json', 'utf8')).datagrid;
    const roles = Object.fromEntries(
      ['selected', 'selected-text', 'selected-border', 'selected-border-width', 'selected-effect', 'indicator-width', 'indicator-length', 'indicator-radius', 'indicator-color'].map((name) => [name, tokens[name].$value]),
    );
    expect(roles).toEqual({
      selected: '{color.selection.bg}',
      'selected-text': '{color.selection.fg}',
      'selected-border': '{color.selection.border}',
      'selected-border-width': '{selection.border-width}',
      'selected-effect': '{effect.selection}',
      'indicator-width': '{indicator.thickness}',
      'indicator-length': '{indicator.length}',
      'indicator-radius': '{indicator.radius}',
      'indicator-color': '{color.selection.indicator}',
    });
    await grid.dispose();
  });

  it('selects all with the header box and Ctrl+A: a state with the rows taken out', async () => {
    const grid = await make();
    click(grid.element.querySelector('[role="columnheader"][data-field="mx:select"]')!);
    await settle();
    expect(grid.selection).toEqual({ all: true, keys: [], except: [], filter: null });
    expect(headerCheck(grid).getAttribute('aria-checked')).toBe('true');
    click(cell(grid, 1, 'mx:select'));
    await settle();
    expect(grid.selection.except).toEqual([2]);
    expect(grid.selectedCount).toBe(5);
    expect(headerCheck(grid).getAttribute('aria-checked')).toBe('mixed');
    expect(grid.selectionFilter).toEqual(data.not(data.where('id', 'in', [2])));
    click(grid.element.querySelector('[role="columnheader"][data-field="mx:select"]')!);
    expect(grid.selectedCount).toBe(6);
    grid.clearSelection();
    await settle();
    expect(headerCheck(grid).getAttribute('aria-checked')).toBe('false');
    cell(grid, 0, 'name').focus();
    key(cell(grid, 0, 'name'), 'a', { ctrlKey: true });
    expect(grid.selection.all).toBe(true);
    grid.settings.selectAll = false;
    await settle();
    grid.clearSelection();
    key(cell(grid, 0, 'name'), 'a', { ctrlKey: true });
    expect(grid.selectedCount).toBe(0);
    expect(headerCheck(grid).hidden).toBe(true);
    await grid.dispose();
  });

  it('works from the keyboard: Shift+Space, Space where it does not edit, Shift+arrows', async () => {
    const grid = await make({ settings: { selection: 'multiple', editable: true } });
    cell(grid, 0, 'name').focus();
    key(document.activeElement!, ' ', { shiftKey: true });
    expect(grid.selectedKeys).toEqual([1]);
    key(document.activeElement!, 'ArrowDown', { shiftKey: true });
    key(document.activeElement!, 'ArrowDown', { shiftKey: true });
    await settle();
    expect(grid.selectedKeys).toEqual([1, 2, 3]);
    key(document.activeElement!, 'ArrowLeft');
    key(document.activeElement!, 'ArrowLeft');
    await settle();
    expect(grid.activeField).toBe('mx:select');
    key(document.activeElement!, ' ');
    expect(grid.selectedKeys).toEqual([1, 2]);
    // Space on an editable cell still edits.
    key(document.activeElement!, 'ArrowRight');
    key(document.activeElement!, 'ArrowRight');
    await settle();
    key(document.activeElement!, ' ');
    expect(grid.element.querySelector('.mx-data-grid__editor')).not.toBeNull();
    await grid.dispose();
  });

  it('follows the active row in single selection, and can be turned off live', async () => {
    const grid = await make({ settings: { selection: 'single' } });
    expect(grid.element.querySelector('[role="grid"]')!.hasAttribute('aria-multiselectable')).toBe(false);
    expect((grid as any).model.columns.visible()).not.toContain('mx:select');
    cell(grid, 1, 'name').focus();
    key(document.activeElement!, 'ArrowDown');
    await settle();
    expect(grid.selectedKeys).toEqual([3]);
    click(cell(grid, 0, 'name'), { ctrlKey: true });
    expect(grid.selectedKeys).toEqual([1]);
    grid.settings.selection = 'none';
    await settle();
    expect(rowEl(grid, 0).hasAttribute('aria-selected')).toBe(false);
    click(cell(grid, 4, 'name'));
    expect(grid.selectedKeys).toEqual([1]);
    await grid.dispose();
  });

  it('takes the selected keys from the app and tells it changes', async () => {
    const state = reactive({ keys: [2, 4] as unknown[] });
    let grid!: DataGrid<Row>;
    const host = mountHost(
      <DataGrid
        ref={(g: DataGrid<Row>) => (grid = g)}
        rowKey="id"
        columns={columns}
        rows={makeRows(6)}
        settings={{ selection: 'multiple' }}
        selectedKeys={() => state.keys}
        onSelectionChanged={(e) => (state.keys = e.selection.keys)}
      />,
    );
    layout(grid);
    await settle();
    expect(grid.selectedKeys).toEqual([2, 4]);
    click(cell(grid, 0, 'mx:select'));
    await settle();
    expect(state.keys).toEqual([2, 4, 1]);
    state.keys = [6];
    await settle();
    expect(grid.selectedKeys).toEqual([6]);
    await host.dispose();
  });

  it('selects every row of a server without loading them, and drops "all" when the filter changes', async () => {
    const source = new data.DataSource<Row, number>({ adapter: new ServerAdapter(50_000), loadMode: 'blocks', pageSize: 50 });
    const grid = await make({ dataSource: source });
    grid.selectAll();
    click(cell(grid, 2, 'mx:select'));
    expect(grid.selectedCount).toBe(49_999);
    expect(grid.selection.except).toEqual([3]);
    expect(grid.isSelected(source.rowAt(0)!)).toBe(true);
    expect(grid.selectedKeys).not.toContain(3);
    grid.selectRow(source.rowAt(4)!, true);
    grid.filters = { city: { value: 'Ankara' } };
    grid.settings.filterRow = true;
    await settle();
    expect(grid.selection.all).toBe(false);
    expect(grid.selectedCount).toBe(0);
    await grid.dispose();
  });

  it('writes its texts from uiLocale', async () => {
    uiLocale.strings = trStrings;
    const grid = await make();
    expect(headerCheck(grid).getAttribute('aria-label')).toBe('Tüm satırları seç');
    expect(cell(grid, 0, 'mx:select').querySelector('[role="checkbox"]')!.getAttribute('aria-label')).toBe('Satırı seç');
    grid.selectAll();
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__selected')!.textContent).toBe('6 seçili');
    await grid.dispose();
  });
});
