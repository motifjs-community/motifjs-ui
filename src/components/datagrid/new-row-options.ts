import type { Bind } from '@motifx/core';

/** Where new rows open, and their initial values. */
export interface NewRowOptions<T> {
  /** `'bottom'` (the default) opens below the last row, and `'top'` opens above the first. */
  position?: Bind<'top' | 'bottom'>;
  /** The initial values of a new row. */
  create?: () => Partial<T>;
}
