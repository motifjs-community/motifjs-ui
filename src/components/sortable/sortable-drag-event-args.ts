import type { EventArgs } from '@motifx/core';
import type { Sortable } from './Sortable';

/** A drag in a sortable: the item, where it comes from and where it would go. `cancel = true` refuses. */
export interface SortableDragEventArgs<T = unknown> extends EventArgs {
    /** The item as given, or the component when the children are the items. */
    item: T;
    fromIndex: number;
    /** Where it would land in `to`; -1 while nowhere. */
    toIndex: number;
    from: Sortable<T>;
    /** The sortable under the pointer; `null` while nowhere. */
    to: Sortable<T> | null;
    source: Sortable<T>;
    event?: Event;
}
