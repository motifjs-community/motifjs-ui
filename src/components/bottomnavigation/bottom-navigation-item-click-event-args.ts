import type { BottomNavigation } from "./BottomNavigation";
import type { BottomNavigationItem } from "./bottom-navigation-item";

/** Data of `BottomNavigation.onItemClick` and of an item's `click`. */
export interface BottomNavigationItemClickEventArgs {
    item: BottomNavigationItem;
    value: string | number;
    originalEvent: Event;
    source: BottomNavigation;
}
