import type { Scheduler } from './Scheduler';

/** The print dialog has closed. */
export interface PrintedEventArgs<T = unknown> {
  source: Scheduler<T>;
}
