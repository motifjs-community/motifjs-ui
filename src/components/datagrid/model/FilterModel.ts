import { reactive, untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { ColumnFilter } from '../column-filter';
import type { GridFilterOperator } from '../grid-filter-operator';
import type { GridFilters } from '../grid-filters';
import type { ColumnModel } from './ColumnModel';

const TEXT_OPS: readonly GridFilterOperator[] = ['contains', 'startswith', 'endswith', '=', '<>', 'isblank', 'isnotblank'];
const RANGE_OPS: readonly GridFilterOperator[] = ['=', '<>', '<', '<=', '>', '>=', 'between', 'isblank', 'isnotblank'];
const LIST_OPS: readonly GridFilterOperator[] = ['=', '<>', 'isblank', 'isnotblank'];

const empty = (v: unknown) => v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));

/**
 * The grid's filters by field: the filter row's condition and the header filter's values. Turns them
 * into one data-layer filter (`expression`), each column's part only while its feature is on, so
 * switching a feature off takes its filter out. Reads are reactive per column.
 */
export class FilterModel<T> {
  readonly state = reactive({ columns: {} as Record<string, ColumnFilter> });
  /** The last change came from typing: wait `filterDelay` before applying it. */
  typed = false;

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

  clearAll() {
    this.typed = false;
    const next: Record<string, ColumnFilter> = {};
    for (const [field, f] of Object.entries(untracked(() => ({ ...this.state.columns })))) if (f.op) next[field] = { op: f.op };
    this.state.columns = next;
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
    const col = this.columns.get(field);
    if (col.lookup) return [];
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
    const col = this.columns.get(field);
    return col.filterOperator && ops.includes(col.filterOperator) ? col.filterOperator : (ops[0] ?? '=');
  }

  /**
   * Every column's filter together (AND); `skipValuesOf` leaves one column's header values out (for
   * its own value list), `skipColumn` its whole filter (a lookup's lists honor only the other columns).
   */
  expression(skipValuesOf?: string, skipColumn?: string): data.FilterExpression | null {
    const parts: (data.FilterExpression | null)[] = [];
    for (const [field, f] of Object.entries(this.state.columns)) {
      if (!this.columns.defs.has(field) || field === skipColumn) continue;
      parts.push(this.rowPart(field, f));
      if (field !== skipValuesOf) parts.push(this.valuesPart(field, f));
    }
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

  private valuesPart(field: string, f: ColumnFilter): data.FilterExpression | null {
    if (!f.values?.length || !this.columns.can(field, 'headerFilter')) return null;
    const values = f.values.filter((v) => !empty(v));
    const blank = values.length < f.values.length;
    return data.or(values.length ? data.where(field, 'in', values) : null, blank ? data.where(field, 'isblank') : null);
  }
}

/** A date condition by calendar day, whatever time the values carry. */
function dayCondition(field: string, op: GridFilterOperator, value: unknown): data.FilterExpression | null {
  const start = dayStart(value);
  const end = dayEnd(value);
  if (!start || !end) return null;
  switch (op) {
    case '=':
      return data.where(field, 'between', [start, end]);
    case '<>':
      return data.or(data.where(field, '<', start), data.where(field, '>', end));
    case '<':
      return data.where(field, '<', start);
    case '<=':
      return data.where(field, '<=', end);
    case '>':
      return data.where(field, '>', end);
    default:
      return data.where(field, '>=', start);
  }
}

function dayStart(v: unknown): Date | null {
  const d = data.toDate(v);
  return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;
}

function dayEnd(v: unknown): Date | null {
  const d = dayStart(v);
  return d ? new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - 1) : null;
}
