import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { GalleryItem } from './gallery-item';
import type { GalleryItemClickEventArgs } from './gallery-item-click-event-args';
import type { SlideChangedEventArgs } from './slide-changed-event-args';
import type { SlideChangingEventArgs } from './slide-changing-event-args';

/** Props of `Gallery`. Each one is also a settable property; a function is followed. */
export interface GalleryProps extends ControlProps {
    /** The panes in order: `GalleryItem`s or image addresses. */
    items?: Bind<readonly (GalleryItem | string)[]>;
    /** The pane in view: its `key`, else its index. `x-model` binds it two-way. Default `0`. */
    value?: Bind<string | number | null>;
    /** After the last pane comes the first. Default `false`. */
    loop?: Bind<boolean>;
    /** The previous and next buttons at the sides. Default `true`. */
    showNavButtons?: Bind<boolean>;
    /** The dots under the panes, one per pane. Default `true`. */
    showIndicator?: Bind<boolean>;
    /** Milliseconds a pane stays in a slideshow; `0` for none. It pauses under the pointer, while focus is inside, out of sight and under reduced motion. Default `0`. */
    slideInterval?: Bind<number>;
    /** The slideshow pauses while the pointer rests on the gallery. Default `true`. */
    pauseOnHover?: Bind<boolean>;
    /** A finger or a pointer drags the panes. Default `true`. */
    swipeEnabled?: Bind<boolean>;
    /** Panes side by side in the width. Default `1`. */
    itemsPerPage?: Bind<number>;
    /** An image fills its pane, cut at the edges, instead of fitting inside it whole. Default `false`. */
    stretchImages?: Bind<boolean>;
    /** The gallery's height, a CSS length or pixels. Without one it is as tall as its tallest pane. */
    height?: Bind<string | number | null>;
    /** What screen readers call it. Default: the kit's "Gallery". */
    label?: Bind<string>;
    /** The pane in view is about to change; cancelable. */
    onSlideChanging?: (e: SlideChangingEventArgs) => void;
    onSlideChanged?: (e: SlideChangedEventArgs) => void;
    /** A press on a pane that was not a drag. */
    onItemClick?: (e: GalleryItemClickEventArgs) => void;
}
