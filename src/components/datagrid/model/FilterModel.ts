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

/**
 * The grid's filters by field: the filter row's condition and the header filter's values, and the
 * search panel's filter. Turns them into one data-layer filter (`expression`), each column's part
 * only while its feature is on, so switching a feature off takes its filter out. Reads are reactive
 * per column.
 */
export class FilterModel<T> {
  /** `search` counts changes of the search's filter, which is kept outside (it may hold dates). */
  readonly state = reactive({ columns: {} as Record<string, ColumnFilter>, search: 0 });
  /** The last change came from typing: wait `filterDelay` before applying it. */
  typed = false;
  /** How a column's header filter value filters when not by being equal (a range, an expression); the grid gives it. */
  conditionOf: (field: string) => ((value: unknown) => data.FilterExpression | null) | null = () => null;
  private searchPart: data.FilterExpression | null = null;

  constructor(private readonly columns: ColumnModel<T>) {}

  get(field: string): ColumnFilter | undefined {
    return this.state.columns[field];
  }

  /** Changes part of a column's filter. `typed` waits a moment before the grid applies it. */
  update(field: string, change: Partial<ColumnFilter>, typed = false) {
    this.typed = typed;
    const next: ColumnFilter = { ...this.state.columns[field], ...change };
    for (const key of Object.keys(next) as (keyof ColumnFilter)[]) if (next[key] === undefined) delete next[key];
    this.state.columns[field] = next;
  }

  /** Takes the filter row's value (or the header filter's values) of a column away; its condition stays. */
  clear(field: string, part: 'row' | 'values' | 'all' = 'all') {
    const f = this.state.columns[field];
    if (!f) return;
    this.typed = false;
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

  clearAll() {
    this.typed = false;
    const next: Record<string, ColumnFilter> = {};
    for (const [field, f] of Object.entries(untracked(() => ({ ...this.state.columns })))) if (f.op) next[field] = { op: f.op };
    this.state.columns = next;
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

  /** Whether any column filters rows now. */
  any(): boolean {
    for (const field of Object.keys(this.state.columns)) if (this.isActive(field)) return true;
    return false;
  }

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
   * Every column's filter and the search together (AND); `skipValuesOf` leaves one column's header values out (for
   * its own value list), `skipColumn` its whole filter (a lookup's lists honor only the other columns).
   */
  expression(skipValuesOf?: string, skipColumn?: string): data.FilterExpression | null {
    const parts: (data.FilterExpression | null)[] = [];
    for (const [field, f] of Object.entries(this.state.columns)) {
      if (!this.columns.defs.has(field) || field === skipColumn) continue;
      parts.push(this.rowPart(field, f));
      if (field !== skipValuesOf) parts.push(this.valuesPart(field, f));
    }
    parts.push(this.search());
    return data.and(...parts);
  }

  private rowPart(field: string, f: ColumnFilter): data.FilterExpression | null {
    if (!this.columns.can(field, 'filterRow')) return null;
    const col = this.columns.get(field);
    if (col.type === 'boolean') return typeof f.value === 'boolean' ? data.where(field, '=', f.value) : null;
    if (col.lookup) return empty(f.value) ? null : data.where(field, '=', f.value);
    const op = this.operator(field);
    if (op === 'isblank' || op === 'isnotblank') return data.where(field, op);
    if (op === 'between') {
      if (empty(f.value) && empty(f.value2)) return null;
      if (col.type === 'date') return data.where(field, 'between', [dayStart(f.value), dayEnd(f.value2)]);
      return data.where(field, 'between', [empty(f.value) ? null : f.value, empty(f.value2) ? null : f.value2]);
    }
    if (empty(f.value)) return null;
    if (col.type === 'date') return dayCondition(field, op, f.value);
    return data.where(field, op, f.value);
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
