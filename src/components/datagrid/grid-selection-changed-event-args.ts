import type { GridSelection } from './grid-selection';

/** The selection changed, by the user or by code. */
export interface GridSelectionChangedEventArgs {
  selection: GridSelection;
}
