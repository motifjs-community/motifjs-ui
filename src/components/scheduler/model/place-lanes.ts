/** A bar over a row of days: from day `first` to day `last`, both included. */
export interface LaneSpan {
  id: string;
  first: number;
  last: number;
  /** Bars that begin on the same day go in this order. */
  order: number;
}

/** Gives each bar the lowest line free over all its days; longer bars first, so they stay on top. */
export function placeLanes(spans: readonly LaneSpan[]): Map<string, number> {
  const sorted = [...spans].sort((a, b) => a.first - b.first || b.last - b.first - (a.last - a.first) || a.order - b.order || (a.id < b.id ? -1 : 1));
  const lineEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const span of sorted) {
    let lane = lineEnds.findIndex((end) => end < span.first);
    if (lane < 0) lane = lineEnds.push(-1) - 1;
    lineEnds[lane] = span.last;
    lanes.set(span.id, lane);
  }
  return lanes;
}
