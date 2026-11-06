import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, glyphPart, mark, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { SlideTrack } from "../../parts/slide/slide-track";
import type { GalleryItem } from "./gallery-item";
import type { GalleryItemClickEventArgs } from "./gallery-item-click-event-args";
import type { GalleryProps } from "./gallery-props";
import type { SlideChangedEventArgs } from "./slide-changed-event-args";
import type { SlideChangingEventArgs } from "./slide-changing-event-args";

const OWN = ['items', 'value', 'loop', 'showNavButtons', 'showIndicator', 'slideInterval', 'pauseOnHover', 'swipeEnabled', 'itemsPerPage', 'stretchImages', 'height', 'label'] as const;

interface Look {
    item: unknown;
    key: string | null;
    image: string;
    alt: string;
    text: string;
    description: string;
    content: (() => ComponentBase) | null;
}

interface Pane {
    item: unknown;
    pane: Component<HTMLDivElement>;
    figure: Component<HTMLDivElement>;
    image: HTMLImageElement | null;
    content: ComponentBase | null;
    caption: Component<HTMLDivElement>;
    title: Component<HTMLSpanElement>;
    description: Component<HTMLSpanElement>;
}

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
    panes: Pane[] = [];
    dots: HTMLButtonElement[] = [];
    looks: Look[] = [];
    stopItems: (() => void) | null = null;
    previousIndex = -1;
    byUser = false;
    ready = false;
    // The slideshow as the user wants it; `holds` are the reasons it waits for now.
    playing = true;
    holds = new Set<Hold>();
    timer = 0;
    reduced: MediaQueryList | null;

    constructor(props?: IBaseProp<GalleryProps>) {
        super('section', props);
        const own = (this.props ?? {}) as GalleryProps;
        this.element.classList.add('mx-gallery');
        this.element.setAttribute('role', 'region');
        this.element.setAttribute('aria-roledescription', 'carousel');
        // The slideshow button and the dots come first, so the keys reach them before the panes.
        this.bar = part(this, 'div', 'mx-gallery__bar');
        this.playButton = part(this.bar, 'button', 'mx-gallery__play');
        this.playButton.element.type = 'button';
        glyphPart(this.playButton, 'play', 'mx-gallery__play-glyph');
        this.indicator = part(this.bar, 'div', 'mx-gallery__indicator');
        this.indicator.element.setAttribute('role', 'group');
        this.previousButton = this.makeNav('previous');
        this.viewport = part(this, 'div', 'mx-gallery__viewport');
        this.viewport.element.setAttribute('role', 'group');
        this.viewport.element.tabIndex = 0;
        this.list = part(this.viewport, 'div', 'mx-gallery__track');
        this.nextButton = this.makeNav('next');
        this.slide = new SlideTrack(this.viewport.element, this.list.element, {
            count: () => this.looks.length,
            index: () => this.selectedIndex,
            perView: () => this.perView,
            loop: () => this.loop,
            pane: index => this.panes[index]?.pane.element ?? null,
            canDrag: () => this.swipeEnabled && this.isEnabled,
            swipeTo: to => void this.go(to, true),
            dragged: on => {
                mark(this.element, 'data-dragging', on);
                this.hold('drag', on);
            }
        });
        this.reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onSlideChanging) this.onSlideChanging(own.onSlideChanging);
        if (own.onSlideChanged) this.onSlideChanged(own.onSlideChanged);
        if (own.onItemClick) this.onItemClick(own.onItemClick);

        this.observeProperty('items', () => this.renderItems());
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
            css(this.list.element, '--_per', String(this.perView));
            this.drawStates();
            this.slide.layout();
        });
        this.observeProperty<boolean>('stretchImages', on => mark(this.element, 'data-stretch', on === true));
        this.observeProperty<string | number | null>('height', h => css(this.element, 'block-size', typeof h === 'number' ? `${h}px` : h ?? ''));
        for (const name of ['slideInterval', 'pauseOnHover'] as const) this.observeProperty(name, () => this.schedule());
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => {
            this.renderName();
            this.drawStates();
        });
        this.listen();
        this.motif.setDisposable(() => {
            this.stopItems?.();
            this.slide.dispose();
            window.clearTimeout(this.timer);
            this.reduced?.removeEventListener('change', this.schedule);
            document.removeEventListener('visibilitychange', this.schedule);
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
        put(this.element, 'aria-label', this.peekProperty<string>('label') || strings.gallery);
        put(this.viewport.element, 'aria-label', strings.gallerySlides);
        put(this.indicator.element, 'aria-label', strings.galleryChoose);
        put(this.previousButton.element, 'aria-label', strings.galleryPrevious);
        put(this.nextButton.element, 'aria-label', strings.galleryNext);
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
                this.looks = looks;
                this.drawPanes();
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

    // The panes are recreated when the items are others; otherwise written in place.
    drawPanes(): void {
        const stale = this.panes.length !== this.looks.length || this.panes.some((pane, i) => pane.item !== this.looks[i].item);
        if (stale) {
            for (const pane of this.panes) void pane.pane.dispose();
            this.panes = this.looks.map(look => this.makePane(look));
            this.drawDots();
        }
        this.looks.forEach((look, i) => this.writePane(this.panes[i], look));
        this.drawStates();
        this.slide.layout();
        this.schedule();
    }

    makePane(look: Look): Pane {
        const pane = new Component<HTMLDivElement>('div');
        pane.element.className = 'mx-gallery__item';
        pane.element.setAttribute('role', 'group');
        pane.element.setAttribute('aria-roledescription', 'slide');
        this.list.controls.add(pane);
        const figure = part<HTMLDivElement>(pane, 'div', 'mx-gallery__figure');
        let content: ComponentBase | null = null;
        if (look.content) {
            content = look.content();
            figure.controls.add(content);
        }
        const caption = part<HTMLDivElement>(pane, 'div', 'mx-gallery__caption');
        const title = part<HTMLSpanElement>(caption, 'span', 'mx-gallery__title');
        const description = part<HTMLSpanElement>(caption, 'span', 'mx-gallery__description');
        return { item: look.item, pane, figure, image: null, content, caption, title, description };
    }

    writePane(pane: Pane, look: Look): void {
        if (look.image && !pane.image) {
            const image = document.createElement('img');
            image.className = 'mx-gallery__image';
            image.draggable = false;
            image.loading = 'lazy';
            pane.figure.element.prepend(image);
            pane.image = image;
        } else if (!look.image && pane.image) {
            pane.image.remove();
            pane.image = null;
        }
        if (pane.image) {
            if (pane.image.getAttribute('src') !== look.image) pane.image.src = look.image;
            pane.image.alt = look.alt;
        }
        text(pane.title.element, look.text);
        text(pane.description.element, look.description);
        shown(pane.title.element, look.text !== '');
        shown(pane.description.element, look.description !== '');
        shown(pane.caption.element, look.text !== '' || look.description !== '');
    }

    drawDots(): void {
        this.indicator.element.replaceChildren();
        this.dots = this.looks.map((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'mx-gallery__dot';
            dot.addEventListener('click', e => void this.go(index, true, e));
            this.indicator.element.append(dot);
            return dot;
        });
    }

    // What depends on the pane in view: which panes are seen and read, the buttons, the dots, the slideshow.
    drawStates(): void {
        const count = this.looks.length;
        const index = this.selectedIndex;
        const per = this.perView;
        const loop = this.loop;
        const first = this.slide.first(index);
        const strings = uiLocale.strings;
        this.panes.forEach((pane, i) => {
            const inView = i >= first && i < first + per;
            put(pane.pane.element, 'aria-label', uiLocale.text('gallerySlideOf', { index: i + 1, count }));
            put(pane.pane.element, 'aria-hidden', inView ? null : 'true');
            pane.pane.element.inert = !inView;
            mark(pane.pane.element, 'data-current', i === index);
        });
        this.dots.forEach((dot, i) => {
            put(dot, 'aria-label', uiLocale.text('gallerySlideOf', { index: i + 1, count }));
            put(dot, 'aria-current', i === index ? 'true' : null);
            dot.tabIndex = i === index || (index < 0 && i === 0) ? 0 : -1;
        });
        const navs = this.showNavButtons && count > per;
        shown(this.previousButton.element, navs);
        shown(this.nextButton.element, navs);
        put(this.previousButton.element, 'aria-disabled', !loop && index <= 0 ? 'true' : null);
        put(this.nextButton.element, 'aria-disabled', !loop && index >= count - per ? 'true' : null);
        shown(this.indicator.element, this.showIndicator && count > 1);
        shown(this.playButton.element, this.slideInterval > 0 && count > 1);
        shown(this.bar.element, !this.indicator.element.hidden || !this.playButton.element.hidden);
        put(this.playButton.element, 'aria-label', this.playing ? strings.galleryPause : strings.galleryPlay);
        mark(this.element, 'data-playing', this.playing && this.slideInterval > 0);
        mark(this.element, 'data-swipe', this.swipeEnabled && (count > per || loop));
    }

    // The slideshow's next step, when nothing holds it.
    schedule = (): void => {
        window.clearTimeout(this.timer);
        this.timer = 0;
        if (this.isDisposed) return;
        const interval = this.slideInterval;
        const on = this.playing && interval > 0 && this.holds.size === 0 && !this.reduced?.matches && !document.hidden && this.looks.length > 1;
        if (on) this.timer = window.setTimeout(() => void this.go((this.selectedIndex + 1) % this.looks.length, false), interval);
        put(this.viewport.element, 'aria-live', on ? 'off' : 'polite');
        put(this.playButton.element, 'aria-label', this.playing ? uiLocale.strings.galleryPause : uiLocale.strings.galleryPlay);
        mark(this.element, 'data-playing', this.playing && interval > 0);
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
        nav.element.type = 'button';
        put(nav.element, 'data-direction', direction);
        glyphPart(nav, direction === 'previous' ? 'chevron-start' : 'chevron-end', 'mx-gallery__arrow');
        nav.element.addEventListener('click', e => {
            if (nav.element.getAttribute('aria-disabled') === 'true') return;
            void this.go(this.selectedIndex + (direction === 'next' ? 1 : -1), true, e);
        });
        return nav;
    }

    listen(): void {
        const el = this.element;
        this.playButton.element.addEventListener('click', () => (this.playing ? this.pause() : this.play()));
        this.viewport.element.addEventListener('keydown', e => this.keyDown(e, false));
        this.indicator.element.addEventListener('keydown', e => this.keyDown(e, true));
        // A click on a button or a link inside the pane is that control's, not the pane's.
        this.list.element.addEventListener('click', e => {
            const target = e.target as Element;
            const el = target.closest('.mx-gallery__item');
            const index = this.panes.findIndex(pane => pane.pane.element === el);
            if (index < 0) return;
            const control = target.closest('button, a, input, select, textarea, [role="button"], [role="link"]');
            if (control && el!.contains(control)) return;
            this.itemClick.fire({ index, item: this.looks[index].item, source: this, event: e });
        });
        el.addEventListener('pointerenter', e => {
            if (e.pointerType === 'mouse' && this.pauseOnHover) this.hold('hover', true);
        });
        el.addEventListener('pointerleave', () => this.hold('hover', false));
        el.addEventListener('focusin', () => this.hold('focus', true));
        el.addEventListener('focusout', e => {
            if (!el.contains(e.relatedTarget as Node | null)) this.hold('focus', false);
        });
        this.reduced?.addEventListener('change', this.schedule);
        document.addEventListener('visibilitychange', this.schedule);
    }

    // Left and Right (the other way round in a right-to-left page), Home and End; on the dots the keys move focus too.
    keyDown(e: KeyboardEvent, onDots: boolean): void {
        if (e.altKey || e.ctrlKey || e.metaKey || this.looks.length === 0) return;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
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
            if (onDots) this.dots[this.selectedIndex]?.focus();
        });
    }
}
