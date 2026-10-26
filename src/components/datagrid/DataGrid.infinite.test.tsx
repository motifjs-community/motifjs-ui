import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridMoreRowsLoadedEventArgs } from './grid-more-rows-loaded-event-args';
import type { GridMoreRowsLoadingEventArgs } from './grid-more-rows-loading-event-args';

type Row = { id: number; name: string; city: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number' },
  { field: 'name', title: 'Name' },
  { field: 'city', title: 'City' },
];

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, city: i % 2 ? 'Oslo' : 'Rome' }));

/** A pretend server that cannot count; every load is recorded, and loads can be held or failed. */
class PartAdapter extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  hold = false;
  failWith: Error | null = null;
  private waiting: (() => void)[] = [];

  constructor(rows: Row[]) {
    super({ data: rows, key: 'id', capabilities: { count: false } });
  }

  release() {
    for (const go of this.waiting.splice(0)) go();
  }

  protected override async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    if (this.hold) await new Promise<void>((go) => this.waiting.push(go));
    if (this.failWith) throw this.failWith;
    return super.loadRows(options);
  }
}

async function settle() {
  for (let i = 0; i < 8; i++) await new Promise((r) => setTimeout(r, 0));
}

function make(props: Partial<DataGridProps<Row>> = {}, viewport = 360) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(95), mode: 'infinite', pageSize: 20, rowHeight: 36, label: 'Orders', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  Object.defineProperty(vp, 'clientWidth', { configurable: true, get: () => 800 });
  (grid as any).measure();
  return {
    grid,
    vp,
    /** Scrolls to the last row shown now. */
    async toEnd() {
      vp.scrollTop = grid.total * 36;
      vp.dispatchEvent(new Event('scroll'));
      await settle();
    },
  };
}

const serverGrid = (adapter: PartAdapter, props: Partial<DataGridProps<Row>> = {}) =>
  make({ rows: undefined, dataSource: new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 20, count: false }), ...props });

const more = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__load-more')!;
const shows = (el: HTMLElement | null) => !!el && el.style.display !== 'none';
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

afterEach(() => {
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

describe('DataGrid infinite mode', () => {
  it('shows rows in memory part by part as the view reaches the end, and tells each part', async () => {
    const loading: GridMoreRowsLoadingEventArgs[] = [];
    const loaded: GridMoreRowsLoadedEventArgs[] = [];
    const { grid, toEnd } = make({ onMoreRowsLoading: (e) => loading.push({ ...e }), onMoreRowsLoaded: (e) => loaded.push({ ...e }) });
    await settle();
    expect([grid.dataSource.loadMode, grid.total, grid.endReached, grid.pageCount, grid.totalCount()]).toEqual(['all', 20, false, 5, 95]);
    expect(grid.element.querySelector('.mx-data-grid__pager')?.closest('[hidden], [style*="display: none"]') ?? null).not.toBeNull();
    await toEnd();
    expect([grid.total, loading.map((e) => [e.skip, e.take])]).toEqual([40, [[20, 20]]]);
    expect(loaded).toEqual([{ skip: 20, count: 20, ended: false }]);
    await toEnd();
    await toEnd();
    await toEnd();
    expect([grid.total, grid.endReached, grid.page]).toEqual([95, true, 4]);
    expect(loaded.at(-1)).toEqual({ skip: 80, count: 15, ended: true });
    // At the end nothing more is asked for.
    expect(grid.loadMore()).toBe(false);
    expect(grid.element.querySelector('.mx-data-grid__viewport')!.getAttribute('aria-rowcount')).toBe('96');
  });

  it('keeps the rows as they are while onMoreRowsLoading cancels, and loads from code', async () => {
    let allow = false;
    const { grid, toEnd } = make({ onMoreRowsLoading: (e) => (e.cancel = !allow) });
    await settle();
    await toEnd();
    expect(grid.total).toBe(20);
    expect(grid.loadMore()).toBe(false);
    allow = true;
    expect(grid.loadMore()).toBe(true);
    await settle();
    expect(grid.total).toBe(40);
    // The settings: a distance from the end, and one part ahead.
    grid.settings.loadMoreDistance = 25;
    await toEnd();
    // 40 rows in view's end: parts come until more than 25 rows are left below it.
    expect(grid.total).toBe(80);
  });

  it('loads blocks part by part without a count, finds the end from a short part and shows the mark while one loads', async () => {
    const adapter = new PartAdapter(makeRows(45));
    const { grid, toEnd } = serverGrid(adapter);
    await settle();
    expect([grid.total, grid.totalCount(), grid.endReached]).toEqual([20, -1, false]);
    expect(adapter.requests.map((r) => [r.skip, r.take, r.count])).toEqual([[0, 20, undefined]]);
    expect(grid.element.querySelector('.mx-data-grid__count')!.textContent).toBe('20 records loaded');
    expect(grid.element.querySelector('.mx-data-grid__viewport')!.getAttribute('aria-rowcount')).toBe('-1');
    adapter.hold = true;
    await toEnd();
    expect([grid.loadingMore, shows(more(grid)), more(grid).textContent]).toEqual([true, true, 'Loading more rows…']);
    // The scroll bar has room for the mark under the last row.
    expect(parseFloat(grid.element.querySelector<HTMLElement>('.mx-data-grid__body')!.style.height)).toBe(21 * 36);
    adapter.hold = false;
    adapter.release();
    await settle();
    expect([grid.total, grid.loadingMore, shows(more(grid))]).toEqual([40, false, false]);
    await toEnd();
    expect([grid.total, grid.endReached, grid.totalCount()]).toEqual([45, true, 45]);
    expect(adapter.requests.map((r) => r.skip)).toEqual([0, 20, 40]);
    expect(grid.element.querySelector('.mx-data-grid__count')!.textContent).toBe('45 records');
    await toEnd();
    expect(adapter.requests).toHaveLength(3);
  });

  it('shows Retry when a part fails and loads it again', async () => {
    const adapter = new PartAdapter(makeRows(60));
    const { grid, toEnd } = serverGrid(adapter);
    await settle();
    adapter.failWith = new Error('Timeout');
    await toEnd();
    expect([grid.total, grid.status, more(grid).dataset.state, more(grid).textContent]).toEqual([20, 'ready', 'failed', 'Could not load more rows.Retry']);
    // A failed part is not asked for again by scrolling, only by Retry.
    await toEnd();
    expect(adapter.requests).toHaveLength(2);
    adapter.failWith = null;
    // Retry asks onMoreRowsLoading first.
    let asked = 0;
    const stop = grid.onMoreRowsLoading((e) => {
      asked++;
      e.cancel = asked === 1;
    });
    more(grid).querySelector('button')!.click();
    await settle();
    expect([asked, grid.total, more(grid).dataset.state]).toEqual([1, 20, 'failed']);
    more(grid).querySelector('button')!.click();
    await settle();
    expect([asked, grid.total, shows(more(grid))]).toEqual([2, 40, false]);
    stop.dispose();
  });

  it('starts again from the first part when the sort, the filter or the search changes', async () => {
    const adapter = new PartAdapter(makeRows(100));
    const { grid, vp, toEnd } = serverGrid(adapter, { settings: { searchPanel: true, filterRow: true } });
    await settle();
    await toEnd();
    await toEnd();
    expect(grid.total).toBe(60);
    grid.sort = [{ field: 'id', dir: 'desc' }];
    await settle();
    expect([grid.total, vp.scrollTop, grid.getVisibleRows()[0].row?.id]).toEqual([20, 0, 100]);
    await toEnd();
    expect(grid.total).toBe(40);
    grid.filters = { city: { value: 'Oslo' } };
    await settle();
    await settle();
    expect(grid.total).toBe(20);
    expect(grid.getVisibleRows().every((r) => r.row?.city === 'Oslo')).toBe(true);
    await toEnd();
    await toEnd();
    expect([grid.total, grid.endReached]).toEqual([50, true]);
    grid.searchByText('Name 9');
    await settle();
    await settle();
    expect([grid.total, vp.scrollTop, grid.endReached]).toEqual([5, 0, true]);
  });

  it('goes to the last row shown with Ctrl+End and loads the next part', async () => {
    const { grid } = make();
    await settle();
    grid.focusCell(0, 'name');
    const cell = grid.getCellElement(0, 'name')!;
    key(cell, 'End', { ctrlKey: true });
    await settle();
    expect(grid.focusedRowIndex).toBe(19);
    expect(grid.total).toBe(40);
    key(document.activeElement!, 'End', { ctrlKey: true });
    await settle();
    expect(grid.focusedRowIndex).toBe(39);
  });

  it('keeps focus, selection, the row in edit and grouping working while parts come', async () => {
    const { grid, vp, toEnd } = make({ settings: { selection: 'multiple', editable: true } });
    await settle();
    grid.selectRow(grid.getVisibleRows()[2].row!);
    grid.focusCell(3, 'name');
    grid.editCell(3, 'name');
    await settle();
    await toEnd();
    expect(grid.total).toBe(40);
    expect([grid.selectedKeys, grid.editingCell?.field, grid.focusedRowIndex]).toEqual([[3], 'name', 3]);
    grid.cancelEditData();
    // Grouped, the parts count group rows and rows alike: the second group shows once its part does.
    grid.groupBy('city');
    await settle();
    const groups = () => grid.getVisibleRows().filter((r) => r.rowType === 'group').map((r) => r.groupKey![0]);
    expect([grid.total, groups()]).toEqual([95, ['Oslo']]);
    await toEnd();
    await toEnd();
    vp.scrollTop = 44 * 36;
    vp.dispatchEvent(new Event('scroll'));
    await settle();
    expect(groups()).toEqual(['Rome']);
  });

  it('takes its texts from uiLocale and keeps open details while parts come', async () => {
    uiLocale.strings = trStrings;
    const adapter = new PartAdapter(makeRows(60));
    const { grid, toEnd } = serverGrid(adapter, { masterDetail: { enabled: true, height: 72, template: (ctx) => document.createTextNode(`detail ${ctx.key}`) } });
    await settle();
    expect(grid.element.querySelector('.mx-data-grid__count')!.textContent).toBe('20 kayıt yüklendi');
    expect(grid.expandRow(2)).toBe(true);
    await settle();
    expect(grid.isRowExpanded(2)).toBe(true);
    adapter.hold = true;
    await toEnd();
    expect(more(grid).textContent).toBe('Daha fazla satır yükleniyor…');
    adapter.hold = false;
    adapter.release();
    await settle();
    expect([grid.total, grid.isRowExpanded(2)]).toEqual([40, true]);
    // The open detail adds its height to the scroll bar, with the rows that came.
    expect(parseFloat(grid.element.querySelector<HTMLElement>('.mx-data-grid__body')!.style.height)).toBe(40 * 36 + 72);
  });

  it('loads up to a part with pageIndex(n)', async () => {
    const adapter = new PartAdapter(makeRows(100));
    const { grid } = serverGrid(adapter);
    await settle();
    grid.pageIndex(3);
    await settle();
    await settle();
    expect([grid.total, grid.pageIndex()]).toEqual([80, 3]);
  });
});
