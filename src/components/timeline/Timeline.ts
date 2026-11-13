import { Component, Emitter, createSignal, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, iconPart, part, removePart } from "../../core/draw-parts";
import { focusOn } from "../../core/focus";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { nextId } from "../../core/next-id";
import { boxOf, isRtl, measure, onLayout, scrollBy, scrollIntoView, type Box } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { kept, mark, put, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import type { TimelineItem, TimelineTone } from "./timeline-item";
import type { TimelineItemClickEventArgs } from "./timeline-item-click-event-args";
import type { TimelineDateFormat, TimelineOrientation, TimelineProps } from "./timeline-props";
import type { TimelineSelectionChangedEventArgs } from "./timeline-selection-changed-event-args";

const OWN = ['items', 'orientation', 'alternate', 'collapsible', 'dateFormat', 'value', 'label'] as const;
const TONES = new Set<TimelineTone>(['default', 'accent', 'success', 'caution', 'danger', 'info']);

interface Look {
    item: unknown;
    key: string | null;
    date: Date | null;
    title: string;
    description: string;
    glyph: string;
    icon: IconSource | null;
    tone: TimelineTone;
    content: (() => ComponentBase) | null;
}

// An event as drawn: its row, dot and texts; the card down the page, or the flag along the line.
interface Entry {
    item: unknown;
    // The way it was made: a card or a flag, pressable or not; made again only when this changes.
    as: TimelineOrientation;
    li: Component<HTMLLIElement>;
    dot: Component<HTMLSpanElement>;
    dotGlyph: Component<HTMLSpanElement>;
    dotIcon: ComponentBase | null;
    face: Component<HTMLElement>;
    // A button: a flag, or a card that folds.
    pressable: boolean;
    // The flag's id, which labels the detail card; a card has none.
    faceId: string | null;
    date: Component<HTMLTimeElement>;
    title: Component<HTMLSpanElement>;
    description: Component<HTMLDivElement> | null;
    content: ComponentBase | null;
}

/**
 * Events in time order, either down the page, each a card next to a line with a dot (with cards on alternating sides
 * with `alternate`, and collapsed until clicked with `collapsible`), or along a line of dates (`horizontal`), where
 * clicking a date or using the arrow keys shows that event's card below the line. Dates use the kit language.
 *
 * @example
 * <Timeline items={[{ date: '2026-03-01', title: 'Kick-off', description: 'The plan agreed' }, { date: '2026-05-14', title: 'Beta', tone: 'accent' }]} />
 * <Timeline orientation="horizontal" items={() => this.milestones} x-model={() => this.shown} />
 */
export class Timeline extends Control<HTMLDivElement, TimelineProps> {
    itemClick = new Emitter<TimelineItemClickEventArgs>();
    selectionChanged = new Emitter<TimelineSelectionChangedEventArgs>();
    track: Component<HTMLDivElement>;
    list: Component<HTMLOListElement>;
    previousButton: Component<HTMLButtonElement>;
    nextButton: Component<HTMLButtonElement>;
    detail: Component<HTMLDivElement>;
    detailId: string;
    detailDate: Component<HTMLTimeElement>;
    detailTitle: Component<HTMLSpanElement>;
    detailDescription: Component<HTMLDivElement>;
    detailContent: Component<HTMLDivElement>;
    entries: Entry[] = [];
    // Bumped when the entries change: the list places their rows, makes none and drops the ones gone.
    placed = createSignal(0);
    looks: Look[] = [];
    expanded = new Set<unknown>();
    stopItems: (() => void) | null = null;
    drawnAs: TimelineOrientation | null = null;
    // The earlier and later buttons at the ends of the track, as `drawNav` drew them.
    previousDisabled = false;
    nextDisabled = false;
    previousIndex = -1;
    byUser = false;
    ready = false;

    constructor(props?: IBaseProp<TimelineProps>) {
        super('div', props);
        const own = (this.props ?? {}) as TimelineProps;
        this.class.add('mx-timeline');
        this.previousButton = this.makeNav('previous');
        this.track = part<HTMLDivElement>(this, 'div', 'mx-timeline__track');
        this.list = part<HTMLOListElement>(this.track, 'ol', 'mx-timeline__list');
        this.list.bindings.list(
            () => {
                void this.placed.value;
                return untracked(() => this.entries.map(entry => entry.li));
            },
            (li: ComponentBase) => li
        );
        this.nextButton = this.makeNav('next');
        this.detail = part<HTMLDivElement>(this, 'div', 'mx-timeline__detail');
        this.detailId = nextId('timeline-detail');
        this.detail.attr.add({ id: this.detailId });
        this.detailDate = part<HTMLTimeElement>(this.detail, 'time', 'mx-timeline__date');
        this.detailTitle = part<HTMLSpanElement>(this.detail, 'span', 'mx-timeline__title');
        this.detailDescription = part<HTMLDivElement>(this.detail, 'div', 'mx-timeline__description');
        this.detailContent = part<HTMLDivElement>(this.detail, 'div', 'mx-timeline__content');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onItemClick) this.onItemClick(own.onItemClick);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty<TimelineOrientation>('orientation', o => {
            put(this, 'data-orientation', o ?? 'vertical');
            this.drawEntries();
        });
        this.observeProperty<boolean>('alternate', on => {
            mark(this, 'data-alternate', on === true);
            this.drawStates();
        });
        this.observeProperty('collapsible', () => this.drawEntries());
        this.observeProperty('dateFormat', () => this.drawTexts());
        this.observeProperty<string | number | null>('value', () => {
            const index = this.selectedIndex;
            this.drawStates();
            if (!this.ready || index === this.previousIndex) return;
            this.selectionChanged.fire({ index, item: this.looks[index]?.item ?? null, previous: this.previousIndex, byUser: this.byUser, source: this });
            this.previousIndex = index;
        });
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => {
            this.renderName();
            this.drawTexts();
        });
        this.list.motif.on('click', (_, e) => this.click(e));
        this.list.motif.on('keydown', (_, e) => this.keyDown(e));
        this.track.motif.on('scroll', () => this.drawNav());
        onLayout(this.track, 'size', () => this.drawNav());
        this.motif.setDisposable(() => {
            this.stopItems?.();
            this.itemClick.dispose();
            this.selectionChanged.dispose();
        });
        this.previousIndex = this.selectedIndex;
        this.ready = true;
    }

    // Properties (see TimelineProps).

    get items(): readonly TimelineItem[] {
        return this.getProperty<readonly TimelineItem[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly TimelineItem[]>) {
        this.assignProperty('items', value);
    }
    get orientation(): TimelineOrientation {
        return this.getProperty<TimelineOrientation | undefined>('orientation') ?? 'vertical';
    }
    set orientation(value: Bind<TimelineOrientation>) {
        this.assignProperty('orientation', value);
    }
    get alternate(): boolean {
        return this.getProperty<boolean | undefined>('alternate') === true;
    }
    set alternate(value: Bind<boolean>) {
        this.assignProperty('alternate', value);
    }
    get collapsible(): boolean {
        return this.getProperty<boolean | undefined>('collapsible') === true;
    }
    set collapsible(value: Bind<boolean>) {
        this.assignProperty('collapsible', value);
    }
    get dateFormat(): TimelineDateFormat {
        return this.getProperty<TimelineDateFormat | undefined>('dateFormat') ?? 'medium';
    }
    set dateFormat(value: Bind<TimelineDateFormat>) {
        this.assignProperty('dateFormat', value);
    }
    get value(): string | number | null {
        const value = this.getProperty<string | number | null | undefined>('value');
        return value === undefined ? 0 : value;
    }
    set value(value: Bind<string | number | null>) {
        this.assignProperty('value', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    /** Occurs when an event's card or date is clicked (`index`, `item`). */
    get onItemClick(): MotifEvent<TimelineItemClickEventArgs> {
        return this.itemClick.event;
    }

    /** In the horizontal layout, occurs when the selected event changes (`index`, `item`, `previous`, `byUser`). */
    get onSelectionChanged(): MotifEvent<TimelineSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }

    /** In the horizontal layout, the index of the selected event, or -1 if there is none. */
    get selectedIndex(): number {
        return this.indexOf(this.peekProperty<string | number | null | undefined>('value'));
    }

    /** The number of events. */
    get count(): number {
        return this.looks.length;
    }

    get horizontal(): boolean {
        return this.orientation === 'horizontal';
    }

    /** In the horizontal layout, shows an event by index or key. In the vertical layout, expands its card. */
    goTo(event: number | string): boolean {
        const index = this.indexOf(event);
        if (index < 0) return false;
        if (this.horizontal) return this.select(index, false);
        this.unfold(index, true);
        return true;
    }

    /** In the vertical layout with `collapsible`, expands or collapses an event's card. */
    unfold(event: number | string, on = true): void {
        const look = this.looks[this.indexOf(event)];
        if (!look) return;
        if (on) this.expanded.add(look.item);
        else this.expanded.delete(look.item);
        this.drawStates();
    }

    /** Indicates whether an event's card is expanded. */
    isUnfolded(event: number | string): boolean {
        const look = this.looks[this.indexOf(event)];
        return !!look && this.expanded.has(look.item);
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

    valueAt(index: number): string | number {
        return this.looks[index]?.key ?? index;
    }

    /** Formats a date in the kit language, using `dateFormat`. */
    formatDate(date: Date | null): string {
        if (!date || Number.isNaN(date.getTime())) return '';
        const format = this.dateFormat;
        const options: Intl.DateTimeFormatOptions = typeof format === 'string' ? { dateStyle: format } : format;
        try {
            return new Intl.DateTimeFormat(uiLocale.locale, options).format(date);
        } catch {
            return date.toLocaleDateString();
        }
    }

    renderName(): void {
        put(this.list, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.timeline);
        put(this.previousButton, 'aria-label', uiLocale.strings.timelineEarlier);
        put(this.nextButton, 'aria-label', uiLocale.strings.timelineLater);
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
                this.drawEntries();
            }
        );
    }

    lookOf(item: unknown): Look {
        if (typeof item !== 'object' || item === null) {
            return { item, key: null, date: null, title: String(item ?? ''), description: '', glyph: '', icon: null, tone: 'default', content: null };
        }
        const when = givenField<Date | string | number | undefined>(item, 'date');
        const tone = givenField<TimelineTone | undefined>(item, 'tone');
        return {
            item,
            key: givenField<string | undefined>(item, 'key') ?? null,
            date: when === undefined || when === null ? null : when instanceof Date ? when : new Date(when),
            title: String(givenField(item, 'title') ?? ''),
            description: String(givenField(item, 'description') ?? ''),
            glyph: String(givenField(item, 'glyph') ?? ''),
            icon: givenValue<IconSource | undefined>(item, 'icon') ?? null,
            tone: tone && TONES.has(tone) ? tone : 'default',
            content: givenValue<(() => ComponentBase) | undefined>(item, 'content') ?? null
        };
    }

    // An event keeps its row while it stays: a row is made for an event that comes, and again only when the timeline
    // turned or became collapsible (a card and a flag are other parts); the list drops the rows of the events gone.
    drawEntries(): void {
        const as = this.orientation;
        const pressable = this.pressable();
        const pool = new Map<unknown, Entry[]>();
        for (const entry of this.entries) {
            const same = pool.get(entry.item);
            if (same) same.push(entry);
            else pool.set(entry.item, [entry]);
        }
        const next = this.looks.map(look => {
            const old = pool.get(look.item)?.shift();
            return old && old.as === as && old.pressable === pressable ? old : this.makeEntry(look, as);
        });
        const changed = next.length !== this.entries.length || next.some((entry, i) => entry !== this.entries[i]);
        this.entries = next;
        if (changed) untracked(() => this.placed.value++);
        if (this.drawnAs !== as) {
            this.drawnAs = as;
            put(this.list, 'role', as === 'horizontal' ? 'tablist' : 'list');
        }
        this.drawTexts();
    }

    // Vertical cards are buttons when they fold; flags always are.
    pressable(): boolean {
        return this.horizontal || this.collapsible;
    }

    makeEntry(look: Look, as: TimelineOrientation): Entry {
        const li = new Component<HTMLLIElement>('li');
        li.class.add('mx-timeline__item');
        const horizontal = as === 'horizontal';
        const pressable = this.pressable();
        const face = part<HTMLElement>(li, pressable ? 'button' : 'div', horizontal ? 'mx-timeline__flag' : 'mx-timeline__card');
        if (pressable) face.attr.add({ type: 'button' });
        const dot = part<HTMLSpanElement>(horizontal ? face : li, 'span', 'mx-timeline__dot');
        dot.attr.add({ 'aria-hidden': 'true' });
        const dotGlyph = glyphPart(dot, look.glyph || 'clock', 'mx-timeline__dot-glyph');
        let dotIcon: ComponentBase | null = null;
        if (look.icon) {
            dotIcon = iconPart(dot, look.icon);
            dotIcon.class.add('mx-timeline__dot-icon');
        }
        const date = part<HTMLTimeElement>(face, 'time', 'mx-timeline__date');
        const title = part<HTMLSpanElement>(face, 'span', 'mx-timeline__title');
        let description: Component<HTMLDivElement> | null = null;
        let content: ComponentBase | null = null;
        let faceId: string | null = null;
        if (horizontal) {
            li.attr.add({ role: 'presentation' });
            faceId = nextId('timeline-flag');
            face.attr.add({ role: 'tab', id: faceId, 'aria-controls': this.detailId });
            put(face, 'tabindex', '-1');
            if (look.content) {
                const own = look.content();
                content = own;
                this.detailContent.controls.add(own);
                // The flag's content stands in the detail card: it goes with the flag.
                li.motif.setDisposable(() => {
                    if (!this.isDisposed && own.parent === this.detailContent) removePart(own);
                });
            }
        } else {
            description = part<HTMLDivElement>(face, 'div', 'mx-timeline__description');
            const textId = nextId('timeline-text');
            description.attr.add({ id: textId });
            if (pressable) face.attr.add({ 'aria-controls': textId });
            const host = part<HTMLDivElement>(face, 'div', 'mx-timeline__content');
            if (look.content) {
                content = look.content();
                host.controls.add(content);
            }
        }
        return { item: look.item, as, li, dot, dotGlyph, dotIcon, face, pressable, faceId, date, title, description, content };
    }

    // The texts of every event, in the language and the date format of now.
    drawTexts(): void {
        this.looks.forEach((look, i) => {
            const entry = this.entries[i];
            if (!entry) return;
            const when = this.formatDate(look.date);
            text(entry.date, when);
            put(entry.date, 'datetime', look.date && !Number.isNaN(look.date.getTime()) ? look.date.toISOString() : null);
            kept(entry.date, when !== '');
            text(entry.title, look.title);
            put(entry.dotGlyph, 'data-icon', look.glyph || 'clock');
            kept(entry.dotGlyph, !look.icon && look.glyph !== '');
            put(entry.li, 'data-tone', look.tone);
            put(entry.dot, 'data-tone', look.tone);
            if (entry.description) {
                text(entry.description, look.description);
            }
        });
        this.drawStates();
    }

    // What depends on the selection, the folds and the sides.
    drawStates(): void {
        const horizontal = this.horizontal;
        const index = this.selectedIndex;
        const alternate = this.alternate;
        const collapsible = this.collapsible;
        this.looks.forEach((look, i) => {
            const entry = this.entries[i];
            if (!entry) return;
            if (horizontal) {
                const on = i === index;
                put(entry.face, 'aria-selected', on ? 'true' : 'false');
                put(entry.face, 'tabindex', on || (index < 0 && i === 0) ? '0' : '-1');
                mark(entry.li, 'data-selected', on);
                if (entry.content) kept(entry.content, on);
            } else {
                put(entry.li, 'data-side', alternate ? (i % 2 === 0 ? 'end' : 'start') : 'end');
                const open = !collapsible || this.expanded.has(look.item);
                if (entry.description) kept(entry.description, open && look.description !== '');
                if (entry.pressable) put(entry.face, 'aria-expanded', open ? 'true' : 'false');
                mark(entry.li, 'data-expanded', collapsible && open);
            }
        });
        kept(this.detail, horizontal && index >= 0);
        kept(this.previousButton, horizontal && this.looks.length > 0);
        kept(this.nextButton, horizontal && this.looks.length > 0);
        if (horizontal) this.drawDetail(index);
        this.drawNav();
    }

    drawDetail(index: number): void {
        const look = this.looks[index];
        const entry = this.entries[index];
        if (!look || !entry) return;
        put(this.detail, 'role', 'tabpanel');
        put(this.detail, 'aria-labelledby', entry.faceId);
        const when = this.formatDate(look.date);
        text(this.detailDate, when);
        put(this.detailDate, 'datetime', look.date && !Number.isNaN(look.date.getTime()) ? look.date.toISOString() : null);
        kept(this.detailDate, when !== '');
        text(this.detailTitle, look.title);
        text(this.detailDescription, look.description);
        kept(this.detailDescription, look.description !== '');
        kept(this.detailContent, !!look.content);
    }

    // The earlier and later buttons: disabled at the ends of the track, as read in the next frame.
    drawNav(): void {
        if (this.horizontal) measure(this, this.readTrack, this.writeNav);
    }

    readTrack = (): Box => boxOf(this.track);

    writeNav = (track: Box): void => {
        if (!this.horizontal) return;
        this.previousDisabled = track.scrollStart <= 1;
        this.nextDisabled = track.scrollStart >= track.scrollWidth - track.clientWidth - 1;
        put(this.previousButton, 'aria-disabled', this.previousDisabled ? 'true' : null);
        put(this.nextButton, 'aria-disabled', this.nextDisabled ? 'true' : null);
    };

    makeNav(direction: 'previous' | 'next'): Component<HTMLButtonElement> {
        const nav = part<HTMLButtonElement>(this, 'button', 'mx-timeline__nav');
        nav.attr.add({ type: 'button' });
        put(nav, 'data-direction', direction);
        glyphPart(nav, direction === 'previous' ? 'chevron-start' : 'chevron-end', 'mx-timeline__nav-glyph');
        nav.motif.on('click', () => {
            if (direction === 'previous' ? this.previousDisabled : this.nextDisabled) return;
            const by = Math.max(80, boxOf(this.track).clientWidth * 0.6) * (direction === 'next' ? 1 : -1);
            scrollBy(this.track, { start: by }, 'smooth');
        });
        return nav;
    }

    select(index: number, byUser: boolean, event?: Event): boolean {
        const from = this.selectedIndex;
        if (index < 0 || index >= this.looks.length) return false;
        if (index !== from) {
            const value = this.valueAt(index);
            this.byUser = byUser;
            this.changeProperty('value', value);
            this.byUser = false;
            // `x-model` takes the event back.
            this.bindings.writeModel(value);
        }
        const flag = this.entries[index]?.face;
        if (flag && byUser) {
            focusOn(flag, { preventScroll: true });
            scrollIntoView(flag, { block: 'nearest', inline: 'nearest', motion: 'smooth' });
        }
        void event;
        return true;
    }

    // Whether an event started on a flag or a card of a timeline inside `root`. The walk goes on into a timeline too:
    // across, what its events hold lies below the line, outside its flags.
    onInnerFace(root: ComponentBase, e: Event): boolean {
        return root.controls.items.some(child => {
            if (!child.motif.isEventFrom(e)) return false;
            if (child instanceof Timeline && child.entries.some(entry => entry.face.motif.isEventFrom(e))) return true;
            return this.onInnerFace(child, e);
        });
    }

    click(e: MouseEvent): void {
        const index = this.entries.findIndex(entry => entry.face.motif.isEventFrom(e));
        if (index < 0) return;
        // A flag or a card of a timeline inside this card is that timeline's.
        if (this.onInnerFace(this.entries[index].face, e)) return;
        const look = this.looks[index];
        if (this.horizontal) this.select(index, true, e);
        else if (this.collapsible) this.unfold(index, !this.expanded.has(look.item));
        this.itemClick.fire({ index, item: look.item, source: this, event: e });
    }

    // Horizontal: the arrow keys move along the dates and show the event; Home and End go to the ends.
    keyDown(e: KeyboardEvent): void {
        if (!this.horizontal || e.altKey || e.ctrlKey || e.metaKey) return;
        const from = this.entries.findIndex(entry => entry.face.motif.isEventFrom(e));
        if (from < 0) return;
        const rtl = isRtl(this);
        const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        let to = -1;
        if (e.key === forward) to = Math.min(from + 1, this.looks.length - 1);
        else if (e.key === back) to = Math.max(from - 1, 0);
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = this.looks.length - 1;
        else return;
        e.preventDefault();
        this.select(to, true, e);
    }
}
