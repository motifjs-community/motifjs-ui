/** Where a dragged row lands among the rows under the pointer: before row `gap` (`rows.length`: after the last), or onto row `inside`. */
export interface RowDropPlace {
  gap: number;
  /** The row dropped onto, or -1. */
  inside: number;
}

/**
 * The place a row dragged to `y` lands among `rows` (drawn rows, top to bottom): in the middle half
 * of a row that takes drops (`canDropInside`) onto it, else before the row whose middle lies after
 * the pointer. Above the first row is before it, below the last after it.
 */
export function rowDropPlace(rows: readonly { top: number; bottom: number }[], y: number, canDropInside: (k: number) => boolean): RowDropPlace {
  for (let k = 0; k < rows.length; k++) {
    const { top, bottom } = rows[k];
    if (y >= bottom) continue;
    if (y < top) return { gap: k, inside: -1 };
    const quarter = (bottom - top) / 4;
    if (canDropInside(k) && y >= top + quarter && y < bottom - quarter) return { gap: -1, inside: k };
    return { gap: y < (top + bottom) / 2 ? k : k + 1, inside: -1 };
  }
  return { gap: rows.length, inside: -1 };
}
