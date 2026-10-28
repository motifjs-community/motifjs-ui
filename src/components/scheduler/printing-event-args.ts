import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** The scheduler is about to be printed; `cancel = true` prints nothing. */
export interface PrintingEventArgs<T = unknown> extends EventArgs {
  source: Scheduler<T>;
}
