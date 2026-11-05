import type { Bind, ComponentBase } from '@motifx/core';

/** A tile of the `TileView`: a text, or any content, on a tile of so many base cells. Each field may be a function of your state. */
export interface TileViewItem {
    /** Names the tile in `value`; without one its index does. */
    key?: string;
    /** The tile's text. */
    text?: Bind<string>;
    /** How many base cells wide the tile is. Default `1`. */
    widthRatio?: Bind<number>;
    /** How many base cells tall the tile is. Default `1`. */
    heightRatio?: Bind<number>;
    /** Any content in place of the text, made when the tile is. */
    content?: () => ComponentBase;
    /** A tile that cannot be chosen or moved. Default `true`. */
    enabled?: Bind<boolean>;
    /** Anything of your own; the item comes back as given in the events. */
    data?: unknown;
}
