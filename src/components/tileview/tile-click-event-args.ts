import type { TileView } from './TileView';

/** A click on a tile that was not a drag. */
export interface TileClickEventArgs {
    index: number;
    /** The item as given. */
    item: unknown;
    source: TileView;
    event: Event;
}
