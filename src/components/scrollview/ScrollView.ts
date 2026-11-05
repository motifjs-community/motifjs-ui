import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, mark, part, put, shown, text } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { ResizeWatch } from "../../core/resize-watch";
import { uiLocale } from "../../core/ui-locale";
import { Spinner } from "../progress/Spinner";
import type { PullDownEventArgs } from "./pull-down-event-args";
import type { ReachBottomEventArgs } from "./reach-bottom-event-args";
import type { ScrollEventArgs } from "./scroll-event-args";
import type { ScrollViewBars } from "./scroll-view-bars";
import type { ScrollViewDirection } from "./scroll-view-direction";
import type { ScrollViewProps } from "./scroll-view-props";

const OWN = ['direction', 'showScrollbar', 'pullToRefresh', 'loadOnReachBottom', 'reachBottomOffset', 'pullDownText', 'releaseText', 'refreshingText', 'reachBottomText', 'label'] as const;

interface Pull {
    pointerId: number;
    startY: number;
    distance: number;
    // The finger went down first: the pull is taken, not the page.
    taken: boolean;
}

/**
 * Content that scrolls in a box of its own, with the scrollbars shown as told (`showScrollbar`), a pull from the top
 * that asks for what is new (`pullToRefresh`, `onPullDown`) and a reach near the end that asks for more
 * (`loadOnReachBottom`, `onReachBottom`). `scrollTo`, `scrollBy` and `scrollToElement` move it from code.
 *
 * @example
 * <ScrollView style="block-size: 20rem" pullToRefresh onPullDown={e => (e.promise = this.reload())} loadOnReachBottom onReachBottom={e => (e.promise = this.loadMore())}>
 *   {this.rows.map(row => <Row key={row.id} row={row} />)}
 * </ScrollView>
 */
export class ScrollView extends Control<HTMLDivElement, ScrollViewProps> {
    content: Component<HTMLDivElement>;
    pullPanel: Component<HTMLDivElement>;
    pullSpinner: Spinner;
    pullText: Component<HTMLSpanElement>;
    bottomPanel: Component<HTMLDivElement>;
    bottomSpinner: Spinner;
    bottomText: Component<HTMLSpanElement>;
    pull: Pull | null = null;
    refreshing = false;
    loading = false;
    ended = false;
    scrollTimer: ReturnType<typeof setTimeout> | null = null;
    sizes: ResizeWatch;
    refreshCount = 0;
    pulled = new Emitter<PullDownEventArgs>();
    reached = new Emitter<ReachBottomEventArgs>();
    scrolled = new Emitter<ScrollEventArgs>();
    stops: (() => void)[] = [];

    constructor(props?: IBaseProp<ScrollViewProps>) {
        super('div', props);
        const own = (this.props ?? {}) as ScrollViewProps;
        const el = this.element;
        el.classList.add('mx-scroll-view');
        el.tabIndex = 0;
        this.content = part<HTMLDivElement>(this, 'div', 'mx-scroll-view__content');
        this.pullPanel = part<HTMLDivElement>(this.content, 'div', 'mx-scroll-view__pull');
        this.pullPanel.element.setAttribute('aria-live', 'polite');
        this.pullSpinner = new Spinner({ size: 'sm' });
        this.pullSpinner.element.classList.add('mx-scroll-view__pull-spinner');
        this.pullSpinner.element.setAttribute('aria-hidden', 'true');
        this.pullPanel.controls.add(this.pullSpinner);
        this.pullText = part<HTMLSpanElement>(this.pullPanel, 'span', 'mx-scroll-view__pull-text');
        if (this.childs?.length) this.content.controls.add(...this.childs);
        this.bottomPanel = part<HTMLDivElement>(this.content, 'div', 'mx-scroll-view__bottom');
        this.bottomPanel.element.setAttribute('aria-live', 'polite');
        this.bottomSpinner = new Spinner({ size: 'sm' });
        this.bottomSpinner.element.classList.add('mx-scroll-view__bottom-spinner');
        this.bottomSpinner.element.setAttribute('aria-hidden', 'true');
        this.bottomPanel.controls.add(this.bottomSpinner);
        this.bottomText = part<HTMLSpanElement>(this.bottomPanel, 'span', 'mx-scroll-view__bottom-text');
        shown(this.bottomPanel.element, false);

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onPullDown) this.pulled.event(own.onPullDown);
        if (own.onReachBottom) this.reached.event(own.onReachBottom);
        if (own.onScrolled) this.scrolled.event(own.onScrolled);

        this.observeProperty<ScrollViewDirection>('direction', d => put(el, 'data-direction', d ?? 'vertical'));
        this.observeProperty<ScrollViewBars>('showScrollbar', bars => put(el, 'data-bars', bars ?? 'onScroll'));
        this.observeProperty<boolean>('pullToRefresh', on => {
            mark(el, 'data-pull', !!on);
            shown(this.pullPanel.element, !!on);
            if (!on) this.release();
        });
        this.observeProperty<boolean>('loadOnReachBottom', on => {
            this.ended = false;
            if (on) this.check();
        });
        for (const name of ['pullDownText', 'releaseText', 'refreshingText', 'reachBottomText'] as const) this.observeProperty(name, () => this.drawTexts());
        this.observeProperty<string>('label', label => put(el, 'aria-label', label || null));
        onLanguage(this, () => this.drawTexts());

        el.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        el.addEventListener('pointerdown', e => this.pointerDown(e));
        // The browser decides at the first touch whether the page scrolls: a listener there, before the finger moves.
        el.addEventListener('touchmove', e => this.touchMove(e), { passive: false });
        // Content that grows or shrinks ends nearer or farther: looked at again.
        this.sizes = new ResizeWatch(() => this.check());
        this.sizes.observe(this.content.element);
        this.motif.setDisposable(() => {
            this.sizes.disconnect();
            for (const stop of this.stops.splice(0)) stop();
            if (this.scrollTimer) clearTimeout(this.scrollTimer);
            this.pulled.dispose();
            this.reached.dispose();
            this.scrolled.dispose();
        });
        this.drawTexts();
    }

    // Properties (see ScrollViewProps).

    get direction(): ScrollViewDirection {
        return this.getProperty<ScrollViewDirection | undefined>('direction') ?? 'vertical';
    }
    set direction(value: Bind<ScrollViewDirection>) {
        this.assignProperty('direction', value);
    }
    get showScrollbar(): ScrollViewBars {
        return this.getProperty<ScrollViewBars | undefined>('showScrollbar') ?? 'onScroll';
    }
    set showScrollbar(value: Bind<ScrollViewBars>) {
        this.assignProperty('showScrollbar', value);
    }
    get pullToRefresh(): boolean {
        return !!this.getProperty<boolean>('pullToRefresh');
    }
    set pullToRefresh(value: Bind<boolean>) {
        this.assignProperty('pullToRefresh', value, Boolean);
    }
    get loadOnReachBottom(): boolean {
        return !!this.getProperty<boolean>('loadOnReachBottom');
    }
    set loadOnReachBottom(value: Bind<boolean>) {
        this.assignProperty('loadOnReachBottom', value, Boolean);
    }
    get reachBottomOffset(): number {
        return this.getProperty<number | undefined>('reachBottomOffset') ?? 100;
    }
    set reachBottomOffset(value: Bind<number>) {
        this.assignProperty('reachBottomOffset', value, Number);
    }
    get pullDownText(): string {
        return this.getProperty<string | undefined>('pullDownText') ?? '';
    }
    set pullDownText(value: Bind<string>) {
        this.assignProperty('pullDownText', value);
    }
    get releaseText(): string {
        return this.getProperty<string | undefined>('releaseText') ?? '';
    }
    set releaseText(value: Bind<string>) {
        this.assignProperty('releaseText', value);
    }
    get refreshingText(): string {
        return this.getProperty<string | undefined>('refreshingText') ?? '';
    }
    set refreshingText(value: Bind<string>) {
        this.assignProperty('refreshingText', value);
    }
    get reachBottomText(): string {
        return this.getProperty<string | undefined>('reachBottomText') ?? '';
    }
    set reachBottomText(value: Bind<string>) {
        this.assignProperty('reachBottomText', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    get onPullDown(): MotifEvent<PullDownEventArgs> {
        return this.pulled.event;
    }
    get onReachBottom(): MotifEvent<ReachBottomEventArgs> {
        return this.reached.event;
    }
    get onScrolled(): MotifEvent<ScrollEventArgs> {
        return this.scrolled.event;
    }

    /** Where the content stands. */
    get scrollTop(): number {
        return this.element.scrollTop;
    }
    get scrollLeft(): number {
        return this.element.scrollLeft;
    }
    /** A refresh (a pull) is going on. */
    get isRefreshing(): boolean {
        return this.refreshing;
    }
    /** More is being loaded (a reach near the end). */
    get isLoading(): boolean {
        return this.loading;
    }

    /** Scrolls to a position: `{ top, left }`, or a top. */
    scrollTo(where: number | { top?: number; left?: number }, smooth = false): void {
        const options: ScrollToOptions = typeof where === 'number' ? { top: where } : { top: where.top, left: where.left };
        options.behavior = smooth ? 'smooth' : 'auto';
        this.element.scrollTo(options);
    }

    scrollBy(by: { top?: number; left?: number }, smooth = false): void {
        this.element.scrollBy({ top: by.top ?? 0, left: by.left ?? 0, behavior: smooth ? 'smooth' : 'auto' });
    }

    /** Brings an element of the content into view. */
    scrollToElement(target: Element | { element: Element }, smooth = false): void {
        const el = 'element' in target ? target.element : target;
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
    }

    /** Starts a refresh as a pull would: the panel shows, `onPullDown` is asked. */
    refresh(): void {
        if (this.refreshing || !this.peekProperty('pullToRefresh')) {
            return;
        }
        this.refreshing = true;
        put(this.element, 'data-pull-state', 'refreshing');
        css(this.content.element, 'translate', `0 ${this.pullHeight()}px`);
        this.drawTexts();
        const count = ++this.refreshCount;
        const args: PullDownEventArgs = { release: () => this.release(), source: this };
        this.pulled.fire(args);
        // The promise ends this refresh only; one started after it is its own.
        const end = () => {
            if (this.refreshCount === count) this.release();
        };
        if (args.promise) void args.promise.then(end, end);
    }

    /** Ends a refresh: the panel goes back. */
    release(): void {
        this.refreshing = false;
        this.pull = null;
        put(this.element, 'data-pull-state', null);
        css(this.content.element, 'translate', '');
        this.drawTexts();
    }

    /** Asks for more now, as a reach near the end would. */
    loadMore(): boolean {
        if (this.loading || this.ended || !this.peekProperty('loadOnReachBottom')) {
            return false;
        }
        const el = this.element;
        // At the very end the panel would open below the view: the view stays at the end, so it shows.
        const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight <= 1;
        this.loading = true;
        mark(el, 'data-loading', true);
        shown(this.bottomPanel.element, true);
        if (atEnd) el.scrollTop = el.scrollHeight;
        let open = true;
        // Released once: a promise set beside a `release(true)` must not open the view again.
        const release = (done = false) => {
            if (!open) return;
            open = false;
            this.loading = false;
            this.ended = done;
            mark(this.element, 'data-loading', false);
            shown(this.bottomPanel.element, false);
        };
        const args: ReachBottomEventArgs = { release, source: this };
        this.reached.fire(args);
        if (args.promise) void args.promise.then(() => release(), () => release());
        return true;
    }

    /** Looks at the position again (the content changed): near the end, more is asked for. */
    update(): void {
        this.ended = false;
        this.check();
    }

    pullHeight(): number {
        return this.pullPanel.element.offsetHeight || 48;
    }

    drawTexts(): void {
        const strings = uiLocale.strings;
        const state = this.element.getAttribute('data-pull-state');
        const pullText = state === 'refreshing' ? this.peekProperty<string>('refreshingText') || strings.scrollRefreshing : state === 'release' ? this.peekProperty<string>('releaseText') || strings.scrollRelease : this.peekProperty<string>('pullDownText') || strings.scrollPullDown;
        text(this.pullText.element, pullText);
        shown(this.pullSpinner.element, state === 'refreshing');
        text(this.bottomText.element, this.peekProperty<string>('reachBottomText') || strings.loading);
    }

    handleScroll(): void {
        const el = this.element;
        mark(el, 'data-scrolling', true);
        if (this.scrollTimer) clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => mark(el, 'data-scrolling', false), 800);
        this.scrolled.fire({ top: el.scrollTop, left: el.scrollLeft, source: this });
        this.check();
    }

    override onMounted(): void {
        this.check();
    }

    check(): void {
        const el = this.element;
        // Not laid out yet (or hidden): nothing is near anything.
        if (!this.peekProperty('loadOnReachBottom') || this.loading || this.ended || el.clientHeight === 0) {
            return;
        }
        const offset = this.peekProperty<number | undefined>('reachBottomOffset') ?? 100;
        if (el.scrollHeight - el.scrollTop - el.clientHeight <= offset) this.loadMore();
    }

    // A pull starts at the top, with any pointer; it is taken only once the finger goes down.
    pointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.pull || this.refreshing || !this.peekProperty('pullToRefresh') || this.element.scrollTop > 0) {
            return;
        }
        const pull: Pull = { pointerId: e.pointerId, startY: e.clientY, distance: 0, taken: false };
        this.pull = pull;
        const win = this.element.ownerDocument.defaultView ?? window;
        const move = (ev: PointerEvent) => this.pointerMove(ev);
        const up = (ev: PointerEvent) => this.pointerUp(ev);
        win.addEventListener('pointermove', move);
        win.addEventListener('pointerup', up);
        win.addEventListener('pointercancel', up);
        this.stops.push(() => {
            win.removeEventListener('pointermove', move);
            win.removeEventListener('pointerup', up);
            win.removeEventListener('pointercancel', up);
        });
    }

    pointerMove(e: PointerEvent): void {
        const pull = this.pull;
        if (!pull || e.pointerId !== pull.pointerId) return;
        const dy = e.clientY - pull.startY;
        if (!pull.taken) {
            if (dy < 6 || this.element.scrollTop > 0) {
                if (dy < -6) this.stopPull();
                return;
            }
            pull.taken = true;
            mark(this.element, 'data-pulling', true);
            if (e.pointerType !== 'touch') this.element.setPointerCapture?.(e.pointerId);
        }
        // Harder to pull the farther it goes, up to half again the panel's height.
        const height = this.pullHeight();
        pull.distance = Math.min(height * 1.5, dy * 0.5);
        css(this.content.element, 'translate', `0 ${Math.max(0, pull.distance)}px`);
        put(this.element, 'data-pull-state', pull.distance >= height ? 'release' : 'pull');
        this.drawTexts();
    }

    pointerUp(e: PointerEvent): void {
        const pull = this.pull;
        if (!pull || e.pointerId !== pull.pointerId) return;
        const taken = pull.taken;
        const far = pull.distance >= this.pullHeight();
        this.stopPull();
        if (taken && far && e.type === 'pointerup') {
            this.refresh();
        }
    }

    stopPull(): void {
        for (const stop of this.stops.splice(0)) stop();
        const pull = this.pull;
        this.pull = null;
        mark(this.element, 'data-pulling', false);
        if (pull?.taken && !this.refreshing) {
            put(this.element, 'data-pull-state', null);
            css(this.content.element, 'translate', '');
            this.drawTexts();
        }
    }

    touchMove(e: TouchEvent): void {
        // While the content is pulled, the page must not scroll with the finger.
        if (this.pull?.taken && e.cancelable) e.preventDefault();
    }
}
