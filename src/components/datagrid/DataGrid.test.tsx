import { ComponentBase, disposableCore, reactive, type IDisposable } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', width: 80, sticky: 'start' },
  { field: 'name', title: 'Name', flex: 1 },
  { field: 'amount', title: 'Amount', type: 'number' },
];

const makeRows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Name ${n - i}`, amount: (i * 37) % 1000 }));

/** Rows of a pretend server, made when asked for; every load is recorded. */
class RangeAdapter extends data.DataAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  gate: Promise<void> | null = null;

  constructor(private readonly size: number) {
    super({ key: 'id' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: false, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: false, update: false, remove: false };
  }

  protected async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Row>> {
    this.requests.push(options);
    if (this.gate) await this.gate;
    const skip = options.skip ?? 0;
    const take = Math.max(0, Math.min(options.take ?? this.size, this.size - skip));
    const rows = Array.from({ length: take }, (_, i) => ({ id: skip + i + 1, name: `n${skip + i}`, amount: i }));
    return { rows, total: options.count ? this.size : undefined };
  }
}

/** Lets every pending load and reactive update finish. */
async function settle() {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
}

/** jsdom has no layout: give the viewport a scroll position and a height. */
function layout(grid: DataGrid<any>, viewport = 360) {
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  let top = 0;
  Object.defineProperty(vp, 'scrollTop', { configurable: true, get: () => top, set: (v: number) => (top = Math.max(0, v)) });
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => viewport });
  (grid as any).measure();
  return {
    vp,
    scrollTo(px: number) {
      vp.scrollTop = px;
      vp.dispatchEvent(new Event('scroll'));
    },
  };
}

/** Counts live components through the disposable tracker. */
function trackComponents() {
  let alive = 0;
  const seen = new WeakSet<IDisposable>();
  const previous = disposableCore.disposableTracker;
  disposableCore.disposableTracker = {
    trackDisposable(x) {
      if (x instanceof ComponentBase) alive++;
    },
    markAsDisposed(x) {
      if (!(x instanceof ComponentBase) || seen.has(x)) return;
      seen.add(x);
      alive--;
    },
    setParent() {},
    markAsSingleton() {},
  };
  return {
    get alive() {
      return alive;
    },
    stop() {
      disposableCore.disposableTracker = previous;
    },
  };
}

/** Header cells of data columns (the row status column is there too, hidden while nothing is editable). */
const DATA = ':not([data-field^="mx:"])';

/** The shown body rows in reading order (the order the rowgroup gives with `aria-owns`). */
const readingRows = (grid: DataGrid<any>) => {
  const body = grid.element.querySelector('.mx-data-grid__body')!;
  return (body.getAttribute('aria-owns') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => body.querySelector<HTMLElement>(`#${id}`)!)
    .filter((row) => !row.hidden);
};
const rowEls = readingRows;
const cellText = (row: HTMLElement, field: string) => row.querySelector(`[data-field="${field}"]`)!.textContent;
const header = (grid: DataGrid<any>, f: string) => grid.element.querySelector(`[role="columnheader"][data-field="${f}"]`) as HTMLElement;
const key = (el: Element, k: string, init: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));

afterEach(() => {
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

describe('DataGrid', () => {
  it('renders a grid with headers in display order', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(5), label: 'Orders' }));
    layout(grid);
    await settle();
    const vp = grid.element.querySelector('[role="grid"]')!;
    expect(vp.getAttribute('aria-label')).toBe('Orders');
    expect(vp.getAttribute('aria-rowcount')).toBe('6');
    const headers = [...grid.element.querySelectorAll(`[role="columnheader"]${DATA}`)].map((h) => h.textContent!.trim());
    expect(headers).toEqual(['Id', 'Name', 'Amount']);
    expect(rowEls(grid)).toHaveLength(5);
    expect(cellText(rowEls(grid)[0], 'name')).toBe('Name 5');
    expect(grid.element.querySelector('.mx-data-grid__count')!.textContent).toBe('5 records');
    await grid.dispose();
  });

  it('is the same from JSX, with getter props followed', async () => {
    const state = reactive({ rows: makeRows(3), label: 'First', striped: false });
    let grid!: DataGrid<Row>;
    const host = mountHost(
      <DataGrid ref={(g: DataGrid<Row>) => (grid = g)} rowKey="id" columns={columns} rows={() => state.rows} label={() => state.label} settings={{ striped: () => state.striped }} />,
    );
    layout(grid);
    await settle();
    expect(rowEls(grid)).toHaveLength(3);
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('First');
    state.label = 'Second';
    state.striped = true;
    state.rows = makeRows(7);
    await settle();
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('Second');
    expect(grid.element.hasAttribute('data-striped')).toBe(true);
    expect(grid.settings.striped).toBe(true);
    expect(grid.total).toBe(7);
    await host.dispose();
  });

  it('keeps the DOM small for 100,000 rows and reuses rows while scrolling', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(100_000), rowHeight: 36 }));
    const { scrollTo } = layout(grid, 360);
    await settle();
    // 10 visible rows + 4 below at the top.
    expect(rowEls(grid)).toHaveLength(14);
    const poolSize = () => (grid as any).body.pool.length;

    scrollTo(36 * 50_000);
    await tick();
    // 4 above + 10 + 4 below, plus the active row (row 1) kept for focus.
    const settled = poolSize();
    expect(settled).toBe(19);
    const indices = rowEls(grid).map((r) => Number(r.getAttribute('aria-rowindex')));
    expect(indices.filter((i) => i !== 2).every((i) => i > 49_990 && i < 50_020)).toBe(true);
    const r = rowEls(grid).find((el) => el.getAttribute('aria-rowindex') === String(50_000 + 2))!;
    expect(cellText(r, 'id')).toBe('50001');

    for (const px of [36 * 10, 36 * 99_990, 36 * 77_777, 0]) {
      scrollTo(px);
      await tick();
    }
    expect(poolSize()).toBe(settled);
    expect(grid.element.querySelectorAll(`.mx-data-grid__body .mx-data-grid__cell${DATA}`)).toHaveLength(settled * columns.length);
    await grid.dispose();
  });

  it('gives assistive technology the rows in row order', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(1000), rowHeight: 36 }));
    const { scrollTo } = layout(grid, 360);
    await settle();
    for (const px of [36 * 7, 36 * 3, 36 * 400, 36 * 399]) {
      scrollTo(px);
      await tick();
      const idx = rowEls(grid).map((r) => Number(r.getAttribute('aria-rowindex')));
      expect(idx).toEqual([...idx].sort((a, b) => a - b));
    }
    await grid.dispose();
  });

  it('sorts from the header and reports the layout change', async () => {
    const onLayoutChange = vi.fn();
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(20), onLayoutChange }));
    layout(grid);
    await settle();
    const nameHeader = header(grid, 'name');
    nameHeader.click();
    await settle();
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(nameHeader.dataset.sort).toBe('asc');
    expect(cellText(rowEls(grid)[0], 'name')).toBe('Name 1');
    expect(onLayoutChange).toHaveBeenLastCalledWith(expect.objectContaining({ sort: [{ field: 'name', dir: 'asc' }] }));
    nameHeader.click();
    await settle();
    expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
    expect(cellText(rowEls(grid)[0], 'name')).toBe('Name 20');
    nameHeader.click();
    await settle();
    expect(nameHeader.hasAttribute('aria-sort')).toBe(false);
    expect(grid.dataSource.sort).toEqual([]);
    await grid.dispose();
  });

  it('is one tab stop and moves with the arrow keys', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(100_000), rowHeight: 36 }));
    layout(grid, 360);
    await settle();
    const tabbable = () => [...grid.element.querySelectorAll('[tabindex="0"]')] as HTMLElement[];
    expect(tabbable()).toHaveLength(1);
    const first = tabbable()[0];
    expect(first.dataset.field).toBe('id');
    expect(first.closest('.mx-data-grid__row')!.getAttribute('aria-rowindex')).toBe('2');

    first.focus();
    key(first, 'ArrowRight');
    key(document.activeElement!, 'ArrowDown');
    await tick();
    let active = document.activeElement as HTMLElement;
    expect(active.dataset.field).toBe('name');
    expect(active.closest('.mx-data-grid__row')!.getAttribute('aria-rowindex')).toBe('3');

    key(active, 'End', { ctrlKey: true });
    await tick();
    active = document.activeElement as HTMLElement;
    expect(active.dataset.field).toBe('amount');
    expect(active.closest('.mx-data-grid__row')!.getAttribute('aria-rowindex')).toBe(String(100_000 + 1));
    expect(tabbable()).toEqual([active]);

    key(active, 'Home', { ctrlKey: true });
    key(document.activeElement!, 'ArrowUp');
    await tick();
    active = document.activeElement as HTMLElement;
    expect(active.getAttribute('role')).toBe('columnheader');
    expect(active.dataset.field).toBe('id');
    await grid.dispose();
  });

  it('keeps the focused row in the DOM when it scrolls out of view', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(10_000), rowHeight: 36 }));
    const { scrollTo } = layout(grid, 360);
    await settle();
    const cell = grid.element.querySelector('[tabindex="0"]') as HTMLElement;
    cell.focus();
    scrollTo(36 * 5000);
    await tick();
    expect(document.activeElement).toBe(cell);
    expect(cell.isConnected).toBe(true);
    expect(cell.closest('.mx-data-grid__row')!.getAttribute('aria-rowindex')).toBe('2');
    await grid.dispose();
  });

  it('resizing a column touches no row', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(50), rowHeight: 36 }));
    const { vp } = layout(grid);
    await settle();
    const before = rowEls(grid);
    const cellsBefore = before.map((r) => r.querySelector('[data-field="amount"]'));
    (grid as any).model.columns.resize('amount', 222);
    await tick();
    expect(vp.style.getPropertyValue('--_columns')).toContain('222px');
    expect(rowEls(grid)).toEqual(before);
    expect(rowEls(grid).map((r) => r.querySelector('[data-field="amount"]'))).toEqual(cellsBefore);
    await grid.dispose();
  });

  it('moves and hides columns through the model and renumbers the cells', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(5) }));
    layout(grid);
    await settle();
    const cols = (grid as any).model.columns;
    cols.move('amount', 0);
    await tick();
    const headerFields = () => [...grid.element.querySelectorAll(`[role="columnheader"]${DATA}`)].map((h) => (h as HTMLElement).dataset.field);
    expect(headerFields()).toEqual(['id', 'amount', 'name']);
    expect([...rowEls(grid)[0].querySelectorAll(`.mx-data-grid__cell${DATA}`)].map((c) => (c as HTMLElement).dataset.field)).toEqual(['id', 'amount', 'name']);
    cols.setHidden('name', true);
    await tick();
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-colcount')).toBe('2');
    expect(rowEls(grid)[0].querySelector('[data-field="name"]')!.hasAttribute('aria-colindex')).toBe(false);
    expect(grid.layout.columns.find((c) => c.field === 'name')!.hidden).toBe(true);
    await grid.dispose();
  });

  it('follows push on a reactive local array, and changes of its rows', async () => {
    const state = reactive({ rows: makeRows(3) });
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: () => state.rows }));
    layout(grid);
    await settle();
    state.rows.push({ id: 99, name: 'New', amount: 1 });
    await settle();
    expect(grid.total).toBe(4);
    expect(rowEls(grid)).toHaveLength(4);
    state.rows[0].name = 'Changed';
    await tick();
    expect(cellText(rowEls(grid)[0], 'name')).toBe('Changed');
    await grid.dispose();
  });

  it('pages a data source and asks for one page at a time', async () => {
    const adapter = new RangeAdapter(1234);
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'page', pageSize: 50 });
    const grid = mount(new DataGrid<Row>({ columns, dataSource: source }));
    layout(grid);
    await vi.waitFor(() => expect(grid.total).toBe(1234));
    await tick();
    expect(grid.pageCount).toBe(25);
    expect(rowEls(grid)).toHaveLength(50);
    const last = grid.element.querySelector('.mx-data-grid__page-step[data-step="last"]') as HTMLButtonElement;
    last.click();
    await vi.waitFor(() => expect(rowEls(grid)).toHaveLength(34));
    await settle();
    expect(adapter.requests.map((r) => r.skip ?? 0)).toEqual([0, 1200]);
    expect(cellText(rowEls(grid)[0], 'id')).toBe('1201');
    expect(grid.element.querySelector('.mx-data-grid__page-info')!.textContent).toBe('Page 25 of 25 (1,234 items)');
    const current = grid.element.querySelector('.mx-data-grid__page[aria-current="page"]')!;
    expect(current.textContent).toBe('25');
    await grid.dispose();
    source.dispose();
  });

  it('shows loading, then empty', async () => {
    const adapter = new RangeAdapter(0);
    let open!: () => void;
    adapter.gate = new Promise<void>((r) => (open = r));
    const source = new data.DataSource<Row, number>({ adapter, loadMode: 'blocks', pageSize: 100 });
    const grid = mount(new DataGrid<Row>({ columns, dataSource: source }));
    layout(grid);
    await tick();
    const visibleStates = () => [...grid.element.querySelectorAll('.mx-data-grid__state')].filter((el) => el.isConnected).map((el) => el.textContent?.trim());
    expect(visibleStates()).toContain('Loading…');
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-busy')).toBe('true');
    open();
    await vi.waitFor(() => expect(visibleStates()).toEqual(['No records']));
    await grid.dispose();
    source.dispose();
  });

  it('round-trips the layout', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(5) }));
    layout(grid);
    await settle();
    const saved = grid.layout;
    saved.columns.reverse();
    saved.columns[0].width = 300;
    saved.sort = [{ field: 'amount', dir: 'desc' }];
    grid.layout = saved;
    await settle();
    expect(grid.layout.columns.map((c) => c.field)).toEqual(['amount', 'name', 'id']);
    expect(grid.sort).toEqual([{ field: 'amount', dir: 'desc' }]);
    grid.resetLayout();
    expect(grid.layout.columns.map((c) => c.field)).toEqual(['id', 'name', 'amount']);
    await grid.dispose();
  });

  it('follows the settings and the column values live', async () => {
    const grid = mount(
      new DataGrid<Row>({
        rowKey: 'id',
        columns: [columns[0], { ...columns[1], resizable: true }, columns[2]],
        rows: makeRows(5),
        settings: { resizable: false, menu: false },
      }),
    );
    layout(grid);
    await settle();
    const shows = (el: Element | null) => !!el && (el as HTMLElement).style.display !== 'none';
    expect(shows(header(grid, 'id').querySelector('.mx-data-grid__resize'))).toBe(false);
    expect(shows(header(grid, 'name').querySelector('.mx-data-grid__resize'))).toBe(true);
    expect(shows(header(grid, 'id').querySelector('.mx-data-grid__menu-button'))).toBe(false);

    // Alt+ArrowDown opens no menu while the menu is off.
    header(grid, 'id').focus();
    key(header(grid, 'id'), 'ArrowDown', { altKey: true });
    expect((grid as any).menu.opened).toBe(false);

    grid.settings.menu = true;
    grid.columnSettings('amount').menu = false;
    await tick();
    expect(shows(header(grid, 'id').querySelector('.mx-data-grid__menu-button'))).toBe(true);
    expect(shows(header(grid, 'amount').querySelector('.mx-data-grid__menu-button'))).toBe(false);

    // Sorting off: no click sort, no sortable look.
    grid.settings.sortable = false;
    await tick();
    expect(header(grid, 'name').hasAttribute('data-sortable')).toBe(false);
    header(grid, 'name').click();
    await settle();
    expect(grid.sort).toEqual([]);
    grid.columnSettings('name').sortable = true;
    await tick();
    header(grid, 'name').click();
    await settle();
    expect(grid.sort).toEqual([{ field: 'name', dir: 'asc' }]);

    // Striped rows and the row count.
    grid.settings.striped = true;
    grid.settings.rowCount = false;
    await tick();
    expect(grid.element.hasAttribute('data-striped')).toBe(true);
    expect(shows(grid.element.querySelector('.mx-data-grid__count'))).toBe(false);
    await grid.dispose();
  });

  it('leaves out the menu entries of features that are off', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(5), settings: { pinnable: false, columnChooser: false, layoutReset: false } }));
    layout(grid);
    await settle();
    const menu = (grid as any).menu;
    const texts = () => [...menu.list.element.querySelectorAll('[role^="menuitem"]')].map((el: Element) => el.textContent);
    (grid as any).openMenu('name', grid.element.querySelector('[data-field="name"] .mx-data-grid__menu-button'));
    expect(menu.opened).toBe(true);
    expect(texts()).not.toContain('Pin to start');
    expect(texts()).not.toContain('Reset layout');
    expect(texts()).toContain('Sort ascending');
    expect(texts()).toContain('Hide column');
    menu.close();
    grid.settings.sortable = false;
    grid.settings.hideable = false;
    grid.settings.movable = false;
    grid.settings.resizable = false;
    await tick();
    // Nothing left to do: the button goes away and Alt+ArrowDown does nothing.
    expect((grid as any).hasMenu('name')).toBe(false);
    expect(grid.element.querySelector('[data-field="name"] .mx-data-grid__menu-button')).toBeNull();
    await grid.dispose();
  });

  it('runs the column menu: sort, hide, the column list, focus back to the header', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(5) }));
    layout(grid);
    await settle();
    const menu = (grid as any).menu;
    const item = (text: string) => [...menu.popup.element.querySelectorAll('[role^="menuitem"]')].find((el: Element) => el.textContent === text) as HTMLElement;
    header(grid, 'name').focus();
    key(header(grid, 'name'), 'ArrowDown', { altKey: true });
    expect(menu.opened).toBe(true);
    expect(document.activeElement?.textContent).toBe('Sort ascending');
    item('Sort descending').click();
    await settle();
    expect(menu.opened).toBe(false);
    expect(grid.sort).toEqual([{ field: 'name', dir: 'desc' }]);
    expect(document.activeElement).toBe(header(grid, 'name'));
    (grid as any).openMenu('amount', header(grid, 'amount'));
    item('Columns').click();
    const idItem = item('Id');
    expect(idItem.getAttribute('aria-checked')).toBe('true');
    idItem.click();
    await tick();
    // The column list stays open and follows.
    expect(menu.opened).toBe(true);
    expect(grid.layout.columns.find((c) => c.field === 'id')!.hidden).toBe(true);
    expect(item('Id').getAttribute('aria-checked')).toBe('false');
    menu.close();
    await grid.dispose();
  });

  it('turns multi-sort off', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(5), settings: { multiSort: false } }));
    layout(grid);
    await settle();
    header(grid, 'name').click();
    header(grid, 'amount').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    await settle();
    expect(grid.sort).toEqual([{ field: 'amount', dir: 'asc' }]);
    grid.settings.multiSort = true;
    header(grid, 'name').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    expect(grid.sort).toEqual([
      { field: 'amount', dir: 'asc' },
      { field: 'name', dir: 'asc' },
    ]);
    await grid.dispose();
  });

  it('writes its texts from uiLocale and follows a change', async () => {
    const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(3) }));
    layout(grid);
    await settle();
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('Data grid');
    uiLocale.strings = trStrings;
    await tick();
    expect(grid.element.querySelector('[role="grid"]')!.getAttribute('aria-label')).toBe('Veri tablosu');
    expect(grid.element.querySelector('.mx-data-grid__count')!.textContent).toBe('3 kayıt');
    expect(header(grid, 'id').querySelector('.mx-data-grid__menu-button')!.getAttribute('aria-label')).toBe('Id kolon menüsü');
    await grid.dispose();
  });

  it('starts again with another data source given through a getter', async () => {
    const first = new data.DataSource<Row, number>({ adapter: new RangeAdapter(30), loadMode: 'blocks', pageSize: 50 });
    const second = new data.DataSource<Row, number>({ adapter: new RangeAdapter(7), loadMode: 'all' });
    // A data source is a service object: keep it out of reactive state, pick it with something reactive.
    const sources = [first, second];
    const state = reactive({ which: 0 });
    const grid = mount(new DataGrid<Row>({ columns, dataSource: () => sources[state.which] }));
    layout(grid);
    await settle();
    expect(grid.total).toBe(30);
    state.which = 1;
    await settle();
    expect(grid.total).toBe(7);
    expect(grid.dataSource).toBe(second);
    expect(rowEls(grid)).toHaveLength(7);
    await grid.dispose();
    first.dispose();
    second.dispose();
  });

  it('leaves no live components behind', async () => {
    const tracker = trackComponents();
    try {
      const before = tracker.alive;
      for (let i = 0; i < 5; i++) {
        const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns, rows: makeRows(1000), rowHeight: 36 }));
        const { scrollTo } = layout(grid);
        await settle();
        scrollTo(36 * 500);
        await tick();
        await grid.dispose();
      }
      expect(tracker.alive).toBe(before);
    } finally {
      tracker.stop();
    }
  });
});
