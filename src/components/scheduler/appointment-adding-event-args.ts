import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** A new appointment is about to be added. `cancel = true` drops it; `promise` may be set to wait (a server): it is added when it resolves to `true`. */
export interface AppointmentAddingEventArgs<T = unknown> extends EventArgs {
  /** Its values, by the field names; they may still be changed. */
  appointment: Partial<T>;
  byUser: boolean;
  promise?: Promise<boolean>;
  source: Scheduler<T>;
}
