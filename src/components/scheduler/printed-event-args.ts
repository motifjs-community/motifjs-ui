import type { Scheduler } from './Scheduler';

/** Occurs when the print dialog closes. */
export interface PrintedEventArgs<T = unknown> {
  source: Scheduler<T>;
}
