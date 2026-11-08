import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonTab } from "./ribbon-tab";

export interface RibbonTabSelectionChangedEventArgs {
    key: string | number;
    previous: string | number | null;
    tab: RibbonTab;
    previousTab: RibbonTab | null;
    originalEvent: Event | null;
    source: RibbonMenu;
}
