import type { Scheduler } from './Scheduler';

/** Saving to the data source failed; the appointment shows as it was. */
export interface DataErrorEventArgs<T = unknown> {
  operation: 'add' | 'update' | 'delete';
  appointment: T | Partial<T>;
  error: unknown;
  source: Scheduler<T>;
}
