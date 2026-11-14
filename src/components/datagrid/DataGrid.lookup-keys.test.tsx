import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { DropDown } from '../dropdown/DropDown';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

// Lookup keys a source compares its own way: codes a database pads with spaces (`char(3)`), matched to the items'
// unpadded codes as the database matches them.

type Group = { id: string; text: string };
type Row = { id: number; code: string | null; amount: number };

const GROUPS: Group[] = [
  { id: 'A', text: 'Group A' },
  { id: 'B', text: 'Group B' },
];

const trailingSpaces = (a: unknown, b: unknown) => String(a).trimEnd() === String(b).trimEnd();

/** The lookup's service: compares codes as the database does, in a batch filter and by key; records what it is asked. */
class Groups extends data.ArrayAdapter<Group, string> {
  readonly loads: data.LoadOptions[] = [];
  readonly byKeys: string[] = [];

  constructor() {
    super({ data: GROUPS.map((g) => ({ ...g })), key: 'id' });
  }

  protected override async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Group>> {
    this.loads.push(options);
    const f = options.filter as { field?: string; op?: string; value?: unknown } | null | undefined;
    if (f && f.field && (f.op === 'in' || f.op === '=')) {
      const wanted = f.op === 'in' ? (f.value as unknown[]) : [f.value];
      const { rows } = await super.loadRows({});
      const found = rows.filter((row) => wanted.some((w) => trailingSpaces((row as Record<string, unknown>)[f.field!], w)));
      return { rows: found, total: found.length };
    }
    return super.loadRows(options);
  }

  protected override async findRow(key: string): Promise<Group | undefined> {
    this.byKeys.push(key);
    const { rows } = await super.loadRows({});
    return rows.find((row) => trailingSpaces(row.id, key));
  }
}

const groupSource = (adapter: Groups) => new data.DataSource<Group, string>({ adapter, loadMode: 'page' });

async function make(rows: Row[], lookup: Partial<NonNullable<GridColumn<Row>['lookup']>>, props: Partial<DataGridProps<Row>> = {}) {
  const columns: GridColumn<Row>[] = [
    { field: 'id', title: 'No', type: 'number' },
    { field: 'code', title: 'Group', lookup: { dataSource: [], valueField: 'id', textField: 'text', ...lookup } as GridColumn<Row>['lookup'] },
    { field: 'amount', title: 'Amount', type: 'number' },
  ];
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows, rowHeight: 36, ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  await settled(10);
  return grid;
}

const shownRows = (grid: DataGrid<any>) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')).sort(
    (a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')),
  );
const cellOf = (grid: DataGrid<any>, i: number, field: string) => shownRows(grid)[i].querySelector(`[data-field="${field}"]`) as HTMLElement;
const column = (grid: DataGrid<any>, field: string) => shownRows(grid).map((r) => r.querySelector(`[data-field="${field}"]`)!.firstChild?.textContent ?? '');
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

async function headerValues(grid: DataGrid<any>, field: string) {
  (grid as any).openHeaderFilter(field, (grid as any).headerAnchor(field));
  await settled(10);
  const list = (grid as any).headerFilter.listBox;
  return { list, values: () => list.listItems.loaded.map((v: { text: string; count?: number }) => `${v.text}:${v.count ?? ''}`) as string[] };
}

async function rowList(grid: DataGrid<any>, field: string) {
  const dropDown = (grid as any).filterRow.filterCells.get(field).editors[0] as DropDown<any, any>;
  dropDown.open();
  await settled(10);
  const options = () => [...(dropDown as any).dropParts.list.element.querySelectorAll('[role="option"]')] as HTMLElement[];
  return { dropDown, options, texts: () => options().map((o) => o.textContent) };
}

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('DataGrid lookup keys a source compares its own way', () => {
  it('shows the text of a padded key in its cell and its editor, the item marked, the value kept', async () => {
    const service = new Groups();
    const grid = await make(
      [
        { id: 1, code: 'A  ', amount: 10 },
        { id: 2, code: 'B', amount: 20 },
      ],
      { dataSource: groupSource(service) },
      { settings: { editable: true } },
    );
    expect(column(grid, 'code')).toEqual(['Group A', 'Group B']);
    // The batch, then the padded key alone: the service decides it is 'A'.
    expect(service.byKeys).toEqual(['A  ']);
    const cell = cellOf(grid, 0, 'code');
    cell.focus();
    key(cell, 'Enter');
    await settled(10);
    const editor = (grid as any).editor;
    const field = editor.field as DropDown<Group, string>;
    expect(field.element.textContent).toContain('Group A');
    field.open();
    await settled(10);
    const selected = [...(field as any).dropParts.list.element.querySelectorAll('[role="option"][aria-selected="true"]')].map((o: Element) => o.textContent);
    expect(selected).toEqual(['Group A']);
    field.close();
    (grid as any).cancelEdit();
    await settled(10);
    expect(grid.cellValue(0, 'code')).toBe('A  ');
    await grid.dispose();
  });

  it('lists keys the source matched to one item as one entry, which filters by all of them', async () => {
    const rows: Row[] = [
      { id: 1, code: 'A', amount: 10 },
      { id: 2, code: 'A  ', amount: 20 },
      { id: 3, code: 'B', amount: 30 },
    ];
    const grid = await make(rows, { dataSource: groupSource(new Groups()) }, { settings: { headerFilter: true, filterRow: true, filterDelay: 0 } });
    const { list, values } = await headerValues(grid, 'code');
    expect(values()).toEqual(['Group A:2', 'Group B:1']);
    list.value = ['A'];
    (grid as any).headerFilter.apply();
    await settled(10);
    expect(grid.filter).toEqual({ field: 'code', op: 'in', value: ['A', 'A  '] });
    expect(column(grid, 'id')).toEqual(['1', '2']);
    grid.filters = {};
    await settled(10);
    // The filter row's list: one entry too, and choosing it filters by both keys.
    const { options, texts } = await rowList(grid, 'code');
    expect(texts()).toEqual(['(All)', 'Group A', 'Group B']);
    options()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settled(10);
    expect(grid.filter).toEqual({ field: 'code', op: 'in', value: ['A', 'A  '] });
    expect(column(grid, 'id')).toEqual(['1', '2']);
    await grid.dispose();
  });

  it('lists the items of padded keys a server groups by (it matches them as the lookup service does)', async () => {
    class Orders extends data.ArrayAdapter<Row, number> {
      protected override backendCapabilities(): data.Capabilities {
        return { ...super.backendCapabilities(), group: true };
      }
    }
    const rows: Row[] = [
      { id: 1, code: 'A  ', amount: 10 },
      { id: 2, code: 'B  ', amount: 20 },
    ];
    const orders = new data.DataSource<Row, number>({ adapter: new Orders({ data: rows, key: 'id' }), loadMode: 'page' });
    const grid = await make([], { dataSource: groupSource(new Groups()) }, { dataSource: orders, settings: { filterRow: true, filterDelay: 0 } } as any);
    const { texts } = await rowList(grid, 'code');
    expect(texts()).toEqual(['(All)', 'Group A', 'Group B']);
    await grid.dispose();
  });

  it('asks nothing more with normalizeKey, the rule said', async () => {
    const service = new Groups();
    const trimEnd = (k: unknown) => (typeof k === 'string' ? k.trimEnd() : k);
    const grid = await make(
      [
        { id: 1, code: 'A  ', amount: 10 },
        { id: 2, code: 'B', amount: 20 },
      ],
      { dataSource: groupSource(service), normalizeKey: trimEnd },
    );
    expect(column(grid, 'code')).toEqual(['Group A', 'Group B']);
    expect(service.byKeys).toEqual([]);
    expect(service.loads.length).toBe(1);
    await grid.dispose();
  });

  it('follows normalizeKey for an array of items, where no source decides', async () => {
    const trimEnd = (k: unknown) => (typeof k === 'string' ? k.trimEnd() : k);
    const rows: Row[] = [{ id: 1, code: 'A  ', amount: 10 }];
    const plain = await make(rows, { dataSource: GROUPS });
    expect(column(plain, 'code')).toEqual(['A  ']);
    await plain.dispose();
    const ruled = await make(rows, { dataSource: GROUPS, normalizeKey: trimEnd });
    expect(column(ruled, 'code')).toEqual(['Group A']);
    await ruled.dispose();
  });
});
