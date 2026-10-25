import type { GridAction } from './grid-action';

/** The actions the grid has ready (`grid.actions`); in the `actions` prop they can also be named: `['edit', 'remove']`. */
export interface GridBuiltInActions<T> {
  /** Opens the editor of the row's first cell the user can fill. */
  edit: GridAction<T>;
  /** Deletes the row as the save mode says. */
  remove: GridAction<T>;
  /** Takes a deletion mark back (batch mode). */
  restore: GridAction<T>;
  /** Sends the row's edits now. */
  save: GridAction<T>;
  /** Drops the row's edits; a new row goes away. */
  cancel: GridAction<T>;
}
