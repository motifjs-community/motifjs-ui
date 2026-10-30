import type { EventArgs } from '@motifx/core';

/**
 * An editor of a cell or of an edit form field is about to be made. `options` are the props the
 * editor gets: change them (`enabled = false` disables it, `clearButton`, `placeholder`…); `cancel`
 * keeps the cell from being edited, or leaves the field out of the form.
 */
export interface GridEditorPreparingEventArgs<T> extends EventArgs {
  readonly field: string;
  /** The row itself. */
  readonly row: T;
  /** The values entered and not saved yet, by field (`{}` while there are none); the row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** The value a field is saved with: the entered one when there is one, else the row's. */
  getValue(field: string): unknown;
  /** The row was added in the grid and never saved. */
  readonly isNew: boolean;
  /** Props of the kit's editor (`TextBox`, `NumberBox`, `DateBox`, `CheckBox`, `DropDown`, `ComboBox`, `Lookup`); empty for a column's own `editor`. */
  options: Record<string, unknown>;
}
