import type { EventArgs } from '@motifx/core';

/**
 * A row is checked before it is saved, after its cells. `errors` holds the messages found, by field
 * (`''` the whole row): add or remove some. `isValid = false` (or `cancel`) keeps the row from being
 * saved, with `errorText` as its message.
 */
export interface GridRowValidatingEventArgs<T> extends EventArgs {
  /** The row's key; `undefined` for a new row. */
  readonly key: unknown;
  /** The row itself. */
  readonly row: T;
  /** The values entered and not saved yet, by field (`{}` while there are none); the row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** The value a field is saved with: the entered one when there is one, else the row's. */
  getValue(field: string): unknown;
  readonly isNew: boolean;
  /** The fields with unsaved edits. */
  readonly changed: readonly string[];
  errors: Record<string, string>;
  isValid: boolean;
  errorText: string;
}
