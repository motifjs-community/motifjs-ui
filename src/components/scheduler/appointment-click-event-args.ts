import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** Occurs when an appointment is clicked or double-clicked. Set `cancel = true` to skip the default action. */
export interface AppointmentClickEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  /** The day of the displayed part that was clicked. */
  start: Date;
  end: Date;
  /** The resource values of the clicked group. `null` without groups. */
  group: Record<string, unknown> | null;
  event: MouseEvent | KeyboardEvent;
  source: Scheduler<T>;
}
