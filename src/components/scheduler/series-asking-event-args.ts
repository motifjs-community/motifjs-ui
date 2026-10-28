import type { EventArgs } from '@motifx/core';
import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';
import type { SeriesAction } from './series-action';

/**
 * The user is about to be asked what a change (or a delete) of an occurrence reaches. Set `scope`
 * to answer without the question, narrow `scopes` to offer fewer, or `cancel = true` to drop the change.
 */
export interface SeriesAskingEventArgs<T = unknown> extends EventArgs {
  /** The occurrence. */
  appointment: T;
  series: T;
  action: SeriesAction;
  /** The answers offered, in order. */
  scopes: SeriesScope[];
  scope: SeriesScope | null;
  source: Scheduler<T>;
}
