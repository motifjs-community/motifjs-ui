import type { AppMenu } from "./AppMenu";
import type { AppMenuItem } from "./app-menu-item";

export interface AppMenuItemsChangedEventArgs {
    /** The new list of items, to keep: the item changed is a new object, the others the ones given. */
    items: readonly AppMenuItem[];
    source: AppMenu;
}
