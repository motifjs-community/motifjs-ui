import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonCommand } from "./ribbon-command";
import type { RibbonGalleryItem } from "./ribbon-gallery-item";
import type { RibbonGroup } from "./ribbon-group";
import type { RibbonTab } from "./ribbon-tab";

export interface RibbonCommandClickEventArgs {
    command: RibbonCommand;
    /** The group and the tab of the command; `null` for a command given only to the quick commands. */
    group: RibbonGroup | null;
    tab: RibbonTab | null;
    /** The choice pressed in a `gallery`. */
    item?: RibbonGalleryItem;
    originalEvent: Event;
    source: RibbonMenu;
}
