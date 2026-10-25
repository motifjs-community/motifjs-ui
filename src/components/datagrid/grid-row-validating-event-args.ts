import type { EventArgs } from '@motifx/core';

/**
 * A row is checked before it is saved, after its cells. `errors` holds the messages found, by field
 * (`''` the whole row): add or remove some. `isValid = false` (or `cancel`) keeps the row from being
 * saved, with `errorText` as its message.
 */
export interface GridRowValidatingEventArgs<T> extends EventArgs {
  /** The row's key; `undefined` for a new row. */
  readonly key: unknown;
  /** The row with its unsaved edits applied (a copy). */
  readonly row: T;
  readonly isNew: boolean;
  /** The fields with unsaved edits. */
  readonly changed: readonly string[];
  errors: Record<string, string>;
  isValid: boolean;
  errorText: string;
}
