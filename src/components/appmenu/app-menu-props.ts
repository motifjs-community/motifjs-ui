import type { Bind, ComponentBase } from "@motifx/core";
import type { OverlayPanelProps } from "../../parts/overlay/overlay-panel-props";
import type { AppMenuItem } from "./app-menu-item";
import type { AppMenuItemClickEventArgs } from "./app-menu-item-click-event-args";
import type { AppMenuItemsChangedEventArgs } from "./app-menu-items-changed-event-args";
import type { AppMenuSearchTextChangedEventArgs } from "./app-menu-search-text-changed-event-args";
import type { AppMenuSelectingEventArgs } from "./app-menu-selecting-event-args";
import type { AppMenuSelectionChangedEventArgs } from "./app-menu-selection-changed-event-args";

/**
 * Props of `AppMenu`. Each prop is also a settable property, and a function is tracked. `value` is whether it is open
 * (`x-model`), as for every overlay panel.
 */
export interface AppMenuProps extends Omit<OverlayPanelProps, 'title' | 'content' | 'footer' | 'showClose'> {
    /** The entries of the list. Nothing is there until they are given. */
    items?: Bind<readonly AppMenuItem[]>;
    /** The key of the page item shown. By default, the first page item. */
    selected?: Bind<string | number | null>;
    /** Closes the menu when a command or a link is pressed. Each item can say otherwise. The default is `true`. */
    closeOnCommand?: Bind<boolean>;
    /** Any content of the app at the top of the list, under the close button, such as the user's name and picture. */
    listHeader?: Bind<ComponentBase | null>;
    /** Any content of the app at the bottom of the list, after the items at the bottom. */
    listFooter?: Bind<ComponentBase | null>;
    /** A search field above the items: typing leaves the items whose text or hint holds it. The default is `false`. */
    searchEnabled?: Bind<boolean>;
    /** The text searched for. */
    searchText?: Bind<string>;
    /** Occurs when the user types in the search field. */
    onSearchTextChanged?: (e: AppMenuSearchTextChangedEventArgs) => void;
    /** Occurs after a change by key (`addItem`, `removeItem`, `moveItem`, `updateItem`), with the new list to keep. */
    onItemsChanged?: (e: AppMenuItemsChangedEventArgs) => void;
    /** Occurs before another page is shown. Setting `cancel` keeps the page shown now. */
    onSelecting?: (e: AppMenuSelectingEventArgs) => void;
    /** Occurs after another page is shown. */
    onSelectionChanged?: (e: AppMenuSelectionChangedEventArgs) => void;
    /** Occurs when an item is pressed, after its own `click`. */
    onItemClick?: (e: AppMenuItemClickEventArgs) => void;
}
