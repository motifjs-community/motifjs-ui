import { data } from '@motifx-community/data';

/** Two cell values are the same: empty ones (`null`, `undefined`, `''`) alike, dates by moment. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (data.isEmpty(a) && data.isEmpty(b)) return true;
  if (a instanceof Date || b instanceof Date) return data.toDate(a)?.getTime() === data.toDate(b)?.getTime();
  return Object.is(a, b);
}
