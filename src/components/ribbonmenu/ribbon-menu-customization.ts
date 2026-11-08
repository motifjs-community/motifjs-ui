import type { RibbonMenuDisplay } from "./ribbon-menu-display";
import type { RibbonMenuLayout } from "./ribbon-menu-layout";
import type { RibbonQuickBarPosition } from "./ribbon-quick-bar-position";

/**
 * What the user changed in the menu, to save and give back later. Groups and commands are named by their keys, joined
 * with `/`: `home/clipboard` for a group, `home/clipboard/paste` for a command (a missing key is the position).
 */
export interface RibbonMenuCustomization {
    /** The groups and commands the user hid. */
    hidden?: readonly string[];
    /** The order the user gave: a tab's groups under its key, a group's commands under its path. */
    order?: Readonly<Record<string, readonly string[]>>;
    /** The commands the user added to the quick commands. */
    quick?: readonly string[];
    layout?: RibbonMenuLayout;
    display?: RibbonMenuDisplay;
    quickBar?: RibbonQuickBarPosition;
}
