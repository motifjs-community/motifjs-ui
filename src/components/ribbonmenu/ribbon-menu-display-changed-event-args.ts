import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonMenuDisplay } from "./ribbon-menu-display";

export interface RibbonMenuDisplayChangedEventArgs {
    display: RibbonMenuDisplay;
    previous: RibbonMenuDisplay;
    originalEvent: Event | null;
    source: RibbonMenu;
}
