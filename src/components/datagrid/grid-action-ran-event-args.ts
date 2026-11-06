import type { GridAction } from './grid-action';
import type { GridActionLocation } from './grid-action-location';

/** Occurs after an action runs, and reports how many rows succeeded or failed and whether the user stopped it. */
export interface GridActionRanEventArgs<T> {
  readonly action: GridAction<T>;
  readonly rows: readonly T[];
  readonly location: GridActionLocation | 'contextMenu' | 'code';
  readonly done: number;
  readonly failed: number;
  /** Indicates that the action was stopped (Stop, `grid.stopAction()`) before every row finished. */
  readonly canceled: boolean;
  /** The errors of the failed rows, with the row (`undefined` for `onclickMany` and `onclickSelection`). */
  readonly errors: readonly { row: T | undefined; error: unknown }[];
}
