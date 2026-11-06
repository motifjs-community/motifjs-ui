import type { GridSelection } from './grid-selection';

/** Occurs when the selection changes, by the user or programmatically. */
export interface GridSelectionChangedEventArgs {
  selection: GridSelection;
  /** Indicates that the rows were selected by dragging over them. */
  byDrag: boolean;
}
