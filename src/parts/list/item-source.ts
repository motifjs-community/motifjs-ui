/** Items that may load while they are looked at: a count, the item at an index once loaded, and where the view is. */
export interface ItemSource<T> {
  readonly count: number;
  /** `undefined` while not loaded yet. */
  at(index: number): T | undefined;
  /** The view shows `first` up to `end`: load them. */
  ensure?(first: number, end: number): void;
}
