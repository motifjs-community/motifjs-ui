/**
 * Follows a finger or a pointer along a drag and tells how fast it was going when let go, from
 * the last tenth of a second of movement.
 */
export class SwipeTracker {
  private points: { t: number; x: number; y: number }[] = [];

  start(x: number, y: number, t = performance.now()): void {
    this.points = [{ t, x, y }];
  }

  move(x: number, y: number, t = performance.now()): void {
    this.points.push({ t, x, y });
    const old = t - 120;
    while (this.points.length > 2 && this.points[0].t < old) this.points.shift();
  }

  /** Pixels per millisecond along `axis` (positive: right or down). */
  velocity(axis: 'x' | 'y', t = performance.now()): number {
    const to = this.points[this.points.length - 1];
    // Held still before letting go: no speed.
    if (!to || to.t < t - 100) return 0;
    const from = this.points.find((p) => p.t >= t - 100 && p !== to) ?? this.points[this.points.length - 2];
    if (!from || to.t - from.t < 1) return 0;
    return (to[axis] - from[axis]) / (to.t - from.t);
  }
}
