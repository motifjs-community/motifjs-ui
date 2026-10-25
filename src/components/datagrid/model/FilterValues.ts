import { data } from '@motifx-community/data';
import type { GridFilterValue } from '../grid-filter-value';
import type { GridValuesResult } from '../grid-values-result';
import { cellValue } from './cell-value';
import type { GridModel } from './GridModel';
import type { ValueLoader } from './value-loader';
import { ValueListAdapter } from './ValueListAdapter';

const PAGE = 100;

/** A value as a map key: equal dates are equal, `1` and `'1'` are not. */
const bucketOf = (v: unknown) => (v instanceof Date ? `d${v.getTime()}` : `${typeof v}:${String(v)}`);

const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (typeof v === 'number' && Number.isNaN(v));

/**
 * Where a column's header filter gets its values: the app's `loadValues`, rows held in memory (the
 * grid counts them itself, the column's `value` reader and format included), or an adapter that
 * groups (one grouped load per part, with counts). Every way honors the other filters.
 */
export class FilterValues<T> {
  constructor(private readonly model: GridModel<T>) {}

  /** Whether the values of the column can be listed at all. */
  available(): boolean {
    const source = this.model.data.source;
    return !!this.model.loadValues || source.loadMode === 'all' || source.adapter.capabilities.group;
  }

  /** Whether the list can search: always in memory; on a server, text columns only. */
  searchable(field: string): boolean {
    if (this.model.loadValues || this.model.data.source.loadMode === 'all') return true;
    const col = this.model.columns.get(field);
    return (col.type ?? 'text') === 'text' && !col.value;
  }

  /** A source of the column's values for the list, made for one opening of the header filter. */
  source(field: string): data.DataSource<GridFilterValue, unknown> {
    const col = this.model.columns.get(field);
    const textOf = (value: unknown) => (isBlank(value) ? this.model.text('gridEmptyOption') : this.model.formatter.text(col, {} as T, value));
    const adapter = new ValueListAdapter(this.loader(field), textOf);
    return new data.DataSource<GridFilterValue, unknown>({ adapter, loadMode: 'blocks', pageSize: PAGE, searchFields: ['text'] });
  }

  private loader(field: string): ValueLoader {
    const model = this.model;
    const col = model.columns.get(field);
    const filter = data.and(model.baseFilter, model.filters.expression(field));
    const own = model.loadValues;
    if (own) return async ({ search, skip, take, signal }) => own({ column: col, search, filter, skip, take, signal });
    const source = model.data.source;
    if (source.loadMode !== 'all' && source.adapter.capabilities.group) {
      return async ({ search, skip, take, signal }) => {
        const found = search ? data.where(field, 'contains', search) : null;
        const result = await source.adapter.load({ filter: data.and(filter, found), group: [{ field }], skip, take, count: true, select: [field], signal });
        const values = (result.groups ?? []).map((g) => ({ value: g.key, count: g.count }));
        return { values, total: result.groupCount ?? skip + values.length };
      };
    }
    let all: Promise<GridFilterValue[]> | null = null;
    return async ({ search, skip, take, signal }) => {
      all ??= this.countValues(field, filter, signal);
      const text = search.trim().toLocaleLowerCase();
      const values = text ? (await all).filter((v) => v.text!.toLocaleLowerCase().includes(text)) : await all;
      return { values: values.slice(skip, skip + take), total: values.length } satisfies GridValuesResult;
    };
  }

  /** Every distinct value of the rows the other filters leave, with counts, empty first, then in order. */
  private async countValues(field: string, filter: data.FilterExpression | null, signal: AbortSignal): Promise<GridFilterValue[]> {
    const model = this.model;
    const col = model.columns.get(field);
    const { rows } = await model.data.source.adapter.load({ filter, signal });
    const buckets = new Map<string, { value: unknown; row: T; count: number }>();
    for (const row of rows) {
      const raw = cellValue(col, row);
      const value = isBlank(raw) ? null : raw;
      const key = value === null ? '' : bucketOf(value);
      const bucket = buckets.get(key);
      if (bucket) bucket.count++;
      else buckets.set(key, { value, row, count: 1 });
    }
    const formatter = model.formatter;
    const list = [...buckets.values()].map((b) => ({
      value: b.value,
      count: b.count,
      text: b.value === null ? model.text('gridEmptyOption') : formatter.text(col, b.row, b.value),
    }));
    const collator = formatter.collator;
    const rank = (v: unknown) => (v instanceof Date ? v.getTime() : typeof v === 'number' ? v : null);
    list.sort((a, b) => {
      if (a.value === null || b.value === null) return a.value === null ? (b.value === null ? 0 : -1) : 1;
      const ra = rank(a.value);
      const rb = rank(b.value);
      if (ra !== null && rb !== null) return ra - rb;
      if (col.type === 'date') return (data.toDate(a.value)?.getTime() ?? 0) - (data.toDate(b.value)?.getTime() ?? 0);
      return collator.compare(a.text, b.text);
    });
    return list;
  }
}
