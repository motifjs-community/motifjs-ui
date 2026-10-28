import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';

export interface AppointmentUpdatedEventArgs<T = unknown> {
  appointment: T;
  changes: Partial<T>;
  byUser: boolean;
  scope: SeriesScope | null;
  series: T | null;
  /** The appointment the change made: the occurrence changed apart (`occurrence`), or the series going on from it (`following`). */
  added: T | null;
  source: Scheduler<T>;
}
