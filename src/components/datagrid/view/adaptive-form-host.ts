import type { EditFormHost } from './edit-form-host';

/** What a row's adaptive detail asks of the grid, besides what an edit form does. */
export interface AdaptiveFormHost<T> extends EditFormHost<T> {
  /** One of its editors took focus: the row becomes the one being edited. */
  begin(): void;
  /** A field was left, its value written into the row's draft. */
  kept(field: string): void;
}
