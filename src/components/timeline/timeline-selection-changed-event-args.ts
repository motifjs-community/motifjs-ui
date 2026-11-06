import type { Timeline } from './Timeline';

/** Provides data for the event that occurs, in the horizontal layout, when the selected event changes. */
export interface TimelineSelectionChangedEventArgs {
    index: number;
    /** The item as provided, or `null` if there is none. */
    item: unknown;
    previous: number;
    /** `true` for a click or key, and `false` for a programmatic change. */
    byUser: boolean;
    source: Timeline;
}
