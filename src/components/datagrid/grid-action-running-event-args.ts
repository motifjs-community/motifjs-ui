import type { EventArgs } from '@motifx/core';
import type { GridAction } from './grid-action';
import type { GridActionLocation } from './grid-action-location';
import type { GridSelection } from './grid-selection';

/** An action is about to run; `cancel` keeps it from running. */
export interface GridActionRunningEventArgs<T> extends EventArgs {
  readonly action: GridAction<T>;
  /** The rows it runs on; empty when it runs on a selection whose rows are not loaded. */
  readonly rows: readonly T[];
  /** The selection it runs on, when it acts on the selected rows; else `null`. */
  readonly selection: GridSelection | null;
  readonly location: GridActionLocation | 'contextMenu' | 'code';
}
