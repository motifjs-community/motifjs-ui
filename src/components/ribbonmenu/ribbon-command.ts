import type { Bind, ComponentBase } from "@motifx/core";
import type { IconSource } from "../../core/icon-source";
import type { MenuItem } from "../../parts/menu/menu-item";
import type { RibbonCommandClickEventArgs } from "./ribbon-command-click-event-args";
import type { RibbonCommandSize } from "./ribbon-command-size";
import type { RibbonCommandType } from "./ribbon-command-type";
import type { RibbonGalleryItem } from "./ribbon-gallery-item";

/**
 * One command of a group. Every field except `key`, `content`, `click` and `data` accepts a value or a function, and a
 * function is tracked.
 */
export interface RibbonCommand {
    /** Finds the command. The default is its position. */
    key?: string | number;
    /** The default is `'button'`. */
    type?: Bind<RibbonCommandType>;
    /** The text. An `&` before a letter makes that letter its access key. A small command shows it as its tooltip. */
    text?: Bind<string>;
    /** The name of a glyph. */
    glyph?: Bind<string>;
    /** An image, an element or a component, used instead of `glyph`. */
    icon?: Bind<IconSource | null | undefined>;
    /** A longer description, shown as a tooltip. */
    hint?: Bind<string>;
    /** The default is `'medium'`. The commands of a row are always small. */
    size?: Bind<RibbonCommandSize>;
    /** The state of a toggle. As a function, the command follows it, and `click` changes the value it reads. */
    pressed?: Bind<boolean>;
    /** `false` dims the command, and it cannot be pressed. The default is `true`. */
    enabled?: Bind<boolean>;
    /** `false` leaves it out of the simplified layout's row; it waits in the "more" menu. The default is `true`. */
    simple?: Bind<boolean>;
    /** The letters that press it while key hints are shown. The default comes from its access key or its text. */
    keyHint?: Bind<string>;
    /** `true` keeps the user from hiding or moving it. The default is `false`. */
    fixed?: Bind<boolean>;
    /** `false` removes the command. The default is `true`. */
    visible?: Bind<boolean>;
    /** The commands of a `menu` or a `split` command. */
    menu?: Bind<readonly MenuItem[]>;
    /** The commands of a `row`. */
    commands?: Bind<readonly RibbonCommand[]>;
    /** The choices of a `gallery`. */
    items?: Bind<readonly RibbonGalleryItem[]>;
    /** The key of the choice of a `gallery` that is marked as chosen. */
    value?: Bind<string | number | null>;
    /** How many choices of a `gallery` stand in its row, and in each row of its grid. The default is `4`. */
    columns?: Bind<number>;
    /** Makes the content of a `content` command, such as a drop-down or a number box. Made once, and kept. */
    content?: () => ComponentBase;
    /** Occurs when the command is pressed (for a `split` command, its own part; for a `gallery`, a choice: `e.item`). */
    click?: (e: RibbonCommandClickEventArgs) => void;
    /** A custom application value for the command. */
    data?: unknown;
}
