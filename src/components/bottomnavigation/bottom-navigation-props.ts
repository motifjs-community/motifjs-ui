import type { Bind, ComponentBase } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { BottomNavigationItem } from "./bottom-navigation-item";
import type { BottomNavigationItemClickEventArgs } from "./bottom-navigation-item-click-event-args";
import type { BottomNavigationLabelMode } from "./bottom-navigation-label-mode";
import type { BottomNavigationPosition } from "./bottom-navigation-position";
import type { BottomNavigationSelectingEventArgs } from "./bottom-navigation-selecting-event-args";
import type { BottomNavigationSelectionChangedEventArgs } from "./bottom-navigation-selection-changed-event-args";

/** Props of `BottomNavigation`. Each prop is also a settable property, and a function is tracked. */
export interface BottomNavigationProps extends ControlProps {
    /** The destinations, three to five of them. */
    items?: Bind<readonly BottomNavigationItem[]>;
    /** The `value` of the selected item. `x-model` provides two-way binding. */
    value?: Bind<string | number | null>;
    /** The accessible name of the bar. This is the same property as `text`. By default, it is a kit string. */
    label?: Bind<string>;
    /** The default is `'always'`. */
    labelMode?: Bind<BottomNavigationLabelMode>;
    /** The default is `'fixed'`. */
    position?: Bind<BottomNavigationPosition>;
    /** Moves the bar out of sight while scrolling down. The default is `false`. */
    hideOnScroll?: Bind<boolean>;
    /** What `hideOnScroll` watches. By default, the nearest ancestor that scrolls, else the page. */
    scrollTarget?: Bind<ComponentBase | null>;
    /** Occurs before the selection changes. Setting `cancel` keeps the current item. */
    onSelecting?: (e: BottomNavigationSelectingEventArgs) => void;
    /** Occurs after the selection changes. */
    onSelectionChanged?: (e: BottomNavigationSelectionChangedEventArgs) => void;
    /** Occurs when an item is pressed, after its own `click`. */
    onItemClick?: (e: BottomNavigationItemClickEventArgs) => void;
}
