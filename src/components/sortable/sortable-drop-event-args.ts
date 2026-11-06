import type { Sortable } from './Sortable';

/** An item was dropped: moved within a sortable (`onReorder`), removed from one (`onRemove`) or added to another (`onAdd`). */
export interface SortableDropEventArgs<T = unknown> {
    item: T;
    fromIndex: number;
    toIndex: number;
    from: Sortable<T>;
    to: Sortable<T>;
    source: Sortable<T>;
    event?: Event;
}
