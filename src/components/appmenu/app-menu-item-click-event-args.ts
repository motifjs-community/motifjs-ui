import type { AppMenu } from "./AppMenu";
import type { AppMenuItem } from "./app-menu-item";

/** Data of `AppMenu.onItemClick` and of an item's own `click`. */
export interface AppMenuItemClickEventArgs {
    item: AppMenuItem;
    key: string | number;
    /** Keeps the menu open after a command or a link that would close it. */
    keepOpen: boolean;
    originalEvent: Event;
    source: AppMenu;
}
