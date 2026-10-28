import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** Two fingers are about to zoom the time scale; `cancel = true` keeps it as it is. */
export interface TimeZoomChangingEventArgs<T = unknown> extends EventArgs {
  from: number;
  to: number;
  source: Scheduler<T>;
}
