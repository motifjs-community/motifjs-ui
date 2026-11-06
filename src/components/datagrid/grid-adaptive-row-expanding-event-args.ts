import type { EventArgs } from '@motifx/core';

/** Occurs before a row's adaptive detail opens or closes, by the user or programmatically. Set `cancel = true` to prevent it. */
export interface GridAdaptiveRowExpandingEventArgs<T> extends EventArgs {
  readonly row: T;
  /** The row's key, or `undefined` for a new row. */
  readonly key: unknown;
  readonly rowIndex: number;
}
