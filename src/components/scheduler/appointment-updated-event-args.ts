import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';

export interface AppointmentUpdatedEventArgs<T = unknown> {
  appointment: T;
  changes: Partial<T>;
  byUser: boolean;
  scope: SeriesScope | null;
  series: T | null;
  /**
   * The appointment the change created: the individually edited occurrence (`occurrence`), or the
   * continuing series (`following`).
   */
  added: T | null;
  source: Scheduler<T>;
}
