import type { Bind, ComponentBase } from '@motifx/core';

/** A slide of the gallery: an image, or any content, with a caption. Each field can be a function of your state. */
export interface GalleryItem {
    /** Identifies the slide in `value`. If omitted, its index is used. */
    key?: string;
    /** The address of the image. */
    image?: Bind<string>;
    /** Alternative text for the image. Leave it empty for a decorative image. */
    alt?: Bind<string>;
    /** The first line of the caption. */
    text?: Bind<string>;
    /** The second line of the caption. */
    description?: Bind<string>;
    /** Any content in place of an image, created with the slide. */
    content?: () => ComponentBase;
    /** A custom value. The item is returned as provided in the events. */
    data?: unknown;
}
