import type { EventArgs } from '@motifx/core';

/** A row's adaptive detail is about to open or close, by the user or from code; `cancel` keeps it as it is. */
export interface GridAdaptiveRowExpandingEventArgs<T> extends EventArgs {
  readonly row: T;
  /** The row's key; `undefined` for a new row. */
  readonly key: unknown;
  readonly rowIndex: number;
}
