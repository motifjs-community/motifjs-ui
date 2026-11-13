import type { ComponentBase } from '@motifx/core';
import type { ScrollMotion } from './scroll-motion';

/** How `reveal` brings something into view. */
export interface RevealOptions {
  /** The axis it may scroll: `x`, `y`, or `both` (the default). */
  axis?: 'x' | 'y' | 'both';
  /** Where it comes to rest when it has to move: the nearer edge (the default), the start, the middle or the end. */
  align?: 'nearest' | 'start' | 'center' | 'end';
  /** Room covered at an edge by parts that do not scroll (a sticky head, pinned columns): pixels, or the part. */
  cover?: { start?: number | ComponentBase; end?: number | ComponentBase; top?: number | ComponentBase; bottom?: number | ComponentBase };
  /** How it moves; at once by default. */
  motion?: ScrollMotion;
  /** Runs in the write of the round after, once the scroll is made: a virtual list draws the rows now in view. */
  then?: () => void;
}
