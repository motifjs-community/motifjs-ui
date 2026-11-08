import type { Bind, ComponentBase } from "@motifx/core";
import type { IconSource } from "../../core/icon-source";
import type { AppMenuItemClickEventArgs } from "./app-menu-item-click-event-args";

/**
 * One entry of `AppMenu.items`. An item with `page` shows that page beside the list; any other item is a command
 * (`click`, `onItemClick`) or, with `href`, a link. Every field except `key`, `page`, `click` and `data` accepts a value
 * or a function.
 */
export interface AppMenuItem {
    /** Finds the item, and is what `selected` is while its page is shown. The default is its position. */
    key?: string | number;
    /** The text. An `&` before a letter makes that letter its access key; `&&` writes an ampersand. */
    text: Bind<string>;
    /** The name of a glyph. */
    glyph?: Bind<string>;
    /** An image, an element or a component, used instead of `glyph`. */
    icon?: Bind<IconSource | null | undefined>;
    /** A longer description, shown as a tooltip. */
    hint?: Bind<string>;
    /** Makes it a page item. The page is made the first time it is shown, and kept. */
    page?: () => ComponentBase;
    /** Makes the item a link to this address. */
    href?: Bind<string>;
    /** The `rel` of the link, such as `'router'`. */
    rel?: Bind<string>;
    /** The `target` of the link. */
    target?: Bind<string>;
    /** A count in a badge. */
    badge?: Bind<number | null>;
    /** A dot instead of a count. The default is `false`. */
    dot?: Bind<boolean>;
    /** `false` dims the item, and it cannot be chosen. The default is `true`. */
    enabled?: Bind<boolean>;
    /** `false` removes the item. The default is `true`. */
    visible?: Bind<boolean>;
    /** Items of the same group stand together, with a line between groups. */
    group?: Bind<string>;
    /** Puts the item in the list at the bottom of the menu. The default is `false`. */
    bottom?: Bind<boolean>;
    /** Closes the menu when the item is pressed, for a command or a link. The default is the menu's `closeOnCommand`. */
    closeOnClick?: Bind<boolean>;
    /** Occurs when the item is pressed. */
    click?: (e: AppMenuItemClickEventArgs) => void;
    /** A custom application value for the item. */
    data?: unknown;
}
