import type { AppMenu } from "./AppMenu";
import type { AppMenuItem } from "./app-menu-item";

/** Data of `AppMenu.onSelectionChanged`. */
export interface AppMenuSelectionChangedEventArgs {
    /** The key of the page item chosen. */
    key: string | number;
    previous: string | number | null;
    item: AppMenuItem;
    previousItem: AppMenuItem | null;
    /** What the reader did, or `null` for a change made programmatically. */
    originalEvent: Event | null;
    source: AppMenu;
}
