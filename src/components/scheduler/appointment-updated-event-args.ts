import type { Scheduler } from './Scheduler';

export interface AppointmentUpdatedEventArgs<T = unknown> {
  appointment: T;
  changes: Partial<T>;
  byUser: boolean;
  source: Scheduler<T>;
}
