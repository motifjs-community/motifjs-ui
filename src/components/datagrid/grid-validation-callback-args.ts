import type { GridColumn } from './grid-column';
import type { GridValidationRule } from './grid-validation-rule';

/** What a `custom` or `async` rule checks. */
export interface GridValidationCallbackArgs<T> {
  readonly value: unknown;
  /** The row with its unsaved edits applied (a copy). */
  readonly row: T;
  readonly column: GridColumn<T>;
  readonly rule: GridValidationRule<T>;
}
