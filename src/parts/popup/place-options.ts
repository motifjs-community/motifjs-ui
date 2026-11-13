import type { Placed } from './placed';
import type { PopupPlacement } from './popup-placement';

/** How `placeNear` places a popup. */
export interface PlaceOptions {
  placement: PopupPlacement;
  /** At least as wide as the anchor, above or below it. */
  matchWidth?: boolean;
  /** Called in the write with where it went: an arrow is drawn from it with no read. */
  placed?: (where: Placed) => void;
}
