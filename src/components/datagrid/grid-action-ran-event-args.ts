import type { GridAction } from './grid-action';
import type { GridActionLocation } from './grid-action-location';

/** An action ran: on how many rows it worked, failed, and whether the user stopped it. */
export interface GridActionRanEventArgs<T> {
  readonly action: GridAction<T>;
  readonly rows: readonly T[];
  readonly location: GridActionLocation | 'contextMenu' | 'code';
  readonly done: number;
  readonly failed: number;
  /** Stopped (Stop, `grid.stopAction()`) before every row was done. */
  readonly canceled: boolean;
  /** What the failed rows threw, with the row (`undefined` for `onclickMany` and `onclickSelection`). */
  readonly errors: readonly { row: T | undefined; error: unknown }[];
}
