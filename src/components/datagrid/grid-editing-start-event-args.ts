import type { EventArgs } from '@motifx/core';

/** A cell is about to be edited (its editor opens), or a row in its edit form; `cancel` keeps it as it is. */
export interface GridEditingStartEventArgs<T> extends EventArgs {
  /** The cell's field; `''` when the edit form opens for the whole row. */
  readonly field: string;
  /** The row itself. */
  readonly row: T;
  /** The values entered and not saved yet, by field (`{}` while there are none); the row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** The value a field is saved with: the entered one when there is one, else the row's. */
  getValue(field: string): unknown;
  readonly rowIndex: number;
  readonly isNew: boolean;
}
