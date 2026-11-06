import type { BottomNavigation } from "./BottomNavigation";
import type { BottomNavigationItem } from "./bottom-navigation-item";

/** Data of `BottomNavigation.onSelectionChanged`. */
export interface BottomNavigationSelectionChangedEventArgs {
    value: string | number;
    previous: string | number | null;
    item: BottomNavigationItem;
    previousItem: BottomNavigationItem | null;
    originalEvent: Event;
    source: BottomNavigation;
}
