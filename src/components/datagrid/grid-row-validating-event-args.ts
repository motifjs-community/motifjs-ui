import type { EventArgs } from '@motifx/core';

/**
 * Occurs when a row is validated before saving, after its cells. `errors` holds the messages found, by
 * field (`''` for the whole row), and you can add or remove them. `isValid = false` (or `cancel`)
 * prevents the row from being saved, with `errorText` as its message.
 */
export interface GridRowValidatingEventArgs<T> extends EventArgs {
  /** The row's key, or `undefined` for a new row. */
  readonly key: unknown;
  /** The row itself. */
  readonly row: T;
  /** The entered, unsaved values by field (`{}` while there are none). The row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** Returns the value a field will be saved with: the entered value, otherwise the row's. */
  getValue(field: string): unknown;
  readonly isNew: boolean;
  /** The fields with unsaved edits. */
  readonly changed: readonly string[];
  errors: Record<string, string>;
  isValid: boolean;
  errorText: string;
}
