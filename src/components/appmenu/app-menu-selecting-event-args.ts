import type { AppMenuSelectionChangedEventArgs } from "./app-menu-selection-changed-event-args";

/** Data of `AppMenu.onSelecting`. Setting `cancel` keeps the page shown now. */
export interface AppMenuSelectingEventArgs extends AppMenuSelectionChangedEventArgs {
    cancel: boolean;
}
