import type { Scheduler } from './Scheduler';

export interface ICalendarExportedEventArgs<T = unknown> {
  text: string;
  appointments: T[];
  source: Scheduler<T>;
}
