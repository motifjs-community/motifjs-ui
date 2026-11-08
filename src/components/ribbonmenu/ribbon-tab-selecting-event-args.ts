import type { RibbonTabSelectionChangedEventArgs } from "./ribbon-tab-selection-changed-event-args";

export interface RibbonTabSelectingEventArgs extends RibbonTabSelectionChangedEventArgs {
    /** Keeps the tab shown now. */
    cancel: boolean;
}
