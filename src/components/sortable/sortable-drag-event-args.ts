import type { EventArgs } from '@motifx/core';
import type { Sortable } from './Sortable';

/** A drag in a sortable: the item, where it comes from and where it would land. Set `cancel = true` to reject it. */
export interface SortableDragEventArgs<T = unknown> extends EventArgs {
    /** The item as provided, or the component when the children are the items. */
    item: T;
    fromIndex: number;
    /** The position it would land at in `to`, or -1 if there is none. */
    toIndex: number;
    from: Sortable<T>;
    /** The sortable under the pointer, or `null` if there is none. */
    to: Sortable<T> | null;
    source: Sortable<T>;
    event?: Event;
}
