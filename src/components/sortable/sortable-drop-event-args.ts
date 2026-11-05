import type { Sortable } from './Sortable';

/** An item was dropped: moved within a sortable (`onReorder`), taken out of one (`onRemove`) or into another (`onAdd`). */
export interface SortableDropEventArgs<T = unknown> {
    item: T;
    fromIndex: number;
    toIndex: number;
    from: Sortable<T>;
    to: Sortable<T>;
    source: Sortable<T>;
    event?: Event;
}
