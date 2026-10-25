import type { Bind } from '@motifx/core';

/** Where new rows open and what they start with. */
export interface NewRowOptions<T> {
  /** `'bottom'` (default) below the last row, or `'top'` above the first. */
  position?: Bind<'top' | 'bottom'>;
  /** Initial values of a new row. */
  create?: () => Partial<T>;
}
