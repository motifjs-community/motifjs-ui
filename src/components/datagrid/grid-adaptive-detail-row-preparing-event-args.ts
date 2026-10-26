import type { GridAdaptiveFormOptions } from './grid-adaptive-form-options';

/**
 * A row's adaptive detail is about to lay out its form: when it opens, and again when other columns
 * hide or show. Change `formOptions` (`onAdaptiveDetailRowPreparing`).
 */
export interface GridAdaptiveDetailRowPreparingEventArgs<T> {
  readonly row: T;
  /** The row's key; `undefined` for a new row. */
  readonly key: unknown;
  readonly rowIndex: number;
  /** The form shows editors (the row can be edited in its cells). */
  readonly editors: boolean;
  formOptions: GridAdaptiveFormOptions;
}
