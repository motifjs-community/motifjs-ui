import type { EventArgs } from '@motifx/core';
import type { Gallery } from './Gallery';

/** Provides data for the event that occurs before the current slide changes. Set `cancel = true` to keep it. */
export interface SlideChangingEventArgs extends EventArgs {
    from: number;
    to: number;
    /** The items as provided, or `null` if there is none. */
    fromItem: unknown;
    toItem: unknown;
    /** `true` for a click, swipe or key, and `false` for a programmatic change or the slideshow. */
    byUser: boolean;
    source: Gallery;
    event?: Event;
}
