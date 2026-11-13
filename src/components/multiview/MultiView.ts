import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { part } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { mark, put } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { SlideTrack } from "../../parts/slide/slide-track";
import type { MultiViewProps } from "./multi-view-props";
import { View } from "./View";
import type { ViewSelectingEventArgs } from "./view-selecting-event-args";
import type { ViewSelectionChangedEventArgs } from "./view-selection-changed-event-args";

const OWN = ['value', 'loop', 'swipeEnabled', 'animated', 'lazy', 'keepAlive', 'label'] as const;

/**
 * Pages side by side, with one visible: the JSX `View` children, or views added programmatically. A swipe shows the
 * next or previous view, as do `next()`, `previous()` and `goTo()`, and a `Tabs`, a `Stepper` or buttons bound to
 * `value` can control it. A view is created when it first becomes visible (`lazy`) and kept (`keepAlive`), like the
 * panels of `Tabs`.
 *
 * @example
 * <MultiView x-model={() => this.page} loop>
 *   <View title="Details">…</View>
 *   <View title="Review">…</View>
 * </MultiView>
 */
export class MultiView extends Control<HTMLDivElement, MultiViewProps> {
    selecting = new Emitter<ViewSelectingEventArgs>();
    selectionChanged = new Emitter<ViewSelectionChangedEventArgs>();
    viewport: Component<HTMLDivElement>;
    track: Component<HTMLDivElement>;
    slide: SlideTrack;
    views: View[] = [];
    previousIndex = -1;
    byUser = false;
    ready = false;

    constructor(props?: IBaseProp<MultiViewProps>) {
        super('div', props);
        const own = (this.props ?? {}) as MultiViewProps;
        this.class.add('mx-multi-view');
        this.attr.add({ role: 'group' });
        this.viewport = part(this, 'div', 'mx-multi-view__viewport');
        this.track = part(this.viewport, 'div', 'mx-multi-view__track');
        this.slide = new SlideTrack(this.viewport, this.track, {
            count: () => this.lane().length,
            index: () => this.laneIndex(this.selectedIndex),
            perView: () => 1,
            loop: () => this.loop,
            panePart: i => this.lane()[i] ?? null,
            canDrag: () => this.swipeEnabled && this.isEnabled && this.lane().length > 1,
            swipeTo: to => void this.go(this.views.indexOf(this.lane()[to]), true),
            dragged: on => mark(this, 'data-dragging', on)
        });
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onSelecting) this.onSelecting(own.onSelecting);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);

        this.observeProperty<number | string | null>('value', () => {
            const index = this.selectedIndex;
            this.drawStates();
            if (!this.ready || index === this.previousIndex) return;
            this.slide.slide(this.laneIndex(this.previousIndex), this.laneIndex(index));
            this.selectionChanged.fire({ index, view: this.views[index] ?? null, previous: this.previousIndex, byUser: this.byUser, source: this });
            this.previousIndex = index;
        });
        for (const name of ['loop', 'swipeEnabled', 'lazy', 'keepAlive'] as const) this.observeProperty(name, () => this.drawStates());
        this.observeProperty<boolean>('animated', on => mark(this, 'data-still', on === false));
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => {
            this.renderName();
            this.drawStates();
        });
        for (const child of this.childs ?? []) if (child instanceof View) this.place(child, this.views.length);
        this.motif.setDisposable(() => {
            this.slide.dispose();
            this.selecting.dispose();
            this.selectionChanged.dispose();
        });
        this.previousIndex = this.selectedIndex;
        this.ready = true;
        this.drawStates();
        this.slide.layout();
    }

    // Properties (see MultiViewProps).

    get value(): string | number | null {
        const value = this.getProperty<string | number | null | undefined>('value');
        return value === undefined ? 0 : value;
    }
    set value(value: Bind<string | number | null>) {
        this.assignProperty('value', value);
    }
    get loop(): boolean {
        return this.getProperty<boolean | undefined>('loop') === true;
    }
    set loop(value: Bind<boolean>) {
        this.assignProperty('loop', value);
    }
    get swipeEnabled(): boolean {
        return this.getProperty<boolean | undefined>('swipeEnabled') !== false;
    }
    set swipeEnabled(value: Bind<boolean>) {
        this.assignProperty('swipeEnabled', value);
    }
    get animated(): boolean {
        return this.getProperty<boolean | undefined>('animated') !== false;
    }
    set animated(value: Bind<boolean>) {
        this.assignProperty('animated', value);
    }
    get lazy(): boolean {
        return this.getProperty<boolean | undefined>('lazy') !== false;
    }
    set lazy(value: Bind<boolean>) {
        this.assignProperty('lazy', value);
    }
    get keepAlive(): boolean {
        return this.getProperty<boolean | undefined>('keepAlive') !== false;
    }
    set keepAlive(value: Bind<boolean>) {
        this.assignProperty('keepAlive', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    /** Occurs before the visible view changes (`from`, `to`, `byUser`). Set `cancel` to keep the current view. */
    get onSelecting(): MotifEvent<ViewSelectingEventArgs> {
        return this.selecting.event;
    }

    /** Occurs after the visible view changes, by a swipe or programmatically (`byUser`). */
    get onSelectionChanged(): MotifEvent<ViewSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }

    /** The index of the visible view, or -1 if there is none. */
    get selectedIndex(): number {
        return this.indexOf(this.peekProperty<string | number | null | undefined>('value'));
    }

    /** The visible view, or `null` if there is none. */
    get selectedView(): View | null {
        return this.views[this.selectedIndex] ?? null;
    }

    /** The number of views, including hidden ones. */
    get count(): number {
        return this.views.length;
    }

    /** Adds a view at the end. */
    add(view: View): View {
        return this.insert(this.views.length, view);
    }

    /** Adds a view at `index`. */
    insert(index: number, view: View): View {
        if (view.owner === this) return view;
        view.owner?.forget(view);
        this.place(view, Math.max(0, Math.min(index, this.views.length)));
        return view;
    }

    /** Removes a view and disposes it. The display moves to an adjacent view. */
    remove(view: View): boolean {
        if (!this.views.includes(view)) return false;
        this.forget(view);
        this.track.controls.remove(view);
        return true;
    }

    /** Moves to the next view that is visible and enabled. Returns `false` at the end without `loop`, or if canceled. */
    next(): Promise<boolean> {
        return this.go(this.usable(this.selectedIndex, 1), false);
    }

    /** Moves to the previous view that is visible and enabled. */
    previous(): Promise<boolean> {
        return this.go(this.usable(this.selectedIndex, -1), false);
    }

    /** Moves to a view by index or key. `onSelecting` is raised first. */
    goTo(view: number | string | View): Promise<boolean> {
        return this.go(view instanceof View ? this.views.indexOf(view) : this.indexOf(view), false);
    }

    /** Makes a view visible, as `goTo` does. */
    select(view: View): Promise<boolean> {
        return this.goTo(view);
    }

    /** Returns the index that a value identifies: a key, otherwise an index in range, or -1 if there is none. */
    indexOf(value: string | number | null | undefined): number {
        if (value === undefined) return this.views.length ? 0 : -1;
        if (value === null) return -1;
        if (typeof value === 'string') return this.views.findIndex(view => view.key === value);
        return Number.isInteger(value) && value >= 0 && value < this.views.length ? value : -1;
    }

    /** Returns the value that identifies the view at `index`: its key if it has one, otherwise the index. */
    valueAt(index: number): string | number {
        return this.views[index]?.key || index;
    }

    // Going away: the views are disposed one by one, nothing is drawn again.
    override onDisposing(): void {
        this.ready = false;
    }

    /** @internal A view's title, key, visibility or enabled changed. */
    viewChanged(): void {
        if (!this.ready) return;
        this.drawStates();
        this.slide.layout();
    }

    /** @internal A view was disposed on its own. */
    viewGone(view: View): void {
        if (this.ready && this.views.includes(view)) this.forget(view);
    }

    // The views in the track, as the slide part sees them: the hidden ones take no room.
    lane(): View[] {
        return this.views.filter(view => view.visible);
    }

    laneIndex(index: number): number {
        const view = this.views[index];
        return view ? this.lane().indexOf(view) : -1;
    }

    place(view: View, index: number): void {
        this.views.splice(index, 0, view);
        this.track.controls.add(index, view);
        view.owner = this;
        if (!this.lazyOf(view)) view.buildContent();
        this.viewChanged();
    }

    // Takes a view out without disposing it; the sight moves to the nearest view left.
    forget(view: View): void {
        const at = this.views.indexOf(view);
        if (at < 0) return;
        this.views.splice(at, 1);
        view.owner = null;
        view.reveal(false, true);
        const index = this.selectedIndex;
        if (index < 0 && this.views.length) {
            const to = Math.min(at, this.views.length - 1);
            this.previousIndex = -1;
            this.changeProperty('value', this.valueAt(to));
            this.bindings.writeModel(this.valueAt(to));
        }
        this.viewChanged();
    }

    renderName(): void {
        put(this, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.multiView);
    }

    drawStates(): void {
        const index = this.selectedIndex;
        const lane = this.lane();
        this.views.forEach((view, i) => {
            view.reveal(i === index, this.keepAliveOf(view));
            put(view, 'aria-label', view.title || uiLocale.text('multiViewPageOf', { index: lane.indexOf(view) + 1, count: lane.length }));
            if (!this.lazyOf(view)) view.buildContent();
        });
        mark(this, 'data-swipe', this.swipeEnabled && lane.length > 1);
    }

    lazyOf(view: View): boolean {
        return view.lazy ?? this.lazy;
    }

    keepAliveOf(view: View): boolean {
        return view.keepAlive ?? this.keepAlive;
    }

    // The next view that is shown and enabled, around the ends in a loop; -1 when there is none.
    usable(from: number, direction: 1 | -1): number {
        const count = this.views.length;
        for (let step = 1; step <= count; step++) {
            let i = from + direction * step;
            if (this.loop) i = ((i % count) + count) % count;
            else if (i < 0 || i >= count) return -1;
            const view = this.views[i];
            if (view.visible && view.isEnabled) return i;
        }
        return -1;
    }

    async go(to: number, byUser: boolean, event?: Event): Promise<boolean> {
        const from = this.selectedIndex;
        const target = this.views[to];
        if (!target || to === from || !target.visible || !target.isEnabled) return false;
        const args: ViewSelectingEventArgs = { from, to, fromView: this.views[from] ?? null, toView: target, byUser, cancel: false, source: this, event };
        this.selecting.fire(args);
        if (args.cancel) {
            this.slide.layout();
            return false;
        }
        const value = this.valueAt(to);
        this.byUser = byUser;
        this.changeProperty('value', value);
        this.byUser = false;
        // `x-model` takes the view back.
        this.bindings.writeModel(value);
        return true;
    }
}
