import type { EventArgs } from '@motifx/core';
import type { TileView } from './TileView';

/**
 * Provides data for the events before a tile moves (`onReordering`, `cancel = true` keeps it) and after it moves
 * (`onReordered`), from one index to another.
 */
export interface TileReorderEventArgs extends EventArgs {
    /** The item as provided. */
    item: unknown;
    fromIndex: number;
    toIndex: number;
    source: TileView;
    event?: Event;
}
