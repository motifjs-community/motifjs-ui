import type { ComponentBase } from '@motifx/core';
import { isLiveControl } from './live-controls';
import { isHtmlElement } from './node-kind';
import { placeOnPage } from './page-layer';

/**
 * Puts `surface`, made programmatically for `anchor`, right after it, so it shares the anchor's look, landmark and
 * window (a modal window makes the rest inert). A kit control keeps its children for itself (a toolbar takes each one
 * for an item of its bar), a list or a condition has no element, and an SVG part shows no HTML: the surface goes right
 * after such a parent instead. In a kit window, which keeps only its areas, it goes into the area the anchor is in.
 * Above the page when the anchor has no parent (an element of the app's, taken in as a component).
 */
export function placeInTree(anchor: ComponentBase, surface: ComponentBase): void {
    for (let c: ComponentBase = anchor; c.parent; c = c.parent) {
        const home = c.parent;
        if (isLiveControl(home)) {
            if (!home.isWindow) continue;
            c.controls.add(surface);
            return;
        }
        if (!isHtmlElement(home.element)) continue;
        home.controls.insert(home.controls.items.indexOf(c) + 1, surface);
        return;
    }
    placeOnPage(anchor, surface);
}
