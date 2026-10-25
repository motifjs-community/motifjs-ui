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
    /** One row taller than the others (the edit form in place of a row): its position and the height it adds. */
    readonly tall: { at: number; extra: number } | null = null,
  ) {}

  /** Height of all rows. */
  get contentHeight(): number {
    return this.total * this.rowHeight + this.extraHeight;
  }

  /** Top of row `index` in the full content. */
  offsetOf(index: number): number {
    const tall = this.tall;
    return index * this.rowHeight + (tall && index > tall.at ? tall.extra : 0);
  }

  /** Height of row `index`. */
  heightOf(index: number): number {
    return this.rowHeight + (this.tall?.at === index ? this.tall.extra : 0);
  }

  /** The row at an offset in the full content. */
  indexAt(offset: number): number {
    const tall = this.tall;
    if (!tall || offset < (tall.at + 1) * this.rowHeight) return Math.floor(offset / this.rowHeight);
    if (offset < (tall.at + 1) * this.rowHeight + tall.extra) return tall.at;
    return Math.floor((offset - tall.extra) / this.rowHeight);
  }

  private get extraHeight(): number {
    const tall = this.tall;
    return tall && tall.at >= 0 && tall.at < this.total ? tall.extra : 0;
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
    return scrollTop + this.offsetOf(index) - virtualTop;
  }

  /** Rows that intersect the viewport: `first` inclusive, `end` exclusive. */
  visibleRange(virtualTop: number): { first: number; end: number } {
    if (this.total <= 0 || this.rowHeight <= 0) return { first: 0, end: 0 };
    const first = clamp(this.indexAt(virtualTop), 0, this.total - 1);
    const end = clamp(this.indexAt(Math.max(virtualTop, virtualTop + this.viewport - 1)) + 1, first + 1, this.total);
    return { first, end };
  }

  /** Virtual offset that brings row `index` fully into view: `nearest` moves as little as possible, `start` / `end` align it. */
  revealRow(virtualTop: number, index: number, align: 'nearest' | 'start' | 'end' = 'nearest'): number {
    const top = this.offsetOf(index);
    const bottom = top + this.heightOf(index);
    let v = virtualTop;
    if (align === 'start') v = top;
    else if (align === 'end') v = bottom - this.viewport;
    else if (top < virtualTop) v = top;
    else if (bottom > virtualTop + this.viewport) v = Math.min(top, bottom - this.viewport);
    return clamp(v, 0, this.maxVirtualTop);
  }
}
