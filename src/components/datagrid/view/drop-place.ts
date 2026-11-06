/** Where a dragged column or band lands among its neighbors, and where the mark between them goes. */
export interface DropPlace {
  /** Its place among them after the drop. */
  target: number;
  /** The x of the boundary it would land on, or `null` when it would stay where it is. */
  x: number | null;
}

/**
 * The place a column or band dragged to `x` lands: the number of neighbors whose centre lies
 * before the pointer, kept within `lo`…`hi`. `rects` are the neighbors on the screen, the dragged
 * one at `from` among them.
 */
export function dropPlace(rects: readonly { left: number; right: number }[], from: number, lo: number, hi: number, x: number, rtl: boolean): DropPlace {
  let count = 0;
  for (const r of rects) {
    const centre = (r.left + r.right) / 2;
    if (rtl ? x < centre : x > centre) count++;
  }
  const target = Math.max(lo, Math.min(hi, count > from ? count - 1 : count));
  if (target === from) return { target, x: null };
  const r = rects[target];
  const after = target > from;
  return { target, x: rtl ? (after ? r.left : r.right) : after ? r.right : r.left };
}
