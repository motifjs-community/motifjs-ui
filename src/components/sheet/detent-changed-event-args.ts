import type { BottomSheet } from './BottomSheet';
import type { BottomSheetDetent } from './bottom-sheet-detent';

export interface DetentChangedEventArgs {
  from: BottomSheetDetent;
  to: BottomSheetDetent;
  byUser: boolean;
  source: BottomSheet;
}
