import type { Scheduler } from './Scheduler';

/** Occurs when a pinch that zoomed the time scale ends. */
export interface TimeZoomChangedEventArgs<T = unknown> {
  from: number;
  to: number;
  source: Scheduler<T>;
}
