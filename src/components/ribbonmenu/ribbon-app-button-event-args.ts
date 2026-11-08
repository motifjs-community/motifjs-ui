import type { RibbonMenu } from "./RibbonMenu";

export interface RibbonAppButtonEventArgs {
    /** The button, to place a menu by. */
    target: HTMLElement;
    originalEvent: Event;
    source: RibbonMenu;
}
