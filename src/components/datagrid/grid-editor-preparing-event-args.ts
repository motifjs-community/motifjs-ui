import type { EventArgs } from '@motifx/core';

/**
 * Occurs before the editor of a cell or edit form field is created. `options` holds the editor's props,
 * which you can change (`enabled = false` disables it, `clearButton`, `placeholder`…). Set `cancel = true`
 * to prevent the cell from being edited, or to omit the field from the form.
 */
export interface GridEditorPreparingEventArgs<T> extends EventArgs {
  readonly field: string;
  /** The row itself. */
  readonly row: T;
  /** The entered, unsaved values by field (`{}` while there are none). The row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** Returns the value a field will be saved with: the entered value, otherwise the row's. */
  getValue(field: string): unknown;
  /** Indicates that the row was added in the grid and never saved. */
  readonly isNew: boolean;
  /**
   * The props of the kit's editor (`TextBox`, `NumberBox`, `DateBox`, `CheckBox`, `DropDown`, `ComboBox`,
   * `Lookup`). Empty for a column's custom `editor`.
   */
  options: Record<string, unknown>;
}
