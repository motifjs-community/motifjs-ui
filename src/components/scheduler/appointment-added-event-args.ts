import type { Scheduler } from './Scheduler';

export interface AppointmentAddedEventArgs<T = unknown> {
  /** The appointment as it was saved (the data source's row, or the object put in the array). */
  appointment: T;
  byUser: boolean;
  source: Scheduler<T>;
}
