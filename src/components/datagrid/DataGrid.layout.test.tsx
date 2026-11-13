import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';

type Row = { id: number; name: string; amount: number; day: string };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', type: 'number', width: 80 },
  { field: 'name', title: 'Name', width: 160 },
  { field: 'amount', title: 'Amount', type: 'number' },
  { field: 'day', title: 'Day', type: 'date' },
];

const rows = (): Row[] => Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `Name ${i + 1}`, amount: i * 10, day: `2026-03-${String(i + 1).padStart(2, '0')}` }));

const STORED = 'motifx-ui:data-grid:orders';

async function settle() {
  await settled(4);
}

function make(props: Partial<DataGridProps<Row>> = {}) {
  const grid = mount(new DataGrid<Row>({ rows: rows(), rowKey: 'id', columns, rowHeight: 36, locale: 'en-US', layoutKey: 'orders', settings: { filterRow: true }, ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  return grid;
}

const stored = () => JSON.parse(localStorage.getItem(STORED) ?? 'null');

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('layout kept in the browser', () => {
  it('keeps widths, order, hidden and pinned columns, sort and filters, and brings them back', async () => {
    const grid = make({ sort: [{ field: 'id', dir: 'asc' }] });
    await settle();
    grid.layout = {
      columns: [
        { field: 'amount', width: 200, flex: 0, hidden: false, sticky: 'start' },
        { field: 'id', width: 90, flex: 0, hidden: false, sticky: null },
        { field: 'name', width: 160, flex: 0, hidden: true, sticky: null },
        { field: 'day', width: 140, flex: 0, hidden: false, sticky: null },
      ],
      sort: [{ field: 'amount', dir: 'desc' }],
    };
    grid.filters = { amount: { op: '<', value: 100 }, day: { op: '>=', value: new Date(2026, 2, 3) } };
    await settle();
    expect(stored().sort).toEqual([{ field: 'amount', dir: 'desc' }]);
    expect(stored().filters.amount).toEqual({ op: '<', value: 100 });
    void grid.dispose();

    const again = make({ sort: [{ field: 'id', dir: 'asc' }] });
    await settle();
    expect(again.layout.columns.map((c) => [c.field, c.width, c.hidden, c.sticky])).toEqual([
      ['amount', 200, false, 'start'],
      ['id', 90, false, null],
      ['name', 160, true, null],
      ['day', 140, false, null],
    ]);
    expect(again.sort).toEqual([{ field: 'amount', dir: 'desc' }]);
    expect(again.filters.day.value).toEqual(new Date(2026, 2, 3));
    expect(again.total).toBe(8);

    // Back to the definitions and the first sort; that is what is kept now. Filters stay.
    again.resetLayout();
    expect(again.layout.columns.map((c) => c.field)).toEqual(['id', 'name', 'amount', 'day']);
    expect(stored().sort).toEqual([{ field: 'id', dir: 'asc' }]);
    expect(stored().columns.every((c: { hidden: boolean }) => !c.hidden)).toBe(true);
    expect(Object.keys(stored().filters)).toEqual(['amount', 'day']);
  });

  it('follows the saveLayout switch', async () => {
    localStorage.setItem(STORED, JSON.stringify({ columns: [], sort: [{ field: 'name', dir: 'desc' }], filters: {} }));
    const grid = make({ settings: { saveLayout: false } });
    await settle();
    expect(grid.sort).toEqual([]);
    grid.sort = [{ field: 'id', dir: 'desc' }];
    expect(stored().sort).toEqual([{ field: 'name', dir: 'desc' }]);
    grid.settings.saveLayout = true;
    grid.sort = [{ field: 'amount', dir: 'asc' }];
    expect(stored().sort).toEqual([{ field: 'amount', dir: 'asc' }]);
  });

  it('works on without storage, and skips what it cannot read', async () => {
    localStorage.setItem(STORED, '{ not json');
    const grid = make({ sort: [{ field: 'name', dir: 'asc' }] });
    await settle();
    expect(grid.sort).toEqual([{ field: 'name', dir: 'asc' }]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => (grid.sort = [{ field: 'id', dir: 'desc' }])).not.toThrow();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => make()).not.toThrow();
  });
});
