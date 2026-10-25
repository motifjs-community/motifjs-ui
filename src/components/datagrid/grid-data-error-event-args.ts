import type { data } from '@motifx-community/data';

/** Loading or saving failed. The grid shows it too (the error overlay, the row's mark). */
export interface GridDataErrorEventArgs<T> {
  readonly error: data.DataError;
  readonly operation: 'load' | 'save';
  /** `'save'`: the row that was not saved. */
  readonly row?: T;
}
