/** Items that can load as they are viewed: a count, the item at an index once loaded, and the current view. */
export interface ItemSource<T> {
  readonly count: number;
  /** Returns `undefined` until the item has loaded. */
  at(index: number): T | undefined;
  /** Loads the items from `first` up to `end`, which the view shows. */
  ensure?(first: number, end: number): void;
  /** Whether the item at `index` failed to load; with no index, whether the whole list failed. */
  failedAt?(index?: number): boolean;
  /** Loads again what failed. */
  retryFailed?(): void;
}
