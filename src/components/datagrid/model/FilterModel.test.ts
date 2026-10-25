import { data } from '@motifx-community/data';
import { describe, expect, it } from 'vitest';
import type { GridColumn } from '../grid-column';
import type { GridSettings } from '../grid-settings';
import { ColumnModel } from './ColumnModel';
import { DEFAULT_SETTINGS } from './default-settings';
import { FilterModel } from './FilterModel';
import { Switches } from './Switches';

const defs: GridColumn[] = [
  { field: 'name', title: 'Name' },
  { field: 'qty', title: 'Qty', type: 'number' },
  { field: 'day', title: 'Day', type: 'date' },
  { field: 'paid', title: 'Paid', type: 'boolean' },
  { field: 'city', title: 'City', type: 'list', options: ['A', 'B'], filterOperators: ['=', '<>'] },
  { field: 'code', title: 'Code', filterOperator: 'startswith', filterRow: false },
];

function model(given: Partial<GridSettings> = { filterRow: true, headerFilter: true }) {
  const settings = new Switches<GridSettings>(Object.keys(DEFAULT_SETTINGS) as (keyof GridSettings)[], DEFAULT_SETTINGS, given);
  const columns = new ColumnModel(defs, undefined, settings);
  return { filters: new FilterModel(columns), columns, settings };
}

describe('FilterModel', () => {
  it('offers the conditions of the column type, a column narrowing them', () => {
    const { filters } = model();
    expect(filters.operators('name')).toContain('contains');
    expect(filters.operator('name')).toBe('contains');
    expect(filters.operators('qty')).toContain('between');
    expect(filters.operator('qty')).toBe('=');
    expect(filters.operators('paid')).toEqual([]);
    expect(filters.operators('city')).toEqual(['=', '<>']);
    expect(filters.operator('code')).toBe('startswith');
  });

  it('turns the filter row and the header values into one data-layer filter', () => {
    const { filters } = model();
    filters.update('name', { value: 'ada' });
    filters.update('qty', { op: 'between', value: 1, value2: null });
    filters.update('paid', { value: false });
    filters.update('city', { values: ['A', null] });
    expect(filters.expression()).toEqual(
      data.and(
        data.where('name', 'contains', 'ada'),
        data.where('qty', 'between', [1, null]),
        data.where('paid', '=', false),
        data.or(data.where('city', 'in', ['A']), data.where('city', 'isblank')),
      ),
    );
    // A column's own value list honors the other filters, not its own.
    expect(JSON.stringify(filters.expression('city'))).not.toContain('"in"');
  });

  it('filters dates by day, whatever time the values carry', () => {
    const { filters } = model();
    filters.update('day', { op: '=', value: new Date(2026, 4, 3, 15, 30) });
    const e = filters.expression() as data.FilterCondition;
    expect(e.op).toBe('between');
    const [from, to] = e.value as Date[];
    expect(from).toEqual(new Date(2026, 4, 3));
    expect(to.getDate()).toBe(3);
    expect(to.getHours()).toBe(23);
    const test = data.createRowFilter<{ day: Date }>(e);
    expect(test({ day: new Date(2026, 4, 3, 22) })).toBe(true);
    expect(test({ day: new Date(2026, 4, 4, 0, 1) })).toBe(false);
  });

  it('asks no value of "empty", leaves out empty values, and drops a column whose feature is off', () => {
    const { filters, columns } = model();
    filters.update('name', { op: 'isblank' });
    filters.update('qty', { value: '' });
    filters.update('code', { value: 'x' });
    expect(filters.expression()).toEqual(data.where('name', 'isblank'));
    expect(filters.isActive('qty')).toBe(false);
    columns.features.get('name')!.view.filterRow = false;
    expect(filters.expression()).toBeNull();
  });

  it('reads and replaces the filters; clearing keeps the chosen conditions', () => {
    const { filters } = model();
    filters.replace({ name: { op: 'startswith', value: 'a' }, nope: { value: 1 }, qty: { value: 5 } });
    expect(Object.keys(filters.toFilters())).toEqual(['name', 'qty']);
    expect(filters.any()).toBe(true);
    filters.clearAll();
    expect(filters.any()).toBe(false);
    expect(filters.operator('name')).toBe('startswith');
    filters.update('qty', { value: 3 }, true);
    expect(filters.typed).toBe(true);
  });
});
