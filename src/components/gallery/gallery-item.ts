import type { Bind, ComponentBase } from '@motifx/core';

/** A pane of the gallery: an image, or any content, with a caption. Each field may be a function of your state. */
export interface GalleryItem {
    /** Names the pane in `value`; without one its index does. */
    key?: string;
    /** The address of the image. */
    image?: Bind<string>;
    /** What the image shows, for screen readers; empty for a decorative one. */
    alt?: Bind<string>;
    /** The caption's first line. */
    text?: Bind<string>;
    /** The caption's second line. */
    description?: Bind<string>;
    /** Any content in place of an image, made when the pane is. */
    content?: () => ComponentBase;
    /** Anything of your own; the item comes back as given in the events. */
    data?: unknown;
}
