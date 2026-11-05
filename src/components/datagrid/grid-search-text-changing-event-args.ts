import type { EventArgs } from '@motifx/core';

/** The search text is about to change (typed, or set programmatically); `cancel` keeps the one before. */
export interface GridSearchTextChangingEventArgs extends EventArgs {
  readonly text: string;
  readonly previous: string;
}
