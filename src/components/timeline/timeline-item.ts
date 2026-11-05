import type { Bind, ComponentBase } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** The colour of an event's dot and flag. */
export type TimelineTone = 'default' | 'accent' | 'success' | 'caution' | 'danger' | 'info';

/** One event on the `Timeline`. Each field may be a function of your state. */
export interface TimelineItem {
    /** Names the event in `value` and the events; without one its index does. */
    key?: string;
    /** When: a `Date`, an ISO text, or milliseconds. */
    date: Bind<Date | string | number>;
    title: Bind<string>;
    /** The text under the title; folded until the card is pressed when the timeline is `collapsible`. */
    description?: Bind<string>;
    /** A glyph of the kit's set in the dot. */
    glyph?: Bind<string>;
    /** An icon of your own in the dot, in place of the glyph. */
    icon?: IconSource;
    /** Default `'default'`. */
    tone?: Bind<TimelineTone>;
    /** Any content in the card, made when the card is. */
    content?: () => ComponentBase;
    /** Anything of your own; the item comes back as given in the events. */
    data?: unknown;
}
