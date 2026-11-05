import type { Gallery } from './Gallery';

/** A press on a pane that was not a drag. */
export interface GalleryItemClickEventArgs {
    index: number;
    /** The item as given. */
    item: unknown;
    source: Gallery;
    event: MouseEvent;
}
