import type { EventArgs } from '@motifx/core';

/** Occurs before the search text changes, typed or set programmatically. Set `cancel = true` to keep the previous text. */
export interface GridSearchTextChangingEventArgs extends EventArgs {
  readonly text: string;
  readonly previous: string;
}
