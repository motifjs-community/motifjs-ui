import type { SpeedDial } from './SpeedDial';

/** The actions opened or closed. */
export interface SpeedDialEventArgs {
    /** By a click or a key, else from code. */
    byUser: boolean;
    source: SpeedDial;
    event?: Event;
}
