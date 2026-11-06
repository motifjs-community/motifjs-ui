import type { SpeedDial } from './SpeedDial';

/** Provides data for the events that occur when the actions open or close. */
export interface SpeedDialEventArgs {
    /** `true` for a click or key, and `false` for a programmatic change. */
    byUser: boolean;
    source: SpeedDial;
    event?: Event;
}
