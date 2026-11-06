import type { EventArgs } from '@motifx/core';
import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';

/**
 * Occurs before an appointment is deleted, after the confirmation if there is one. Set
 * `cancel = true` to keep it, or set `promise` to wait.
 */
export interface AppointmentDeletingEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  byUser: boolean;
  /** For an occurrence, what the delete applies to (`series` holds its series). `null` for any other appointment. */
  scope: SeriesScope | null;
  series: T | null;
  promise?: Promise<boolean>;
  source: Scheduler<T>;
}
