import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** "+N more" was pressed: the day's list is about to open; `cancel = true` keeps it closed (to show the day yourself). */
export interface MoreOpeningEventArgs<T = unknown> extends EventArgs {
  date: Date;
  appointments: readonly T[];
  source: Scheduler<T>;
}
