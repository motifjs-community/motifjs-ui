import type { Gallery } from './Gallery';

/** Provides data for the event that occurs after the current slide changes. */
export interface SlideChangedEventArgs {
    index: number;
    /** The item as provided, or `null` if there is none. */
    item: unknown;
    previous: number;
    /** `true` for a click, swipe or key, and `false` for a programmatic change or the slideshow. */
    byUser: boolean;
    source: Gallery;
}
