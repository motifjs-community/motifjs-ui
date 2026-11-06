import type { TileView } from './TileView';

/** Provides data for the event that occurs when a tile is clicked without dragging. */
export interface TileClickEventArgs {
    index: number;
    /** The item as provided. */
    item: unknown;
    source: TileView;
    event: Event;
}
