import type { Gallery } from './Gallery';

/** Provides data for the event that occurs when a slide is clicked without dragging. */
export interface GalleryItemClickEventArgs {
    index: number;
    /** The item as provided. */
    item: unknown;
    source: Gallery;
    event: MouseEvent;
}
