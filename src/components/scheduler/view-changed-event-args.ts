import type { Scheduler } from './Scheduler';

export interface ViewChangedEventArgs<T = unknown> {
  from: string;
  to: string;
  byUser: boolean;
  source: Scheduler<T>;
}
