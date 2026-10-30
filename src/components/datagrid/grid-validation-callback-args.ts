import type { data } from '@motifx-community/data';
import type { GridColumn } from './grid-column';
import type { GridValidationRule } from './grid-validation-rule';

/** What a `custom` or `async` rule checks. */
export interface GridValidationCallbackArgs<T> {
  readonly value: unknown;
  /** The row itself. */
  readonly row: T;
  /** The other values of the row: the entered ones (`values`), `isNew`, and `getValue(field)`, the value a field is saved with. */
  readonly context: data.RowCheckContext<T>;
  readonly column: GridColumn<T>;
  readonly rule: GridValidationRule<T>;
}
