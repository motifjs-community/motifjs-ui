import type { GridAction } from './grid-action';
import type { GridActionLocation } from './grid-action-location';

/** An action the toolbar or the bottom bar currently shows, for the rows it acts on (`grid.barActions`). */
export interface GridBarAction<T> {
  readonly action: GridAction<T>;
  readonly location: GridActionLocation;
  /** The action's text, without the count. */
  readonly text: string;
  /** The number of rows it runs on (the selected count for a selection whose rows are not loaded). */
  readonly count: number;
  readonly disabled: boolean;
  /** The rows it runs on. Empty for a selection whose rows are not loaded. */
  readonly rows: readonly T[];
}
