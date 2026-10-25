const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Scroll geometry of the virtual body. Browsers cap the height of an element (Firefox at about 17.9
 * million pixels), so when the rows would be taller than `max` the spacer stays at that height and the
 * scroll bar position is mapped proportionally to a "virtual" offset in the full content. Rows are then
 * placed relative to the scroll position, so the wheel and the keyboard still move row by row.
 */
export class ScrollGeometry {
  /** Spacer height above which scrolling is scaled; well under every browser's limit. */
  static readonly MAX_HEIGHT = 10_000_000;

  constructor(
    /** Row count. */
    readonly total: number,
    readonly rowHeight: number,
    /** Visible height of the body (the viewport minus the sticky header). */
    readonly viewport: number,
    readonly max = ScrollGeometry.MAX_HEIGHT,
  ) {}

  /** Height of all rows. */
  get contentHeight(): number {
    return this.total * this.rowHeight;
  }

  /** Height given to the spacer element. */
  get spacerHeight(): number {
    return Math.min(this.contentHeight, this.max);
  }

  get scaled(): boolean {
    return this.contentHeight > this.max;
  }

  /** Largest valid virtual offset. */
  get maxVirtualTop(): number {
    return Math.max(0, this.contentHeight - this.viewport);
  }

  /** Virtual offset (position in the full content) of the viewport top for a native `scrollTop`. */
  virtualFromScroll(scrollTop: number): number {
    if (!this.scaled) return clamp(scrollTop, 0, this.maxVirtualTop);
    const range = this.spacerHeight - this.viewport;
    if (range <= 0) return 0;
    return clamp(scrollTop / range, 0, 1) * this.maxVirtualTop;
  }

  /** Native `scrollTop` that shows the given virtual offset. */
  scrollFromVirtual(virtualTop: number): number {
    const v = clamp(virtualTop, 0, this.maxVirtualTop);
    if (!this.scaled) return v;
    const range = this.spacerHeight - this.viewport;
    const full = this.maxVirtualTop;
    return full <= 0 ? 0 : (v / full) * range;
  }

  /** Top of row `index` inside the spacer, for the current native and virtual offsets. */
  rowTop(index: number, scrollTop: number, virtualTop: number): number {
    return scrollTop + index * this.rowHeight - virtualTop;
  }

  /** Rows that intersect the viewport: `first` inclusive, `end` exclusive. */
  visibleRange(virtualTop: number): { first: number; end: number } {
    if (this.total <= 0 || this.rowHeight <= 0) return { first: 0, end: 0 };
    const first = clamp(Math.floor(virtualTop / this.rowHeight), 0, this.total - 1);
    const end = clamp(Math.ceil((virtualTop + this.viewport) / this.rowHeight), first + 1, this.total);
    return { first, end };
  }

  /** Virtual offset that brings row `index` fully into view: `nearest` moves as little as possible, `start` / `end` align it. */
  revealRow(virtualTop: number, index: number, align: 'nearest' | 'start' | 'end' = 'nearest'): number {
    const top = index * this.rowHeight;
    const bottom = top + this.rowHeight;
    let v = virtualTop;
    if (align === 'start') v = top;
    else if (align === 'end') v = bottom - this.viewport;
    else if (top < virtualTop) v = top;
    else if (bottom > virtualTop + this.viewport) v = bottom - this.viewport;
    return clamp(v, 0, this.maxVirtualTop);
  }
}
