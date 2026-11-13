import { Emitter, createSignal, untracked, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, loose, part } from "../../core/draw-parts";
import { canTakeFocus, focusGoesInto, focusOn } from "../../core/focus";
import { onDocument } from "../../core/window-events";
import { follow } from "../../core/follow";
import { isRtl, mediaOf, onMedia } from "../../core/measure";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { onLanguage } from "../../core/on-language";
import { css, kept, mark, put, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { SlideTrack } from "../../parts/slide/slide-track";
import type { GalleryItem } from "./gallery-item";
import type { GalleryItemClickEventArgs } from "./gallery-item-click-event-args";
import type { GalleryProps } from "./gallery-props";
import type { SlideChangedEventArgs } from "./slide-changed-event-args";
import type { SlideChangingEventArgs } from "./slide-changing-event-args";

const OWN = ['items', 'value', 'loop', 'showNavButtons', 'showIndicator', 'slideInterval', 'pauseOnHover', 'swipeEnabled', 'itemsPerPage', 'stretchImages', 'height', 'label'] as const;
const REDUCED = '(prefers-reduced-motion: reduce)';

interface Look {
    item: unknown;
    key: string | null;
    image: string;
    alt: string;
    text: string;
    description: string;
    content: (() => ComponentBase) | null;
}

/** A slide's place: the same while its item is given (an item given twice has two). */
interface Entry {
    item: unknown;
    pane: Component<HTMLDivElement> | null;
}

/** A dot's place: the same while there is a slide at its index. */
interface DotSlot {
    index: number;
    dot: Component<HTMLButtonElement> | null;
}

const IMAGE = Symbol('mx.gallery.image');

type Hold = 'hover' | 'focus' | 'drag';

/**
 * Slides side by side, with one in view (or several), moved by the buttons at the sides, the dots below them, a swipe
 * or the arrow keys. With `slideInterval`, it runs as a slideshow that pauses on hover and while focus is
 * inside. A slide is an image with a caption, or any content. The current slide is `value`, identified by its `key`
 * or index, and `x-model` provides two-way binding.
 *
 * @example
 * <Gallery items={['/photos/1.jpg', '/photos/2.jpg']} loop slideInterval={4000} height={320} />
 * <Gallery items={[{ image: '/a.jpg', text: 'Harbour', description: 'Early morning' }]} x-model={() => this.shown} />
 */
export class Gallery extends Control<HTMLElement, GalleryProps> {
    changing = new Emitter<SlideChangingEventArgs>();
    changed = new Emitter<SlideChangedEventArgs>();
    itemClick = new Emitter<GalleryItemClickEventArgs>();
    bar: Component<HTMLDivElement>;
    indicator: Component<HTMLDivElement>;
    playButton: Component<HTMLButtonElement>;
    previousButton: Component<HTMLButtonElement>;
    nextButton: Component<HTMLButtonElement>;
    viewport: Component<HTMLDivElement>;
    list: Component<HTMLDivElement>;
    slide: SlideTrack;
    /** The slides, in item order. */
    entries: Entry[] = [];
    /** The dots by index. */
    dotSlots: DotSlot[] = [];
    stopVisibility: (() => void) | null = null;
    /** What the items say, in order. */
    looksNow = createSignal<Look[]>([]);
    /** Counted up by `refresh()` and a new language: what the slides say is read again. */
    revision = createSignal(0);
    stopItems: (() => void) | null = null;
    previousIndex = -1;
    byUser = false;
    ready = false;
    // The slideshow as the user wants it; `holds` are the reasons it waits for now.
    playing = true;
    holds = new Set<Hold>();
    timer = 0;
    stopReduced: (() => void) | null = null;

    constructor(props?: IBaseProp<GalleryProps>) {
        super('section', props);
        const own = (this.props ?? {}) as GalleryProps;
        this.class.add('mx-gallery');
        this.attr.add({ role: 'region', 'aria-roledescription': 'carousel' });
        // The slideshow button and the dots come first, so the keys reach them before the panes.
        this.bar = part(this, 'div', 'mx-gallery__bar');
        this.playButton = part(this.bar, 'button', 'mx-gallery__play');
        this.playButton.attr.add({ type: 'button' });
        glyphPart(this.playButton, 'play', 'mx-gallery__play-glyph');
        this.indicator = part(this.bar, 'div', 'mx-gallery__indicator');
        this.indicator.attr.add({ role: 'group' });
        this.previousButton = this.makeNav('previous');
        this.viewport = part(this, 'div', 'mx-gallery__viewport');
        this.viewport.attr.add({ role: 'group' });
        put(this.viewport, 'tabindex', '0');
        this.list = part(this.viewport, 'div', 'mx-gallery__track');
        this.nextButton = this.makeNav('next');
        this.slide = new SlideTrack(this.viewport, this.list, {
            count: () => this.looks.length,
            index: () => this.selectedIndex,
            perView: () => this.perView,
            loop: () => this.loop,
            panePart: index => this.entries[index]?.pane ?? null,
            canDrag: () => this.swipeEnabled && this.isEnabled,
            swipeTo: to => void this.go(to, true),
            dragged: on => {
                mark(this, 'data-dragging', on);
                this.hold('drag', on);
            }
        });
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onSlideChanging) this.onSlideChanging(own.onSlideChanging);
        if (own.onSlideChanged) this.onSlideChanged(own.onSlideChanged);
        if (own.onItemClick) this.onItemClick(own.onItemClick);

        this.observeProperty('items', () => this.renderItems());
        // Built once: a slide stays while its item is given, a dot while there is a slide at its index; a changed item
        // or value changes only what shows it.
        this.list.bindings.list(
            () => {
                void this.looks;
                return this.entries;
            },
            (entry: Entry) => this.makePane(entry)
        );
        this.indicator.bindings.list(() => this.dotSlots.slice(0, this.looks.length), (slot: DotSlot) => this.makeDot(slot));
        this.observeProperty<number | string | null>('value', () => {
            const index = this.selectedIndex;
            this.drawStates();
            if (!this.ready || index === this.previousIndex) return;
            this.slide.slide(this.previousIndex, index);
            this.changed.fire({ index, item: this.looks[index]?.item ?? null, previous: this.previousIndex, byUser: this.byUser, source: this });
            this.previousIndex = index;
            this.schedule();
        });
        for (const name of ['loop', 'showNavButtons', 'showIndicator', 'swipeEnabled'] as const) this.observeProperty(name, () => this.drawStates());
        this.observeProperty('itemsPerPage', () => {
            css(this.list, '--_per', String(this.perView));
            this.drawStates();
            this.slide.layout();
        });
        this.observeProperty<boolean>('stretchImages', on => mark(this, 'data-stretch', on === true));
        this.observeProperty<string | number | null>('height', h => css(this, 'block-size', typeof h === 'number' ? `${h}px` : h ?? ''));
        for (const name of ['slideInterval', 'pauseOnHover'] as const) this.observeProperty(name, () => this.schedule());
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => {
            this.renderName();
            this.drawStates();
            this.revision.value = this.revision.peek() + 1;
        });
        this.listen();
        this.motif.setDisposable(() => {
            this.stopItems?.();
            this.slide.dispose();
            window.clearTimeout(this.timer);
            this.stopReduced?.();
            this.stopVisibility?.();
            this.changing.dispose();
            this.changed.dispose();
            this.itemClick.dispose();
        });
        this.previousIndex = this.selectedIndex;
        this.ready = true;
        this.schedule();
    }

    // Properties (see GalleryProps).

    get items(): readonly (GalleryItem | string)[] {
        return this.getProperty<readonly (GalleryItem | string)[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly (GalleryItem | string)[]>) {
        this.assignProperty('items', value);
    }
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
    get showNavButtons(): boolean {
        return this.getProperty<boolean | undefined>('showNavButtons') !== false;
    }
    set showNavButtons(value: Bind<boolean>) {
        this.assignProperty('showNavButtons', value);
    }
    get showIndicator(): boolean {
        return this.getProperty<boolean | undefined>('showIndicator') !== false;
    }
    set showIndicator(value: Bind<boolean>) {
        this.assignProperty('showIndicator', value);
    }
    get slideInterval(): number {
        return Math.max(0, this.getProperty<number | undefined>('slideInterval') ?? 0);
    }
    set slideInterval(value: Bind<number>) {
        this.assignProperty('slideInterval', value);
    }
    get pauseOnHover(): boolean {
        return this.getProperty<boolean | undefined>('pauseOnHover') !== false;
    }
    set pauseOnHover(value: Bind<boolean>) {
        this.assignProperty('pauseOnHover', value);
    }
    get swipeEnabled(): boolean {
        return this.getProperty<boolean | undefined>('swipeEnabled') !== false;
    }
    set swipeEnabled(value: Bind<boolean>) {
        this.assignProperty('swipeEnabled', value);
    }
    get itemsPerPage(): number {
        return this.perView;
    }
    set itemsPerPage(value: Bind<number>) {
        this.assignProperty('itemsPerPage', value);
    }
    get stretchImages(): boolean {
        return this.getProperty<boolean | undefined>('stretchImages') === true;
    }
    set stretchImages(value: Bind<boolean>) {
        this.assignProperty('stretchImages', value);
    }
    get height(): string | number | null {
        return this.getProperty<string | number | null | undefined>('height') ?? null;
    }
    set height(value: Bind<string | number | null>) {
        this.assignProperty('height', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    /** Occurs before the current slide changes (`from`, `to`, `byUser`). Set `cancel` to keep the current slide. */
    get onSlideChanging(): MotifEvent<SlideChangingEventArgs> {
        return this.changing.event;
    }

    /** Occurs after the current slide changes, by the user, programmatically or by the slideshow (`byUser`). */
    get onSlideChanged(): MotifEvent<SlideChangedEventArgs> {
        return this.changed.event;
    }

    /** Occurs when a slide is clicked without dragging. */
    get onItemClick(): MotifEvent<GalleryItemClickEventArgs> {
        return this.itemClick.event;
    }

    /** What the items say, in order; followed where it is read in a binding. */
    get looks(): Look[] {
        return this.looksNow.value;
    }

    /** The index of the current slide, or -1 if there is none. */
    get selectedIndex(): number {
        return this.indexOf(this.peekProperty<string | number | null | undefined>('value'));
    }

    /** The number of slides. */
    get count(): number {
        return this.looks.length;
    }

    /**
     * Indicates that the slideshow is running: it is not paused, and nothing is holding it (the pointer, focus, a drag,
     * reduced motion).
     */
    get isPlaying(): boolean {
        return this.timer !== 0;
    }

    /** The number of slides side by side, at least one. */
    get perView(): number {
        return Math.max(1, Math.floor(this.getProperty<number | undefined>('itemsPerPage') ?? 1));
    }

    /** Moves to the next slide. Returns `false` at the end without `loop`, or if the change was canceled. */
    next(): Promise<boolean> {
        return this.go(this.selectedIndex + 1, false);
    }

    /** Moves to the previous slide. */
    previous(): Promise<boolean> {
        return this.go(this.selectedIndex - 1, false);
    }

    /** Moves to a slide by index or key. `onSlideChanging` is raised first. */
    goTo(pane: number | string): Promise<boolean> {
        return this.go(this.indexOf(pane), false);
    }

    /** Starts the slideshow again after `pause()`. `slideInterval` sets its speed. */
    play(): void {
        this.playing = true;
        this.schedule();
    }

    /** Stops the slideshow until `play()` is called. */
    pause(): void {
        this.playing = false;
        this.schedule();
    }

    /** Re-reads the items after they have been changed in place. */
    refresh(): void {
        this.renderItems();
        this.revision.value = this.revision.peek() + 1;
    }

    /** Returns the index that a value identifies: a key, otherwise an index in range, or -1 if there is none. */
    indexOf(value: string | number | null | undefined): number {
        if (value === undefined) return this.looks.length ? 0 : -1;
        if (value === null) return -1;
        if (typeof value === 'string') return this.looks.findIndex(look => look.key === value);
        return Number.isInteger(value) && value >= 0 && value < this.looks.length ? value : -1;
    }

    /** Returns the value that identifies the slide at `index`: its key if it has one, otherwise the index. */
    valueAt(index: number): string | number {
        return this.looks[index]?.key ?? index;
    }

    renderName(): void {
        const strings = uiLocale.strings;
        put(this, 'aria-label', this.peekProperty<string>('label') || strings.gallery);
        put(this.viewport, 'aria-label', strings.gallerySlides);
        put(this.indicator, 'aria-label', strings.galleryChoose);
        put(this.previousButton, 'aria-label', strings.galleryPrevious);
        put(this.nextButton, 'aria-label', strings.galleryNext);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('items'));
        // The items' own functions are tracked; the list and the drawing are not.
        this.stopItems = follow(
            this,
            'items',
            () => items.map(item => this.lookOf(item)),
            looks => {
                // A slide stays with its item: the same entry while the item is given.
                const old = new Map<unknown, Entry[]>();
                for (const entry of this.entries) {
                    const same = old.get(entry.item);
                    if (same) same.push(entry);
                    else old.set(entry.item, [entry]);
                }
                this.entries = looks.map(look => old.get(look.item)?.shift() ?? { item: look.item, pane: null });
                for (let index = this.dotSlots.length; index < looks.length; index++) this.dotSlots.push({ index, dot: null });
                this.looksNow.value = looks;
                this.drawStates();
                this.slide.layout();
                this.schedule();
            }
        );
    }

    lookOf(item: unknown): Look {
        if (typeof item !== 'object' || item === null) {
            return { item, key: null, image: String(item ?? ''), alt: '', text: '', description: '', content: null };
        }
        return {
            item,
            key: givenField<string | undefined>(item, 'key') ?? null,
            image: String(givenField(item, 'image') ?? ''),
            alt: String(givenField(item, 'alt') ?? ''),
            text: String(givenField(item, 'text') ?? ''),
            description: String(givenField(item, 'description') ?? ''),
            content: givenValue<(() => ComponentBase) | undefined>(item, 'content') ?? null
        };
    }

    /** A slide, built once: its content is made once, and what its item says or where the gallery is changes only what shows it. */
    makePane(entry: Entry): Component<HTMLDivElement> {
        const pane = loose<HTMLDivElement>('div', 'mx-gallery__item');
        pane.attr.add({ role: 'group', 'aria-roledescription': 'slide' });
        entry.pane = pane;
        pane.motif.setDisposable(() => {
            if (entry.pane === pane) entry.pane = null;
        });
        const figure = part<HTMLDivElement>(pane, 'div', 'mx-gallery__figure');
        // First in the figure, before a content given.
        figure.bindings.list(() => (this.lookOf(entry.item).image ? [IMAGE] : []), () => this.makeImage(entry));
        const content = untracked(() => this.lookOf(entry.item).content);
        if (content) figure.controls.add(untracked(content));
        const caption = part<HTMLDivElement>(pane, 'div', 'mx-gallery__caption');
        const title = part<HTMLSpanElement>(caption, 'span', 'mx-gallery__title');
        const description = part<HTMLSpanElement>(caption, 'span', 'mx-gallery__description');
        pane.bindings.watch(() => {
            void this.revision.value;
            const look = this.lookOf(entry.item);
            untracked(() => {
                text(title, look.text);
                text(description, look.description);
                kept(title, look.text !== '');
                kept(description, look.description !== '');
                kept(caption, look.text !== '' || look.description !== '');
            });
        });
        // Which slides are seen and read: the slides, the current one and the options that change how many are in view.
        pane.bindings.watch(() => {
            const count = this.looks.length;
            void [this.getProperty('value'), this.getProperty('itemsPerPage'), this.getProperty('loop'), this.revision.value];
            untracked(() => {
                const at = this.entries.indexOf(entry);
                const index = this.selectedIndex;
                const first = this.slide.first(index);
                const inView = at >= first && at < first + this.perView;
                put(pane, 'aria-label', uiLocale.text('gallerySlideOf', { index: at + 1, count }));
                put(pane, 'aria-hidden', inView ? null : 'true');
                mark(pane, 'inert', !inView);
                mark(pane, 'data-current', at === index);
            });
        });
        return pane;
    }

    makeImage(entry: Entry): Component<HTMLImageElement> {
        const image = loose<HTMLImageElement>('img', 'mx-gallery__image');
        image.attr.add({ draggable: 'false', loading: 'lazy' });
        image.bindings.watch(() => {
            void this.revision.value;
            const look = this.lookOf(entry.item);
            untracked(() => {
                put(image, 'src', look.image);
                if (image.attr.get('alt') !== look.alt) image.attr.add({ alt: look.alt });
            });
        });
        return image;
    }

    /** A dot, built once: it follows the number of slides and the current one. */
    makeDot(slot: DotSlot): Component<HTMLButtonElement> {
        const dot = loose<HTMLButtonElement>('button', 'mx-gallery__dot');
        dot.attr.add({ type: 'button' });
        dot.motif.on('click', (_, e) => void this.go(slot.index, true, e));
        slot.dot = dot;
        dot.motif.setDisposable(() => {
            if (slot.dot === dot) slot.dot = null;
        });
        dot.bindings.watch(() => {
            const count = this.looks.length;
            void [this.getProperty('value'), this.revision.value];
            untracked(() => {
                const i = slot.index;
                const index = this.selectedIndex;
                put(dot, 'aria-label', uiLocale.text('gallerySlideOf', { index: i + 1, count }));
                put(dot, 'aria-current', i === index ? 'true' : null);
                put(dot, 'tabindex', i === index || (index < 0 && i === 0) ? '0' : '-1');
            });
        });
        return dot;
    }

    // What depends on the pane in view outside the slides: the buttons, the dots' bar, the slideshow.
    drawStates(): void {
        const count = this.looks.length;
        const per = this.perView;
        const loop = this.loop;
        const strings = uiLocale.strings;
        const navs = this.showNavButtons && count > per;
        kept(this.previousButton, navs);
        kept(this.nextButton, navs);
        put(this.previousButton, 'aria-disabled', this.atEnd('previous') ? 'true' : null);
        put(this.nextButton, 'aria-disabled', this.atEnd('next') ? 'true' : null);
        const dots = this.showIndicator && count > 1;
        const play = this.slideInterval > 0 && count > 1;
        kept(this.indicator, dots);
        kept(this.playButton, play);
        kept(this.bar, dots || play);
        put(this.playButton, 'aria-label', this.playing ? strings.galleryPause : strings.galleryPlay);
        mark(this, 'data-playing', this.playing && this.slideInterval > 0);
        mark(this, 'data-swipe', this.swipeEnabled && (count > per || loop));
    }

    // The slideshow's next step, when nothing holds it.
    schedule = (): void => {
        window.clearTimeout(this.timer);
        this.timer = 0;
        if (this.isDisposed) return;
        const interval = this.slideInterval;
        const on = this.playing && interval > 0 && this.holds.size === 0 && !mediaOf(this, REDUCED) && !document.hidden && this.looks.length > 1;
        if (on) this.timer = window.setTimeout(() => void this.go((this.selectedIndex + 1) % this.looks.length, false), interval);
        put(this.viewport, 'aria-live', on ? 'off' : 'polite');
        put(this.playButton, 'aria-label', this.playing ? uiLocale.strings.galleryPause : uiLocale.strings.galleryPlay);
        mark(this, 'data-playing', this.playing && interval > 0);
    };

    hold(reason: Hold, on: boolean): void {
        if (on) this.holds.add(reason);
        else this.holds.delete(reason);
        this.schedule();
    }

    async go(to: number, byUser: boolean, event?: Event): Promise<boolean> {
        const count = this.looks.length;
        if (count === 0) return false;
        if (this.loop) to = ((to % count) + count) % count;
        else to = Math.max(0, Math.min(to, Math.max(0, count - this.perView)));
        const from = this.selectedIndex;
        if (to === from) return false;
        const args: SlideChangingEventArgs = { from, to, fromItem: this.looks[from]?.item ?? null, toItem: this.looks[to].item, byUser, cancel: false, source: this, event };
        this.changing.fire(args);
        if (args.cancel) {
            this.slide.layout();
            return false;
        }
        const value = this.valueAt(to);
        this.byUser = byUser;
        this.changeProperty('value', value);
        this.byUser = false;
        // `x-model` takes the pane back.
        this.bindings.writeModel(value);
        return true;
    }

    makeNav(direction: 'previous' | 'next'): Component<HTMLButtonElement> {
        const nav = part<HTMLButtonElement>(this, 'button', 'mx-gallery__nav');
        nav.attr.add({ type: 'button' });
        put(nav, 'data-direction', direction);
        glyphPart(nav, direction === 'previous' ? 'chevron-start' : 'chevron-end', 'mx-gallery__arrow');
        nav.motif.on('click', (_, e) => {
            if (this.atEnd(direction)) return;
            void this.go(this.selectedIndex + (direction === 'next' ? 1 : -1), true, e);
        });
        return nav;
    }

    /** Whether a side button has nowhere to go: the first or the last pane is in view, and `loop` is off. */
    atEnd(direction: 'previous' | 'next'): boolean {
        if (this.loop) return false;
        const index = this.selectedIndex;
        return direction === 'previous' ? index <= 0 : index >= this.looks.length - this.perView;
    }

    listen(): void {
        this.playButton.motif.on('click', () => (this.playing ? this.pause() : this.play()));
        this.viewport.motif.on('keydown', (_, e) => this.keyDown(e, false));
        this.indicator.motif.on('keydown', (_, e) => this.keyDown(e, true));
        // A click on a control inside the pane (a button, a link, a field) is that control's, not the pane's.
        this.list.motif.on('click', (_, e) => {
            const index = this.entries.findIndex(entry => entry.pane?.motif.isEventFrom(e));
            const pane = this.entries[index]?.pane;
            if (!pane || this.fromFocusable(e, pane)) return;
            this.itemClick.fire({ index, item: this.looks[index].item, source: this, event: e });
        });
        this.motif.on('pointerenter', (_, e) => {
            if (e.pointerType === 'mouse' && this.pauseOnHover) this.hold('hover', true);
        });
        this.motif.on('pointerleave', () => this.hold('hover', false));
        this.motif.on('focusin', () => this.hold('focus', true));
        // Focus that leaves (for the page, another window or nowhere) lets the slideshow go on; a move inside keeps it waiting.
        this.motif.on('focusout', (_, e) => {
            if (!focusGoesInto(this, e)) this.hold('focus', false);
        });
        this.stopReduced = onMedia(this, REDUCED, this.schedule);
        // A hidden page plays nothing.
        this.stopVisibility = onDocument(this, 'visibilitychange', this.schedule);
    }

    /** Whether an event came from something inside `from` that takes focus: a button, a link, a field. */
    fromFocusable(e: Event, from: ComponentBase): boolean {
        const inside = from.controls.items.find(c => c.motif.isEventFrom(e));
        return !!inside && (canTakeFocus(inside) || this.fromFocusable(e, inside));
    }

    // Left and Right (the other way round in a right-to-left page), Home and End; on the dots the keys move focus too.
    keyDown(e: KeyboardEvent, onDots: boolean): void {
        if (e.altKey || e.ctrlKey || e.metaKey || this.looks.length === 0) return;
        const rtl = isRtl(this);
        const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        const index = Math.max(0, this.selectedIndex);
        let to: number | undefined;
        if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = this.looks.length - 1;
        else if (e.key === forward) to = index + 1;
        else if (e.key === back) to = index - 1;
        if (to === undefined) return;
        e.preventDefault();
        void this.go(to, true, e).then(() => {
            if (!onDots) return;
            const dot = this.dotSlots[this.selectedIndex]?.dot;
            if (dot) focusOn(dot);
        });
    }
}
