import type { GridAction } from './grid-action';
import type { GridActionLocation } from './grid-action-location';

/** An action the toolbar or the bottom bar shows now, for the rows it acts on (`grid.barActions`). */
export interface GridBarAction<T> {
  readonly action: GridAction<T>;
  readonly location: GridActionLocation;
  /** Its text, without the count. */
  readonly text: string;
  /** Rows it runs on (the selected count for a selection whose rows are not loaded). */
  readonly count: number;
  readonly disabled: boolean;
  /** The rows it runs on; empty for a selection whose rows are not loaded. */
  readonly rows: readonly T[];
}
