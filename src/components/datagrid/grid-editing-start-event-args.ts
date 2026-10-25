import type { EventArgs } from '@motifx/core';

/** A cell is about to be edited (its editor opens), or a row in its edit form; `cancel` keeps it as it is. */
export interface GridEditingStartEventArgs<T> extends EventArgs {
  /** The cell's field; `''` when the edit form opens for the whole row. */
  readonly field: string;
  readonly row: T;
  readonly rowIndex: number;
  readonly isNew: boolean;
}
