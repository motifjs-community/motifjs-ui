import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';
import type { SchedulerCell } from './scheduler-cell';

/** A cell was clicked (or double-clicked); `cancel = true` stops what the scheduler does with it. */
export interface CellClickEventArgs<T = unknown> extends EventArgs {
  cell: SchedulerCell;
  event: MouseEvent | KeyboardEvent;
  source: Scheduler<T>;
}
