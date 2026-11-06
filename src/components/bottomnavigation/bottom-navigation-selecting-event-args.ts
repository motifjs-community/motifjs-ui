import type { BottomNavigationSelectionChangedEventArgs } from "./bottom-navigation-selection-changed-event-args";

/** Data of `BottomNavigation.onSelecting`. Setting `cancel` keeps the current item, and a link is not followed. */
export interface BottomNavigationSelectingEventArgs extends BottomNavigationSelectionChangedEventArgs {
    cancel: boolean;
}
