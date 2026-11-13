import type { ComponentBase } from "@motifx/core";
import type { RibbonMenu } from "./RibbonMenu";

export interface RibbonAppButtonEventArgs {
    /** The button's part, to place a menu by. */
    part: ComponentBase;
    originalEvent: Event;
    source: RibbonMenu;
}
