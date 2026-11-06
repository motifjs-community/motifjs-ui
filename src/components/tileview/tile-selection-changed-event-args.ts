import type { TileView } from './TileView';

/** Provides data for the event that occurs when the selected tiles change. */
export interface TileSelectionChangedEventArgs {
    /** The indexes of the selected tiles, in tile order. */
    indexes: number[];
    /** Their items as provided. */
    items: unknown[];
    /** `true` for a click or key, and `false` for a programmatic change. */
    byUser: boolean;
    source: TileView;
}
