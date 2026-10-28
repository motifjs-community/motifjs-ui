import type { EventArgs } from '@motifx/core';
import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';

/** An appointment is about to change. `cancel = true` keeps it as it was; `promise` may be set to wait: it changes when it resolves to `true`. */
export interface AppointmentUpdatingEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  /** The new values, by the field names; they may still be changed. */
  changes: Partial<T>;
  byUser: boolean;
  /** For an occurrence of a series: what the change reaches, and the series. `null` for any other appointment. */
  scope: SeriesScope | null;
  series: T | null;
  promise?: Promise<boolean>;
  source: Scheduler<T>;
}
