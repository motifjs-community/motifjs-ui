import type { EventArgs } from '@motifx/core';
import type { GridSelection } from './grid-selection';

/** The selection is about to change (by the user or by code); `cancel` keeps it as it is. */
export interface GridSelectionChangingEventArgs extends EventArgs {
  readonly selection: GridSelection;
  readonly previous: GridSelection;
  /** The change comes from rows selected by dragging over them. */
  readonly byDrag: boolean;
}
