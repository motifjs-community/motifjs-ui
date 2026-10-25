import type { ItemSource } from '../../parts/list/item-source';
import { selectAllRow, type SelectAllRow } from './select-all-row';

/** The rows of a list over items that load while they are looked at: a "Select all" row first, when it is on. */
export class ListRows<T> implements ItemSource<T | SelectAllRow> {
  withSelectAll = false;
  private readonly items: ItemSource<T>;

  constructor(items: ItemSource<T>) {
    this.items = items;
  }

  get count(): number {
    return this.items.count + this.offset;
  }

  at(index: number): T | SelectAllRow | undefined {
    const offset = this.offset;
    if (offset && index === 0) return selectAllRow;
    return this.items.at(index - offset);
  }

  ensure(first: number, end: number): void {
    const offset = this.offset;
    this.items.ensure?.(Math.max(0, first - offset), Math.max(0, end - offset));
  }

  private get offset(): number {
    return this.withSelectAll && this.items.count > 0 ? 1 : 0;
  }
}
