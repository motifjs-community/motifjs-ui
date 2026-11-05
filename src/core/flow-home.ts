const HOLDS_FLOW = 'div, section, main, article, aside, nav, header, footer, form, dialog, fieldset, li, dd, td, th, body';
const NAMED_BY_CONTENT = 'button, a, label, summary, [role="button"], [role="link"], [role="option"], [role="menuitem"], [role="tab"]';

/**
 * Where a surface made from code goes for an anchor: the nearest container that may hold a `<div>` and is not named
 * by its content (a button would read the surface as part of its name). Near the anchor, it stays in the anchor's
 * landmark and window (a modal window makes the rest inert).
 */
export function homeOf(anchor: Element): Element {
    for (let el = anchor.parentElement; el; el = el.parentElement) {
        if (el.matches(HOLDS_FLOW) && !el.closest(NAMED_BY_CONTENT)) {
            return el;
        }
    }
    return anchor.ownerDocument.body;
}
