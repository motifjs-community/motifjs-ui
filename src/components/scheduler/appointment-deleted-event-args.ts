import type { Scheduler } from './Scheduler';

export interface AppointmentDeletedEventArgs<T = unknown> {
  appointment: T;
  byUser: boolean;
  source: Scheduler<T>;
}
