import type { ComponentBase } from "@motifx/core";
import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonGroup } from "./ribbon-group";
import type { RibbonTab } from "./ribbon-tab";

export interface RibbonGroupMoreEventArgs {
    group: RibbonGroup;
    tab: RibbonTab;
    /** The button pressed, as a component, to place a window or a popup by. */
    part: ComponentBase;
    originalEvent: Event;
    source: RibbonMenu;
}
