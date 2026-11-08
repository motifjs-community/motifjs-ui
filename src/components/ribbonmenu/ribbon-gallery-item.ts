import type { Bind } from "@motifx/core";
import type { IconSource } from "../../core/icon-source";

/** One choice of a `gallery` command. Every field except `key` and `data` accepts a value or a function. */
export interface RibbonGalleryItem {
    /** Finds the item, and is the command's `value` while it is chosen. The default is its position. */
    key?: string | number;
    text: Bind<string>;
    /** The name of a glyph. */
    glyph?: Bind<string>;
    /** An image, an element or a component, used instead of `glyph`; a preview of the choice. */
    icon?: Bind<IconSource | null | undefined>;
    /** A longer description, shown as a tooltip. */
    hint?: Bind<string>;
    /** `false` dims the item, and it cannot be chosen. The default is `true`. */
    enabled?: Bind<boolean>;
    /** A custom application value for the item. */
    data?: unknown;
}
