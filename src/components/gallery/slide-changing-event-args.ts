import type { EventArgs } from '@motifx/core';
import type { Gallery } from './Gallery';

/** The pane in view is about to change. `cancel = true` keeps the one there. */
export interface SlideChangingEventArgs extends EventArgs {
    from: number;
    to: number;
    /** The items as given; `null` when there is none. */
    fromItem: unknown;
    toItem: unknown;
    /** By a click, a swipe or a key, else programmatically or the slideshow. */
    byUser: boolean;
    source: Gallery;
    event?: Event;
}
