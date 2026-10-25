import { data } from '@motifx-community/data';
import type { GridFilterOperator } from '../grid-filter-operator';

/** A date condition by calendar day, whatever time the values carry. */
export function dayCondition(field: string, op: GridFilterOperator, value: unknown): data.FilterExpression | null {
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

export function dayStart(v: unknown): Date | null {
  const d = data.toDate(v);
  return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;
}

export function dayEnd(v: unknown): Date | null {
  const d = dayStart(v);
  return d ? new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - 1) : null;
}
