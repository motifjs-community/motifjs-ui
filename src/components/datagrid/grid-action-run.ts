import type { GridActionLocation } from './grid-action-location';

/** What `onclickMany` and `onclickSelection` receive in addition to the rows. */
export interface GridActionRun {
  /** Where the action was clicked: `'contextMenu'` from a row's menu, or `'code'` from `grid.runAction`. */
  readonly location: GridActionLocation | 'contextMenu' | 'code';
  /** Aborted when the user clicks Stop or the grid is disposed. */
  readonly signal: AbortSignal;
  /** Updates the progress bar with the rows finished so far, of `total` (by default, the rows it runs on). */
  progress(done: number, total?: number): void;
}
