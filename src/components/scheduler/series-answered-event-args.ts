import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';
import type { SeriesAction } from './series-action';

/** What a change (or a delete) of an occurrence reaches was answered; `scope` is `null` when the question was cancelled. */
export interface SeriesAnsweredEventArgs<T = unknown> {
  appointment: T;
  series: T;
  action: SeriesAction;
  scope: SeriesScope | null;
  byUser: boolean;
  source: Scheduler<T>;
}
