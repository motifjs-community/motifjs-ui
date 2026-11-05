import type { EventArgs } from '@motifx/core';
import type { TileView } from './TileView';

/** A tile is about to be moved (`onReordering`, `cancel = true` keeps it) or was moved (`onReordered`): from one index to another. */
export interface TileReorderEventArgs extends EventArgs {
    /** The item as given. */
    item: unknown;
    fromIndex: number;
    toIndex: number;
    source: TileView;
    event?: Event;
}
