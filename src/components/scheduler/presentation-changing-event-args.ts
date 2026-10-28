import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';
import type { SchedulerPresentationKind } from './scheduler-presentation-kind';

/** The scheduler is about to show itself another way; `cancel = true` keeps the way it is (until the width or the setting changes again). */
export interface SchedulerPresentationChangingEventArgs<T = unknown> extends EventArgs {
  from: SchedulerPresentationKind;
  to: SchedulerPresentationKind;
  /** The scheduler's width, in pixels. */
  width: number;
  source: Scheduler<T>;
}
