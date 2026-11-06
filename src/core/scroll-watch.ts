/** What scrolls: an element, or the page. */
export type ScrollSource = HTMLElement | Window;

const scrolls = (value: string) => value === 'auto' || value === 'scroll' || value === 'overlay';

/** The nearest ancestor of `el` that scrolls, else the page. */
export function scrollParent(el: Element): ScrollSource {
    const view = el.ownerDocument.defaultView ?? window;
    for (let at = el.parentElement; at && at !== el.ownerDocument.body; at = at.parentElement) {
        if (scrolls(view.getComputedStyle(at).overflowY)) return at;
    }
    return view;
}

/** How far `source` is scrolled. */
export function scrollTop(source: ScrollSource): number {
    return 'scrollY' in source ? source.scrollY : source.scrollTop;
}

/**
 * Calls `report` with the position of `source` and how far it moved, now and on each scroll. Returns what stops it.
 *
 * @example
 * const stop = watchScroll(scrollParent(this.element), (top, moved) => this.place(top, moved));
 */
export function watchScroll(source: ScrollSource, report: (top: number, moved: number) => void): () => void {
    let last = scrollTop(source);
    const scrolled = () => {
        const top = scrollTop(source);
        const moved = top - last;
        last = top;
        report(top, moved);
    };
    source.addEventListener('scroll', scrolled, { passive: true });
    report(last, 0);
    return () => source.removeEventListener('scroll', scrolled);
}
