import type { GridActionLocation } from './grid-action-location';

/** What `onclickMany` and `onclickSelection` get besides the rows. */
export interface GridActionRun {
  /** Where the action was pressed; `'contextMenu'` from a row's menu, `'code'` from `grid.runAction`. */
  readonly location: GridActionLocation | 'contextMenu' | 'code';
  /** Aborted when the user presses Stop (or the grid goes away). */
  readonly signal: AbortSignal;
  /** Moves the progress bar: rows done so far, of `total` (default: the rows it runs on). */
  progress(done: number, total?: number): void;
}
