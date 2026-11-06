import type { TileView } from './TileView';

/** The chosen tiles changed. */
export interface TileSelectionChangedEventArgs {
    /** The chosen tiles' indexes, in tile order. */
    indexes: number[];
    /** Their items as given. */
    items: unknown[];
    /** By a click or a key, else programmatically. */
    byUser: boolean;
    source: TileView;
}
