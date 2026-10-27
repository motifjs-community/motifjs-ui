/** An appointment's time in a day column, in minutes. */
export interface TimedSpan {
  id: string;
  start: number;
  end: number;
}

/** Where a span sits among the ones at the same time: its column, how many columns its group has, and how many it widens over. */
export interface TimedPlace {
  column: number;
  columns: number;
  spread: number;
}

const overlaps = (a: TimedSpan, b: TimedSpan) => a.start < b.end && b.start < a.end;

/**
 * Lays out one day column: spans that overlap (directly or through others) form a group; each
 * takes the first column free at its start, the group is as wide as its most columns, and a span
 * widens to the right over the columns nothing of its time is in.
 */
export function placeTimed(spans: readonly TimedSpan[]): Map<string, TimedPlace> {
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const places = new Map<string, TimedPlace>();
  let group: TimedSpan[] = [];
  let columns: TimedSpan[][] = [];
  let groupEnd = -Infinity;
  const close = () => {
    for (const span of group) {
      const place = places.get(span.id)!;
      place.columns = columns.length;
      let spread = 1;
      for (let c = place.column + 1; c < columns.length; c++) {
        if (columns[c].some((other) => overlaps(other, span))) break;
        spread++;
      }
      place.spread = spread;
    }
    group = [];
    columns = [];
  };
  for (const span of sorted) {
    if (span.start >= groupEnd) {
      close();
      groupEnd = -Infinity;
    }
    let column = columns.findIndex((list) => list[list.length - 1].end <= span.start);
    if (column < 0) column = columns.push([]) - 1;
    columns[column].push(span);
    group.push(span);
    places.set(span.id, { column, columns: 0, spread: 1 });
    groupEnd = Math.max(groupEnd, span.end);
  }
  close();
  return places;
}
