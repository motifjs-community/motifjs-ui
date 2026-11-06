import type { Bind } from "@motifx/core";
import type { IconSource } from "../../core/icon-source";
import type { BottomNavigationItemClickEventArgs } from "./bottom-navigation-item-click-event-args";

/** One destination of `BottomNavigation.items`. Every field except `click` and `data` accepts a value or a function. */
export interface BottomNavigationItem {
    /** What `value` is when this item is selected. The default is its position. */
    value?: string | number;
    text: Bind<string>;
    /** The name of a glyph. */
    glyph?: Bind<string>;
    /** The glyph while selected, such as a filled one. The default is `glyph`. */
    activeGlyph?: Bind<string>;
    /** An image, an element or a component, used instead of `glyph`. */
    icon?: Bind<IconSource | null | undefined>;
    /** The icon while selected. The default is `icon`. */
    activeIcon?: Bind<IconSource | null | undefined>;
    /** Makes the item a link to this address. */
    href?: Bind<string>;
    /** The `rel` of the link, such as `'router'`. */
    rel?: Bind<string>;
    /** The `target` of the link. */
    target?: Bind<string>;
    /** A count in a badge on the icon. */
    badge?: Bind<number | null>;
    /** A dot on the icon instead of a count. The default is `false`. */
    dot?: Bind<boolean>;
    /** `false` dims the item, and it cannot be selected. The default is `true`. */
    enabled?: Bind<boolean>;
    /** `false` removes the item. The default is `true`. */
    visible?: Bind<boolean>;
    /** Occurs when the item is pressed. */
    click?: (e: BottomNavigationItemClickEventArgs) => void;
    /** A custom application value for the item. */
    data?: unknown;
}
