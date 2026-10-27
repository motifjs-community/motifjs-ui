import type { BottomSheet } from './BottomSheet';
import type { BottomSheetDetent } from './bottom-sheet-detent';

/** A bottom sheet is about to stop at another height; `to` can be changed, `cancel = true` keeps it where it was. */
export interface DetentChangingEventArgs {
  from: BottomSheetDetent;
  to: BottomSheetDetent;
  /** The finger, the mouse or a key moved it; `false` for code. */
  byUser: boolean;
  cancel: boolean;
  source: BottomSheet;
}
