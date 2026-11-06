import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';
import type { SeriesAction } from './series-action';

/**
 * Occurs when the prompt about what a change or a delete of an occurrence applies to is answered.
 * `scope` is `null` when the prompt was canceled.
 */
export interface SeriesAnsweredEventArgs<T = unknown> {
  appointment: T;
  series: T;
  action: SeriesAction;
  scope: SeriesScope | null;
  byUser: boolean;
  source: Scheduler<T>;
}
