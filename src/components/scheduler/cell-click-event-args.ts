import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';
import type { SchedulerCell } from './scheduler-cell';

/** Occurs when a cell is clicked or double-clicked. Set `cancel = true` to skip the default action. */
export interface CellClickEventArgs<T = unknown> extends EventArgs {
  cell: SchedulerCell;
  event: MouseEvent | KeyboardEvent;
  source: Scheduler<T>;
}
