import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';
import type { SchedulerPresentationKind } from './scheduler-presentation-kind';

/**
 * Occurs before the presentation changes. Set `cancel = true` to keep the current one until the
 * width or the setting changes again.
 */
export interface SchedulerPresentationChangingEventArgs<T = unknown> extends EventArgs {
  from: SchedulerPresentationKind;
  to: SchedulerPresentationKind;
  /** The scheduler's width, in pixels. */
  width: number;
  source: Scheduler<T>;
}
