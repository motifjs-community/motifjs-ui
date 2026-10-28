import type { EventArgs } from '@motifx/core';
import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';

/** An appointment is about to be deleted (after the question, when it asks). `cancel = true` keeps it; `promise` may be set to wait. */
export interface AppointmentDeletingEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  byUser: boolean;
  /** For an occurrence of a series: what the delete reaches, and the series. `null` for any other appointment. */
  scope: SeriesScope | null;
  series: T | null;
  promise?: Promise<boolean>;
  source: Scheduler<T>;
}
