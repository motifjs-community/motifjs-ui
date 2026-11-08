import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonGroup } from "./ribbon-group";
import type { RibbonTab } from "./ribbon-tab";

export interface RibbonGroupMoreEventArgs {
    group: RibbonGroup;
    tab: RibbonTab;
    /** The button pressed, to place a window or a popup by. */
    target: HTMLElement;
    originalEvent: Event;
    source: RibbonMenu;
}
