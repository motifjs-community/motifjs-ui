import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';
import type { GridFilterValue } from '../grid-filter-value';
import type { GridValuesResult } from '../grid-values-result';
import { listValues } from './cell-list';
import { cellValue } from './cell-value';
import type { FilterTreeNode } from './filter-tree-node';
import type { GridModel } from './GridModel';
import { LookupValues } from './LookupValues';
import type { ValueList } from './value-list';
import type { ValueLoader } from './value-loader';
import { ValueIntervals } from './ValueIntervals';
import { ValueListAdapter } from './ValueListAdapter';
import { readField } from './read-field';

/** Asked for at once when every value is wanted. */
const ALL = 1_000_000;
/** The key of the tree's entry for empty values. */
export const BLANK_NODE = '(blank)';

/** A value as a map key: equal dates are equal, `1` and `'1'` are not. */
const bucketOf = (v: unknown) => (v instanceof Date ? `d${v.getTime()}` : `${typeof v}:${String(v)}`);

const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (typeof v === 'number' && Number.isNaN(v));

/**
 * Where a column's header filter gets its values: the app's `loadValues`, rows held in memory (the
 * grid counts them itself, the column's `value` reader and format included), or an adapter that
 * groups (one grouped load per part, with counts). Every way honors the other filters. A column can
 * group them into ranges of numbers or parts of dates (`headerFilterInterval`, a tree for more than
 * one level), counted in the browser from every distinct value, or give entries of its own
 * (`headerFilterItems`).
 */
export class FilterValues<T> {
  /** The lists of the lookup columns. */
  readonly lookups: LookupValues<T>;

  constructor(private readonly model: GridModel<T>) {
    this.lookups = new LookupValues<T>(model);
  }

  /** Whether the values of the column can be listed at all (a lookup column's always can: from its source; entries of its own always). */
  available(field?: string): boolean {
    if (field !== undefined) {
      const col = this.model.columns.get(field);
      if (col.lookup || col.headerFilterItems) return true;
    }
    const source = this.model.data.source;
    return !!this.model.loadValues || source.loadMode === 'all' || source.adapter.capabilities.group;
  }

  /** Whether the list can search: always in memory, in a lookup column (by text), in ranges and in entries of its own; on a server, text columns only. */
  searchable(field: string): boolean {
    const col = this.model.columns.get(field);
    if (col.lookup || col.headerFilterItems || this.intervals(field) || this.model.loadValues || this.model.data.source.loadMode === 'all') return true;
    return (col.type ?? 'text') === 'text' && !col.value;
  }

  /** The ranges or date parts of a column's header filter, or `null` for one entry per value. Reactive. */
  intervals(field: string): ValueIntervals | null {
    void this.model.columns.state.revision;
    const col = this.model.columns.get(field);
    if (col.lookup || col.headerFilterItems) return null;
    return ValueIntervals.of(col.type, readField(col, 'headerFilterInterval'), this.model.settings.get('headerFilterDateInterval'));
  }

  /** A list of values, or a tree (date parts, ranges in more than one level). Reactive. */
  kind(field: string): 'list' | 'tree' {
    return this.intervals(field)?.isTree ? 'tree' : 'list';
  }

  /** How a kept value of a column filters, when not by being equal: a range, or an entry's own expression. Reactive. */
  conditionOf(field: string): ((value: unknown) => data.FilterExpression | null) | null {
    void this.model.columns.state.revision;
    const col = this.model.columns.defs.get(field);
    if (!col) return null;
    if (col.headerFilterItems) return (value) => (data.isFilterExpression(value) ? value : null);
    const intervals = this.intervals(field);
    return intervals ? (value) => intervals.condition(field, value) : null;
  }

  /** The list of a column's header filter, made for one opening. */
  list(field: string): ValueList {
    const model = this.model;
    const col = model.columns.get(field);
    const pageSize = Math.max(1, Math.floor(model.settings.get('headerFilterPageSize')));
    const make = (loader: ValueLoader, textOf: (value: unknown) => string | Promise<string>) =>
      new data.DataSource<GridFilterValue, unknown>({ adapter: new ValueListAdapter(loader, textOf), loadMode: 'blocks', pageSize, searchFields: ['text'] });
    const everyEntry = (source: data.DataSource<GridFilterValue, unknown>) => async () => (await source.adapter.load({})).rows.map((r) => r.value);
    if (col.lookup) {
      const source = this.lookups.source(field, 'blank');
      return { source, toEntry: (v) => v, toValue: (v) => v, all: everyEntry(source) };
    }
    if (col.headerFilterItems) return this.ownList(col, make);
    const textOf = (value: unknown) => (isBlank(value) ? model.text('gridEmptyOption') : model.formatter.text(col, {} as T, value));
    const intervals = this.intervals(field);
    let entries: Promise<GridFilterValue[]> | null = null;
    const loader: ValueLoader = intervals
      ? async ({ search, skip, take, signal }) => {
          entries ??= this.buckets(field, intervals, signal).then((nodes) => nodes.map((n) => ({ value: n.value, text: n.text, count: n.count })));
          return slice(await entries, search, skip, take);
        }
      : this.loader(field);
    const source = make(loader, textOf);
    return { source, toEntry: (v) => v, toValue: (v) => v, all: everyEntry(source) };
  }

  /** The tree of a column's header filter: its date parts or ranges, with the rows under each, empty values first. */
  tree(field: string, signal: AbortSignal): Promise<FilterTreeNode[]> {
    const intervals = this.intervals(field);
    return intervals ? this.buckets(field, intervals, signal) : Promise.resolve([]);
  }

  /** The entries a column gives itself, by their place in the list; a kept value is found by what it is. */
  private ownList(col: GridColumn<T>, make: (loader: ValueLoader, textOf: (value: unknown) => string) => data.DataSource<GridFilterValue, unknown>): ValueList {
    const model = this.model;
    const field = col.field;
    let items: readonly GridFilterValue[] = [];
    let given: Promise<readonly GridFilterValue[]> | null = null;
    const ask = (signal: AbortSignal) => {
      const own = col.headerFilterItems!;
      const filter = data.and(model.baseFilter, model.filters.expression(field));
      return (given ??= Promise.resolve(typeof own === 'function' ? own({ column: col, filter, signal, values: () => this.distinctWithTexts(field, signal) }) : own).then((list) => (items = list)));
    };
    const entryOf = (i: number) => `item:${i}`;
    const loader: ValueLoader = async ({ search, skip, take, signal }) => {
      const list = await ask(signal);
      const entries = list.map((item, i) => ({ value: entryOf(i), text: item.text ?? String(item.value ?? model.text('gridEmptyOption')), count: item.count }));
      return slice(entries, search, skip, take);
    };
    const textOf = (entry: unknown) => {
      const at = typeof entry === 'string' && entry.startsWith('item:') ? Number(entry.slice(5)) : -1;
      return items[at]?.text ?? '';
    };
    const key = (v: unknown) => JSON.stringify(v ?? null);
    return {
      source: make(loader, textOf),
      toEntry: (value) => {
        const at = items.findIndex((item) => key(item.value) === key(value));
        return at < 0 ? undefined : entryOf(at);
      },
      toValue: (entry) => {
        const at = typeof entry === 'string' && entry.startsWith('item:') ? Number(entry.slice(5)) : -1;
        return at < 0 ? undefined : items[at]?.value;
      },
      all: async () => {
        await ask(new AbortController().signal);
        return items.map((_, i) => entryOf(i));
      },
    };
  }

  /** Every distinct value of the column under the other filters, grouped into its ranges or date parts. */
  private async buckets(field: string, intervals: ValueIntervals, signal: AbortSignal): Promise<FilterTreeNode[]> {
    const model = this.model;
    const col = model.columns.get(field);
    const values = await this.loader(field)({ search: '', skip: 0, take: ALL, signal });
    const roots: FilterTreeNode[] = [];
    const byId = new Map<string, FilterTreeNode>();
    let blank: FilterTreeNode | null = null;
    // Counts add up while the values have them (`loadValues` may give none).
    const add = (node: FilterTreeNode, count: number | undefined) => {
      if (count !== undefined) node.count = (node.count ?? 0) + count;
    };
    for (const v of values.values) {
      const parts = intervals.partsOf(v.value);
      if (!parts) {
        blank ??= { id: BLANK_NODE, value: null, text: model.text('gridEmptyOption') };
        add(blank, v.count);
        continue;
      }
      let list = roots;
      for (let depth = 1; depth <= parts.length; depth++) {
        const value = intervals.keyOf(parts, depth);
        const id = String(value);
        let node = byId.get(id);
        if (!node) {
          node = { id, value, text: this.partText(col, intervals, parts[depth - 1], depth) };
          byId.set(id, node);
          list.push(node);
        }
        add(node, v.count);
        if (depth < parts.length) list = node.children ??= [];
      }
    }
    const order = (list: FilterTreeNode[]) => {
      list.sort((a, b) => last(intervals.partsOfKey(a.value)) - last(intervals.partsOfKey(b.value)));
      for (const node of list) if (node.children) order(node.children);
    };
    order(roots);
    return blank ? [blank, ...roots] : roots;
  }

  /** The text of a node: a year, Q2, a month's name, a day or a time part; "0 – 100" for a range. */
  private partText(col: GridColumn<T>, intervals: ValueIntervals, part: number, depth: number): string {
    const model = this.model;
    const level = intervals.levels[depth - 1];
    if (intervals.kind === 'number') {
      const text = (n: number) => model.formatter.text({ ...col, type: 'number' }, {} as T, n);
      return model.text('gridValueRange', { from: text(part), to: text(part + (level as number)) });
    }
    if (level === 'quarter') return model.text('gridQuarter', { quarter: part });
    if (level === 'month') return new Intl.DateTimeFormat(model.formatter.locale, { month: 'long' }).format(new Date(2000, part - 1, 1));
    return String(part);
  }

  /** The column's values the list would show, with their texts: for the app's own entries to start from. */
  private async distinctWithTexts(field: string, signal: AbortSignal): Promise<GridFilterValue[]> {
    const model = this.model;
    const col = model.columns.get(field);
    const { values } = await this.loader(field)({ search: '', skip: 0, take: ALL, signal });
    return values.map((v) => ({ ...v, text: v.text ?? (isBlank(v.value) ? model.text('gridEmptyOption') : model.formatter.text(col, {} as T, v.value)) }));
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
      return slice(await all, search, skip, take);
    };
  }

  /** Every distinct value of the rows the other filters leave, with counts, empty first, then in order; each value of a list (`multiple`) on its own. */
  private async countValues(field: string, filter: data.FilterExpression | null, signal: AbortSignal): Promise<GridFilterValue[]> {
    const model = this.model;
    const col = model.columns.get(field);
    const { rows } = await model.data.source.adapter.load({ filter, signal });
    const buckets = new Map<string, { value: unknown; row: T; count: number }>();
    for (const row of rows) {
      const raw = cellValue(col, row);
      const values = col.multiple ? listValues(raw) : [raw];
      // A row counts once for each value it holds.
      const keys = new Set<string>();
      for (const one of values.length ? values : [null]) {
        const value = isBlank(one) ? null : one;
        const key = value === null ? '' : bucketOf(value);
        if (keys.has(key)) continue;
        keys.add(key);
        const bucket = buckets.get(key);
        if (bucket) bucket.count++;
        else buckets.set(key, { value, row, count: 1 });
      }
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

/** A part of the entries, those whose text holds the search. */
function slice(entries: readonly GridFilterValue[], search: string, skip: number, take: number): GridValuesResult {
  const text = search.trim().toLocaleLowerCase();
  const found = text ? entries.filter((v) => (v.text ?? '').toLocaleLowerCase().includes(text)) : entries;
  return { values: found.slice(skip, skip + take), total: found.length };
}

function last(parts: number[] | null): number {
  return parts ? parts[parts.length - 1] : Number.NEGATIVE_INFINITY;
}
