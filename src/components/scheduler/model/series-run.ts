import type { SeriesWrite } from './series-write';

/** How the writes of a change to a series went. */
export interface SeriesRun<T> {
  /** The first appointment added (an occurrence changed apart, the series that goes on). */
  added: T | null;
  /** A write failed: `error` is why. */
  failed: boolean;
  error: unknown;
  /** The writes saved before the failure, and the ones not made. */
  saved: SeriesWrite<T>[];
  unsaved: SeriesWrite<T>[];
  /** Every saved write was taken back: the data is as it was. */
  undone: boolean;
}
