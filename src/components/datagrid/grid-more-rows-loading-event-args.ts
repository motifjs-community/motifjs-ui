import type { EventArgs } from '@motifx/core';

/** Infinite mode: the next part of the rows is about to load, `take` rows from `skip`; `cancel` keeps the rows as they are. */
export interface GridMoreRowsLoadingEventArgs extends EventArgs {
  readonly skip: number;
  readonly take: number;
}
