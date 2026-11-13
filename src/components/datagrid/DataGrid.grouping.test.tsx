import { data } from '@motifx-community/data';
import { reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { enStrings, uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; city: string; status: string; qty: number; customerId: number };

const CITIES = ['ank', 'brs', 'izm'];
const STATUSES = ['Draft', 'Paid'];
const makeRows = (n = 12): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Order ${i + 1}`, city: CITIES[i % 3], status: STATUSES[Math.floor(i / 3) % 2], qty: (i + 1) * 10, customerId: (i % 2) + 1 }));

const CUSTOMERS = [
  { id: 1, name: 'Ankara Foods' },
  { id: 2, name: 'Bursa Textiles' },
];

const columns = (): GridColumn<Row>[] => [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
  {
    field: 'city',
    title: 'City',
    type: 'list',
    options: [
      { value: 'ank', label: 'Ankara' },
      { value: 'brs', label: 'Bursa' },
      { value: 'izm', label: 'İzmir' },
    ],
  },
  { field: 'status', title: 'Status' },
  { field: 'qty', title: 'Qty', type: 'number' },
];

/** A pretend server that groups (an array adapter): every load is recorded. */
class Server extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  protected override loadRows(options: data.LoadOptions) {
    this.requests.push(options);
    return super.loadRows(options);
  }
}

async function settle() {
  await settled(10);
}

function layout(grid: DataGrid<any>, viewport = 720) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(props: Partial<DataGridProps<Row>> = {}, rows: Row[] = makeRows()) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns: columns(), rows, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

/** The rows drawn, in order: a group row as "> text" (open) or "+ text", a data row by its id. */
const lines = (grid: DataGrid<any>) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])'))
    .sort((a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')))
    .map((r) => (r.classList.contains('mx-data-grid__group-row') ? `${r.getAttribute('aria-expanded') === 'true' ? '>' : '+'}${'  '.repeat(Number(r.getAttribute('aria-level')) - 1)} ${r.querySelector('.mx-data-grid__group-cell')!.textContent!.trim()}` : r.querySelector('[data-field="id"]')?.textContent ?? '?'));
const groupRow = (grid: DataGrid<any>, text: string) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__group-row:not([hidden])')).find((r) => r.textContent!.includes(text))!;
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));
const headers = (grid: DataGrid<any>) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__row--header .mx-data-grid__header-cell')).filter((h) => h.hasAttribute('aria-colindex')).map((h) => h.dataset.field);

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  uiLocale.strings = enStrings;
});

describe('grouping rows in memory', () => {
  it('shows a row per group with its text and count, levels below moved in, and hides the grouped columns', async () => {
    const grid = await make({ columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c.field === 'status' ? { ...c, groupIndex: 1 } : c)) });
    expect(grid.group).toEqual([
      { field: 'city', dir: 'asc' },
      { field: 'status', dir: 'asc' },
    ]);
    expect(lines(grid).slice(0, 8)).toEqual(['> City: Ankara (4)', '>   Status: Draft (2)', '1', '7', '>   Status: Paid (2)', '4', '10', '> City: Bursa (4)']);
    expect(headers(grid)).toEqual(['id', 'name', 'qty']);
    expect(grid.total).toBe(12);
    const vp = grid.element.querySelector('.mx-data-grid__viewport')!;
    expect(vp.getAttribute('aria-rowcount')).toBe(String(12 + 3 + 6 + 1));
    // Grouped, the grid is a tree: data rows below every level.
    expect(vp.getAttribute('role')).toBe('treegrid');
    expect(grid.element.querySelector('.mx-data-grid__body > .mx-data-grid__row:not(.mx-data-grid__group-row):not([hidden])')!.getAttribute('aria-level')).toBe('3');
    const top = groupRow(grid, 'City: Ankara');
    expect([top.getAttribute('role'), top.getAttribute('aria-level'), top.getAttribute('aria-expanded'), top.querySelector('[role="gridcell"]')!.getAttribute('aria-colspan')]).toEqual(['row', '1', 'true', '3']);
    await grid.dispose();
  });

  it('opens and closes groups by click, keys and code, and tells it before and after', async () => {
    const told: string[] = [];
    const grid = await make({
      columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)),
      onRowCollapsing: (e) => e.kind === 'group' && told.push(`collapsing ${e.key.join('/')}`),
      onRowCollapsed: (e) => e.kind === 'group' && told.push(`collapsed ${e.key.join('/')}`),
      onRowExpanding: (e) => {
        if (e.kind !== 'group') return;
        told.push(`expanding ${e.key.join('/')}`);
        if (e.key[0] === 'izm') e.cancel = true;
      },
    });
    // The arrow closes the group.
    groupRow(grid, 'Ankara').querySelector<HTMLElement>('.mx-data-grid__group-toggle')!.click();
    await settle();
    expect(lines(grid).slice(0, 3)).toEqual(['+ City: Ankara (4)', '> City: Bursa (4)', '2']);
    expect(told).toEqual(['collapsing ank', 'collapsed ank']);
    // A click elsewhere on the row does not, unless groupExpandMode is rowClick.
    groupRow(grid, 'Bursa').querySelector<HTMLElement>('.mx-data-grid__group-text')!.click();
    await settle();
    expect(grid.isGroupExpanded(['brs'])).toBe(true);
    grid.settings.groupExpandMode = 'rowClick';
    groupRow(grid, 'Bursa').querySelector<HTMLElement>('.mx-data-grid__group-text')!.click();
    await settle();
    expect(grid.isGroupExpanded(['brs'])).toBe(false);

    // Keys: Right opens, Right again goes to the first row, Left on a closed group stays.
    const cell = groupRow(grid, 'Ankara').querySelector<HTMLElement>('.mx-data-grid__group-cell')!;
    cell.focus();
    await settle();
    key(cell, 'ArrowRight');
    await settle();
    expect(grid.isGroupExpanded(['ank'])).toBe(true);
    expect(document.activeElement).toBe(cell);
    key(cell, 'ArrowRight');
    await settle();
    expect((document.activeElement as HTMLElement).closest('.mx-data-grid__row')!.querySelector('[data-field="id"]')!.textContent).toBe('1');
    // Up goes back to the group row; Enter and Space close and open it.
    key(document.activeElement!, 'ArrowUp');
    await settle();
    expect(document.activeElement).toBe(groupRow(grid, 'Ankara').querySelector('.mx-data-grid__group-cell'));
    key(document.activeElement!, 'Enter');
    await settle();
    expect(grid.isGroupExpanded(['ank'])).toBe(false);
    key(document.activeElement!, ' ');
    await settle();
    expect(grid.isGroupExpanded(['ank'])).toBe(true);
    key(document.activeElement!, 'ArrowLeft');
    await settle();
    expect(grid.isGroupExpanded(['ank'])).toBe(false);

    // Code; a cancelled expansion stays closed.
    grid.collapseAll();
    await settle();
    expect(lines(grid)).toEqual(['+ City: Ankara (4)', '+ City: Bursa (4)', '+ City: İzmir (4)']);
    expect(grid.expandGroup(['izm'])).toBe(false);
    expect(grid.expandGroup(['brs'])).toBe(true);
    await settle();
    expect(lines(grid)).toEqual(['+ City: Ankara (4)', '> City: Bursa (4)', '2', '5', '8', '11', '+ City: İzmir (4)']);
    grid.expandAll();
    await settle();
    expect(lines(grid)).toHaveLength(15);
    // allowCollapsing off: the user cannot, code can.
    grid.settings.allowCollapsing = false;
    groupRow(grid, 'Bursa').querySelector<HTMLElement>('.mx-data-grid__group-toggle')!.click();
    await settle();
    expect(grid.isGroupExpanded(['brs'])).toBe(true);
    expect(grid.collapseGroup(['brs'])).toBe(true);
    await grid.dispose();
  });

  it('starts closed with autoExpandAll off or a column of its own, and pages over the list of groups and rows', async () => {
    const grid = await make({
      mode: 'paged',
      pageSize: 4,
      columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, autoExpandGroup: false } : c.field === 'status' ? { ...c, groupIndex: 1 } : c)),
    });
    expect(lines(grid)).toEqual(['+ City: Ankara (4)', '+ City: Bursa (4)', '+ City: İzmir (4)']);
    expect(grid.pageCount).toBe(1);
    grid.expandAll(0);
    await settle();
    // 3 + 6 groups and 12 rows: 21 places, 4 a page.
    expect(grid.pageCount).toBe(6);
    expect(lines(grid)).toEqual(['> City: Ankara (4)', '>   Status: Draft (2)', '1', '7']);
    grid.page = 1;
    await settle();
    expect(lines(grid)).toEqual(['>   Status: Paid (2)', '4', '10', '> City: Bursa (4)']);
    grid.collapseAll(1);
    await settle();
    expect(grid.pageCount).toBe(3);
    await grid.dispose();
  });

  it('sorts the groups from the header, the chip and the sort, groups by a value of its own, and keeps the sort inside', async () => {
    const grid = await make({ sort: [{ field: 'qty', dir: 'desc' }], columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, showWhenGrouped: true } : c)) });
    expect(lines(grid).slice(0, 3)).toEqual(['> City: Ankara (4)', '10', '7']);
    expect(headers(grid)).toContain('city');
    // The grouped column's header turns the order of its groups.
    grid.element.querySelector<HTMLElement>('.mx-data-grid__header-cell[data-field="city"]')!.click();
    await settle();
    expect(grid.group).toEqual([{ field: 'city', dir: 'desc' }]);
    expect(lines(grid)[0]).toBe('> City: İzmir (4)');
    expect(grid.sort).toEqual([{ field: 'qty', dir: 'desc' }]);
    // Grouping a sorted column takes its direction and leaves the sort.
    grid.group = [{ field: 'qty' }];
    await settle();
    expect(grid.sort).toEqual([]);
    expect(grid.group).toEqual([{ field: 'qty', dir: 'desc' }]);
    await grid.dispose();

    const byBand = await make({
      columns: [...columns(), { field: 'band', title: 'Band', value: (r) => (r.qty > 60 ? 'big' : 'small'), groupIndex: 0, calculateGroupValue: (r) => (r.qty > 60 ? 'big' : 'small') }],
    });
    expect(lines(byBand).filter((l) => l.startsWith('>'))).toEqual(['> Band: big (6)', '> Band: small (6)']);
    await byBand.dispose();
  });

  it('follows the filters, the search, the rows and a groupIndex the app binds', async () => {
    const s = reactive({ at: 0 as number | undefined });
    const rows = makeRows();
    const grid = await make({ settings: { filterRow: true }, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: () => s.at } : c)) }, rows);
    grid.searchByText('Order 1');
    await settle();
    // 1, 10, 11, 12.
    expect(lines(grid).filter((l) => l.startsWith('>'))).toEqual(['> City: Ankara (2)', '> City: Bursa (1)', '> City: İzmir (1)']);
    grid.searchByText('');
    grid.filters = { status: { op: '=', value: 'Paid' } };
    await settle();
    expect(lines(grid).filter((l) => l.startsWith('>'))).toEqual(['> City: Ankara (2)', '> City: Bursa (2)', '> City: İzmir (2)']);
    grid.filters = {};
    rows.push({ id: 13, name: 'Order 13', city: 'ank', status: 'Draft', qty: 1, customerId: 1 });
    await settle();
    expect(lines(grid)[0]).toBe('> City: Ankara (5)');
    s.at = undefined;
    await settle();
    expect(grid.group).toEqual([]);
    expect(lines(grid)[0]).toBe('1');
    s.at = 0;
    await settle();
    expect(grid.group).toEqual([{ field: 'city', dir: 'asc' }]);
    await grid.dispose();
  });

  it("draws a column's groupCell content, following the group the pooled row shows", async () => {
    const grid = await make({
      columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, groupCell: (ctx) => <b class="own">{() => `${ctx.text} · ${ctx.count} · ${ctx.isExpanded ? 'open' : 'closed'}`}</b> } : c)),
    });
    const own = () => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__group-row:not([hidden]) .own')).map((b) => b.textContent);
    expect(own()).toEqual(['Ankara · 4 · open', 'Bursa · 4 · open', 'İzmir · 4 · open']);
    grid.collapseGroup(['brs']);
    await settle();
    expect(own()).toEqual(['Ankara · 4 · open', 'Bursa · 4 · closed', 'İzmir · 4 · open']);
    await grid.dispose();
  });

  it('draws the grid groupCell in the group rows of columns without their own', async () => {
    const grid = await make({ groupCell: (ctx) => <i class="grid-own">{() => `${ctx.column.field}=${ctx.value}`}</i>, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)) });
    expect(Array.from(grid.element.querySelectorAll('.mx-data-grid__group-row:not([hidden]) .grid-own')).map((e) => e.textContent)).toEqual(['city=ank', 'city=brs', 'city=izm']);
    await grid.dispose();
  });

  it('groups a lookup column by its key and shows the text of the key', async () => {
    const customers = new data.DataSource<{ id: number; name: string }, number>({ adapter: new data.ArrayAdapter({ data: CUSTOMERS, key: 'id' }) });
    const grid = await make({
      columns: [...columns(), { field: 'customerId', title: 'Customer', lookup: { dataSource: customers, valueField: 'id', textField: 'name' }, groupIndex: 0 }],
    });
    await settle();
    expect(lines(grid).filter((l) => l.startsWith('>'))).toEqual(['> Customer: Ankara Foods (6)', '> Customer: Bursa Textiles (6)']);
    await grid.dispose();
  });

  it('shows the text of the key for a lookup column with textFrom grouped by its own field', async () => {
    const customers = new data.DataSource<{ id: number; name: string }, number>({ adapter: new data.ArrayAdapter({ data: CUSTOMERS, key: 'id' }) });
    const lookup = { dataSource: customers, valueField: 'id', textField: 'name' };
    const grid = await make({
      columns: [...columns(), { field: 'customerId', title: 'Customer', textFrom: (r) => `#${r.customerId}`, calculateGroupValue: 'customerId', lookup, groupIndex: 0 }],
    });
    await settle();
    expect(lines(grid).filter((l) => l.startsWith('>'))).toEqual(['> Customer: Ankara Foods (6)', '> Customer: Bursa Textiles (6)']);
    await grid.dispose();
  });
});

describe('grouping on a server', () => {
  it('asks an adapter that groups for the groups only and loads the rows of the open groups in group order', async () => {
    const server = new Server({ data: makeRows(300).map((r, i) => ({ ...r, city: CITIES[Math.floor(i / 100)] })), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 50 });
    const grid = await make({ dataSource: source, rows: undefined, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, autoExpandGroup: false } : c)) });
    expect(lines(grid)).toEqual(['+ City: Ankara (100)', '+ City: Bursa (100)', '+ City: İzmir (100)']);
    const groups = server.requests.find((r) => r.groupsOnly)!;
    expect([groups.group, groups.take]).toEqual([[{ field: 'city', dir: 'asc' }], undefined]);
    expect(source.sort).toEqual([{ field: 'city', dir: 'asc' }]);
    server.requests.length = 0;
    expect(grid.expandGroup(['izm'])).toBe(true);
    await settle();
    // Only the block where Izmir's rows start: 200 of 300.
    expect(server.requests.map((r) => r.skip)).toEqual([200]);
    expect(lines(grid).slice(0, 5)).toEqual(['+ City: Ankara (100)', '+ City: Bursa (100)', '> City: İzmir (100)', '201', '202']);
    expect(grid.total).toBe(300);
    await grid.dispose();
  });

  it('groups on the server over a source that loads pages, loading only the rows of the page shown', async () => {
    const server = new Server({ data: makeRows(300).map((r, i) => ({ ...r, city: CITIES[Math.floor(i / 100)] })), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'page', pageSize: 10 });
    const grid = await make({ dataSource: source, rows: undefined, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, autoExpandGroup: false } : c)) });
    expect(lines(grid)).toEqual(['+ City: Ankara (100)', '+ City: Bursa (100)', '+ City: İzmir (100)']);
    expect(server.requests.some((r) => r.groupsOnly)).toBe(true);
    // Never every row at once.
    expect(server.requests.some((r) => !r.groupsOnly && r.take === undefined)).toBe(false);
    server.requests.length = 0;
    expect(grid.expandGroup(['izm'])).toBe(true);
    await settle();
    // Three group rows and seven of İzmir's rows on the first page of ten places.
    expect(server.requests.map((r) => [r.skip, r.take])).toEqual([[200, 7]]);
    expect(lines(grid)).toEqual(['+ City: Ankara (100)', '+ City: Bursa (100)', '> City: İzmir (100)', '201', '202', '203', '204', '205', '206', '207']);
    expect(grid.pageCount).toBe(11);
    server.requests.length = 0;
    grid.page = 1;
    await settle();
    expect(server.requests.map((r) => [r.skip, r.take])).toEqual([[207, 10]]);
    expect(lines(grid)).toEqual(['208', '209', '210', '211', '212', '213', '214', '215', '216', '217']);
    // Back on a page already seen: nothing is asked again.
    server.requests.length = 0;
    grid.page = 0;
    await settle();
    expect(server.requests.length).toBe(0);
    expect(lines(grid).slice(3, 5)).toEqual(['201', '202']);
    await grid.dispose();
  });

  it('groups the rows in memory when the adapter cannot group', async () => {
    const server = new Server({ data: makeRows(30), key: 'id', capabilities: { group: false } });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 10 });
    const grid = await make({ dataSource: source, rows: undefined, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)) });
    expect(lines(grid).slice(0, 3)).toEqual(['> City: Ankara (10)', '1', '4']);
    expect(server.requests.some((r) => r.skip === undefined && r.take === undefined && !r.group)).toBe(true);
    await grid.dispose();
  });
});

const rect = (el: Element, r: { left: number; top: number; width: number; height: number }) =>
  ((el as HTMLElement).getBoundingClientRect = () => ({ ...r, right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top, toJSON: () => r }) as DOMRect);
const pointer = (el: Element, type: string, x: number, y: number) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, pointerId: 1 }));
const panelOf = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__group-panel')!;
const chips = (grid: DataGrid<any>) => Array.from(panelOf(grid).querySelectorAll<HTMLElement>('.mx-data-grid__chip')).map((c) => `${c.textContent}:${c.dataset.dir}`);

describe('the group panel and the column menu', () => {
  it('shows the panel at the start of the toolbar, chips that sort, move and ungroup from the keyboard', async () => {
    const grid = await make({ settings: { groupPanel: true, searchPanel: true } });
    const panel = panelOf(grid);
    const bar = grid.element.querySelector('.mx-data-grid__toolbar')!;
    expect(bar.firstElementChild).toBe(panel);
    expect([panel.getAttribute('role'), panel.getAttribute('aria-label')]).toEqual(['group', 'Grouping']);
    expect(panel.querySelector('.mx-data-grid__group-empty')!.textContent).toBe('Drag a column header here to group by that column');
    grid.group = [{ field: 'city' }, { field: 'status', dir: 'desc' }];
    await settle();
    expect(chips(grid)).toEqual(['City:asc', 'Status:desc']);
    const city = panel.querySelector<HTMLElement>('.mx-data-grid__chip[data-group="city"]')!;
    expect(city.getAttribute('aria-label')).toBe('City, groups ascending');
    expect(document.getElementById(city.getAttribute('aria-describedby')!)!.textContent).toMatch(/Delete ungroups/);
    city.click();
    await settle();
    expect(grid.group[0]).toEqual({ field: 'city', dir: 'desc' });
    expect(lines(grid)[0]).toBe('> City: İzmir (4)');
    city.focus();
    key(city, 'ArrowRight', { shiftKey: true });
    await settle();
    expect(chips(grid)).toEqual(['Status:desc', 'City:desc']);
    expect(document.activeElement).toBe(city);
    key(city, 'Delete');
    await settle();
    expect(chips(grid)).toEqual(['Status:desc']);
    expect(document.activeElement!.textContent).toBe('Status');
    // Informative only: no keys that change the grouping.
    grid.settings.groupPanelDragging = false;
    await settle();
    key(document.activeElement!, 'Delete');
    await settle();
    expect(chips(grid)).toEqual(['Status:desc']);
    grid.settings.groupPanel = false;
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__group-panel')).toBeNull();
    await grid.dispose();
  });

  it('groups from a header dropped on the panel, and ungroups a chip dropped on the headers where it lands', async () => {
    const grid = await make({ settings: { groupPanel: true } });
    const panel = panelOf(grid);
    Object.defineProperty(panel, 'offsetParent', { configurable: true, get: () => document.body });
    // The whole toolbar takes drops for the panel.
    const bar = grid.element.querySelector('.mx-data-grid__toolbar')!;
    rect(bar, { left: 0, top: 0, width: 600, height: 30 });
    const head = grid.element.querySelector('.mx-data-grid__row--header')!;
    rect(head, { left: 0, top: 40, width: 600, height: 30 });
    const header = (f: string) => grid.element.querySelector<HTMLElement>(`.mx-data-grid__header-cell[data-field="${f}"]`)!;
    ['id', 'name', 'city', 'status', 'qty'].forEach((f, i) => rect(header(f), { left: i * 100, top: 40, width: 100, height: 30 }));
    pointer(header('status'), 'pointerdown', 350, 55);
    pointer(header('status'), 'pointermove', 560, 20);
    // The drag draws with the window's next measuring round.
    (grid as any).measure();
    expect(bar.hasAttribute('data-drop')).toBe(true);
    expect(bar.hasAttribute('data-drop-ready')).toBe(true);
    expect(grid.element.querySelector('.mx-data-grid__ghost')!.getAttribute('data-target')).toBe('group');
    pointer(header('status'), 'pointerup', 560, 20);
    await settle();
    expect(grid.group).toEqual([{ field: 'status', dir: 'asc' }]);
    expect(headers(grid)).toEqual(['id', 'name', 'city', 'qty']);
    expect(bar.hasAttribute('data-drop')).toBe(false);
    expect(bar.hasAttribute('data-drop-ready')).toBe(false);
    expect(grid.element.querySelector('.mx-data-grid__ghost')).toBeNull();
    // The chip back onto the headers, between Id and Name.
    const chip = panel.querySelector<HTMLElement>('.mx-data-grid__chip')!;
    rect(chip, { left: 10, top: 5, width: 80, height: 20 });
    pointer(chip, 'pointerdown', 20, 15);
    pointer(chip, 'pointermove', 120, 50);
    (grid as any).measure();
    expect(head.hasAttribute('data-drop')).toBe(true);
    pointer(chip, 'pointerup', 120, 50);
    await settle();
    expect(grid.group).toEqual([]);
    expect(headers(grid)).toEqual(['id', 'status', 'name', 'city', 'qty']);
    await grid.dispose();
  });

  it('asks once for a chip dropped on the headers, and moves focus off the chip before it goes', async () => {
    const drops: string[] = [];
    const grid = await make({
      settings: { groupPanel: true },
      columns: columns().map((c) => (c.field === 'status' ? { ...c, groupIndex: 0 } : c.field === 'city' ? { ...c, groupIndex: 1 } : c)),
      onGroupDropping: (e) => {
        drops.push(`${e.field} ${e.from}→${e.to} ${e.index}`);
        e.cancel = drops.length === 1;
      },
    });
    const panel = panelOf(grid);
    Object.defineProperty(panel, 'offsetParent', { configurable: true, get: () => document.body });
    rect(grid.element.querySelector('.mx-data-grid__toolbar')!, { left: 0, top: 0, width: 600, height: 30 });
    rect(grid.element.querySelector('.mx-data-grid__row--header')!, { left: 0, top: 40, width: 600, height: 30 });
    headers(grid).forEach((f, i) => rect(grid.element.querySelector(`.mx-data-grid__header-cell[data-field="${f}"]`)!, { left: i * 100, top: 40, width: 100, height: 30 }));
    const chipOf = (f: string) => panel.querySelector<HTMLElement>(`.mx-data-grid__chip[data-group="${f}"]`)!;
    const drag = () => {
      const chip = chipOf('status');
      rect(chip, { left: 10, top: 5, width: 80, height: 20 });
      chip.focus();
      pointer(chip, 'pointerdown', 20, 15);
      pointer(chip, 'pointermove', 120, 50);
      pointer(chip, 'pointerup', 120, 50);
    };
    // Cancelled: the chip stays, and keeps focus.
    drag();
    await settle();
    expect(grid.group.map((g) => g.field)).toEqual(['status', 'city']);
    expect(document.activeElement).toBe(chipOf('status'));
    drag();
    expect(document.activeElement).toBe(chipOf('city'));
    await settle();
    expect(drops).toEqual(['status chip→headers 1', 'status chip→headers 1']);
    expect(grid.group.map((g) => g.field)).toEqual(['city']);
    expect(document.activeElement).toBe(chipOf('city'));
    await grid.dispose();
  });

  it('groups and ungroups from the column menu, which shows them with groupMenu or a panel that takes headers', async () => {
    const grid = await make();
    const menu = (grid as any).menu;
    const texts = () => [...menu.list.element.querySelectorAll('[role^="menuitem"]')].map((el: Element) => el.textContent);
    const item = (text: string) => [...menu.popup.element.querySelectorAll('[role^="menuitem"]')].find((el: Element) => el.textContent === text) as HTMLElement;
    const open = (field: string) => (grid as any).openMenu(field, (grid as any).headerAnchor(field));
    open('city');
    expect(texts()).not.toContain('Group by this column');
    menu.close();
    grid.settings.groupMenu = true;
    open('city');
    expect(texts()).toContain('Group by this column');
    expect(texts()).not.toContain('Ungroup');
    item('Group by this column').click();
    await settle();
    expect(grid.group).toEqual([{ field: 'city', dir: 'asc' }]);
    expect(grid.element.querySelector('.mx-data-grid__live[aria-live]')!.textContent).toBe('Grouped by City');
    expect(document.activeElement!.classList.contains('mx-data-grid__header-cell')).toBe(true);
    open('status');
    item('Group by this column').click();
    await settle();
    open('name');
    expect(texts()).toContain('Ungroup all');
    item('Ungroup all').click();
    await settle();
    expect(grid.group).toEqual([]);
    // groupable off for a column: no item.
    grid.columnSettings('name').groupable = false;
    open('name');
    expect(texts()).not.toContain('Group by this column');
    menu.close();
    // Left unset, the items follow a group panel that takes headers; a column's own value wins.
    (grid.settings as any).groupMenu = undefined;
    grid.settings.groupPanel = true;
    await settle();
    open('city');
    expect(texts()).toContain('Group by this column');
    menu.close();
    grid.columnSettings('city').groupMenu = false;
    open('city');
    expect(texts()).not.toContain('Group by this column');
    menu.close();
    await grid.dispose();
  });
});

describe('grouping with the other features', () => {
  it('exports the rows in group order with a line per group, and copies a group row as its text', async () => {
    const grid = await make({ columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)) });
    grid.collapseGroup(['ank']);
    await settle();
    const csv = await grid.exportCsv({ download: false, bom: false, separator: ',' });
    const csvLines = csv.trim().split('\r\n');
    expect(csvLines.slice(0, 4)).toEqual(['Id,Name,Status,Qty', 'City: Ankara,,,', '1,Order 1,Draft,10', '4,Order 4,Paid,40']);
    expect(csvLines).toHaveLength(1 + 3 + 12);
    expect((await grid.exportRows()).map((r) => r.id)).toEqual(['1', '4', '7', '10', '2', '5', '8', '11', '3', '6', '9', '12']);
    const cell = groupRow(grid, 'Ankara').querySelector<HTMLElement>('.mx-data-grid__group-cell')!;
    cell.focus();
    await settle();
    expect(grid.copy()).toBe('City: Ankara');
    await grid.dispose();
  });

  it('keeps the grouping with the layout, and resets it to the columns', async () => {
    const first = await make({ layoutKey: 'grouped', columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)) });
    first.group = [{ field: 'status', dir: 'desc' }];
    await settle();
    expect(first.layout.group).toEqual([{ field: 'status', dir: 'desc' }]);
    await first.dispose();
    document.body.innerHTML = '';
    const again = await make({ layoutKey: 'grouped', columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)) });
    expect(again.group).toEqual([{ field: 'status', dir: 'desc' }]);
    again.resetLayout();
    await settle();
    expect(again.group).toEqual([{ field: 'city', dir: 'asc' }]);
    again.layout = { ...again.layout, group: [] };
    await settle();
    expect(again.group).toEqual([]);
    await again.dispose();
  });

  it('selects across groups: group rows take no selection, "all" stays all, a range skips them', async () => {
    const grid = await make({ settings: { selection: 'multiple' }, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)) });
    const first = groupRow(grid, 'Ankara');
    expect(first.hasAttribute('aria-selected')).toBe(false);
    grid.selectAll();
    await settle();
    expect(grid.selectedCount).toBe(12);
    grid.clearSelection();
    const row = (id: number) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not(.mx-data-grid__group-row):not([hidden])')).find((r) => r.querySelector('[data-field="id"]')!.textContent === String(id))!;
    row(10).querySelector<HTMLElement>('[data-field="name"]')!.click();
    row(5).querySelector<HTMLElement>('[data-field="name"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    await settle();
    expect([...grid.selectedKeys].sort((a, b) => (a as number) - (b as number))).toEqual([2, 5, 10]);
    await grid.dispose();
  });

  it('edits a row in a group; saved, it moves to its new group', async () => {
    const grid = await make({ settings: { editable: true }, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0, showWhenGrouped: true } : c)) });
    const model = (grid as any).model;
    const r = model.rowAt(1) as Row;
    expect(r.id).toBe(1);
    model.writeCell(model.rowIdOf(r), r, 'city', 'izm');
    await model.commit(model.rowIdOf(r));
    await settle();
    expect(lines(grid).filter((l) => l.startsWith('>'))).toEqual(['> City: Ankara (3)', '> City: Bursa (4)', '> City: İzmir (5)']);
    await grid.dispose();
  });
});

describe('grouping options and events', () => {
  it('tells every change of the grouping before (cancellable) and after, from the user and programmatically', async () => {
    const told: string[] = [];
    const grid = await make({
      settings: { groupMenu: true },
      onGroupingChanging: (e) => {
        told.push(`changing ${e.group.map((g) => g.field).join('+')} from ${e.previous.map((g) => g.field).join('+')} ${e.byUser ? 'user' : 'code'}`);
        if (e.group.some((g) => g.field === 'qty')) e.cancel = true;
      },
      onGroupingChanged: (e) => told.push(`changed ${e.group.map((g) => `${g.field} ${g.dir}`).join('+')}`),
    });
    grid.groupBy('city');
    grid.groupBy('status', 0, 'desc');
    grid.groupBy('qty');
    await settle();
    expect(grid.group).toEqual([
      { field: 'status', dir: 'desc' },
      { field: 'city', dir: 'asc' },
    ]);
    grid.setGroupOrder('city', 'desc');
    grid.ungroup('status');
    await settle();
    expect(grid.group).toEqual([{ field: 'city', dir: 'desc' }]);
    expect(told).toEqual([
      'changing city from  code',
      'changed city asc',
      'changing status+city from city code',
      'changed status desc+city asc',
      'changing status+city+qty from status+city code',
      'changing status+city from status+city code',
      'changed status desc+city desc',
      'changing city from status+city code',
      'changed city desc',
    ]);
    await grid.dispose();
  });

  it('lets the app cancel a drop on the group panel', async () => {
    const drops: string[] = [];
    const grid = await make({
      settings: { groupPanel: true, dragThreshold: 20 },
      onGroupDropping: (e) => {
        drops.push(`${e.field} ${e.from}→${e.to} ${e.index}`);
        e.cancel = e.field === 'status';
      },
    });
    const panel = panelOf(grid);
    Object.defineProperty(panel, 'offsetParent', { configurable: true, get: () => document.body });
    // The whole toolbar takes drops for the panel.
    const bar = grid.element.querySelector('.mx-data-grid__toolbar')!;
    rect(bar, { left: 0, top: 0, width: 600, height: 30 });
    const header = (f: string) => grid.element.querySelector<HTMLElement>(`.mx-data-grid__header-cell[data-field="${f}"]`)!;
    // Under the threshold of 20 pixels nothing is dragged.
    pointer(header('status'), 'pointerdown', 350, 25);
    pointer(header('status'), 'pointermove', 360, 15);
    pointer(header('status'), 'pointerup', 360, 15);
    pointer(header('status'), 'pointerdown', 350, 55);
    pointer(header('status'), 'pointermove', 360, 20);
    pointer(header('status'), 'pointerup', 360, 20);
    pointer(header('city'), 'pointerdown', 250, 55);
    pointer(header('city'), 'pointermove', 260, 20);
    pointer(header('city'), 'pointerup', 260, 20);
    await settle();
    expect(drops).toEqual(['status header→panel 0', 'city header→panel 0']);
    expect(grid.group).toEqual([{ field: 'city', dir: 'asc' }]);
    await grid.dispose();
  });

  it('switches per column: collapsing, the count, the expand mode, staying a column, the order of the groups', async () => {
    const order = ['izm', 'ank', 'brs'];
    const grid = await make({
      settings: { allowCollapsing: false, groupCount: false, groupToggleKeys: ['F4'], groupArrowKeys: false },
      columns: columns().map((c) =>
        c.field === 'city'
          ? { ...c, groupIndex: 0, allowCollapsing: true, groupCount: true, groupExpandMode: 'rowClick' as const, showWhenGrouped: true, groupCompare: (a: unknown, b: unknown) => order.indexOf(a as string) - order.indexOf(b as string) }
          : c.field === 'status'
            ? { ...c, groupIndex: 1 }
            : c,
      ),
    });
    expect(lines(grid).filter((l) => !/^\d/.test(l)).slice(0, 3)).toEqual(['> City: İzmir (4)', '>   Status: Draft', '>   Status: Paid']);
    expect(headers(grid)).toContain('city');
    // City: a click on the row closes it (its own switches); Status: the user cannot.
    groupRow(grid, 'İzmir').querySelector<HTMLElement>('.mx-data-grid__group-text')!.click();
    await settle();
    expect(grid.isGroupExpanded(['izm'])).toBe(false);
    const status = grid.element.querySelector<HTMLElement>('.mx-data-grid__group-row[aria-level="2"]:not([hidden])')!;
    status.querySelector<HTMLElement>('.mx-data-grid__group-toggle')!.click();
    await settle();
    expect(status.getAttribute('aria-expanded')).toBe('true');
    // The keys: F4 toggles, Enter and the arrows do not.
    const cell = groupRow(grid, 'Ankara').querySelector<HTMLElement>('.mx-data-grid__group-cell')!;
    cell.focus();
    key(cell, 'Enter');
    key(cell, 'ArrowLeft');
    await settle();
    expect(grid.isGroupExpanded(['ank'])).toBe(true);
    key(cell, 'F4');
    await settle();
    expect(grid.isGroupExpanded(['ank'])).toBe(false);
    await grid.dispose();
  });

  it('groups on the server or in memory as remoteGrouping says, loading every row in parts', async () => {
    const server = new Server({ data: makeRows(30), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 10 });
    const grid = await make({ dataSource: source, rows: undefined, settings: { remoteGrouping: false, groupLoadPageSize: 12 }, columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)) });
    expect(lines(grid).slice(0, 2)).toEqual(['> City: Ankara (10)', '1']);
    expect(server.requests.filter((r) => r.take === 12).map((r) => r.skip)).toEqual([0, 12, 24]);
    expect(server.requests.some((r) => r.groupsOnly)).toBe(false);
    grid.settings.remoteGrouping = 'auto';
    await settle();
    expect(server.requests.some((r) => r.groupsOnly)).toBe(true);
    expect(lines(grid)[0]).toBe('> City: Ankara (10)');
    await grid.dispose();
  });
});
