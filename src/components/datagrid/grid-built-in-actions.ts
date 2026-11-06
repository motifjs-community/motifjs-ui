import type { GridAction } from './grid-action';

/** The built-in actions (`grid.actions`). In the `actions` prop, they can also be named: `['edit', 'remove']`. */
export interface GridBuiltInActions<T> {
  /** Opens the editor of the row's first cell the user can fill. */
  edit: GridAction<T>;
  /** Deletes the row according to the save mode. */
  remove: GridAction<T>;
  /** Removes a deletion mark (batch mode). */
  restore: GridAction<T>;
  /** Sends the row's edits immediately. */
  save: GridAction<T>;
  /** Discards the row's edits. A new row is removed. */
  cancel: GridAction<T>;
}
