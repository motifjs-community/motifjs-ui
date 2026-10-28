import type { data } from '@motifx-community/data';

/** Where the store writes: the scheduler's array, or its data source. */
export interface AppointmentStoreOptions<T> {
  appointments: () => readonly T[];
  source: () => data.DataSource<T, unknown> | null;
  /** The field that holds an appointment's key (for the data source). */
  keyField: () => string;
  /** The array changed in place (it may not be a reactive one). */
  changed: () => void;
}

/**
 * Adds, changes and deletes appointments where they come from: in the array itself (an added one is
 * pushed, a changed one gets its new values, a deleted one is spliced out), or through the data
 * source's adapter, whose rows then follow.
 */
export class AppointmentStore<T> {
  constructor(private readonly options: AppointmentStoreOptions<T>) {}

  /** Resolves to the appointment as it was saved. */
  async add(values: Partial<T>): Promise<T> {
    const source = this.options.source();
    if (source) return source.adapter.insert(values);
    const list = this.options.appointments() as T[];
    list.push(values as T);
    this.options.changed();
    return list[list.length - 1];
  }

  async update(item: T, changes: Partial<T>): Promise<void> {
    const source = this.options.source();
    if (source) {
      await source.adapter.update(this.keyOf(item), changes);
      return;
    }
    Object.assign(item as object, changes);
    this.options.changed();
  }

  async remove(item: T): Promise<void> {
    const source = this.options.source();
    if (source) {
      await source.adapter.remove(this.keyOf(item));
      return;
    }
    const list = this.options.appointments() as T[];
    const at = list.indexOf(item);
    if (at >= 0) list.splice(at, 1);
    this.options.changed();
  }

  /** The appointments whose `field` holds `value` (the occurrences changed apart from a series): asked of the adapter, so rows not loaded are found too. */
  async rowsNaming(field: string, value: unknown): Promise<T[]> {
    const source = this.options.source();
    if (source) return (await source.adapter.load({ filter: { field, op: '=', value } })).rows;
    return this.options.appointments().filter((item) => (item as Record<string, unknown>)?.[field] === value);
  }

  /** The adapter's key of a row (its own key settings), else the key field. */
  keyOf(item: T): unknown {
    const source = this.options.source();
    return source ? source.adapter.keyOf(item) : (item as Record<string, unknown>)[this.options.keyField()];
  }
}
