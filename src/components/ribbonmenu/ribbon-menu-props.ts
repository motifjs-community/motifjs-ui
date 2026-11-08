import type { Bind, ComponentBase } from "@motifx/core";
import type { ControlProps } from "../../core/control";
import type { RibbonAppButtonEventArgs } from "./ribbon-app-button-event-args";
import type { RibbonCommand } from "./ribbon-command";
import type { RibbonCommandClickEventArgs } from "./ribbon-command-click-event-args";
import type { RibbonGroupMoreEventArgs } from "./ribbon-group-more-event-args";
import type { RibbonMenuCustomization } from "./ribbon-menu-customization";
import type { RibbonMenuCustomizedEventArgs } from "./ribbon-menu-customized-event-args";
import type { RibbonMenuCustomMenuOpeningEventArgs } from "./ribbon-menu-custom-menu-opening-event-args";
import type { RibbonMenuDisplay } from "./ribbon-menu-display";
import type { RibbonMenuDisplayChangedEventArgs } from "./ribbon-menu-display-changed-event-args";
import type { RibbonMenuItemsChangedEventArgs } from "./ribbon-menu-items-changed-event-args";
import type { RibbonMenuLayout } from "./ribbon-menu-layout";
import type { RibbonMenuLayoutChangedEventArgs } from "./ribbon-menu-layout-changed-event-args";
import type { RibbonQuickBarPosition } from "./ribbon-quick-bar-position";
import type { RibbonTab } from "./ribbon-tab";
import type { RibbonTabSelectingEventArgs } from "./ribbon-tab-selecting-event-args";
import type { RibbonTabSelectionChangedEventArgs } from "./ribbon-tab-selection-changed-event-args";

/** Props of `RibbonMenu`, in addition to the shared `ControlProps`. Each prop is also a settable property. */
export interface RibbonMenuProps extends ControlProps {
    /** The tabs. Nothing is there until they are given. */
    items?: Bind<readonly RibbonTab[]>;
    /** The key of the tab shown. By default, the first tab that can be chosen. `x-model` provides two-way binding. */
    value?: Bind<string | number | null>;
    /** Names the tabs for assistive technology. The default comes from the language pack. This is the same property as `text`. */
    label?: Bind<string>;
    /** The default is `'classic'`. The button at the end of the commands switches it (`layoutSwitch`). */
    layout?: Bind<RibbonMenuLayout>;
    /** Shows the button at the end of the commands that switches between the classic and the simplified layout. The default is `true`. */
    layoutSwitch?: Bind<boolean>;
    /**
     * When the commands do not fit, groups give way one step at a time, the least important first: large commands
     * become medium, then all become small, then a group folds into one button (in the simplified layout, it moves
     * into the "more" menu). Each group can refuse the last step (`collapsible`). The default is `true`.
     */
    adaptive?: Bind<boolean>;
    /**
     * The default is `'always'`. `'tabs'` shows only the tabs, a tab opening its commands over the page; `'auto'` hides the
     * menu behind a thin strip that opens it over the page. A double-click on a tab and Ctrl+F1 switch between `'always'`
     * and `'tabs'`; the menu's context menu offers all three.
     */
    display?: Bind<RibbonMenuDisplay>;
    /** The text of the button before the tabs, such as one that opens the app's main menu. None by default. */
    appButton?: Bind<string>;
    /** The quick commands, pressed from any tab; the user can add commands to them. */
    quickCommands?: Bind<readonly RibbonCommand[]>;
    /** The default is `'start'`. */
    quickBar?: Bind<RibbonQuickBarPosition>;
    /** Alt or F10 shows a letter on each tab, then on each command of the tab chosen: typing it presses it. The default is `true`. */
    keyHints?: Bind<boolean>;
    /** The context menu that lets the user hide and move commands and add them to the quick commands. The default is `true`. */
    customizable?: Bind<boolean>;
    /** What the user changed, to save and give back: the menu starts from it and reports each change with `onCustomized`. */
    customization?: Bind<RibbonMenuCustomization | null>;
    /** Any content of the app at the start of the row of tabs, such as a button. */
    barStart?: Bind<ComponentBase | null>;
    /** Any content of the app at the end of the row of tabs, such as a search field, a button or an editor. */
    barEnd?: Bind<ComponentBase | null>;
    /** Occurs before another tab is shown. Setting `cancel` keeps the tab shown now. */
    onSelecting?: (e: RibbonTabSelectingEventArgs) => void;
    /** Occurs after another tab is shown. */
    onSelectionChanged?: (e: RibbonTabSelectionChangedEventArgs) => void;
    /** Occurs when a command is pressed, after its own `click`. */
    onCommandClick?: (e: RibbonCommandClickEventArgs) => void;
    /** Occurs when the button beside a group's name is pressed, after the group's own `more`. */
    onGroupMore?: (e: RibbonGroupMoreEventArgs) => void;
    /** Occurs when the user shows the menu another way. */
    onDisplayChanged?: (e: RibbonMenuDisplayChangedEventArgs) => void;
    /** Occurs when the user hides, moves or adds a command, or resets the menu. */
    onCustomized?: (e: RibbonMenuCustomizedEventArgs) => void;
    /** Occurs after a change by path (`addTab`, `addGroup`, `addCommand`, `remove`, `move`, `update`), with the new list to keep. */
    onItemsChanged?: (e: RibbonMenuItemsChangedEventArgs) => void;
    /** Occurs when the button before the tabs is pressed. */
    onAppButton?: (e: RibbonAppButtonEventArgs) => void;
    /** Occurs when the user switches the layout with the button at the end of the commands. */
    onLayoutChanged?: (e: RibbonMenuLayoutChangedEventArgs) => void;
    /** Occurs before the menu of the right button opens, to add commands of your own or leave some out. */
    onCustomMenuOpening?: (e: RibbonMenuCustomMenuOpeningEventArgs) => void;
}
