import type { EventArgs } from '@motifx/core';

/**
 * In infinite mode, occurs before the next page of rows loads, `take` rows from `skip`. Set
 * `cancel = true` to keep the rows as they are.
 */
export interface GridMoreRowsLoadingEventArgs extends EventArgs {
  readonly skip: number;
  readonly take: number;
}
