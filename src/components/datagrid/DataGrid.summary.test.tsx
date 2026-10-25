import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { GridCustomSummaryInfo } from './grid-custom-summary-info';
import type { GridSummary } from './grid-summary';

type Row = { id: number; city: string; qty: number | null; price: number; day: string };

const CITIES = ['ank', 'brs', 'izm'];
const makeRows = (n = 12): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, city: CITIES[i % 3], qty: i === 5 ? null : (i + 1) * 10, price: i + 0.5, day: `2024-01-${String(i + 1).padStart(2, '0')}` }));

const columns = (): GridColumn<Row>[] => [
  { field: 'id', title: 'Id', type: 'number' },
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
  { field: 'qty', title: 'Qty', type: 'number' },
  { field: 'price', title: 'Price', type: 'number' },
  { field: 'day', title: 'Day', type: 'date' },
  { field: 'total', title: 'Total', type: 'number', value: (r) => (r.qty ?? 0) * 2 },
];

/** A pretend server (an array adapter) that records every load; `summary` and `group` say what it does itself. */
class Server extends data.ArrayAdapter<Row, number> {
  readonly requests: data.LoadOptions[] = [];
  constructor(rows: Row[], private readonly own: Partial<data.Capabilities> = {}) {
    super({ data: rows, key: 'id' });
  }
  protected override backendCapabilities(): data.Capabilities {
    return { ...super.backendCapabilities(), ...this.own };
  }
  protected override loadRows(options: data.LoadOptions) {
    this.requests.push(options);
    return super.loadRows(options);
  }
}

async function settle() {
  for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 0));
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

const totalRow = (grid: DataGrid<any>) => grid.element.querySelector<HTMLElement>('.mx-data-grid__total-row')!;
/** What an element shows, without the text only assistive technology reads. */
const shown = (el: Element) => {
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll('.mx-sr-only').forEach((e) => e.remove());
  return copy.textContent ?? '';
};
/** What an element reads to assistive technology. */
const heard = (el: Element) => {
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((e) => e.remove());
  return copy.textContent ?? '';
};
/** The items under a column in the row of totals. */
const totals = (grid: DataGrid<any>, field: string) => Array.from(totalRow(grid).querySelectorAll(`[data-field="${field}"] .mx-data-grid__summary-item`)).map(shown);
const groupRow = (grid: DataGrid<any>, text: string) => Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__group-row:not([hidden])')).find((r) => r.textContent!.includes(text))!;
const footers = (grid: DataGrid<any>) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__group-footer:not([hidden])')).sort((a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')));
/** The rows drawn, in order: group rows by their text, footers as "= …", data rows by id. */
const lines = (grid: DataGrid<any>) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])'))
    .sort((a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')))
    .map((r) =>
      r.classList.contains('mx-data-grid__group-row')
        ? shown(r.querySelector('.mx-data-grid__group-cell')!).trim()
        : r.classList.contains('mx-data-grid__group-footer')
          ? `= ${Array.from(r.querySelectorAll('.mx-data-grid__summary-cell'))
              .map(shown)
              .filter(Boolean)
              .join(' | ')}`
          : (r.querySelector('[data-field="id"]')?.textContent ?? '?'),
    );
const short = (d: Date) => new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(d);
const key = (el: Element, k: string, extra: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra }));

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  uiLocale.strings = enStrings;
});

describe('total summary', () => {
  it('computes each type under its column, formatted like the column, and names each item', async () => {
    const changed: unknown[][] = [];
    const grid = await make({
      summary: {
        totalItems: [
          { column: 'id', summaryType: 'count' },
          { column: 'qty', summaryType: 'sum' },
          { column: 'qty', summaryType: 'avg' },
          { column: 'price', summaryType: 'max', name: 'top' },
          { column: 'day', summaryType: 'min' },
          { column: 'total', summaryType: 'sum' },
        ],
      },
      onSummaryChanged: (e) => changed.push([...e.total]),
    });
    // qty: 10…120 without the empty sixth value.
    expect(totals(grid, 'id')).toEqual(['Count: 12']);
    expect(totals(grid, 'qty')).toEqual(['Sum: 720', 'Avg: 65.455']);
    expect(totals(grid, 'price')).toEqual(['Max: 11.5']);
    expect(totals(grid, 'day')).toEqual([`Min: ${short(new Date(2024, 0, 1))}`]);
    // A column with a `value` reader is aggregated through it.
    expect(totals(grid, 'total')).toEqual(['Sum: 1,440']);
    const row = totalRow(grid);
    expect([row.getAttribute('role'), row.getAttribute('aria-rowindex'), row.getAttribute('tabindex'), row.parentElement!.getAttribute('role')]).toEqual(['row', '14', '0', 'rowgroup']);
    // Read as items that name their column.
    expect(Array.from(row.querySelectorAll('[data-field="qty"] .mx-data-grid__summary-item')).map(heard)).toEqual(['Sum of Qty: 720', 'Avg of Qty: 65.455']);
    expect(grid.element.querySelector('.mx-data-grid__viewport')!.getAttribute('aria-rowcount')).toBe('14');
    // By name, place, type, column or type_column.
    expect([grid.getTotalSummaryValue('top'), grid.getTotalSummaryValue(1), grid.getTotalSummaryValue('avg'), grid.getTotalSummaryValue('day'), grid.getTotalSummaryValue('sum_total'), grid.getTotalSummaryValue('nothing')]).toEqual([11.5, 720, 720 / 11, '2024-01-01', 1440, undefined]);
    expect(changed.at(-1)).toEqual([12, 720, 720 / 11, 11.5, '2024-01-01', 1440]);
    await grid.dispose();
  });

  it('follows the filter and the search, and rows added to the array', async () => {
    const rows = makeRows();
    const grid = await make({ summary: { totalItems: [{ column: 'id', summaryType: 'count' }, { column: 'qty', summaryType: 'sum' }] }, settings: { filterRow: true } }, rows);
    grid.filters = { city: { op: '=', value: 'ank' } };
    await settle();
    expect([totals(grid, 'id'), totals(grid, 'qty')]).toEqual([['Count: 4'], ['Sum: 220']]);
    grid.filters = {};
    grid.searchText = 'Bursa';
    await settle();
    expect(totals(grid, 'id')).toEqual(['Count: 4']);
    grid.searchText = '';
    await settle();
    expect(totals(grid, 'id')).toEqual(['Count: 12']);
    await grid.dispose();
  });

  it('places items under another column, formats them as asked and takes texts of its own', async () => {
    const grid = await make({
      summary: {
        totalItems: [
          { column: 'qty', summaryType: 'sum', showInColumn: 'id' },
          { column: 'price', summaryType: 'sum', valueFormat: { style: 'currency', currency: 'EUR' }, alignment: 'center', cssClass: 'money' },
          { column: 'price', summaryType: 'avg', valueFormat: (v) => `~${Math.round(v as number)}`, displayFormat: 'About {0} per {1}' },
          { column: 'day', summaryType: 'max', customizeText: (e) => `Last: ${e.valueText} (${e.value})` },
          { column: 'city', summaryType: 'count' },
        ],
        texts: { count: '{0} rows' },
      },
    });
    expect(totals(grid, 'id')).toEqual(['Sum of Qty: 720']);
    expect(totals(grid, 'price')).toEqual(['Sum: €72.00', 'About ~6 per Price']);
    const money = totalRow(grid).querySelector<HTMLElement>('[data-field="price"] .money')!;
    expect(money.style.textAlign).toBe('center');
    expect(totals(grid, 'day')).toEqual([`Last: ${short(new Date(2024, 0, 12))} (2024-01-12)`]);
    expect(totals(grid, 'city')).toEqual(['12 rows']);
    await grid.dispose();
  });

  it('skips empty values unless told not to, for the summary or one item', async () => {
    const summary = (skip: boolean, own?: boolean): GridSummary<Row> => ({
      skipEmptyValues: skip,
      totalItems: [{ column: 'qty', summaryType: 'avg', skipEmptyValues: own }, { column: 'qty', summaryType: 'count' }],
    });
    const grid = await make({ summary: summary(true) });
    expect(grid.getTotalSummaryValue(0)).toBe(720 / 11);
    grid.summary = summary(false);
    await settle();
    // Empty counts as 0; count counts every row either way.
    expect([grid.getTotalSummaryValue(0), grid.getTotalSummaryValue(1)]).toEqual([60, 12]);
    grid.summary = summary(false, true);
    await settle();
    expect(grid.getTotalSummaryValue(0)).toBe(720 / 11);
    await grid.dispose();
  });

  it('is turned off by the setting, an item turns itself back on, and the texts follow the locale', async () => {
    uiLocale.strings = trStrings;
    const grid = await make({ settings: { totalSummary: false }, summary: { totalItems: [{ column: 'qty', summaryType: 'sum' }, { column: 'qty', summaryType: 'max', visible: true }] } });
    expect(totals(grid, 'qty')).toEqual(['En büyük: 120']);
    grid.settings.totalSummary = true;
    await settle();
    expect(totals(grid, 'qty')).toEqual(['Toplam: 720', 'En büyük: 120']);
    grid.settings.totalSummaryTabStop = false;
    await settle();
    expect(totalRow(grid).hasAttribute('tabindex')).toBe(false);
    grid.summary = {};
    await settle();
    expect(totalRow(grid).parentElement!.hidden).toBe(true);
    await grid.dispose();
  });

  it('tells clicks on the row of totals and its rows drawn, as rows of their own kind', async () => {
    const told: string[] = [];
    const grid = await make({
      summary: { totalItems: [{ column: 'qty', summaryType: 'sum' }] },
      onRowClick: (e) => told.push(`row ${e.rowType} ${e.rowIndex}`),
      onCellClick: (e) => told.push(`cell ${e.rowType} ${e.field}`),
      onRowPrepared: (e) => e.rowType === 'totalFooter' && told.push(`prepared ${e.rowType}`),
    });
    grid.summary = { totalItems: [{ column: 'qty', summaryType: 'max' }] };
    await settle();
    totalRow(grid).querySelector<HTMLElement>('[data-field="qty"] .mx-data-grid__summary-item')!.click();
    expect(told).toContain('prepared totalFooter');
    expect(told.filter((t) => !t.startsWith('prepared'))).toEqual(['cell totalFooter qty', 'row totalFooter 12']);
    await grid.dispose();
  });

  it('runs a custom summary through start, calculate and finalize', async () => {
    const steps: string[] = [];
    const calculateCustomSummary = (e: GridCustomSummaryInfo<Row>) => {
      steps.push(`${e.name}:${e.summaryProcess}`);
      if (e.summaryProcess === 'start') e.totalValue = { n: 0, odd: 0 };
      else if (e.summaryProcess === 'calculate') {
        const t = e.totalValue as { n: number; odd: number };
        t.n++;
        if ((e.value as Row).id % 2) t.odd++;
      } else e.totalValue = (e.totalValue as { odd: number }).odd;
    };
    const grid = await make({ summary: { totalItems: [{ name: 'odd', summaryType: 'custom', showInColumn: 'id', displayFormat: 'Odd: {0}' }], calculateCustomSummary } });
    expect(totals(grid, 'id')).toEqual(['Odd: 6']);
    expect(steps.filter((s) => s !== 'odd:calculate')).toEqual(['odd:start', 'odd:finalize']);
    expect(steps.filter((s) => s === 'odd:calculate')).toHaveLength(12);
    await grid.dispose();
  });
});

describe('group summary', () => {
  const grouped = () => columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c));

  it('shows items after the group text, under their columns, and in footer rows', async () => {
    const grid = await make({
      columns: grouped(),
      summary: {
        groupItems: [
          { column: 'qty', summaryType: 'sum' },
          { column: 'price', summaryType: 'max', alignByColumn: true },
          { column: 'qty', summaryType: 'max', showInGroupFooter: true },
          { column: 'id', summaryType: 'count', showInGroupFooter: true },
        ],
      },
    });
    // Ankara: ids 1, 4, 7, 10.
    expect(lines(grid).slice(0, 6)).toEqual(['City: Ankara (4) · Sum of Qty: 220', '1', '4', '7', '10', '= Count: 4 | Max: 100']);
    const ankara = groupRow(grid, 'Ankara');
    const aligned = ankara.querySelector<HTMLElement>('.mx-data-grid__summary-cell[data-field="price"]')!;
    expect([shown(aligned), heard(aligned), aligned.style.gridColumn, aligned.getAttribute('aria-colindex')]).toEqual(['Max: 9.5', 'Max of Price: 9.5', '3', '3']);
    const cell = ankara.querySelector('.mx-data-grid__group-cell')!;
    expect([(cell as HTMLElement).style.gridColumn, cell.getAttribute('aria-colspan')]).toEqual(['1 / 3', '2']);
    const footer = footers(grid)[0];
    expect([footer.getAttribute('role'), footer.getAttribute('aria-level'), footer.getAttribute('aria-rowindex')]).toEqual(['row', '2', '7']);
    expect(grid.getGroupSummaryValue(['ank'], 'sum_qty')).toBe(220);
    expect(grid.getGroupSummaryValue(['brs'], 3)).toBe(4);
    expect(grid.getVisibleRows().find((r) => r.element === footer)?.rowType).toBe('groupFooter');
    // A closed group has no footer.
    grid.collapseGroup(['ank']);
    await settle();
    expect(lines(grid).slice(0, 2)).toEqual(['City: Ankara (4) · Sum of Qty: 220', 'City: Bursa (4) · Sum of Qty: 260']);
    await grid.dispose();
  });

  it('is reached by the arrow keys like a group row, takes no edit keys, and the footers follow their items', async () => {
    const grid = await make({ columns: grouped(), settings: { editable: true }, summary: { groupItems: [{ column: 'qty', summaryType: 'sum', showInGroupFooter: true }] } });
    const first = grid.element.querySelector<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="3"] [data-field="id"]')!;
    first.focus();
    for (let i = 0; i < 4; i++) key(document.activeElement!, 'ArrowDown');
    expect(document.activeElement!.classList.contains('mx-data-grid__group-footer')).toBe(true);
    expect(key(document.activeElement!, 'Enter')).toBe(false);
    expect(grid.element.querySelector('.mx-data-grid__editor')).toBeNull();
    key(document.activeElement!, 'ArrowDown');
    expect(document.activeElement!.closest('.mx-data-grid__group-row')).not.toBeNull();
    grid.summary = { groupItems: [{ column: 'qty', summaryType: 'sum' }] };
    await settle();
    expect(footers(grid)).toHaveLength(0);
    await grid.dispose();
  });

  it('gives a custom group item the level of its group, and a column’s own group cell the items', async () => {
    const levels = new Set<number | undefined>();
    const grid = await make({
      columns: grouped().map((c) => (c.field === 'city' ? { ...c, groupCell: (ctx) => <span class="own">{() => ctx.summaryItems.map((i) => i.text).join(';')}</span> } : c)),
      summary: {
        groupItems: [{ name: 'n', summaryType: 'custom', displayFormat: 'Rows: {0}' }],
        calculateCustomSummary: (e) => {
          levels.add(e.groupIndex);
          if (e.summaryProcess === 'start') e.totalValue = 0;
          if (e.summaryProcess === 'calculate') e.totalValue = (e.totalValue as number) + 1;
        },
      },
    });
    expect(groupRow(grid, 'Rows').querySelector('.own')!.textContent).toBe('Rows: 4');
    expect([...levels]).toEqual([0]);
    await grid.dispose();
  });

  it('pages the footers with the rows', async () => {
    const grid = await make({ columns: grouped(), mode: 'paged', pageSize: 7, summary: { groupItems: [{ column: 'id', summaryType: 'count', showInGroupFooter: true }] } });
    // A group row, its four rows and its footer: 6 places per city.
    expect(lines(grid)).toEqual(['City: Ankara (4)', '1', '4', '7', '10', '= Count: 4', 'City: Bursa (4)']);
    grid.page = 1;
    await settle();
    expect(lines(grid)[0]).toBe('2');
    expect(grid.pageCount).toBe(3);
    await grid.dispose();
  });
});

describe('summaries while editing', () => {
  it('change on save, or with recalculateWhileEditing as the edits are made', async () => {
    for (const recalculateWhileEditing of [false, true]) {
      const grid = await make({
        saveMode: 'batch',
        settings: { editable: true, addRows: true },
        summary: { recalculateWhileEditing, totalItems: [{ column: 'qty', summaryType: 'sum' }, { column: 'id', summaryType: 'count' }] },
      });
      grid.cellValue(0, 'qty', 1010);
      await settle();
      expect(grid.getTotalSummaryValue('sum')).toBe(recalculateWhileEditing ? 1720 : 720);
      await grid.addRow({ qty: 5, id: 99 } as Partial<Row>);
      await settle();
      expect(grid.getTotalSummaryValue('count')).toBe(recalculateWhileEditing ? 13 : 12);
      await grid.deleteRow(grid.dataSource.rows[1]);
      await settle();
      expect(grid.getTotalSummaryValue('sum')).toBe(recalculateWhileEditing ? 1720 + 5 - 20 : 720);
      await grid.saveChanges();
      await settle();
      expect([grid.getTotalSummaryValue('sum'), grid.getTotalSummaryValue('count')]).toEqual([1720 + 5 - 20, 12]);
      await grid.dispose();
    }
  });
});

describe('summaries of a server', () => {
  it('asks a server that can for the totals of the query, and works them out from every row when it cannot', async () => {
    for (const [own, remoteSummary] of [
      [{ summary: true }, 'auto'],
      [{ summary: false }, 'auto'],
      [{ summary: true }, false],
    ] as const) {
      const server = new Server(makeRows(250), own);
      const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 50 });
      const grid = await make({ dataSource: source, settings: { remoteSummary, groupLoadPageSize: 100, filterRow: true }, summary: { totalItems: [{ column: 'qty', summaryType: 'sum' }, { column: 'id', summaryType: 'max' }] } });
      // 10 + 20 + … + 2500, less the empty sixth.
      const sum = (250 * 251 * 10) / 2 - 60;
      expect([grid.getTotalSummaryValue(0), grid.getTotalSummaryValue(1), grid.summaryStatus]).toEqual([sum, 250, 'ready']);
      const asked = server.requests.filter((r) => r.summary);
      const pages = server.requests.filter((r) => r.take === 100);
      if (own.summary && remoteSummary === 'auto') expect([asked.length, asked[0].take, pages.length]).toEqual([1, 0, 0]);
      else expect([asked.length, pages.length]).toEqual([0, 3]);
      // A new filter asks again.
      grid.filters = { id: { op: '<', value: 11 } };
      await settle();
      expect([own.summary, remoteSummary, grid.getTotalSummaryValue(1), grid.total]).toEqual([own.summary, remoteSummary, 10, 10]);
      await grid.dispose();
    }
  });

  it('asks a server that groups for the group summaries with the groups, and groups in memory when it cannot compute them', async () => {
    const server = new Server(makeRows(90), { group: true, summary: true });
    const source = new data.DataSource<Row, number>({ adapter: server, loadMode: 'blocks', pageSize: 50 });
    const grid = await make({
      dataSource: source,
      columns: columns().map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)),
      summary: { groupItems: [{ column: 'id', summaryType: 'count', showInGroupFooter: true }, { column: 'qty', summaryType: 'max' }] },
    });
    const groups = server.requests.find((r) => r.groupsOnly);
    expect(groups?.groupSummary).toEqual([{ type: 'count' }, { type: 'max', field: 'qty' }]);
    expect(groupRow(grid, 'Ankara').textContent).toContain('Max of Qty: 880');
    expect(grid.getGroupSummaryValue(['brs'], 'count')).toBe(30);
    server.requests.length = 0;
    grid.summary = { groupItems: [{ name: 'n', summaryType: 'custom' }], calculateCustomSummary: (e) => (e.totalValue = e.summaryProcess === 'start' ? 0 : (e.totalValue as number) + (e.summaryProcess === 'calculate' ? 1 : 0)) };
    await settle();
    expect(server.requests.some((r) => r.groupsOnly)).toBe(false);
    expect(grid.getGroupSummaryValue(['izm'], 'n')).toBe(30);
    await grid.dispose();
  });
});

describe('exporting summaries', () => {
  it('writes group footers after their rows and the totals last, or leaves them out', async () => {
    const grid = await make(
      {
        columns: columns()
          .filter((c) => ['id', 'city', 'qty'].includes(c.field))
          .map((c) => (c.field === 'city' ? { ...c, groupIndex: 0 } : c)),
        summary: { totalItems: [{ column: 'qty', summaryType: 'sum' }, { column: 'qty', summaryType: 'max' }], groupItems: [{ column: 'qty', summaryType: 'sum' }, { column: 'id', summaryType: 'count', showInGroupFooter: true }] },
      },
      makeRows(4),
    );
    const csv = await grid.exportCsv({ download: false, bom: false, separator: ',' });
    expect(csv.split('\r\n')).toEqual(['Id,Qty', 'City: Ankara · Sum of Qty: 50,', '1,10', '4,40', 'Count: 2,', 'City: Bursa · Sum of Qty: 20,', '2,20', 'Count: 1,', 'City: İzmir · Sum of Qty: 30,', '3,30', 'Count: 1,', ',"Sum: 100\nMax: 40"', '']);
    const rows = await grid.exportRows();
    expect(rows.slice(2, 3)).toEqual([{ id: 'Count: 2', qty: '' }]);
    expect(rows.at(-1)).toEqual({ id: '', qty: 'Sum: 100\nMax: 40' });
    expect(await grid.exportRows({ summaries: false })).toHaveLength(4);
    await grid.dispose();
  });
});
