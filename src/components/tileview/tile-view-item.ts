import type { Bind, ComponentBase } from '@motifx/core';

/**
 * A tile of the `TileView`: text or any content, on a tile that spans a number of base cells. Each field can be a
 * function of your state.
 */
export interface TileViewItem {
    /** Identifies the tile in `value`. If omitted, its index is used. */
    key?: string;
    /** The tile text. */
    text?: Bind<string>;
    /** The width of the tile in base cells. The default is `1`. */
    widthRatio?: Bind<number>;
    /** The height of the tile in base cells. The default is `1`. */
    heightRatio?: Bind<number>;
    /** Any content in place of the text, created with the tile. */
    content?: () => ComponentBase;
    /** `false` means the tile cannot be selected or moved. The default is `true`. */
    enabled?: Bind<boolean>;
    /** A custom value. The item is returned as provided in the events. */
    data?: unknown;
}
