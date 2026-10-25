import type { GridColumn } from './grid-column';
import type { GridLookup } from './grid-lookup';

/**
 * What a custom editor receives. An editor that is a `Field` is read through its `value`; any other
 * one writes its value with `setValue`. `commit()` keeps the value and closes the editor (like
 * Enter), `cancel()` closes it without keeping it (like Escape). On a lookup column `setValue` also
 * takes the text to show for the key.
 */
export interface EditorContext<T> {
  /** The row with the unsaved edits applied (a copy). */
  readonly row: T;
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
