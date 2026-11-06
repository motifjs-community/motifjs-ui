import type { EventArgs } from '@motifx/core';

/** Occurs before a cell editor or a row's edit form opens. Set `cancel = true` to keep it closed. */
export interface GridEditingStartEventArgs<T> extends EventArgs {
  /** The cell's field, or `''` when the edit form opens for the whole row. */
  readonly field: string;
  /** The row itself. */
  readonly row: T;
  /** The entered, unsaved values by field (`{}` while there are none). The row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** Returns the value a field will be saved with: the entered value, otherwise the row's. */
  getValue(field: string): unknown;
  readonly rowIndex: number;
  readonly isNew: boolean;
}
