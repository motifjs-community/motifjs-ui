import { data } from '@motifx-community/data';
import { describe, expect, it } from 'vitest';
import type { GridColumn } from '../grid-column';
import { GridRowsAdapter } from './GridRowsAdapter';

type Row = { id: number; name: string | null; a: number; b: number };

const rows: Row[] = [
  { id: 1, name: 'ılık', a: 1, b: 9 },
  { id: 2, name: 'İnce', a: 5, b: 1 },
  { id: 3, name: null, a: 2, b: 2 },
  { id: 4, name: 'inek', a: 3, b: 0 },
  { id: 5, name: 'Ilgaz', a: 4, b: 4 },
];

const cols = new Map<string, GridColumn<Row>>([
  ['name', { field: 'name', title: 'Name' }],
  ['sum', { field: 'sum', title: 'Sum', type: 'number', value: (r) => r.a + r.b }],
  ['b', { field: 'b', title: 'B', type: 'number', compare: (x, y) => (y as number) - (x as number) }],
]);

const adapter = () => new GridRowsAdapter<Row>({ data: rows, key: 'id', locale: 'tr' }, (f) => cols.get(f) ?? { field: f, title: f });
const ids = (r: data.LoadResult<Row>) => r.rows.map((x) => x.id);

describe('GridRowsAdapter', () => {
  it('sorts text in the locale (Turkish I/ı and İ/i), empty values last', async () => {
    expect(ids(await adapter().load({ sort: [{ field: 'name', dir: 'asc' }] }))).toEqual([5, 1, 2, 4, 3]);
    expect(ids(await adapter().load({ sort: [{ field: 'name', dir: 'desc' }] }))).toEqual([4, 2, 1, 5, 3]);
  });

  it("sorts by a column's value reader and its own compare", async () => {
    expect(ids(await adapter().load({ sort: [{ field: 'sum', dir: 'asc' }] }))).toEqual([4, 3, 2, 5, 1]);
    expect(ids(await adapter().load({ sort: [{ field: 'b', dir: 'asc' }] }))).toEqual([1, 5, 3, 2, 4]);
  });

  it("filters a column that reads its value itself, then sorts and pages", async () => {
    const result = await adapter().load({ filter: data.where('sum', '>=', 5), sort: [{ field: 'sum', dir: 'desc' }], skip: 1, take: 2, count: true });
    expect(ids(result)).toEqual([5, 2]);
    expect(result.total).toBe(3);
  });
});
