import type { SpeedDial } from './SpeedDial';

/** The actions opened or closed. */
export interface SpeedDialEventArgs {
    /** By a press or a key, else from code. */
    byUser: boolean;
    source: SpeedDial;
    event?: Event;
}
