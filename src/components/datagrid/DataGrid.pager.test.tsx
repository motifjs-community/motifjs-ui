import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridPageSizeChangingEventArgs } from './grid-page-size-changing-event-args';

type Row = { id: number; name: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
];

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}` }));

/** A pretend server that loads by page; every load is recorded. */
class PageAdapter extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];

  protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    return super.loadRows(options);
  }
}

async function settle() {
  for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0));
}

function layout(grid: DataGrid<any>, viewport = 2000) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
}

async function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(95), mode: 'paged', pageSize: 20, label: 'Orders', ...props } as DataGridProps<Row>));
  layout(grid);
  await settle();
  return grid;
}

const pager = (grid: DataGrid<any>) => grid.element.querySelector('.mx-data-grid__pager') as HTMLElement;
const pagerOf = (grid: DataGrid<any>) => (grid as any).pager;
const shownIds = (grid: DataGrid<Row>) => grid.getVisibleRows().filter((r) => r.rowType === 'data').map((r) => r.row!.id);
const info = (grid: DataGrid<any>) => grid.element.querySelector('.mx-data-grid__page-info')?.textContent ?? null;
const sizeButtons = (grid: DataGrid<any>) => [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__page-size')];
const pageButtons = (grid: DataGrid<any>) => [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__page')].map((b) => b.textContent);
const shown = (el: Element | null) => !!el && (el as HTMLElement).style.display !== 'none' && !(el as HTMLElement).hidden;
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('DataGrid pager', () => {
  it('offers the page sizes as buttons and shows as many rows, back on the first page, with the info text', async () => {
    const grid = await make({ settings: { pageSizeSelector: true, allowedPageSizes: [10, 25, 'all'] } });
    const nav = pager(grid);
    expect(nav.tagName).toBe('NAV');
    expect(nav.getAttribute('aria-label')).toBe('Pages: Orders');
    expect(info(grid)).toBe('Page 1 of 5 (95 items)');
    expect(sizeButtons(grid).map((b) => b.textContent)).toEqual(['10', '25', 'All']);
    expect(grid.element.querySelector('.mx-data-grid__page-sizes')!.getAttribute('aria-label')).toBe('Rows per page');
    // 20 is not among them: none is pressed.
    expect(sizeButtons(grid).map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false']);
    grid.page = 2;
    await settle();
    sizeButtons(grid)[1].click();
    await settle();
    expect([grid.pageSize(), grid.pageIndex(), grid.pageCount, grid.totalCount()]).toEqual([25, 0, 4, 95]);
    expect(shownIds(grid)).toHaveLength(25);
    expect(info(grid)).toBe('Page 1 of 4 (95 items)');
    expect(sizeButtons(grid).map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    expect(pageButtons(grid)).toEqual(['1', '2', '3', '4']);
    // "All": one page with every row.
    sizeButtons(grid)[2].click();
    await settle();
    expect([grid.pageSize(), grid.pageCount]).toEqual([0, 1]);
    expect(shownIds(grid)).toHaveLength(95);
    expect(info(grid)).toBe('Page 1 of 1 (95 items)');
    await grid.dispose();
  });

  it('works out the sizes from the page size by default, and turns the pager on only for pages with auto', async () => {
    const grid = await make({ settings: { pageSizeSelector: true } });
    expect(sizeButtons(grid).map((b) => b.textContent)).toEqual(['10', '20', '40']);
    expect(sizeButtons(grid)[1].getAttribute('aria-pressed')).toBe('true');
    grid.settings.pager = 'auto';
    await settle();
    expect(pager(grid).hidden).toBe(false);
    grid.pageSize(100);
    await settle();
    expect(pager(grid).hidden).toBe(true);
    grid.settings.pager = true;
    await settle();
    expect(pager(grid).hidden).toBe(false);
    grid.settings.pageSizeSelector = false;
    await settle();
    expect(shown(grid.element.querySelector('.mx-data-grid__page-sizes'))).toBe(false);
    await grid.dispose();
  });

  it('asks before the page size changes, tells after, and keeps the page events', async () => {
    const asked: GridPageSizeChangingEventArgs[] = [];
    const told: string[] = [];
    let keep = true;
    const grid = await make({
      onPageSizeChanging: (e) => {
        asked.push({ ...e });
        e.cancel = keep;
      },
      onPageSizeChanged: (e) => told.push(`size ${e.previous}→${e.pageSize}`),
      onPageChanged: (e) => told.push(`page ${e.previous}→${e.page}`),
    });
    grid.page = 3;
    await settle();
    grid.pageSize(50);
    await settle();
    expect([grid.pageSize(), grid.page]).toEqual([20, 3]);
    expect(asked).toEqual([expect.objectContaining({ pageSize: 50, previous: 20 })]);
    keep = false;
    grid.pageSize(50);
    await settle();
    expect([grid.pageSize(), grid.page]).toEqual([50, 0]);
    expect(told).toEqual(['page 0→3', 'page 3→0', 'size 20→50']);
    grid.pageIndex(1);
    expect(grid.pageIndex()).toBe(1);
    await grid.dispose();
  });

  it('fills the info text from pagerInfoText and names the pager from pagerLabel, in the locale', async () => {
    const grid = await make({ settings: { pagerInfoText: '{0}/{1} · {2} rows · page {page}' } });
    expect(info(grid)).toBe('1/5 · 95 rows · page 1');
    grid.settings.pagerLabel = 'Order pages';
    await settle();
    expect(pager(grid).getAttribute('aria-label')).toBe('Order pages');
    grid.settings.pagerInfoText = '';
    await uiLocale.use('tr');
    await settle();
    expect(info(grid)).toBe('Sayfa 1 / 5 (95 kayıt)');
    expect(grid.element.querySelector('.mx-data-grid__page')!.getAttribute('aria-label')).toBe('Sayfa 1');
    await grid.dispose();
  });

  it('marks the current page and keeps focus on a pressed page button', async () => {
    const grid = await make();
    const second = [...grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__page')][1];
    expect(second.getAttribute('aria-label')).toBe('Page 2');
    second.focus();
    second.click();
    await settle();
    expect(grid.page).toBe(1);
    expect(second.getAttribute('aria-current')).toBe('page');
    expect(document.activeElement).toBe(second);
    expect(shownIds(grid)[0]).toBe(21);
    await grid.dispose();
  });

  it('shows a page number box and a drop-down of the sizes in the compact look', async () => {
    const grid = await make({ settings: { pagerDisplayMode: 'compact', pageSizeSelector: true, allowedPageSizes: [10, 20, 'all'] } });
    const nav = pager(grid);
    expect(nav.getAttribute('data-look')).toBe('compact');
    expect(shown(grid.element.querySelector('.mx-data-grid__pages'))).toBe(false);
    expect(shown(grid.element.querySelector('.mx-data-grid__page-info'))).toBe(false);
    expect(shown(grid.element.querySelector('.mx-data-grid__page-jump'))).toBe(true);
    expect(grid.element.querySelector('.mx-data-grid__page-jump')!.textContent).toContain('of 5');
    const box = pagerOf(grid).pageBox;
    const input = box.element.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-label') ?? box.label).toBeTruthy();
    input.focus();
    input.value = '4';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    key(input, 'Enter');
    await settle();
    expect(grid.page).toBe(3);
    expect(shownIds(grid)[0]).toBe(61);
    const list = pagerOf(grid).sizeList;
    list.open();
    await settle();
    const option = [...list.dropParts.list.element.querySelectorAll('[role="option"]')].find((o: HTMLElement) => o.textContent === 'All') as HTMLElement;
    option.click();
    await settle();
    expect([grid.pageSize(), grid.page]).toEqual([0, 0]);
    expect(shownIds(grid)).toHaveLength(95);
    grid.settings.pagerDisplayMode = 'full';
    await settle();
    expect(nav.getAttribute('data-look')).toBe('full');
    expect(shown(grid.element.querySelector('.mx-data-grid__pages'))).toBe(true);
    await grid.dispose();
  });

  it('is compact while the full pager does not fit in the bar (adaptive), and full again when it does', async () => {
    const grid = await make();
    const nav = pager(grid);
    const bar = nav.parentElement!;
    let room = 800;
    Object.defineProperty(bar, 'clientWidth', { configurable: true, get: () => room });
    Object.defineProperty(nav, 'scrollWidth', { configurable: true, get: () => (nav.dataset.look === 'full' ? 500 : 200) });
    pagerOf(grid).fit();
    expect(nav.dataset.look).toBe('full');
    room = 400;
    pagerOf(grid).fit();
    await settle();
    expect(nav.dataset.look).toBe('compact');
    room = 450;
    pagerOf(grid).fit();
    await settle();
    expect(nav.dataset.look).toBe('compact');
    room = 600;
    pagerOf(grid).fit();
    await settle();
    expect(nav.dataset.look).toBe('full');
    await grid.dispose();
  });

  it('turns the page with PageDown and PageUp, or moves rows with pageKeys "rows"', async () => {
    const grid = await make();
    const cell = grid.getCellPart(0, 'name')!.element;
    cell.focus();
    await settle();
    key(cell, 'PageDown');
    await settle();
    expect(grid.page).toBe(1);
    expect(grid.focusedRowIndex).toBe(20);
    expect(document.activeElement).toBe(grid.getCellPart(20, 'name')?.element);
    key(document.activeElement!, 'PageUp');
    await settle();
    expect(grid.page).toBe(0);
    grid.settings.pageKeys = 'rows';
    key(document.activeElement!, 'PageDown');
    await settle();
    expect(grid.page).toBe(0);
    expect(grid.focusedRowIndex).toBeGreaterThan(0);
    await grid.dispose();
  });

  it('asks a server that loads by page for pages of the new size, and for every row with "all"', async () => {
    const adapter = new PageAdapter({ data: makeRows(95), key: 'id' });
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'page', pageSize: 20 });
    const grid = await make({ rows: undefined, dataSource: source });
    expect(adapter.requests.at(-1)).toMatchObject({ skip: 0, take: 20 });
    grid.pageSize(30);
    await settle();
    expect(adapter.requests.at(-1)).toMatchObject({ skip: 0, take: 30 });
    expect([source.pageSize, grid.pageCount, shownIds(grid).length]).toEqual([30, 4, 30]);
    grid.page = 3;
    await settle();
    expect(adapter.requests.at(-1)).toMatchObject({ skip: 90, take: 30 });
    expect(shownIds(grid)).toEqual([91, 92, 93, 94, 95]);
    grid.pageSize(0);
    await settle();
    expect(adapter.requests.at(-1)?.take).toBeUndefined();
    expect([grid.pageCount, shownIds(grid).length]).toEqual([1, 95]);
    await grid.dispose();
    source.dispose();
  });

  it('keeps the page size with the layout and in the state', async () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
    const grid = await make({ layoutKey: 'pager', layoutStorage: storage });
    grid.pageSize(40);
    await settle();
    expect(JSON.parse([...store.values()][0]).pageSize).toBe(40);
    expect(grid.state()).toMatchObject({ page: 0, pageSize: 40 });
    await grid.dispose();
    const again = await make({ layoutKey: 'pager', layoutStorage: storage });
    expect([again.pageSize(), again.pageCount]).toEqual([40, 3]);
    again.state({ pageSize: 10, page: 2 });
    await settle();
    expect([again.pageSize(), again.page, shownIds(again)[0]]).toEqual([10, 2, 21]);
    await again.dispose();
  });
});
