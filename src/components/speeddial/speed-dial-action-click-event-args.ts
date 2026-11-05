import type { SpeedDial } from './SpeedDial';

/** An action was pressed (or the main button, when it stands for the only action). */
export interface SpeedDialActionClickEventArgs {
    index: number;
    /** The action as given. */
    action: unknown;
    source: SpeedDial;
    event: Event;
}
