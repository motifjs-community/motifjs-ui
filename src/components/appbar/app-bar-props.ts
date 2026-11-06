import type { Bind, ComponentBase } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { IconSource } from "../../core/icon-source";
import type { ToolbarItem } from "../toolbar/toolbar-item";
import type { ToolbarOverflow } from "../toolbar/toolbar-overflow";
import type { AppBarNavigation } from "./app-bar-navigation";
import type { AppBarNavigationClickEventArgs } from "./app-bar-navigation-click-event-args";
import type { AppBarPosition } from "./app-bar-position";
import type { AppBarScrollBehavior } from "./app-bar-scroll-behavior";
import type { AppBarTitleAlign } from "./app-bar-title-align";
import type { AppBarTone } from "./app-bar-tone";

/** Props of `AppBar`. Each prop is also a settable property, and a function is tracked. */
export interface AppBarProps extends ControlProps {
    title?: Bind<string>;
    /** A second, smaller line under the title. */
    subtitle?: Bind<string>;
    /** The default is `'start'`. */
    titleAlign?: Bind<AppBarTitleAlign>;
    /** Makes the title a heading of this level. By default, it is plain text. */
    headingLevel?: Bind<number | null>;
    /** An image, an element or a component before the title. */
    logo?: Bind<IconSource | null | undefined>;
    /** The button at the start of the bar. The default is `'none'`. */
    navigation?: Bind<AppBarNavigation>;
    /** The glyph of that button. The default is `'menu'`, or `'arrow-start'` for `'back'`. */
    navigationGlyph?: Bind<string>;
    /** The accessible name of that button. By default, it is a kit string. */
    navigationLabel?: Bind<string>;
    /** The commands at the end of the bar, the same items as `Toolbar.items`. */
    actions?: Bind<readonly ToolbarItem[]>;
    /** The accessible name of the commands. By default, it is a kit string. */
    actionsLabel?: Bind<string>;
    /** How commands that do not fit are handled. The default is `'menu'`. */
    overflow?: Bind<ToolbarOverflow>;
    /** A control between the title and the commands, the same as JSX children. */
    content?: Bind<ComponentBase | null>;
    /** The default is `'surface'`. */
    tone?: Bind<AppBarTone>;
    /** Puts the title on a larger row of its own under the buttons. The default is `false`. */
    prominent?: Bind<boolean>;
    /** The default is `'sticky'`. */
    position?: Bind<AppBarPosition>;
    /** The default is `'none'`. */
    scrollBehavior?: Bind<AppBarScrollBehavior>;
    /** What `scrollBehavior` watches. By default, the nearest ancestor that scrolls, else the page. */
    scrollTarget?: Bind<HTMLElement | null>;
    /** Occurs when the button at the start of the bar is pressed. */
    onNavigationClick?: (e: AppBarNavigationClickEventArgs) => void;
}
