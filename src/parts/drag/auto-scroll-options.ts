import type { ComponentBase } from '@motifx/core';

/** How `autoScroll` scrolls near the edges. */
export interface AutoScrollOptions {
  /** How near an edge the pointer starts it, in pixels, or worked out from the room along that axis; 40 by default. */
  zone?: number | ((room: number) => number);
  /** The most it moves in a frame; 12 by default. */
  speed?: number;
  /** The axes it scrolls: `x`, `y` or `both` (the default). */
  axis?: 'x' | 'y' | 'both';
  /** Room covered at an edge by parts that do not scroll (a head, a foot, pinned columns): pixels, or the part. The zones start past it. */
  start?: number | ComponentBase;
  end?: number | ComponentBase;
  top?: number | ComponentBase;
  bottom?: number | ComponentBase;
  /** Scrolls only while the pointer is over the scroller across the axis it scrolls (a row aimed at another grid stops it). */
  whileOver?: boolean;
  /** The step of one frame along one axis, for `pos` near `start` to `end`; `scrollStep` by default. */
  step?: (pos: number, start: number, end: number, zone: number, speed: number) => number;
}
