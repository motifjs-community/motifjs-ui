import type { Bind } from "@motifx/core";
import type { IconSource } from "../../core/icon-source";
import type { RibbonCommand } from "./ribbon-command";
import type { RibbonGroupMoreEventArgs } from "./ribbon-group-more-event-args";

/** A group of commands under a name. Every field except `key`, `more` and `data` accepts a value or a function. */
export interface RibbonGroup {
    /** Finds the group. The default is its position. */
    key?: string | number;
    /** The name under the commands. */
    text: Bind<string>;
    /** The commands. Nothing is there until they are given. */
    commands: Bind<readonly RibbonCommand[]>;
    /** The name of a glyph, for the button the group folds into when there is no room. */
    glyph?: Bind<string>;
    /** An image address or a component, used instead of `glyph`. */
    icon?: Bind<IconSource | null | undefined>;
    /** Groups with a lower priority give way first when there is no room; of equals, the last first. The default is `0`. */
    priority?: Bind<number>;
    /** `false` keeps the group from folding into one button (or moving into the "more" menu). The default is `true`. */
    collapsible?: Bind<boolean>;
    /** `true` keeps the user from hiding or moving it. The default is `false`. */
    fixed?: Bind<boolean>;
    /** `false` removes the group. The default is `true`. */
    visible?: Bind<boolean>;
    /** Adds the button beside the name that opens more options of the group, such as a window. */
    more?: (e: RibbonGroupMoreEventArgs) => void;
    /** The tooltip of that button. The default names the group. */
    moreHint?: Bind<string>;
    /** A custom application value for the group. */
    data?: unknown;
}
