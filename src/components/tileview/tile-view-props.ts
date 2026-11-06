import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { TileClickEventArgs } from './tile-click-event-args';
import type { TileReorderEventArgs } from './tile-reorder-event-args';
import type { TileSelectionChangedEventArgs } from './tile-selection-changed-event-args';
import type { TileViewItem } from './tile-view-item';

/** Tiles fill the columns (`horizontal`, which scrolls horizontally) or the rows (`vertical`). */
export type TileViewDirection = 'horizontal' | 'vertical';

/** `none` selects nothing, `single` one tile, and `multiple` any number. */
export type TileViewSelectionMode = 'none' | 'single' | 'multiple';

/** Props of `TileView`. Each prop is also a settable property, and a function is tracked. */
export interface TileViewProps extends ControlProps {
    /** The tiles in order: `TileViewItem` objects or plain text. */
    items?: Bind<readonly (TileViewItem | string)[]>;
    /** The width of a base cell in pixels. A tile spans `widthRatio` cells. The default is `100`. */
    baseItemWidth?: Bind<number>;
    /** The height of a base cell in pixels. A tile spans `heightRatio` cells. The default is `100`. */
    baseItemHeight?: Bind<number>;
    /** The default, `'horizontal'`, fills the height in columns and scrolls horizontally, so set a `height`. */
    direction?: Bind<TileViewDirection>;
    /** The default is `'none'`. */
    selectionMode?: Bind<TileViewSelectionMode>;
    /**
     * The selected tile (`single`), identified by its `key` or index, or a list of selected tiles (`multiple`).
     * `x-model` provides two-way binding.
     */
    value?: Bind<string | number | null | readonly (string | number)[]>;
    /** Lets users reorder tiles by dragging or with Ctrl and an arrow key. The default is `false`. */
    allowReorder?: Bind<boolean>;
    /** The height of the view, a CSS length or pixels. */
    height?: Bind<string | number | null>;
    /** The accessible name. The default is the kit's "Tiles" string. */
    label?: Bind<string>;
    /** Occurs when a tile is clicked without dragging. */
    onItemClick?: (e: TileClickEventArgs) => void;
    onSelectionChanged?: (e: TileSelectionChangedEventArgs) => void;
    /** Occurs before a tile is dragged. This event is cancelable. */
    onReordering?: (e: TileReorderEventArgs) => void;
    /** Occurs after a tile is dropped or moved with the keyboard to a new position. Your code reorders the data. */
    onReordered?: (e: TileReorderEventArgs) => void;
}
