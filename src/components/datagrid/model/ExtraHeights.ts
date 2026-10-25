/**
 * Heights added under some rows (their open details), by position among the rows laid out. A position
 * counts at its measured height, or at `estimate` until it has one. The sums before a position are
 * kept in two Fenwick trees (how many are measured, and their heights), so a long list with many open
 * rows still finds a row's offset in a few steps, and a new measurement changes one entry only.
 */
export class ExtraHeights {
  /** What a position without a measured height counts as. */
  estimate = 0;
  private readonly heights: (number | undefined)[];
  private readonly counted: Float64Array;
  private readonly summed: Float64Array;
  private measured = 0;
  private measuredSum = 0;

  /** `at`: the positions that get a height, ascending. */
  constructor(readonly at: readonly number[]) {
    this.heights = new Array(at.length);
    this.counted = new Float64Array(at.length + 1);
    this.summed = new Float64Array(at.length + 1);
  }

  get size(): number {
    return this.at.length;
  }

  /** The slot of a position, or -1 when it has no added height. */
  slotOf(position: number): number {
    const slot = this.countBefore(position);
    return this.at[slot] === position ? slot : -1;
  }

  /** How many positions before `position` have an added height. */
  countBefore(position: number): number {
    let lo = 0;
    let hi = this.at.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.at[mid] < position) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** Gives a slot its measured height (`undefined`: counted at the estimate again). */
  set(slot: number, height: number | undefined) {
    const before = this.heights[slot];
    if (before === height) return;
    this.heights[slot] = height;
    const count = (height === undefined ? 0 : 1) - (before === undefined ? 0 : 1);
    const sum = (height ?? 0) - (before ?? 0);
    this.measured += count;
    this.measuredSum += sum;
    for (let i = slot + 1; i <= this.at.length; i += i & -i) {
      this.counted[i] += count;
      this.summed[i] += sum;
    }
  }

  /** The measured height of a slot, if it has one. */
  measuredAt(slot: number): number | undefined {
    return this.heights[slot];
  }

  /** The height added under a position (0 when it has none). */
  heightAt(position: number): number {
    const slot = this.slotOf(position);
    return slot < 0 ? 0 : (this.heights[slot] ?? this.estimate);
  }

  /** The heights added under the positions before `position`. */
  before(position: number): number {
    const slots = this.countBefore(position);
    let count = 0;
    let sum = 0;
    for (let i = slots; i > 0; i -= i & -i) {
      count += this.counted[i];
      sum += this.summed[i];
    }
    return sum + (slots - count) * this.estimate;
  }

  /** The average of the measured heights, or `null` before any. */
  get average(): number | null {
    return this.measured > 0 ? this.measuredSum / this.measured : null;
  }
}
