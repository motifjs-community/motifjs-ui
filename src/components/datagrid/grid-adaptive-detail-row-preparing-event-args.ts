import type { GridAdaptiveFormOptions } from './grid-adaptive-form-options';

/**
 * Occurs when a row's adaptive detail lays out its form: when it opens, and again when other columns
 * hide or appear. Change `formOptions`.
 */
export interface GridAdaptiveDetailRowPreparingEventArgs<T> {
  readonly row: T;
  /** The row's key, or `undefined` for a new row. */
  readonly key: unknown;
  readonly rowIndex: number;
  /** Indicates that the form shows editors (the row can be edited in its cells). */
  readonly editors: boolean;
  formOptions: GridAdaptiveFormOptions;
}
