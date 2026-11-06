import type { Timeline } from './Timeline';

/** Horizontal: the event whose card is shown changed. */
export interface TimelineSelectionChangedEventArgs {
    index: number;
    /** The item as given; `null` when there is none. */
    item: unknown;
    previous: number;
    /** By a click or a key, else from code. */
    byUser: boolean;
    source: Timeline;
}
