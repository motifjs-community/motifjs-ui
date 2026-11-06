import type { Bind, ComponentBase } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';

/** The color of an event's dot and date marker. */
export type TimelineTone = 'default' | 'accent' | 'success' | 'caution' | 'danger' | 'info';

/** One event on the `Timeline`. Each field can be a function of your state. */
export interface TimelineItem {
    /** Identifies the event in `value` and the events. If omitted, its index is used. */
    key?: string;
    /** The date: a `Date`, an ISO string or milliseconds. */
    date: Bind<Date | string | number>;
    title: Bind<string>;
    /** The text below the title. With `collapsible`, it stays collapsed until the card is clicked. */
    description?: Bind<string>;
    /** A glyph from the kit's set in the dot. */
    glyph?: Bind<string>;
    /** A custom icon in the dot, in place of the glyph. */
    icon?: IconSource;
    /** The default is `'default'`. */
    tone?: Bind<TimelineTone>;
    /** Any content in the card, created with the card. */
    content?: () => ComponentBase;
    /** A custom value. The item is returned as provided in the events. */
    data?: unknown;
}
