import { Component, ComponentBase, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { part } from "../../core/draw-parts";
import { boxOf, isRtl, measure, onLayout, scrollBy as scrollBoxBy, scrollIntoView as scrollPartIntoView, scrollTo as scrollBoxTo, type Box } from "../../core/measure";
import { onWindow } from "../../core/window-events";
import { onLanguage } from "../../core/on-language";
import { css, mark, put, shown, text } from "../../core/part-writes";
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
    /** The pull panel's height, read when the pull starts. */
    height: number;
    // The finger went down first: the pull is taken, not the page.
    taken: boolean;
}

/** Where a pull stands: pulled, far enough to let go, or refreshing. */
type PullState = 'pull' | 'release' | 'refreshing';

/**
 * Content that scrolls in its own box, with scrollbars shown as set by `showScrollbar`, a pull from the top that
 * requests new content (`pullToRefresh`, `onPullDown`), and a request for more content near the end
 * (`loadOnReachBottom`, `onReachBottom`). `scrollTo`, `scrollBy` and `scrollToElement` move it programmatically.
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
    /** Where the pull stands now, `null` while there is none. */
    pullState: PullState | null = null;
    refreshing = false;
    loading = false;
    ended = false;
    scrollTimer: ReturnType<typeof setTimeout> | null = null;
    refreshCount = 0;
    pulled = new Emitter<PullDownEventArgs>();
    reached = new Emitter<ReachBottomEventArgs>();
    scrolled = new Emitter<ScrollEventArgs>();
    stops: (() => void)[] = [];

    constructor(props?: IBaseProp<ScrollViewProps>) {
        super('div', props);
        const own = (this.props ?? {}) as ScrollViewProps;
        this.class.add('mx-scroll-view');
        put(this, 'tabindex', '0');
        this.content = part<HTMLDivElement>(this, 'div', 'mx-scroll-view__content');
        this.pullPanel = part<HTMLDivElement>(this.content, 'div', 'mx-scroll-view__pull');
        this.pullPanel.attr.add({ 'aria-live': 'polite' });
        this.pullSpinner = new Spinner({ size: 'sm' });
        this.pullSpinner.class.add('mx-scroll-view__pull-spinner');
        this.pullSpinner.attr.add({ 'aria-hidden': 'true' });
        this.pullPanel.controls.add(this.pullSpinner);
        this.pullText = part<HTMLSpanElement>(this.pullPanel, 'span', 'mx-scroll-view__pull-text');
        if (this.childs?.length) this.content.controls.add(...this.childs);
        this.bottomPanel = part<HTMLDivElement>(this.content, 'div', 'mx-scroll-view__bottom');
        this.bottomPanel.attr.add({ 'aria-live': 'polite' });
        this.bottomSpinner = new Spinner({ size: 'sm' });
        this.bottomSpinner.class.add('mx-scroll-view__bottom-spinner');
        this.bottomSpinner.attr.add({ 'aria-hidden': 'true' });
        this.bottomPanel.controls.add(this.bottomSpinner);
        this.bottomText = part<HTMLSpanElement>(this.bottomPanel, 'span', 'mx-scroll-view__bottom-text');
        shown(this.bottomPanel, false);

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onPullDown) this.pulled.event(own.onPullDown);
        if (own.onReachBottom) this.reached.event(own.onReachBottom);
        if (own.onScrolled) this.scrolled.event(own.onScrolled);

        this.observeProperty<ScrollViewDirection>('direction', d => put(this, 'data-direction', d ?? 'vertical'));
        this.observeProperty<ScrollViewBars>('showScrollbar', bars => put(this, 'data-bars', bars ?? 'onScroll'));
        this.observeProperty<boolean>('pullToRefresh', on => {
            mark(this, 'data-pull', !!on);
            shown(this.pullPanel, !!on);
            if (!on) this.release();
        });
        this.observeProperty<boolean>('loadOnReachBottom', on => {
            this.ended = false;
            if (on) this.check();
        });
        for (const name of ['pullDownText', 'releaseText', 'refreshingText', 'reachBottomText'] as const) this.observeProperty(name, () => this.drawTexts());
        this.observeProperty<string>('label', label => put(this, 'aria-label', label || null));
        onLanguage(this, () => this.drawTexts());

        this.motif.on('scroll:passive', () => this.handleScroll());
        this.motif.on('pointerdown', (_, e) => this.pointerDown(e));
        // The browser decides at the first touch whether the page scrolls: a listener there, before the finger moves.
        this.motif.on('touchmove', (_, e: TouchEvent | undefined) => e && this.touchMove(e));
        // Content that grows or shrinks ends nearer or farther: looked at again.
        onLayout(this.content, 'size', () => this.check());
        this.motif.setDisposable(() => {
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

    /** The current scroll position. */
    get scrollTop(): number {
        return boxOf(this).scrollTop;
    }
    get scrollLeft(): number {
        const box = boxOf(this);
        return box.rtl ? -box.scrollStart : box.scrollStart;
    }
    /** Indicates that a refresh (a pull) is in progress. */
    get isRefreshing(): boolean {
        return this.refreshing;
    }
    /** Indicates that more data is being loaded near the end. */
    get isLoading(): boolean {
        return this.loading;
    }

    /** Scrolls to a position: `{ top, left }`, or a top position. */
    scrollTo(where: number | { top?: number; left?: number }, smooth = false): void {
        const place = typeof where === 'number' ? { top: where } : { top: where.top, start: this.startOf(where.left) };
        scrollBoxTo(this, place, smooth ? 'smooth' : 'auto');
    }

    scrollBy(by: { top?: number; left?: number }, smooth = false): void {
        scrollBoxBy(this, { top: by.top, start: this.startOf(by.left) }, smooth ? 'smooth' : 'auto');
    }

    /** Scrolls a part of the content into view. */
    scrollToElement(target: ComponentBase, smooth = false): void {
        scrollPartIntoView(target, { motion: smooth ? 'smooth' : 'auto' });
    }

    /** A left position as the page counts it (below zero right to left) as a distance from the inline start. */
    startOf(left: number | undefined): number | undefined {
        return left === undefined || !isRtl(this) ? left : -left;
    }

    /** Starts a refresh as a pull would: the panel appears and `onPullDown` is raised. */
    refresh(): void {
        if (this.canRefresh()) this.startRefresh(this.pullHeight());
    }

    canRefresh(): boolean {
        return !this.refreshing && !!this.peekProperty('pullToRefresh');
    }

    /** Opens the panel `height` pixels tall and raises `onPullDown`. */
    startRefresh(height: number): void {
        this.refreshing = true;
        this.setPullState('refreshing');
        css(this.content, 'translate', `0 ${height}px`);
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

    /** Ends a refresh and closes the panel. */
    release(): void {
        this.refreshing = false;
        this.pull = null;
        this.setPullState(null);
        css(this.content, 'translate', '');
        this.drawTexts();
    }

    /** Requests more data now, as reaching the end would. */
    loadMore(): boolean {
        if (!this.canLoad()) {
            return false;
        }
        this.startLoad(this.roomBelow(boxOf(this)) <= 1);
        return true;
    }

    canLoad(): boolean {
        return !this.loading && !this.ended && !!this.peekProperty('loadOnReachBottom');
    }

    /** How much of the content is still below the view. */
    roomBelow(box: Box): number {
        return box.scrollHeight - box.scrollTop - box.clientHeight;
    }

    /** Shows the panel at the end and raises `onReachBottom`; `atEnd` when the view stood at the very end. */
    startLoad(atEnd: boolean): void {
        this.loading = true;
        mark(this, 'data-loading', true);
        shown(this.bottomPanel, true);
        // At the very end the panel would open below the view: the view stays at the end, so it shows.
        if (atEnd) measure(this, this.readHeight, this.scrollToEnd);
        let open = true;
        // Released once: a promise set beside a `release(true)` must not open the view again.
        const release = (done = false) => {
            if (!open) return;
            open = false;
            this.loading = false;
            this.ended = done;
            mark(this, 'data-loading', false);
            shown(this.bottomPanel, false);
        };
        const args: ReachBottomEventArgs = { release, source: this };
        this.reached.fire(args);
        if (args.promise) void args.promise.then(() => release(), () => release());
    }

    readonly readHeight = (): number => boxOf(this).scrollHeight;

    readonly scrollToEnd = (height: number): void => {
        scrollBoxTo(this, { top: height });
    };

    /** Checks the position again after the content changes, and requests more data near the end. */
    update(): void {
        this.ended = false;
        this.check();
    }

    pullHeight(): number {
        return boxOf(this.pullPanel).offsetHeight || 48;
    }

    /** Keeps where the pull stands and writes it on the root for the styles. */
    setPullState(state: PullState | null): void {
        this.pullState = state;
        put(this, 'data-pull-state', state);
    }

    drawTexts(): void {
        const strings = uiLocale.strings;
        const state = this.pullState;
        const pullText = state === 'refreshing' ? this.peekProperty<string>('refreshingText') || strings.scrollRefreshing : state === 'release' ? this.peekProperty<string>('releaseText') || strings.scrollRelease : this.peekProperty<string>('pullDownText') || strings.scrollPullDown;
        text(this.pullText, pullText);
        shown(this.pullSpinner, state === 'refreshing');
        text(this.bottomText, this.peekProperty<string>('reachBottomText') || strings.loading);
    }

    handleScroll(): void {
        const box = boxOf(this);
        mark(this, 'data-scrolling', true);
        if (this.scrollTimer) clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => mark(this, 'data-scrolling', false), 800);
        this.scrolled.fire({ top: box.scrollTop, left: box.rtl ? -box.scrollStart : box.scrollStart, source: this });
        this.checkRoom(box);
    }

    /** Looks at the position with the next frame, and requests more data near the end. */
    check(): void {
        if (this.canLoad()) measure(this, this.readBox, this.checkRoom);
    }

    readonly readBox = (): Box => boxOf(this);

    readonly checkRoom = (box: Box): void => {
        // Not laid out yet (or hidden): nothing is near anything.
        if (!this.canLoad() || box.clientHeight === 0) {
            return;
        }
        const offset = this.peekProperty<number | undefined>('reachBottomOffset') ?? 100;
        const below = this.roomBelow(box);
        if (below <= offset) this.startLoad(below <= 1);
    };

    // A pull starts at the top, with any pointer; it is taken only once the finger goes down.
    pointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.pull || this.refreshing || !this.peekProperty('pullToRefresh') || boxOf(this).scrollTop > 0) {
            return;
        }
        const pull: Pull = { pointerId: e.pointerId, startY: e.clientY, distance: 0, height: this.pullHeight(), taken: false };
        this.pull = pull;
        const move = (ev: PointerEvent) => this.pointerMove(ev);
        const up = (ev: PointerEvent) => this.pointerUp(ev);
        // The pull goes on past the view: its window is listened to while it runs.
        this.stops.push(onWindow(this, 'pointermove', move), onWindow(this, 'pointerup', up), onWindow(this, 'pointercancel', up));
    }

    pointerMove(e: PointerEvent): void {
        const pull = this.pull;
        if (!pull || e.pointerId !== pull.pointerId) return;
        const dy = e.clientY - pull.startY;
        if (!pull.taken) {
            if (dy < 6 || boxOf(this).scrollTop > 0) {
                if (dy < -6) this.stopPull();
                return;
            }
            pull.taken = true;
            mark(this, 'data-pulling', true);
            if (e.pointerType !== 'touch') this.attr.add({ setPointerCapture: e.pointerId });
        }
        // Harder to pull the farther it goes, up to half again the panel's height.
        pull.distance = Math.min(pull.height * 1.5, dy * 0.5);
        css(this.content, 'translate', `0 ${Math.max(0, pull.distance)}px`);
        this.setPullState(pull.distance >= pull.height ? 'release' : 'pull');
        this.drawTexts();
    }

    pointerUp(e: PointerEvent): void {
        const pull = this.pull;
        if (!pull || e.pointerId !== pull.pointerId) return;
        const taken = pull.taken;
        const far = pull.distance >= pull.height;
        this.stopPull();
        if (taken && far && e.type === 'pointerup' && this.canRefresh()) {
            this.startRefresh(pull.height);
        }
    }

    stopPull(): void {
        for (const stop of this.stops.splice(0)) stop();
        const pull = this.pull;
        this.pull = null;
        mark(this, 'data-pulling', false);
        if (pull?.taken && !this.refreshing) {
            this.setPullState(null);
            css(this.content, 'translate', '');
            this.drawTexts();
        }
    }

    touchMove(e: TouchEvent): void {
        // While the content is pulled, the page must not scroll with the finger.
        if (this.pull?.taken && e.cancelable) e.preventDefault();
    }
}
