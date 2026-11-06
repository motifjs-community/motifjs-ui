import type { SpeedDial } from './SpeedDial';

/**
 * Provides data for the event that occurs when an action is clicked, or the main button when it performs the only
 * action.
 */
export interface SpeedDialActionClickEventArgs {
    index: number;
    /** The action as provided. */
    action: unknown;
    source: SpeedDial;
    event: Event;
}
