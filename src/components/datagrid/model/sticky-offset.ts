import type { StickySide } from '../sticky-side';

/** Where a sticky column sits and how far from its edge. */
export interface StickyOffset {
  side: StickySide;
  offset: number;
  /** The column next to the scrolling area (draws the separator). */
  edge: boolean;
}
