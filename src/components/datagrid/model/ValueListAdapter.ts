import { data } from '@motifx-community/data';
import type { GridFilterValue } from '../grid-filter-value';
import type { ValueLoader } from './value-loader';

const ALL = 1_000_000;

/**
 * The values of a header filter as a data-layer adapter, so the kit's `ListBox` lists, searches and
 * scrolls them like any other data: a search arrives as a filter on `text` and goes to the loader,
 * a value asked by key is answered from what was loaded.
 */
export class ValueListAdapter extends data.DataAdapter<GridFilterValue, unknown> {
  private readonly known = new Map<string, GridFilterValue>();

  constructor(
    private readonly loader: ValueLoader,
    private readonly textOf: (value: unknown) => string,
  ) {
    super({ key: 'value' });
  }

  protected backendCapabilities(): data.Capabilities {
    return { filter: true, sort: true, paging: true, count: true, select: false, group: false, summary: false, insert: false, update: false, remove: false };
  }

  protected async loadRows(options: data.LoadOptions): Promise<data.LoadResult<GridFilterValue>> {
    const signal = options.signal ?? new AbortController().signal;
    const result = await this.loader({ search: searchOf(options.filter), skip: options.skip ?? 0, take: options.take ?? ALL, signal });
    const rows = result.values.map((v) => {
      const value = v.value === undefined ? null : v.value;
      const row: GridFilterValue = { value, text: v.text ?? this.textOf(value) };
      if (v.count !== undefined) row.count = v.count;
      this.known.set(this.keyString(value), row);
      return row;
    });
    return { rows, total: result.total };
  }

  protected override async findRow(key: unknown): Promise<GridFilterValue | undefined> {
    return this.known.get(this.keyString(key)) ?? { value: key, text: this.textOf(key) };
  }
}

/** The search text in the filter the list's data source makes (`text contains …`). */
function searchOf(filter: data.FilterExpression | null | undefined): string {
  if (!filter) return '';
  if (data.isCondition(filter)) return filter.field === 'text' && typeof filter.value === 'string' ? filter.value : '';
  const parts = 'and' in filter ? filter.and : 'or' in filter ? filter.or : [];
  for (const part of parts) {
    const found = searchOf(part);
    if (found) return found;
  }
  return '';
}
