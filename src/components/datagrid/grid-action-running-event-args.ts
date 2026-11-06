import type { EventArgs } from '@motifx/core';
import type { GridAction } from './grid-action';
import type { GridActionLocation } from './grid-action-location';
import type { GridSelection } from './grid-selection';

/** Occurs before an action runs. Set `cancel = true` to prevent it. */
export interface GridActionRunningEventArgs<T> extends EventArgs {
  readonly action: GridAction<T>;
  /** The rows it runs on. Empty when it runs on a selection whose rows are not loaded. */
  readonly rows: readonly T[];
  /** The selection it runs on, when it acts on the selected rows, otherwise `null`. */
  readonly selection: GridSelection | null;
  readonly location: GridActionLocation | 'contextMenu' | 'code';
}
