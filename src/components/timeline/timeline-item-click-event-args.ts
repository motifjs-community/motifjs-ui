import type { Timeline } from './Timeline';

/** A click on an event's card (vertical) or flag (horizontal). */
export interface TimelineItemClickEventArgs {
    index: number;
    /** The item as given. */
    item: unknown;
    source: Timeline;
    event: Event;
}
