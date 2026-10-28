import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';

export interface AppointmentDeletedEventArgs<T = unknown> {
  appointment: T;
  byUser: boolean;
  scope: SeriesScope | null;
  series: T | null;
  source: Scheduler<T>;
}
