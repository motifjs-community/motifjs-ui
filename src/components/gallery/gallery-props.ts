import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { GalleryItem } from './gallery-item';
import type { GalleryItemClickEventArgs } from './gallery-item-click-event-args';
import type { SlideChangedEventArgs } from './slide-changed-event-args';
import type { SlideChangingEventArgs } from './slide-changing-event-args';

/** Props of `Gallery`. Each prop is also a settable property, and a function is tracked. */
export interface GalleryProps extends ControlProps {
    /** The slides in order: `GalleryItem` objects or image addresses. */
    items?: Bind<readonly (GalleryItem | string)[]>;
    /** The current slide, identified by its `key` or index. `x-model` provides two-way binding. The default is `0`. */
    value?: Bind<string | number | null>;
    /** The first slide follows the last. The default is `false`. */
    loop?: Bind<boolean>;
    /** Shows previous and next buttons over the sides. The default is `true`. */
    showNavButtons?: Bind<boolean>;
    /** Shows indicator dots below the slides, one per slide. The default is `true`. */
    showIndicator?: Bind<boolean>;
    /**
     * The time each slide stays in a slideshow, in milliseconds. The default, `0`, turns it off. The slideshow pauses on
     * hover, while focus is inside, while out of view and when the user prefers reduced motion.
     */
    slideInterval?: Bind<number>;
    /** Pauses the slideshow while the pointer is over the gallery. The default is `true`. */
    pauseOnHover?: Bind<boolean>;
    /** Lets a finger or pointer drag the slides. The default is `true`. */
    swipeEnabled?: Bind<boolean>;
    /** The number of slides side by side. The default is `1`. */
    itemsPerPage?: Bind<number>;
    /**
     * Makes an image fill its slide and crops the edges, instead of fitting the whole image inside. The default is
     * `false`.
     */
    stretchImages?: Bind<boolean>;
    /** The height of the gallery, a CSS length or pixels. Without it, the gallery is as tall as its tallest slide. */
    height?: Bind<string | number | null>;
    /** The accessible name. The default is the kit's "Gallery" string. */
    label?: Bind<string>;
    /** Occurs before the current slide changes. This event is cancelable. */
    onSlideChanging?: (e: SlideChangingEventArgs) => void;
    onSlideChanged?: (e: SlideChangedEventArgs) => void;
    /** Occurs when a slide is clicked without dragging. */
    onItemClick?: (e: GalleryItemClickEventArgs) => void;
}
