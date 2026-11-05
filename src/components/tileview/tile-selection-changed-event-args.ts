import type { TileView } from './TileView';

/** The chosen tiles changed. */
export interface TileSelectionChangedEventArgs {
    /** The chosen tiles' indexes, in tile order. */
    indexes: number[];
    /** Their items as given. */
    items: unknown[];
    /** By a press or a key, else from code. */
    byUser: boolean;
    source: TileView;
}
