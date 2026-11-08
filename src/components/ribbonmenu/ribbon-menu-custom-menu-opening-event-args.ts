import type { MenuItem } from "../../parts/menu/menu-item";
import type { RibbonMenu } from "./RibbonMenu";
import type { RibbonCommand } from "./ribbon-command";
import type { RibbonGroup } from "./ribbon-group";
import type { RibbonTab } from "./ribbon-tab";

export interface RibbonMenuCustomMenuOpeningEventArgs {
    /** The tab, group or command pressed with the right button or the menu key, as the app gave it; `null` elsewhere. */
    item: RibbonTab | RibbonGroup | RibbonCommand | null;
    /** Its path, such as `home/clipboard/paste`; `null` with `item`. */
    path: string | null;
    /**
     * The commands of the menu about to open: the menu's own when `customizable` is on, else none. Change the list to
     * add your own or to leave some out. The menu does not open when it is empty.
     */
    items: MenuItem[];
    /** Set to `true` to keep the menu closed. */
    cancel: boolean;
    /** Whether a key opened it. */
    byKeyboard: boolean;
    event: Event;
    source: RibbonMenu;
}
