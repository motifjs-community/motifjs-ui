import type { AppBar } from "./AppBar";
import type { AppBarNavigation } from "./app-bar-navigation";

/** Data of `AppBar.onNavigationClick`. */
export interface AppBarNavigationClickEventArgs {
    /** The kind of navigation button that was pressed. */
    navigation: AppBarNavigation;
    originalEvent: Event;
    source: AppBar;
}
