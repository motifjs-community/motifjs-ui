/** An appointment along a row: from `start` to `end` (any unit, `end` not included). */
export interface StackSpan {
  id: string;
  start: number;
  end: number;
  /** Ones that start together go in this order. */
  order: number;
}

/**
 * Gives each span the lowest lane free at its start, so the ones at the same time stack; earlier
 * first, and of those the longer one, so it stays on top. A row's lanes are counted on that row
 * alone.
 */
export function placeStack(spans: readonly StackSpan[]): { lanes: Map<string, number>; count: number } {
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || a.order - b.order || (a.id < b.id ? -1 : 1));
  const ends: number[] = [];
  const lanes = new Map<string, number>();
  for (const span of sorted) {
    // A span of no length still takes its place.
    const end = Math.max(span.end, span.start + 1e-6);
    let lane = ends.findIndex((at) => at <= span.start);
    if (lane < 0) lane = ends.push(0) - 1;
    ends[lane] = end;
    lanes.set(span.id, lane);
  }
  return { lanes, count: ends.length };
}
