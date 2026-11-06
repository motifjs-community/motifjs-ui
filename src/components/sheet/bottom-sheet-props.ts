import type { Bind } from '@motifx/core';
import type { OverlayPanelProps } from '../../parts/overlay/overlay-panel-props';
import type { BottomSheetDetent } from './bottom-sheet-detent';
import type { DetentChangedEventArgs } from './detent-changed-event-args';
import type { DetentChangingEventArgs } from './detent-changing-event-args';

/** Props of `BottomSheet`: the shared `OverlayPanelProps` plus its own. Each prop is also a settable, reactive property. */
export interface BottomSheetProps extends OverlayPanelProps {
  /** The heights it stops at, in any order. The default is `['half', 'full']`. */
  detents?: Bind<readonly BottomSheetDetent[]>;
  /**
   * The height it opens at and its current height (one of `detents`). User changes write to it. The default is
   * the first of `detents`.
   */
  detent?: Bind<BottomSheetDetent>;
  /** Shows the handle at the top. Drag it, or use the arrow keys on it, to change the height. The default is `true`. */
  showHandle?: Bind<boolean>;
  /**
   * Lets touch and mouse move the sheet between heights using the handle and title, and the content with
   * `dragContent`. The default is `true`.
   */
  draggable?: Bind<boolean>;
  /**
   * Lets a finger on the content drag the sheet when the content cannot scroll in that direction: down from its
   * top, or up while the sheet is not at its tallest. The default is `true`.
   */
  dragContent?: Bind<boolean>;
  /** Closes the sheet when it is dragged or flicked below its lowest height. The default is `true`. */
  swipeToClose?: Bind<boolean>;
  /** The speed at which a flick moves to the next height, in pixels per millisecond. The default is `0.4`. */
  flickSpeed?: Bind<number>;
  /**
   * The space above it at full height, in pixels or as a CSS length. `0` creates a full-screen sheet with square
   * top corners, and `null` uses `sheet.top-gap`. The default is `null`.
   */
  topGap?: Bind<number | string | null>;
  /** Occurs before the height changes. `to` can be changed. Set `cancel = true` to keep the current height. */
  onDetentChanging?: (e: DetentChangingEventArgs) => void;
  onDetentChanged?: (e: DetentChangedEventArgs) => void;
}
