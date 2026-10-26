import { reactive, untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { ColumnFilter } from '../column-filter';
import type { GridFilterOperator } from '../grid-filter-operator';
import type { GridFilters } from '../grid-filters';
import type { ColumnModel } from './ColumnModel';
import { dayCondition, dayEnd, dayStart } from './day-condition';

const TEXT_OPS: readonly GridFilterOperator[] = ['contains', 'startswith', 'endswith', '=', '<>', 'isblank', 'isnotblank'];
const RANGE_OPS: readonly GridFilterOperator[] = ['=', '<>', '<', '<=', '>', '>=', 'between', 'isblank', 'isnotblank'];
const LIST_OPS: readonly GridFilterOperator[] = ['=', '<>', 'isblank', 'isnotblank'];

const empty = (v: unknown) => v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));
const key = (e: unknown) => JSON.stringify(e ?? null);

/**
 * The grid's filters by field: the filter row's condition and the header filter's values, the
 * conditions of the filter value that no column shows (the filter builder's), and the search
 * panel's filter. Turns them into one data-layer filter (`expression`), each column's part only
 * while its feature is on, so switching a feature off takes its filter out. With `sync` the filter
 * value holds the columns' parts too (`filterValue`), and a filter value given is shared out to the
 * columns that can show its conditions. Reads are reactive per column.
 */
export class FilterModel<T> {
  /** `search` and `extra` count changes of the parts kept outside (they may hold dates). */
  readonly state = reactive({ columns: {} as Record<string, ColumnFilter>, search: 0, extra: 0, enabled: true });
  /** The last change came from typing: wait `filterDelay` before applying it. */
  typed = false;
  /** How a column's header filter value filters when not by being equal (a range, an expression); the grid gives it. */
  conditionOf: (field: string) => ((value: unknown) => data.FilterExpression | null) | null = () => null;
  /** Whether the filter row and the header filters are part of the filter value (`filterSyncEnabled`); the grid gives it. */
  sync: () => boolean = () => false;
  private searchPart: data.FilterExpression | null = null;
  /** Conditions of the filter value no column shows, in order; with `sync` off, the whole filter value. */
  private extraItems: data.FilterExpression[] = [];
  /** The header filter part each column last wrote into the filter value, to know it again. */
  private readonly written = new Map<string, { key: string; values: unknown[]; filterType?: 'exclude' }>();

  constructor(private readonly columns: ColumnModel<T>) {}

  get(field: string): ColumnFilter | undefined {
    return this.state.columns[field];
  }

  /** Changes part of a column's filter. `typed` waits a moment before the grid applies it. */
  update(field: string, change: Partial<ColumnFilter>, typed = false) {
    this.typed = typed;
    this.state.enabled = true;
    const next: ColumnFilter = { ...this.state.columns[field], ...change };
    for (const key of Object.keys(next) as (keyof ColumnFilter)[]) if (next[key] === undefined) delete next[key];
    this.state.columns[field] = next;
  }

  /** Takes the filter row's value (or the header filter's values) of a column away; its condition stays. */
  clear(field: string, part: 'row' | 'values' | 'all' = 'all') {
    const f = this.state.columns[field];
    if (!f) return;
    this.typed = false;
    this.state.enabled = true;
    if (part === 'all') this.state.columns[field] = f.op ? { op: f.op } : {};
    else if (part === 'row') this.update(field, { value: undefined, value2: undefined });
    else this.update(field, { values: undefined });
  }

  /** Forgets a column's filter, its condition too (the column went away). */
  drop(field: string) {
    if (!(field in untracked(() => this.state.columns))) return;
    this.typed = false;
    const next = { ...untracked(() => this.state.columns) };
    delete next[field];
    this.state.columns = next;
  }

  /** Every column's filter and the filter value's own conditions go; the conditions chosen in the filter row stay. */
  clearAll() {
    this.typed = false;
    const next: Record<string, ColumnFilter> = {};
    for (const [field, f] of Object.entries(untracked(() => ({ ...this.state.columns })))) if (f.op) next[field] = { op: f.op };
    this.state.columns = next;
    this.setExtra([]);
    this.state.enabled = true;
  }

  /** The search panel's filter, joined to the others (AND); `null` takes it away. */
  setSearch(filter: data.FilterExpression | null) {
    this.typed = false;
    this.searchPart = filter;
    this.state.search++;
  }

  /** The search panel's filter now. Reactive. */
  search(): data.FilterExpression | null {
    void this.state.search;
    return this.searchPart;
  }

  /** A copy of the filters that do something. */
  toFilters(): GridFilters {
    const out: GridFilters = {};
    for (const [field, f] of Object.entries(this.state.columns)) {
      if (!this.rowPart(field, f) && !this.valuesPart(field, f)) continue;
      out[field] = { ...f, values: f.values ? [...f.values] : undefined };
      if (!out[field].values) delete out[field].values;
    }
    return out;
  }

  replace(filters: GridFilters) {
    this.typed = false;
    const next: Record<string, ColumnFilter> = {};
    for (const [field, f] of Object.entries(filters)) if (this.columns.defs.has(field) && !this.columns.isInternal(field)) next[field] = { ...f };
    this.state.columns = next;
  }

  /** Whether the column filters rows now (row part or values part). */
  isActive(field: string): boolean {
    const f = this.state.columns[field];
    return !!f && (!!this.rowPart(field, f) || !!this.valuesPart(field, f));
  }

  hasValues(field: string): boolean {
    const f = this.state.columns[field];
    return !!f && !!this.valuesPart(field, f);
  }

  /** Whether any filter but the search leaves rows out now. */
  any(): boolean {
    const enabled = this.state.enabled;
    if (enabled && this.extra()) return true;
    if (!enabled && this.sync()) return false;
    for (const field of Object.keys(this.state.columns)) if (this.isActive(field)) return true;
    return false;
  }

  // The filter value.

  /** Whether the filter value applies (the filter panel's check box). Reactive. */
  get enabled(): boolean {
    return this.state.enabled;
  }
  set enabled(on: boolean) {
    this.typed = false;
    this.state.enabled = on;
  }

  /** The conditions of the filter value no column shows (with `sync` off, the whole filter value). Reactive. */
  extra(): data.FilterExpression | null {
    void this.state.extra;
    return data.and(...this.extraItems);
  }

  /**
   * The filter value: with `sync`, every column's filter row condition and header filter values
   * and the conditions no column shows, joined with AND; without, the filter value given alone.
   * Dates are as they were chosen (a day, not its first and last moment). Reactive.
   */
  filterValue(): data.FilterExpression | null {
    if (!this.sync()) return this.extra();
    const parts: (data.FilterExpression | null)[] = [];
    for (const [field, f] of Object.entries(this.state.columns)) {
      if (!this.columns.defs.has(field)) continue;
      parts.push(this.rowCondition(field, f));
      const values = this.valuesPart(field, f);
      if (values) untracked(() => this.written.set(field, { key: key(values), values: [...f.values!], filterType: f.filterType === 'exclude' ? 'exclude' : undefined }));
      parts.push(values);
    }
    void this.state.extra;
    return data.and(...parts, ...this.extraItems);
  }

  /**
   * Takes a filter value. With `sync` its conditions (the items of a top AND) go to the filter row
   * and the header filter of their column where those can show them, one each, and the rest is kept
   * as the filter value's own; without, all of it is.
   */
  setFilterValue(value: data.FilterExpression | null) {
    this.typed = false;
    this.state.enabled = true;
    if (!this.sync()) return this.setExtra(value ? [value] : []);
    const items = !value ? [] : !data.isCondition(value) && 'and' in value ? value.and : [value];
    const next: Record<string, ColumnFilter> = {};
    for (const [field, f] of Object.entries(untracked(() => ({ ...this.state.columns })))) if (f.op) next[field] = { op: f.op };
    const taken = new Set<string>();
    const rest: data.FilterExpression[] = [];
    for (const item of items) {
      const part = untracked(() => this.columnPartOf(item, taken));
      if (!part) {
        rest.push(item);
        continue;
      }
      taken.add(`${part.kind}:${part.field}`);
      const f: ColumnFilter = { ...next[part.field], ...part.change };
      for (const k of Object.keys(f) as (keyof ColumnFilter)[]) if (f[k] === undefined) delete f[k];
      next[part.field] = f;
    }
    this.state.columns = next;
    this.setExtra(rest);
  }

  /** The filter value's own conditions as they were, and whether it applied (a change put back). */
  restoreValue(extra: data.FilterExpression | null, enabled: boolean) {
    this.setExtra(extra ? (!data.isCondition(extra) && 'and' in extra ? [...extra.and] : [extra]) : []);
    this.state.enabled = enabled;
  }

  /** The filter value goes; with `sync`, so do the columns' filters (their conditions stay). */
  clearValue() {
    if (this.sync()) this.clearAll();
    else {
      this.setExtra([]);
      this.state.enabled = true;
    }
  }

  private setExtra(items: data.FilterExpression[]) {
    this.extraItems = items;
    this.state.extra++;
  }

  /** Where a condition of a filter value shows: a column's filter row, or its header filter. */
  private columnPartOf(item: data.FilterExpression, taken: Set<string>): { field: string; kind: 'row' | 'values'; change: Partial<ColumnFilter> } | null {
    const cols = this.columns;
    const usable = (field: string, feature: 'filterRow' | 'headerFilter', kind: 'row' | 'values') =>
      cols.defs.has(field) && !cols.isInternal(field) && cols.can(field, feature) && !taken.has(`${kind}:${field}`);
    if (data.isCondition(item)) {
      const field = item.field;
      if (usable(field, 'filterRow', 'row')) {
        const change = this.rowChangeOf(field, item);
        if (change) return { field, kind: 'row', change };
      }
      if (usable(field, 'headerFilter', 'values')) {
        const values = item.op === 'in' || item.op === 'notin' ? (Array.isArray(item.value) ? [...item.value] : null) : item.op === '=' && !empty(item.value) ? [item.value] : item.op === 'isblank' ? [null] : null;
        if (values?.length) return { field, kind: 'values', change: { values, filterType: item.op === 'notin' ? 'exclude' : undefined } };
      }
      return null;
    }
    const k = key(item);
    for (const [field, w] of this.written) {
      if (w.key === k && usable(field, 'headerFilter', 'values')) return { field, kind: 'values', change: { values: [...w.values], filterType: w.filterType } };
    }
    if ('not' in item && data.isCondition(item.not) && item.not.op === 'in' && Array.isArray(item.not.value) && usable(item.not.field, 'headerFilter', 'values')) {
      return { field: item.not.field, kind: 'values', change: { values: [...item.not.value], filterType: 'exclude' } };
    }
    return null;
  }

  /** The filter row state that shows a condition, if the column's filter row can. */
  private rowChangeOf(field: string, c: data.FilterCondition): Partial<ColumnFilter> | null {
    const col = this.columns.get(field);
    if (col.type === 'boolean') return c.op === '=' && typeof c.value === 'boolean' ? { value: c.value } : null;
    if (col.lookup) return c.op === '=' && !empty(c.value) && !Array.isArray(c.value) ? { value: c.value } : null;
    if (!this.operators(field).includes(c.op as GridFilterOperator)) return null;
    const op = c.op as GridFilterOperator;
    if (op === 'isblank' || op === 'isnotblank') return { op, value: undefined, value2: undefined };
    if (op === 'between') {
      if (!Array.isArray(c.value) || c.value.length !== 2) return null;
      return { op, value: empty(c.value[0]) ? undefined : c.value[0], value2: empty(c.value[1]) ? undefined : c.value[1] };
    }
    if (empty(c.value) || Array.isArray(c.value)) return null;
    return { op, value: c.value, value2: undefined };
  }

  // Conditions.

  /** The conditions the filter row offers for a column; none for a check box column and a lookup column (always `=`). */
  operators(field: string): readonly GridFilterOperator[] {
    // A column that went has none (its editors may still be going).
    const col = this.columns.defs.get(field);
    if (!col || col.lookup) return [];
    const own = col.filterOperators?.length ? col.filterOperators : null;
    switch (col.type) {
      case 'boolean':
        return [];
      case 'number':
      case 'date':
        return own ?? RANGE_OPS;
      case 'list':
        return own ?? LIST_OPS;
      default:
        return own ?? TEXT_OPS;
    }
  }

  /** The condition of a column's filter row: its own, else the column's default. */
  operator(field: string): GridFilterOperator {
    const ops = this.operators(field);
    const set = this.state.columns[field]?.op;
    if (set && ops.includes(set)) return set;
    const own = this.columns.defs.get(field)?.filterOperator;
    return own && ops.includes(own) ? own : (ops[0] ?? '=');
  }

  /**
   * Every column's filter, the filter value's own conditions and the search together (AND), as the
   * data layer runs them; `skipValuesOf` leaves one column's header values out (for its own value
   * list), `skipColumn` its whole filter (a lookup's lists honor only the other columns).
   */
  expression(skipValuesOf?: string, skipColumn?: string): data.FilterExpression | null {
    const parts: (data.FilterExpression | null)[] = [];
    const enabled = this.state.enabled;
    if (enabled || !this.sync()) {
      for (const [field, f] of Object.entries(this.state.columns)) {
        if (!this.columns.defs.has(field) || field === skipColumn) continue;
        parts.push(this.rowPart(field, f));
        if (field !== skipValuesOf) parts.push(this.valuesPart(field, f));
      }
    }
    void this.state.extra;
    if (enabled) {
      const skip = skipColumn ?? skipValuesOf;
      for (const item of this.extraItems) if (!skip || !data.fieldsInFilter(item).has(skip)) parts.push(this.applied(item));
    }
    parts.push(this.search());
    return data.and(...parts);
  }

  /** A filter value's condition as the data layer runs it: a date column's by calendar day. */
  applied(e: data.FilterExpression): data.FilterExpression | null {
    if (data.isCondition(e)) {
      if (this.columns.defs.get(e.field)?.type !== 'date') return e;
      if (e.op === 'between' && Array.isArray(e.value)) return data.where(e.field, 'between', [dayStart(e.value[0]), dayEnd(e.value[1])]);
      if (['=', '<>', '<', '<=', '>', '>='].includes(e.op) && !empty(e.value)) return dayCondition(e.field, e.op as GridFilterOperator, e.value);
      return e;
    }
    if ('and' in e) return data.and(...e.and.map((x) => this.applied(x))) ?? { and: [] };
    if ('or' in e) return data.or(...e.or.map((x) => this.applied(x))) ?? data.none();
    const inner = this.applied(e.not);
    return inner ? data.not(inner) : null;
  }

  /** The filter row's condition of a column as chosen (a day stays a day). */
  private rowCondition(field: string, f: ColumnFilter): data.FilterExpression | null {
    if (!this.columns.can(field, 'filterRow')) return null;
    const col = this.columns.get(field);
    if (col.type === 'boolean') return typeof f.value === 'boolean' ? data.where(field, '=', f.value) : null;
    if (col.lookup) return empty(f.value) ? null : data.where(field, '=', f.value);
    const op = this.operator(field);
    if (op === 'isblank' || op === 'isnotblank') return data.where(field, op);
    if (op === 'between') {
      if (empty(f.value) && empty(f.value2)) return null;
      return data.where(field, 'between', [empty(f.value) ? null : f.value, empty(f.value2) ? null : f.value2]);
    }
    if (empty(f.value)) return null;
    return data.where(field, op, f.value);
  }

  private rowPart(field: string, f: ColumnFilter): data.FilterExpression | null {
    const c = this.rowCondition(field, f);
    return c ? this.applied(c) : null;
  }

  /** The header filter's part: any of the values (`in`, ranges, expressions, empty), or none of them with `filterType: 'exclude'`. */
  private valuesPart(field: string, f: ColumnFilter): data.FilterExpression | null {
    if (!f.values?.length || !this.columns.can(field, 'headerFilter')) return null;
    const own = this.conditionOf(field);
    const plain: unknown[] = [];
    const parts: data.FilterExpression[] = [];
    let blank = false;
    for (const v of f.values) {
      const condition = empty(v) ? null : own?.(v);
      if (empty(v)) blank = true;
      else if (condition) parts.push(condition);
      else plain.push(v);
    }
    const any = data.or(plain.length ? data.where(field, 'in', plain) : null, ...parts, blank ? data.where(field, 'isblank') : null);
    return any && f.filterType === 'exclude' ? data.not(any) : any;
  }
}
