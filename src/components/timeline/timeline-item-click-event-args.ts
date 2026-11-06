import type { Timeline } from './Timeline';

/** Provides data for the event that occurs when an event's card (vertical) or date (horizontal) is clicked. */
export interface TimelineItemClickEventArgs {
    index: number;
    /** The item as provided. */
    item: unknown;
    source: Timeline;
    event: Event;
}
