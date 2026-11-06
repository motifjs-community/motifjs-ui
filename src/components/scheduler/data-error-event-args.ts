import type { SeriesWrite } from './model/series-write';
import type { Scheduler } from './Scheduler';

/**
 * Occurs when saving to the data source fails, and the appointment reverts. A change to a series
 * takes more than one write: `saved` and `unsaved` report which were completed before the failure,
 * and `undone` reports whether they were all rolled back. If not, that part of the change stays saved.
 */
export interface DataErrorEventArgs<T = unknown> {
  operation: 'add' | 'update' | 'delete';
  appointment: T | Partial<T>;
  error: unknown;
  saved: SeriesWrite<T>[];
  unsaved: SeriesWrite<T>[];
  undone: boolean;
  source: Scheduler<T>;
}
