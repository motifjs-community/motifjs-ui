import type { Bind } from '@motifx/core';
import type { OverlayPanelProps } from '../../parts/overlay/overlay-panel-props';
import type { BottomSheetDetent } from './bottom-sheet-detent';
import type { DetentChangedEventArgs } from './detent-changed-event-args';
import type { DetentChangingEventArgs } from './detent-changing-event-args';

/** Props of `BottomSheet`: the shared `OverlayPanelProps` plus its own. Each prop is also a settable, reactive property. */
export interface BottomSheetProps extends OverlayPanelProps {
  /** The heights it stops at, in any order. Default `['half', 'full']`. */
  detents?: Bind<readonly BottomSheetDetent[]>;
  /** The height it opens at and is at now (one of `detents`); the user moving it writes it. Default: the first of `detents`. */
  detent?: Bind<BottomSheetDetent>;
  /** The handle at the top: drag it, or use the arrow keys on it, to change the height. Default `true`. */
  showHandle?: Bind<boolean>;
  /** The finger and the mouse move it between its heights (by the handle and the title; by the content too, see `dragContent`). Default `true`. */
  draggable?: Bind<boolean>;
  /** A finger moving the content takes the sheet along when the content cannot scroll that way: down from its top, up while the sheet is not at its tallest. Default `true`. */
  dragContent?: Bind<boolean>;
  /** Dragging or flicking it down below its lowest height closes it. Default `true`. */
  swipeToClose?: Bind<boolean>;
  /** How fast a flick goes on to the next height, in pixels per millisecond. Default `0.4`. */
  flickSpeed?: Bind<number>;
  /** The room it leaves above itself at full height: pixels or a CSS length; `0` for a full-screen sheet (its corners square off up there); `null` for `sheet.top-gap`. Default `null`. */
  topGap?: Bind<number | string | null>;
  /** The height is about to change; cancelable, `to` can be changed. */
  onDetentChanging?: (e: DetentChangingEventArgs) => void;
  onDetentChanged?: (e: DetentChangedEventArgs) => void;
}
