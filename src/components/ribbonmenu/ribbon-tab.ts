import type { Bind } from "@motifx/core";
import type { RibbonGroup } from "./ribbon-group";

/** A tab and its groups. Every field except `key` and `data` accepts a value or a function, and a function is tracked. */
export interface RibbonTab {
    /** Finds the tab, and is the menu's `value` while it is shown. The default is its position. */
    key?: string | number;
    /** The text. An `&` before a letter makes that letter its access key. */
    text: Bind<string>;
    /** A longer description, shown as a tooltip. */
    hint?: Bind<string>;
    /** The groups. Nothing is there until they are given; they are made the first time the tab is shown. */
    groups: Bind<readonly RibbonGroup[]>;
    /**
     * Makes it a tab of a context, such as a picture being edited: it is drawn in the context color, and the name is
     * told to assistive technology. Show it with `visible` while the context lasts.
     */
    context?: Bind<string>;
    /** `false` removes the tab. The default is `true`. */
    visible?: Bind<boolean>;
    /** `false` dims the tab, and it cannot be chosen. The default is `true`. */
    enabled?: Bind<boolean>;
    /** A custom application value for the tab. */
    data?: unknown;
}
