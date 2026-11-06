import type { Gallery } from './Gallery';

/** The pane in view changed. */
export interface SlideChangedEventArgs {
    index: number;
    /** The item as given; `null` when there is none. */
    item: unknown;
    previous: number;
    /** By a click, a swipe or a key, else programmatically or the slideshow. */
    byUser: boolean;
    source: Gallery;
}
