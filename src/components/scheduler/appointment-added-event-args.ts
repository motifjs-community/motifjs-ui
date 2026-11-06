import type { Scheduler } from './Scheduler';

export interface AppointmentAddedEventArgs<T = unknown> {
  /** The appointment as it was saved: the data source's row, or the object added to the array. */
  appointment: T;
  byUser: boolean;
  source: Scheduler<T>;
}
