import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonTab } from "./ribbon-tab";

export interface RibbonMenuItemsChangedEventArgs {
    /** The new list of tabs, to keep: the items along the changed path are new objects, the others the ones given. */
    items: readonly RibbonTab[];
    source: RibbonMenu;
}
