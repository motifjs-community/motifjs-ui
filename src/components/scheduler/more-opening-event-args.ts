import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/**
 * Occurs when "+N more" is clicked, before the day's list opens. Set `cancel = true` to keep it
 * closed and display the day yourself.
 */
export interface MoreOpeningEventArgs<T = unknown> extends EventArgs {
  date: Date;
  appointments: readonly T[];
  source: Scheduler<T>;
}
