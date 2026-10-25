import type { GridAction } from '../grid-action';
import type { GridSelection } from '../grid-selection';
import type { RowState } from '../row-state';

/** An action the target rows share: shown once, run on each of its rows with that row's own action. */
export interface ActionEntry<T> {
  /** The first row's action: its text, icon and look. */
  action: GridAction<T>;
  text: string;
  /** Rows it runs on. */
  count: number;
  disabled: boolean;
  /** The rows it runs on, each with its state and its own action. */
  items: { row: T; state: RowState; action: GridAction<T> }[];
  /** The selection it runs on when the rows are not loaded; else `null`. */
  selection: GridSelection | null;
  /** The rows came from the selection. */
  fromSelection: boolean;
}
