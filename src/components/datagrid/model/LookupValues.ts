import { data } from '@motifx-community/data';
import type { GridFilterValue } from '../grid-filter-value';
import { cellValue } from './cell-value';
import type { GridModel } from './GridModel';
import type { ValueLoader } from './value-loader';
import { ValueListAdapter } from './ValueListAdapter';

/** Items of the lookup source a typed search may match, whose keys are then looked for among the rows. */

type Entry = { value: unknown; text: string; count?: number };

/**
 * The lists of a lookup column's filter row ("(All)" first) and header filter ("(Blanks)" first),
 * by text, searched by text. While `syncLookupFilterValues` is on they hold only the keys of the rows
 * the other columns' filters leave: counted among rows in memory, asked from a server that groups,
 * or from the app's `loadValues`; otherwise (or when the server cannot group) they list the lookup
 * source itself. Keys become texts through the column's shared cache.
 */
export class LookupValues<T> {
  constructor(private readonly model: GridModel<T>) {}

  /** The filter of the other columns (and the source's own), which a synced list honors. */
  otherFilter(field: string): data.FilterExpression | null {
    return data.and(this.model.baseFilter, this.model.filters.expression(undefined, field));
  }

  /** The list as a data source a `DropDown` or `ListBox` reads; `first` is the entry put before the values. */
  source(field: string, first: 'all' | 'blank'): data.DataSource<GridFilterValue, unknown> {
    const model = this.model;
    const col = model.columns.get(field);
    const headText = () => model.text(first === 'all' ? 'gridAll' : 'gridEmptyOption');
    const textOf = async (value: unknown) => {
      if (data.isEmpty(value)) return headText();
      await model.lookups.items(col)?.request([value]);
      return model.lookups.textOfKey(col, value);
    };
    const adapter = new ValueListAdapter(this.loader(field, first), textOf);
    return new data.DataSource<GridFilterValue, unknown>({ adapter, loadMode: 'blocks', pageSize: Math.max(1, Math.floor(model.settings.get('headerFilterPageSize'))), searchFields: ['text'] });
  }

  private loader(field: string, first: 'all' | 'blank'): ValueLoader {
    const model = this.model;
    const synced = () => model.columns.can(field, 'syncLookupFilterValues');
    return async ({ search, skip, take, signal }) => {
      const sync = synced();
      // "(All)" always leads the filter row's list; "(Blanks)" leads the header filter's when the rows are not counted.
      const head: Entry | null = !search && (first === 'all' || !sync) ? { value: null, text: model.text(first === 'all' ? 'gridAll' : 'gridEmptyOption') } : null;
      const extra = head ? 1 : 0;
      const innerSkip = Math.max(0, skip - extra);
      const innerTake = skip === 0 ? Math.max(0, take - extra) : take;
      const part = sync ? await this.inRows(field, first, search, innerSkip, innerTake, signal) : null;
      const found = part ?? (await this.inSource(field, search, innerSkip, innerTake));
      const values = head && skip === 0 ? [head, ...found.values] : found.values;
      return { values, total: found.total + extra };
    };
  }

  /** The keys among the rows the other filters leave; `null` when they cannot be had (a server that cannot group). */
  private async inRows(field: string, first: 'all' | 'blank', search: string, skip: number, take: number, signal: AbortSignal): Promise<{ values: Entry[]; total: number } | null> {
    const model = this.model;
    const col = model.columns.get(field);
    const lookups = model.lookups;
    const items = lookups.items(col);
    const source = model.data.source;
    let filter = this.otherFilter(field);
    if (first === 'all') filter = data.and(filter, data.where(field, 'isnotblank'));
    const entry = (value: unknown, count?: number): Entry => {
      const e: Entry = { value: data.isEmpty(value) ? null : value, text: data.isEmpty(value) ? model.text('gridEmptyOption') : lookups.textOfKey(col, value) };
      if (count !== undefined) e.count = count;
      return e;
    };
    if (source.loadMode === 'all') {
      const { rows } = await source.adapter.load({ filter, signal });
      const counts = new Map<string, { value: unknown; count: number }>();
      for (const row of rows) {
        const value = cellValue(col, row);
        const id = data.isEmpty(value) ? '' : `${typeof value}:${String(value)}`;
        const bucket = counts.get(id);
        if (bucket) bucket.count++;
        else counts.set(id, { value: data.isEmpty(value) ? null : value, count: 1 });
      }
      await items?.request([...counts.values()].map((b) => b.value));
      const lower = search.trim().toLocaleLowerCase(model.formatter.locale);
      const collator = model.formatter.collator;
      const all = [...counts.values()]
        .filter((b) => !lookups.isMissing(col, b.value))
        .map((b) => entry(b.value, b.count))
        .filter((e) => !lower || (e.value !== null && e.text.toLocaleLowerCase(model.formatter.locale).includes(lower)))
        .sort((a, b) => (a.value === null ? -1 : b.value === null ? 1 : collator.compare(a.text, b.text)));
      return { values: all.slice(skip, skip + take), total: all.length };
    }
    const own = model.loadValues;
    if (own) {
      const result = await own({ column: col, search, filter, skip, take, signal });
      await items?.request(result.values.map((v) => v.value));
      return { values: result.values.map((v) => ({ ...entry(v.value, v.count), ...(v.text !== undefined ? { text: v.text } : {}) })), total: result.total };
    }
    if (!source.adapter.capabilities.group || !items) return null;
    if (search) {
      // The text is searched in the lookup source; its keys are then looked for among the rows.
      const { items: matches } = await items.search(search, lookups.search(col), 0, Math.max(1, col.lookup?.filterSearchLimit ?? 1000));
      if (!matches.length) return { values: [], total: 0 };
      filter = data.and(filter, data.where(field, 'in', matches.map((m) => items.valueOf(m))));
    }
    const result = await source.adapter.load({ filter, group: [{ field }], skip, take, count: true, select: [field], signal });
    const groups = result.groups ?? [];
    await items.request(groups.map((g) => g.key));
    // Keys the source does not have are omitted, as the list shows the source's items.
    const values = groups.filter((g) => !lookups.isMissing(col, g.key)).map((g) => entry(g.key, g.count));
    return { values, total: (result.groupCount ?? skip + groups.length) - (groups.length - values.length) };
  }

  /** The items of the lookup source itself, narrowed by `lookup.filter(null)`. */
  private async inSource(field: string, search: string, skip: number, take: number): Promise<{ values: Entry[]; total: number }> {
    const model = this.model;
    const col = model.columns.get(field);
    const items = model.lookups.items(col);
    if (!items) return { values: [], total: 0 };
    const { items: found, total } = await items.search(search, model.lookups.search(col), skip, take);
    return { values: found.map((item) => ({ value: items.valueOf(item), text: model.lookups.textOf(col, item) })), total };
  }
}
