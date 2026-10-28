import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/** An appointment is about to be deleted (after the question, when it asks). `cancel = true` keeps it; `promise` may be set to wait. */
export interface AppointmentDeletingEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  byUser: boolean;
  promise?: Promise<boolean>;
  source: Scheduler<T>;
}
