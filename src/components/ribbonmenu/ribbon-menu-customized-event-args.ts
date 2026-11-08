import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonMenuCustomization } from "./ribbon-menu-customization";

export interface RibbonMenuCustomizedEventArgs {
    /** Everything the user changed so far, to save. */
    customization: RibbonMenuCustomization;
    source: RibbonMenu;
}
