import type { EventArgs } from '@motifx/core';
import type { GridSelection } from './grid-selection';

/** Occurs before the selection changes, by the user or programmatically. Set `cancel = true` to keep it. */
export interface GridSelectionChangingEventArgs extends EventArgs {
  readonly selection: GridSelection;
  readonly previous: GridSelection;
  /** Indicates that the rows are selected by dragging over them. */
  readonly byDrag: boolean;
}
