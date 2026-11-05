import type { EventArgs } from '@motifx/core';
import type { Gallery } from './Gallery';

/** The pane in view is about to change. `cancel = true` keeps the one there. */
export interface SlideChangingEventArgs extends EventArgs {
    from: number;
    to: number;
    /** The items as given; `null` when there is none. */
    fromItem: unknown;
    toItem: unknown;
    /** By a press, a swipe or a key, else from code or the slideshow. */
    byUser: boolean;
    source: Gallery;
    event?: Event;
}
