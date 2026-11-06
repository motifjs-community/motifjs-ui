import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { TileClickEventArgs } from './tile-click-event-args';
import type { TileReorderEventArgs } from './tile-reorder-event-args';
import type { TileSelectionChangedEventArgs } from './tile-selection-changed-event-args';
import type { TileViewItem } from './tile-view-item';

/** Tiles flow down the columns (`horizontal`, the view scrolls sideways) or along the rows (`vertical`). */
export type TileViewDirection = 'horizontal' | 'vertical';

/** `none`: nothing is chosen; `single`: one tile; `multiple`: any number. */
export type TileViewSelectionMode = 'none' | 'single' | 'multiple';

/** Props of `TileView`. Each prop is also a settable property, and a function is tracked. */
export interface TileViewProps extends ControlProps {
    /** The tiles in order: `TileViewItem`s or plain texts. */
    items?: Bind<readonly (TileViewItem | string)[]>;
    /** A base cell's width in pixels; a tile is `widthRatio` of them. Default `100`. */
    baseItemWidth?: Bind<number>;
    /** A base cell's height in pixels; a tile is `heightRatio` of them. Default `100`. */
    baseItemHeight?: Bind<number>;
    /** Default `'horizontal'`: the tiles fill the height in columns, the view scrolls sideways; give it a `height`. */
    direction?: Bind<TileViewDirection>;
    /** Default `'none'`. */
    selectionMode?: Bind<TileViewSelectionMode>;
    /** The chosen tile (`single`): its `key`, else its index; the chosen tiles (`multiple`) as a list. `x-model` binds it two-way. */
    value?: Bind<string | number | null | readonly (string | number)[]>;
    /** The tiles can be put in another order by dragging, or with Ctrl and an arrow key. Default `false`. */
    allowReorder?: Bind<boolean>;
    /** The view's height, a CSS length or pixels. */
    height?: Bind<string | number | null>;
    /** What screen readers call it. Default: the kit's "Tiles". */
    label?: Bind<string>;
    /** A click on a tile that was not a drag. */
    onItemClick?: (e: TileClickEventArgs) => void;
    onSelectionChanged?: (e: TileSelectionChangedEventArgs) => void;
    /** A tile is about to be dragged; cancelable. */
    onReordering?: (e: TileReorderEventArgs) => void;
    /** A tile was dropped or moved with the keys to a new place: your data is yours to reorder. */
    onReordered?: (e: TileReorderEventArgs) => void;
}
