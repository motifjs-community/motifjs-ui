import type { EventArgs } from '@motifx/core';
import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';

/**
 * Occurs before an appointment changes. Set `cancel = true` to keep it as it was, or set `promise`
 * to wait. The change is applied when the promise resolves to `true`.
 */
export interface AppointmentUpdatingEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  /** The new values, by field name. They can still be changed. */
  changes: Partial<T>;
  byUser: boolean;
  /** For an occurrence, what the change applies to (`series` holds its series). `null` for any other appointment. */
  scope: SeriesScope | null;
  series: T | null;
  promise?: Promise<boolean>;
  source: Scheduler<T>;
}
