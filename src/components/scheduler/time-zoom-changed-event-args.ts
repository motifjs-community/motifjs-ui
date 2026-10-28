import type { Scheduler } from './Scheduler';

/** Two fingers zoomed the time scale (sent when they let go). */
export interface TimeZoomChangedEventArgs<T = unknown> {
  from: number;
  to: number;
  source: Scheduler<T>;
}
