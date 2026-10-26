/**
 * How far to scroll in one frame while something is dragged at `pos` near the edges of `start`…`end`
 * (one axis): nothing farther than `sensitivity` from them, `speed` at the edge and beyond it, less
 * on the way in. Negative scrolls towards `start`.
 */
export function scrollStep(pos: number, start: number, end: number, sensitivity: number, speed: number): number {
  if (!(sensitivity > 0) || !(speed > 0) || end <= start) return 0;
  // Near both edges at once (a short list): the nearer one.
  const toStart = pos - start;
  const toEnd = end - pos;
  const step = (distance: number) => Math.max(1, Math.round(speed * Math.min(1, (sensitivity - Math.max(0, distance)) / sensitivity)));
  if (toStart < sensitivity && toStart <= toEnd) return -step(toStart);
  if (toEnd < sensitivity) return step(toEnd);
  return 0;
}
