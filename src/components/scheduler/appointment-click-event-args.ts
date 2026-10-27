import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** An appointment was clicked (or double-clicked); `cancel = true` stops what the scheduler does with it. */
export interface AppointmentClickEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  /** Where it was clicked: the day of the piece of it shown there. */
  start: Date;
  end: Date;
  event: MouseEvent | KeyboardEvent;
  source: Scheduler<T>;
}
