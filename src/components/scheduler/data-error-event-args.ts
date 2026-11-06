import type { SeriesWrite } from './model/series-write';
import type { Scheduler } from './Scheduler';

/**
 * Saving to the data source failed; the appointment shows as it was. A change to a series takes
 * more than one write: `saved` and `unsaved` say which were created before the failure, and `undone`
 * whether the saved ones were all taken back (when not, that part of the change stays saved).
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
