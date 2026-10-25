import type { DataItems } from '../../parts/data/DataItems';

/** The items of chosen values, kept so they can be shown while they are on no loaded page. */
export class ValueItems<T> {
  valueOf: (item: T) => unknown = (item) => item;
  private readonly items: DataItems<T>;
  private readonly known = new Map<unknown, T>();
  private readonly asking = new Set<unknown>();
  /** Values the data source has no item for. */
  private readonly missing = new Set<unknown>();

  constructor(items: DataItems<T>) {
    this.items = items;
  }

  remember(item: T): void {
    this.known.set(this.valueOf(item), item);
  }

  /** The item of `value` when it is known now. */
  itemOf(value: unknown): T | undefined {
    const known = this.known.get(value);
    if (known !== undefined) return known;
    const near = this.items.findLoaded(value, this.valueOf);
    if (near !== undefined) this.known.set(value, near);
    return near;
  }

  /** The data source is being asked for the item of `value`. */
  isAsking(value: unknown): boolean {
    return this.asking.has(value);
  }

  /** Asks the data source for the values that have no item yet; `answered` runs after each answer. */
  lookUp(values: readonly unknown[], answered: () => void): void {
    if (!this.items.dataSource) return;
    for (const value of values) {
      if (this.asking.has(value) || this.missing.has(value) || this.itemOf(value) !== undefined) continue;
      this.asking.add(value);
      void this.items.find(value, this.valueOf).then((item) => {
        this.asking.delete(value);
        if (item === undefined) this.missing.add(value);
        else this.known.set(value, item);
        answered();
      });
    }
  }

  /** Lets go of the items of values no longer chosen. */
  keep(values: readonly unknown[]): void {
    const wanted = new Set(values);
    for (const value of this.known.keys()) if (!wanted.has(value)) this.known.delete(value);
    for (const value of this.missing) if (!wanted.has(value)) this.missing.delete(value);
  }

  clear(): void {
    this.known.clear();
    this.missing.clear();
  }
}
