import type { EventArgs } from '@motifx/core';
import type { SeriesScope } from './model/series-scope';
import type { Scheduler } from './Scheduler';
import type { SeriesAction } from './series-action';

/**
 * Occurs before the user is asked what a change or a delete of an occurrence applies to. Set `scope`
 * to answer without prompting, narrow `scopes` to offer fewer, or set `cancel = true` to discard the change.
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
