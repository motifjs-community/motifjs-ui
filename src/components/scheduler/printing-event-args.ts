import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** Occurs before the print dialog opens. Set `cancel = true` to skip printing. */
export interface PrintingEventArgs<T = unknown> extends EventArgs {
  source: Scheduler<T>;
}
