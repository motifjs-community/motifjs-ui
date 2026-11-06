import type { data } from '@motifx-community/data';

/** Occurs when the response to a save arrives. */
export interface GridSavedEventArgs<T> {
  readonly changes: readonly data.Change<T, unknown>[];
  readonly saved: number;
  readonly failed: number;
}
