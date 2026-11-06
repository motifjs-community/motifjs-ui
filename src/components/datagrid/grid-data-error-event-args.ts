import type { data } from '@motifx-community/data';

/** Occurs when loading or saving fails. The grid also displays the error (the overlay, the row's mark). */
export interface GridDataErrorEventArgs<T> {
  readonly error: data.DataError;
  readonly operation: 'load' | 'save';
  /** With `'save'`, the row that was not saved. */
  readonly row?: T;
}
