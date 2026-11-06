import type { TabDockSide } from './tab-dock-side';
import type { TabLayoutDocument } from './tab-layout-document';
import type { TabRect } from './tab-rect';

/** A hidden document as `saveLayout` writes it, with the place it returns to. */
export interface TabLayoutHidden {
  document: TabLayoutDocument;
  /** The group it was hidden from (an index in `groups`), while that group exists. */
  group?: number;
  index?: number;
  /** The dock area it was in: its side, its size and whether it was collapsed. */
  side?: TabDockSide;
  size?: number | string;
  autoHide?: boolean;
  /** The floating window it was in. */
  rect?: TabRect;
}
