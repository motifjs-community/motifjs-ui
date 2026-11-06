import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/**
 * Occurs before a new appointment is added. Set `cancel = true` to discard it, or set `promise` to
 * wait, for example for a server. The appointment is added when the promise resolves to `true`.
 */
export interface AppointmentAddingEventArgs<T = unknown> extends EventArgs {
  /** The new appointment's values, by field name. They can still be changed. */
  appointment: Partial<T>;
  byUser: boolean;
  promise?: Promise<boolean>;
  source: Scheduler<T>;
}
