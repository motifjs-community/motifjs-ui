import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonMenuLayout } from "./ribbon-menu-layout";

export interface RibbonMenuLayoutChangedEventArgs {
    layout: RibbonMenuLayout;
    previous: RibbonMenuLayout;
    originalEvent: Event | null;
    source: RibbonMenu;
}
