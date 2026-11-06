import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** Occurs before a pinch zooms the time scale. Set `cancel = true` to keep the scale as it is. */
export interface TimeZoomChangingEventArgs<T = unknown> extends EventArgs {
  from: number;
  to: number;
  source: Scheduler<T>;
}
