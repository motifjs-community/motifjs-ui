import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, glyphPart, mark, part, put, shown } from "../../core/draw-parts";
import { deepActiveElement } from "../../core/focus";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import type { LayoutOrientation } from "../layout/layout-orientation";
import { SplitPane } from "./SplitPane";
import type { SplitterCollapseEventArgs } from "./splitter-collapse-event-args";
import type { SplitterProps } from "./splitter-props";
import type { SplitterResizeEventArgs } from "./splitter-resize-event-args";

const OWN = ['orientation', 'resizable', 'collapsible', 'step', 'sizes'] as const;
const HANDLE = 'var(--_splitter-size)';

// How a pane is laid out now: fixed pixels, or a share (fr) of the room the shares divide.
interface Lay {
    px: number | null;
    fr: number;
}

// A handle: the cell in the grid, the bar in it that takes the pointer and the keys, the fold buttons at its ends.
interface Handle {
    cell: Component<HTMLDivElement>;
    bar: Component<HTMLDivElement>;
    before: Component<HTMLButtonElement>;
    after: Component<HTMLButtonElement>;
    beforeGlyph: Component<HTMLSpanElement>;
    afterGlyph: Component<HTMLSpanElement>;
}

interface Drag {
    pointer: number;
    handle: number;
    from: number;
    a: number;
    b: number;
}

/**
 * Panes side by side or stacked, as many as needed, with a handle between each two that the pointer drags and the
 * keyboard moves (the window splitter pattern). A handle resizes the two panes next to it, and the others keep their
 * space. A pane is a `SplitPane`, sized in pixels, as a percentage or as an equal share of what remains, with minimum
 * and maximum sizes, and it can be collapsed from its handle (`collapsible`). A pane can hold another splitter.
 *
 * @example
 * <Splitter x-model={() => this.layout.sizes}>
 *   <SplitPane size={240} minSize={160} collapsible><FolderTree /></SplitPane>
 *   <SplitPane minSize={320}><Editor /></SplitPane>
 *   <SplitPane size="30%"><Preview /></SplitPane>
 * </Splitter>
 */
export class Splitter extends Control<HTMLDivElement, SplitterProps> {
    resizing = new Emitter<SplitterResizeEventArgs>();
    resized = new Emitter<SplitterResizeEventArgs>();
    collapsing = new Emitter<SplitterCollapseEventArgs>();
    collapsedEvent = new Emitter<SplitterCollapseEventArgs>();
    panes: SplitPane[] = [];
    handles: Handle[] = [];
    lay = new Map<SplitPane, Lay>();
    drag: Drag | null = null;
    ready = false;

    constructor(props?: IBaseProp<SplitterProps>) {
        super('div', props);
        const own = (this.props ?? {}) as SplitterProps;
        this.element.classList.add('mx-splitter');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onResizing) this.onResizing(own.onResizing);
        if (own.onResized) this.onResized(own.onResized);
        if (own.onCollapsing) this.onCollapsing(own.onCollapsing);
        if (own.onCollapsed) this.onCollapsed(own.onCollapsed);

        this.observeProperty<LayoutOrientation>('orientation', o => {
            put(this.element, 'data-orientation', o ?? 'horizontal');
            this.relayout();
        });
        for (const name of ['resizable', 'collapsible'] as const) this.observeProperty(name, () => this.drawHandles());
        this.observeProperty('sizes', () => this.sizeChanged());
        onLanguage(this, () => this.drawHandles());
        for (const child of this.childs ?? []) if (child instanceof SplitPane) this.place(child, this.panes.length);
        this.element.addEventListener('keydown', e => this.keyDown(e));
        this.motif.setDisposable(() => {
            for (const emitter of [this.resizing, this.resized, this.collapsing, this.collapsedEvent]) emitter.dispose();
        });
        this.ready = true;
        this.readSizes();
        this.relayout();
    }

    // Properties (see SplitterProps).

    get orientation(): LayoutOrientation {
        return this.getProperty<LayoutOrientation | undefined>('orientation') ?? 'horizontal';
    }
    set orientation(value: Bind<LayoutOrientation>) {
        this.assignProperty('orientation', value);
    }
    get resizable(): boolean {
        return this.getProperty<boolean | undefined>('resizable') !== false;
    }
    set resizable(value: Bind<boolean>) {
        this.assignProperty('resizable', value);
    }
    get collapsible(): boolean {
        return this.getProperty<boolean | undefined>('collapsible') === true;
    }
    set collapsible(value: Bind<boolean>) {
        this.assignProperty('collapsible', value);
    }
    get step(): number {
        return Math.max(1, this.getProperty<number | undefined>('step') ?? 10);
    }
    set step(value: Bind<number>) {
        this.assignProperty('step', value);
    }
    /** The sizes as set. See `sizes` in the props. The current sizes in pixels are in `currentSizes`. */
    get sizes(): readonly (number | string | null)[] | null {
        return this.getProperty<readonly (number | string | null)[] | null | undefined>('sizes') ?? null;
    }
    set sizes(value: Bind<readonly (number | string | null)[] | null>) {
        this.assignProperty('sizes', value);
    }
    /** Maps to `sizes` for `x-model`. */
    get value(): readonly (number | string | null)[] | null {
        return this.sizes;
    }
    set value(value: readonly (number | string | null)[] | null) {
        this.sizes = value;
    }

    /** Occurs while a handle is dragged (`handle`, `sizes` in pixels). */
    get onResizing(): MotifEvent<SplitterResizeEventArgs> {
        return this.resizing.event;
    }

    /** Occurs after a drag ends or a key moves a handle. */
    get onResized(): MotifEvent<SplitterResizeEventArgs> {
        return this.resized.event;
    }

    /** Occurs before a pane is collapsed or expanded (`pane`, `collapsed`). Set `cancel = true` to keep the current state. */
    get onCollapsing(): MotifEvent<SplitterCollapseEventArgs> {
        return this.collapsing.event;
    }

    /** Occurs after a pane is collapsed or expanded. */
    get onCollapsed(): MotifEvent<SplitterCollapseEventArgs> {
        return this.collapsedEvent.event;
    }

    /** The current pane sizes in pixels, in pane order, with 0 for a collapsed pane. */
    get currentSizes(): number[] {
        const panes = this.shownPanes();
        const measured = this.measure(panes);
        return this.panes.map(pane => {
            const at = panes.indexOf(pane);
            return at < 0 || pane.collapsed ? 0 : Math.round(measured[at]);
        });
    }

    /** The number of panes, including collapsed ones. */
    get count(): number {
        return this.panes.length;
    }

    /** Adds a pane at the end. */
    add(pane: SplitPane): SplitPane {
        return this.insert(this.panes.length, pane);
    }

    /** Adds a pane at `index`. */
    insert(index: number, pane: SplitPane): SplitPane {
        if (pane.owner === this) return pane;
        pane.owner?.forget(pane);
        this.place(pane, Math.max(0, Math.min(index, this.panes.length)));
        return pane;
    }

    /** Removes a pane and disposes it. */
    remove(pane: SplitPane): boolean {
        if (!this.panes.includes(pane)) return false;
        this.forget(pane);
        this.controls.remove(pane);
        return true;
    }

    /**
   * Collapses a pane, and the adjacent panes take its space. Returns `false` if the pane is not in the splitter,
   * is already collapsed, or `onCollapsing` canceled it.
   */
    collapse(pane: SplitPane | number): boolean {
        return this.fold(pane, true, false);
    }

    /** Expands a collapsed pane. */
    expand(pane: SplitPane | number): boolean {
        return this.fold(pane, false, false);
    }

    // The panes are in the page now: the handles go between them.
    override onBuilt(): void {
        this.relayout();
    }

    // Going away: the panes and the handles are disposed one by one, nothing is drawn again.
    override onDisposing(): void {
        this.ready = false;
    }

    /** @internal A pane's limits, collapsed state, visibility or `resizable` changed. */
    paneChanged(): void {
        if (!this.ready) return;
        this.relayout();
    }

    /** @internal A pane's own `size` changed: the layout starts from the sizes again. */
    sizeChanged(): void {
        if (!this.ready) return;
        this.readSizes();
        this.relayout();
    }

    /** @internal A pane was disposed on its own. */
    paneGone(pane: SplitPane): void {
        if (this.ready && this.panes.includes(pane)) this.forget(pane);
    }

    place(pane: SplitPane, index: number): void {
        this.panes.splice(index, 0, pane);
        this.controls.add(index, pane);
        pane.owner = this;
        if (!pane.element.id) pane.element.id = nextId('split-pane');
        this.sizeChanged();
    }

    // Takes a pane out without disposing it.
    forget(pane: SplitPane): void {
        const at = this.panes.indexOf(pane);
        if (at < 0) return;
        this.panes.splice(at, 1);
        pane.owner = null;
        this.sizeChanged();
    }

    shownPanes(): SplitPane[] {
        return this.panes.filter(pane => pane.visible);
    }

    get horizontal(): boolean {
        return this.peekProperty<LayoutOrientation>('orientation') !== 'vertical';
    }

    // The sizes as given (the `sizes` prop, else each pane's own) become the layout: pixels stay pixels, a share
    // is a share, and the panes without one divide what the shares leave.
    readSizes(): void {
        const given = this.peekProperty<readonly (number | string | null)[] | null | undefined>('sizes');
        const panes = this.shownPanes();
        const raw = panes.map((pane, i) => (given && given[i] !== undefined ? given[i] : pane.size));
        const shares = raw.map(r => (typeof r === 'string' && r.trim().endsWith('%') ? parseFloat(r) : NaN));
        const free = raw.filter((r, i) => (r === null || r === undefined) && Number.isNaN(shares[i])).length;
        const taken = shares.filter(s => !Number.isNaN(s)).reduce((a, b) => a + b, 0);
        const each = free ? Math.max(1, 100 - taken) / free : 0;
        this.lay.clear();
        panes.forEach((pane, i) => {
            const r = raw[i];
            if (typeof r === 'number') this.lay.set(pane, { px: Math.max(0, r), fr: 0 });
            else if (typeof r === 'string' && !Number.isNaN(shares[i])) this.lay.set(pane, { px: null, fr: Math.max(0, shares[i]) });
            else if (typeof r === 'string' && !Number.isNaN(parseFloat(r))) this.lay.set(pane, { px: Math.max(0, parseFloat(r)), fr: 0 });
            else this.lay.set(pane, { px: null, fr: each });
        });
    }

    tracks(panes: SplitPane[]): string {
        const out: string[] = [];
        panes.forEach((pane, i) => {
            if (i > 0) out.push(HANDLE);
            const lay = this.lay.get(pane) ?? { px: null, fr: 1 };
            const min = `${pane.minSize}px`;
            const max = pane.maxSize;
            if (pane.collapsed) out.push('0px');
            else if (lay.px !== null) out.push(max === null ? `max(${min}, ${lay.px}px)` : `clamp(${min}, ${lay.px}px, ${Math.max(pane.minSize, max)}px)`);
            else out.push(`minmax(${min}, ${Math.max(0.0001, lay.fr)}fr)`);
        });
        return out.join(' ');
    }

    relayout(): void {
        if (!this.ready) return;
        const panes = this.shownPanes();
        const horizontal = this.horizontal;
        const el = this.element;
        el.style.setProperty(horizontal ? 'grid-template-columns' : 'grid-template-rows', this.tracks(panes));
        el.style.removeProperty(horizontal ? 'grid-template-rows' : 'grid-template-columns');
        panes.forEach((pane, i) => {
            css(pane.element, horizontal ? 'grid-column' : 'grid-row', String(2 * i + 1));
            css(pane.element, horizontal ? 'grid-row' : 'grid-column', '1');
            pane.element.inert = pane.collapsed;
            mark(pane.element, 'data-collapsed', pane.collapsed);
        });
        while (this.handles.length < Math.max(0, panes.length - 1)) this.handles.push(this.makeHandle());
        while (this.handles.length > Math.max(0, panes.length - 1)) void this.handles.pop()!.cell.dispose();
        this.handles.forEach((h, i) => {
            const cell = h.cell.element;
            css(cell, horizontal ? 'grid-column' : 'grid-row', String(2 * i + 2));
            css(cell, horizontal ? 'grid-row' : 'grid-column', '1');
            // In the Tab order between the two panes it lies between; moved only when it is not there yet, since a
            // move would drop the focus and the pointer capture it holds.
            const next = panes[i + 1].element;
            if (next.parentElement === el && cell.parentElement === el && cell.nextElementSibling !== next) el.insertBefore(cell, next);
        });
        this.drawHandles();
    }

    makeHandle(): Handle {
        const cell = part<HTMLDivElement>(this, 'div', 'mx-splitter__handle');
        const bar = part<HTMLDivElement>(cell, 'div', 'mx-splitter__bar');
        bar.element.setAttribute('role', 'separator');
        bar.element.setAttribute('aria-valuemin', '0');
        bar.element.setAttribute('aria-valuemax', '100');
        const grip = part<HTMLSpanElement>(bar, 'span', 'mx-splitter__grip');
        grip.element.setAttribute('aria-hidden', 'true');
        const before = part<HTMLButtonElement>(cell, 'button', 'mx-splitter__fold');
        before.element.type = 'button';
        before.element.tabIndex = -1;
        put(before.element, 'data-side', 'before');
        const beforeGlyph = glyphPart(before, 'chevron-start', 'mx-splitter__fold-glyph');
        const after = part<HTMLButtonElement>(cell, 'button', 'mx-splitter__fold');
        after.element.type = 'button';
        after.element.tabIndex = -1;
        put(after.element, 'data-side', 'after');
        const afterGlyph = glyphPart(after, 'chevron-end', 'mx-splitter__fold-glyph');
        const handle: Handle = { cell, bar, before, after, beforeGlyph, afterGlyph };
        bar.element.addEventListener('pointerdown', e => this.pointerDown(e, handle));
        bar.element.addEventListener('pointermove', e => this.pointerMove(e));
        bar.element.addEventListener('pointerup', e => this.pointerUp(e));
        bar.element.addEventListener('pointercancel', e => this.pointerUp(e));
        bar.element.addEventListener('dblclick', e => this.foldFromHandle(handle, 'before', e));
        before.element.addEventListener('click', e => this.foldFromHandle(handle, 'before', e));
        after.element.addEventListener('click', e => this.foldFromHandle(handle, 'after', e));
        return handle;
    }

    // What each handle shows and allows: the panes beside it decide.
    drawHandles(): void {
        if (!this.ready) return;
        const panes = this.shownPanes();
        const horizontal = this.horizontal;
        const strings = uiLocale.strings;
        const measured = this.measure(panes);
        this.handles.forEach((h, i) => {
            const a = panes[i];
            const b = panes[i + 1];
            if (!a || !b) return;
            const resizable = this.canResize(i);
            const foldA = a.isCollapsible;
            const foldB = b.isCollapsible;
            const bar = h.bar.element;
            put(bar, 'aria-orientation', horizontal ? 'vertical' : 'horizontal');
            put(bar, 'aria-controls', a.element.id);
            put(bar, 'aria-label', strings.resize);
            mark(bar, 'data-resizable', resizable);
            const room = measured[i] + measured[i + 1];
            put(bar, 'aria-valuenow', String(Math.round(room > 0 ? (measured[i] / room) * 100 : 50)));
            if (resizable || foldA || foldB) bar.tabIndex = this.peekProperty('tabStop') === false ? -1 : 0;
            else bar.removeAttribute('tabindex');
            shown(h.before.element, foldA);
            shown(h.after.element, foldB);
            put(h.before.element, 'aria-label', a.collapsed ? strings.splitterExpand : strings.splitterCollapse);
            put(h.after.element, 'aria-label', b.collapsed ? strings.splitterExpand : strings.splitterCollapse);
            h.beforeGlyph.element.dataset.icon = horizontal ? (a.collapsed ? 'chevron-end' : 'chevron-start') : a.collapsed ? 'chevron-down' : 'chevron-up';
            h.afterGlyph.element.dataset.icon = horizontal ? (b.collapsed ? 'chevron-start' : 'chevron-end') : b.collapsed ? 'chevron-up' : 'chevron-down';
        });
    }

    canResize(handle: number): boolean {
        const panes = this.shownPanes();
        const a = panes[handle];
        const b = panes[handle + 1];
        return !!a && !!b && this.resizable && a.resizable && b.resizable && !a.collapsed && !b.collapsed;
    }

    // The panes' pixels along the split; zeros when not laid out.
    measure(panes: SplitPane[]): number[] {
        if (!this.element.isConnected) return panes.map(() => 0);
        const horizontal = this.horizontal;
        return panes.map(pane => {
            const box = pane.element.getBoundingClientRect();
            return horizontal ? box.width : box.height;
        });
    }

    // Before a handle moves, every share becomes its pixels, so the move changes only the two panes beside it.
    freeze(panes: SplitPane[]): void {
        const measured = this.measure(panes);
        panes.forEach((pane, i) => {
            const lay = this.lay.get(pane);
            if (lay && lay.px === null && !pane.collapsed) lay.fr = Math.max(0.0001, measured[i]);
        });
    }

    // Pane `handle` gets `a` of the `total` the two panes share, within their limits; the next pane the rest.
    apply(handle: number, a: number, total: number): boolean {
        const panes = this.shownPanes();
        const first = panes[handle];
        const second = panes[handle + 1];
        if (!first || !second) return false;
        const low = Math.max(first.minSize, total - (second.maxSize ?? total));
        const high = Math.min(first.maxSize ?? total, total - second.minSize);
        const size = Math.round(Math.min(Math.max(a, low), Math.max(low, high)));
        const layA = this.lay.get(first)!;
        const layB = this.lay.get(second)!;
        if (layA.px !== null) layA.px = size;
        else layA.fr = Math.max(0.0001, size);
        if (layB.px !== null) layB.px = total - size;
        else layB.fr = Math.max(0.0001, total - size);
        this.relayout();
        return true;
    }

    tell(emitter: Emitter<SplitterResizeEventArgs>, handle: number, event?: Event): void {
        emitter.fire({ handle, sizes: this.currentSizes, byUser: true, source: this, event });
    }

    fold(target: SplitPane | number, on: boolean, byUser: boolean, event?: Event): boolean {
        const pane = typeof target === 'number' ? this.panes[target] : target;
        if (!pane || !this.panes.includes(pane) || pane.collapsed === on) return false;
        if (on && byUser && !pane.isCollapsible) return false;
        const index = this.panes.indexOf(pane);
        const args: SplitterCollapseEventArgs = { pane, index, collapsed: on, byUser, cancel: false, source: this, event };
        this.collapsing.fire(args);
        if (args.cancel) return false;
        const active = deepActiveElement();
        const inside = !!active && pane.element.contains(active);
        pane.setCollapsed(on);
        this.relayout();
        if (on && inside) {
            const at = this.shownPanes().indexOf(pane);
            (this.handles[at]?.bar.element ?? this.handles[at - 1]?.bar.element)?.focus({ preventScroll: true });
        }
        this.collapsedEvent.fire({ pane, index, collapsed: on, byUser, cancel: false, source: this, event });
        return true;
    }

    foldFromHandle(handle: Handle, side: 'before' | 'after', event: Event): void {
        if (!this.isEnabled) return;
        const i = this.handles.indexOf(handle);
        const panes = this.shownPanes();
        let pane = side === 'before' ? panes[i] : panes[i + 1];
        // Enter and a double press fold the pane before; when that one cannot be hidden, the one after.
        if (pane && !pane.isCollapsible && !pane.collapsed && side === 'before') pane = panes[i + 1];
        if (!pane) return;
        this.fold(pane, !pane.collapsed, true, event);
    }

    keyDown(e: KeyboardEvent): void {
        if (!this.isEnabled || e.altKey || e.ctrlKey || e.metaKey) return;
        const bar = (e.target as HTMLElement).closest<HTMLElement>('.mx-splitter__bar');
        const handle = this.handles.find(h => h.bar.element === bar);
        if (!handle) return;
        const i = this.handles.indexOf(handle);
        if (e.key === 'Enter') {
            e.preventDefault();
            this.foldFromHandle(handle, 'before', e);
            return;
        }
        if (!this.canResize(i)) return;
        const horizontal = this.horizontal;
        const forward = horizontal ? 'ArrowRight' : 'ArrowDown';
        const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
        const panes = this.shownPanes();
        const measured = this.measure(panes);
        const total = measured[i] + measured[i + 1];
        let a: number | undefined;
        if (e.key === forward || e.key === back) {
            const rtl = horizontal && getComputedStyle(this.element).direction === 'rtl';
            const grows = (e.key === forward) !== rtl;
            a = measured[i] + (grows ? this.step : -this.step);
        } else if (e.key === 'Home') a = 0;
        else if (e.key === 'End') a = total;
        if (a === undefined) return;
        e.preventDefault();
        this.freeze(panes);
        if (this.apply(i, a, total)) {
            this.tell(this.resized, i, e);
            this.bindings.writeModel(this.currentSizes);
        }
    }

    pointerDown(e: PointerEvent, handle: Handle): void {
        if (e.button !== 0 || !this.isEnabled) return;
        const i = this.handles.indexOf(handle);
        if (!this.canResize(i)) return;
        e.preventDefault();
        const bar = handle.bar.element;
        bar.focus({ preventScroll: true });
        bar.setPointerCapture?.(e.pointerId);
        const panes = this.shownPanes();
        const measured = this.measure(panes);
        this.freeze(panes);
        this.drag = { pointer: e.pointerId, handle: i, from: this.horizontal ? e.clientX : e.clientY, a: measured[i], b: measured[i + 1] };
        mark(this.element, 'data-dragging', true);
        mark(bar, 'data-dragging', true);
    }

    pointerMove(e: PointerEvent): void {
        const drag = this.drag;
        if (!drag || drag.pointer !== e.pointerId) return;
        const rtl = this.horizontal && getComputedStyle(this.element).direction === 'rtl';
        const moved = (this.horizontal ? e.clientX : e.clientY) - drag.from;
        if (this.apply(drag.handle, drag.a + (rtl ? -moved : moved), drag.a + drag.b)) this.tell(this.resizing, drag.handle, e);
    }

    pointerUp(e: PointerEvent): void {
        const drag = this.drag;
        if (!drag || drag.pointer !== e.pointerId) return;
        this.drag = null;
        const bar = this.handles[drag.handle]?.bar.element;
        if (bar?.hasPointerCapture?.(e.pointerId)) bar.releasePointerCapture(e.pointerId);
        mark(this.element, 'data-dragging', false);
        if (bar) mark(bar, 'data-dragging', false);
        if (e.type !== 'pointerup') return;
        this.tell(this.resized, drag.handle, e);
        this.bindings.writeModel(this.currentSizes);
    }
}
