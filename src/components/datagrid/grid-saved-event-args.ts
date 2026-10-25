import type { data } from '@motifx-community/data';

/** The answer to a save came. */
export interface GridSavedEventArgs<T> {
  readonly changes: readonly data.Change<T, unknown>[];
  readonly saved: number;
  readonly failed: number;
}
