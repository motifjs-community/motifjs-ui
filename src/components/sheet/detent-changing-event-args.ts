import type { BottomSheet } from './BottomSheet';
import type { BottomSheetDetent } from './bottom-sheet-detent';

/** The arguments of `onDetentChanging`. `to` can be changed, and `cancel = true` keeps the sheet at its current height. */
export interface DetentChangingEventArgs {
  from: BottomSheetDetent;
  to: BottomSheetDetent;
  /** `true` when a finger, the mouse or a key moved it, `false` when code did. */
  byUser: boolean;
  cancel: boolean;
  source: BottomSheet;
}
