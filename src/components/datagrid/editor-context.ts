import type { GridColumn } from './grid-column';
import type { GridLookup } from './grid-lookup';

/**
 * The context a custom editor receives. An editor that is a `Field` is read through its `value`, and
 * any other component writes its value with `setValue`. `commit()` keeps the value and closes the
 * editor (like Enter), and `cancel()` closes it without keeping the value (like Escape). On a lookup
 * column, `setValue` also accepts the text to display for the key.
 */
export interface EditorContext<T> {
  /** The row itself. */
  readonly row: T;
  /** The entered, unsaved values by field (`{}` while there are none). The row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** Returns the value a field will be saved with: the entered value, otherwise the row's. */
  getValue(field: string): unknown;
  readonly column: GridColumn<T>;
  /** The column's lookup, when it has one. */
  readonly lookup: GridLookup<T> | undefined;
  /** The value when the editor opened. */
  readonly value: unknown;
  /** The character typed to start editing, if editing started by typing. */
  readonly initialText: string | undefined;
  setValue(value: unknown, text?: string): void;
  commit(): void;
  cancel(): void;
}
