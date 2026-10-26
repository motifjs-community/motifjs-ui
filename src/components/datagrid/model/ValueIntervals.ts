import { data } from '@motifx-community/data';
import type { ColumnType } from '../column-type';
import type { GridDateInterval } from '../grid-date-interval';
import type { GridHeaderFilterInterval } from '../grid-header-filter-interval';

const DATE_PARTS: readonly GridDateInterval[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];

/**
 * The levels a header filter groups a column's values by: date parts (year → month → day …, or
 * year → quarter) or ranges of numbers, the largest first. A node is kept in the column's filter as
 * its path: the first part alone as a number (`2024`, `100`), deeper ones joined by `/` (`'2024/3'`,
 * `'1000/1200'`), so a value tells its own level, and stands for a range (`>=` its start, `<` its end).
 */
export class ValueIntervals {
  private constructor(
    readonly kind: 'number' | 'date',
    readonly levels: readonly (number | GridDateInterval)[],
  ) {}

  /** The levels of a column, from its own interval or (dates) the grid's; `null` for one entry per value. */
  static of(type: ColumnType | undefined, own: GridHeaderFilterInterval | undefined, dateDefault: GridDateInterval | null): ValueIntervals | null {
    if (type === 'date') {
      const deepest = own === undefined ? dateDefault : own;
      if (deepest === 'quarter') return new ValueIntervals('date', ['year', 'quarter']);
      const at = typeof deepest === 'string' ? DATE_PARTS.indexOf(deepest) : -1;
      return at < 0 ? null : new ValueIntervals('date', DATE_PARTS.slice(0, at + 1));
    }
    if (type !== 'number' || own === undefined || own === null || typeof own === 'string') return null;
    const steps = (typeof own === 'number' ? [own] : [...own]).filter((n) => typeof n === 'number' && Number.isFinite(n) && n > 0);
    return steps.length ? new ValueIntervals('number', steps) : null;
  }

  /** More than one level: the values show as a tree. */
  get isTree(): boolean {
    return this.levels.length > 1;
  }

  /** The parts of a value, one per level (`[2024, 3, 15]`, `[1000, 1200]`); `null` for an empty or unreadable one. */
  partsOf(value: unknown): number[] | null {
    if (data.isEmpty(value)) return null;
    if (this.kind === 'date') {
      const d = data.toDate(value);
      return d ? this.levels.map((level) => datePart(d, level as GridDateInterval)) : null;
    }
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? this.levels.map((step) => Math.floor(n / (step as number)) * (step as number)) : null;
  }

  /** What the filter keeps for the node of the first `depth` parts. */
  keyOf(parts: readonly number[], depth: number): number | string {
    return depth === 1 ? parts[0] : parts.slice(0, depth).join('/');
  }

  /** The parts a kept value names; `null` when it names none. */
  partsOfKey(key: unknown): number[] | null {
    if (data.isEmpty(key) || (typeof key !== 'number' && typeof key !== 'string')) return null;
    const parts = String(key).split('/').map(Number);
    return parts.length <= this.levels.length && parts.every(Number.isFinite) ? parts : null;
  }

  /** The rows a kept value stands for: from its start up to (not with) its end; `null` when it names none. */
  condition(field: string, key: unknown): data.FilterExpression | null {
    const parts = this.partsOfKey(key);
    if (!parts) return null;
    const range = this.kind === 'date' ? dateRange(parts, this.levels as GridDateInterval[]) : numberRange(parts, this.levels as number[]);
    return data.and(data.where(field, '>=', range.start), data.where(field, '<', range.end));
  }
}

function datePart(d: Date, level: GridDateInterval): number {
  switch (level) {
    case 'year':
      return d.getFullYear();
    case 'quarter':
      return Math.floor(d.getMonth() / 3) + 1;
    case 'month':
      return d.getMonth() + 1;
    case 'day':
      return d.getDate();
    case 'hour':
      return d.getHours();
    case 'minute':
      return d.getMinutes();
    default:
      return d.getSeconds();
  }
}

/** Local dates, as a date picker means them. Months and quarters count from 1. */
function dateRange(parts: readonly number[], levels: readonly GridDateInterval[]): { start: Date; end: Date } {
  const level = levels[parts.length - 1];
  if (level === 'quarter') return { start: new Date(parts[0], (parts[1] - 1) * 3, 1), end: new Date(parts[0], parts[1] * 3, 1) };
  const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = parts;
  const at = [year, month - 1, day, hour, minute, second];
  const start = new Date(at[0], at[1], at[2], at[3], at[4], at[5]);
  at[parts.length - 1]++;
  const end = new Date(at[0], at[1], at[2], at[3], at[4], at[5]);
  return { start, end };
}

function numberRange(parts: readonly number[], steps: readonly number[]): { start: number; end: number } {
  const start = parts[parts.length - 1];
  return { start, end: start + steps[parts.length - 1] };
}
