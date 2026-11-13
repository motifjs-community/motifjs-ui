import { data } from '@motifx-community/data';
import { emptyCell } from './cell-list';

/** Two cell values are the same: empty ones (`null`, `undefined`, `''`, an empty list) alike, dates by moment, lists item by item. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (emptyCell(a) && emptyCell(b)) return true;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => sameValue(x, b[i]));
  if (a instanceof Date || b instanceof Date) return data.toDate(a)?.getTime() === data.toDate(b)?.getTime();
  return Object.is(a, b);
}
