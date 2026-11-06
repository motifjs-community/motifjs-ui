/** Items that can load as they are viewed: a count, the item at an index once loaded, and the current view. */
export interface ItemSource<T> {
  readonly count: number;
  /** Returns `undefined` until the item has loaded. */
  at(index: number): T | undefined;
  /** Loads the items from `first` up to `end`, which the view shows. */
  ensure?(first: number, end: number): void;
}
