import type { TabDockSide } from './tab-dock-side';
import type { TabLayoutDocument } from './tab-layout-document';
import type { TabRect } from './tab-rect';

/** A hidden document as `saveLayout` writes it, with where it goes back to. */
export interface TabLayoutHidden {
  document: TabLayoutDocument;
  /** The group it was hidden from (its index in `groups`), while that group is there. */
  group?: number;
  index?: number;
  /** The dock area it was in: its side, its size and whether it was folded. */
  side?: TabDockSide;
  size?: number | string;
  autoHide?: boolean;
  /** The floating window it was in. */
  rect?: TabRect;
}
