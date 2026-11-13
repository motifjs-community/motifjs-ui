import type { Rect } from '../../core/measure';

/** Where `placeNear` put a popup: the side it opened on, the anchor's box (a point is a box of no size) and its own. */
export interface Placed {
  readonly side: 'top' | 'bottom' | 'start' | 'end';
  readonly anchor: Rect;
  readonly rect: Rect;
}
