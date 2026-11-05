import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, iconPart, mark, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
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
    li: Component<HTMLLIElement>;
    dot: Component<HTMLSpanElement>;
    dotGlyph: Component<HTMLSpanElement>;
    dotIcon: ComponentBase | null;
    face: Component<HTMLElement>;
    date: Component<HTMLTimeElement>;
    title: Component<HTMLSpanElement>;
    description: Component<HTMLDivElement> | null;
    content: ComponentBase | null;
}

/**
 * Events in time order: down the page, each a card beside a line with a dot (the cards taking turns on either side
 * when `alternate`, folded until pressed when `collapsible`); or along a line of dates (`horizontal`), where a
 * press on a date, or the arrow keys, shows that event's card under the line. The dates are written in the kit's
 * language.
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
    detailDate: Component<HTMLTimeElement>;
    detailTitle: Component<HTMLSpanElement>;
    detailDescription: Component<HTMLDivElement>;
    detailContent: Component<HTMLDivElement>;
    entries: Entry[] = [];
    looks: Look[] = [];
    expanded = new Set<unknown>();
    stopItems: (() => void) | null = null;
    drawnAs: TimelineOrientation | null = null;
    previousIndex = -1;
    byUser = false;
    ready = false;

    constructor(props?: IBaseProp<TimelineProps>) {
        super('div', props);
        const own = (this.props ?? {}) as TimelineProps;
        const el = this.element;
        el.classList.add('mx-timeline');
        this.previousButton = this.makeNav('previous');
        this.track = part<HTMLDivElement>(this, 'div', 'mx-timeline__track');
        this.list = part<HTMLOListElement>(this.track, 'ol', 'mx-timeline__list');
        this.nextButton = this.makeNav('next');
        this.detail = part<HTMLDivElement>(this, 'div', 'mx-timeline__detail');
        this.detail.element.id = nextId('timeline-detail');
        this.detailDate = part<HTMLTimeElement>(this.detail, 'time', 'mx-timeline__date');
        this.detailTitle = part<HTMLSpanElement>(this.detail, 'span', 'mx-timeline__title');
        this.detailDescription = part<HTMLDivElement>(this.detail, 'div', 'mx-timeline__description');
        this.detailContent = part<HTMLDivElement>(this.detail, 'div', 'mx-timeline__content');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onItemClick) this.onItemClick(own.onItemClick);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty<TimelineOrientation>('orientation', o => {
            put(el, 'data-orientation', o ?? 'vertical');
            this.drawEntries();
        });
        this.observeProperty<boolean>('alternate', on => {
            mark(el, 'data-alternate', on === true);
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
        this.list.element.addEventListener('click', e => this.click(e));
        this.list.element.addEventListener('keydown', e => this.keyDown(e));
        this.track.element.addEventListener('scroll', () => this.drawNav());
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

    /** A press on an event's card or flag (`index`, `item`). */
    get onItemClick(): MotifEvent<TimelineItemClickEventArgs> {
        return this.itemClick.event;
    }

    /** Horizontal: the shown event changed (`index`, `item`, `previous`, `byUser`). */
    get onSelectionChanged(): MotifEvent<TimelineSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }

    /** Horizontal: the index of the shown event; -1 when there is none. */
    get selectedIndex(): number {
        return this.indexOf(this.peekProperty<string | number | null | undefined>('value'));
    }

    /** How many events there are. */
    get count(): number {
        return this.looks.length;
    }

    get horizontal(): boolean {
        return this.orientation === 'horizontal';
    }

    /** Horizontal: shows an event, by index or key. Vertical: unfolds its card. */
    goTo(event: number | string): boolean {
        const index = this.indexOf(event);
        if (index < 0) return false;
        if (this.horizontal) return this.select(index, false);
        this.unfold(index, true);
        return true;
    }

    /** Vertical, `collapsible`: unfolds or folds an event's card. */
    unfold(event: number | string, on = true): void {
        const look = this.looks[this.indexOf(event)];
        if (!look) return;
        if (on) this.expanded.add(look.item);
        else this.expanded.delete(look.item);
        this.drawStates();
    }

    /** Whether an event's card is unfolded. */
    isUnfolded(event: number | string): boolean {
        const look = this.looks[this.indexOf(event)];
        return !!look && this.expanded.has(look.item);
    }

    /** Reads the items again after they were changed in place. */
    refresh(): void {
        this.renderItems();
    }

    /** The index a value names: a key, else an index in range; -1 for none. */
    indexOf(value: string | number | null | undefined): number {
        if (value === undefined) return this.looks.length ? 0 : -1;
        if (value === null) return -1;
        if (typeof value === 'string') return this.looks.findIndex(look => look.key === value);
        return Number.isInteger(value) && value >= 0 && value < this.looks.length ? value : -1;
    }

    valueAt(index: number): string | number {
        return this.looks[index]?.key ?? index;
    }

    /** A date as the kit's language writes it with `dateFormat`. */
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
        put(this.list.element, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.timeline);
        put(this.previousButton.element, 'aria-label', uiLocale.strings.timelineEarlier);
        put(this.nextButton.element, 'aria-label', uiLocale.strings.timelineLater);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('items'));
        // The items' own functions are followed; the list and the drawing are not.
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

    // The rows are made again when the events are others, or the timeline turned or became collapsible.
    drawEntries(): void {
        const as = this.orientation;
        const stale = this.drawnAs !== as || this.entries.length !== this.looks.length || this.entries.some((entry, i) => entry.item !== this.looks[i].item) || this.entries.some(entry => (entry.face.element.tagName === 'BUTTON') !== this.pressable());
        if (stale) {
            for (const entry of this.entries) void entry.li.dispose();
            this.detailContent.element.replaceChildren();
            this.entries = this.looks.map(look => this.makeEntry(look, as));
            this.drawnAs = as;
            put(this.list.element, 'role', as === 'horizontal' ? 'tablist' : 'list');
        }
        this.drawTexts();
    }

    // Vertical cards are buttons when they fold; flags always are.
    pressable(): boolean {
        return this.horizontal || this.collapsible;
    }

    makeEntry(look: Look, as: TimelineOrientation): Entry {
        const li = new Component<HTMLLIElement>('li');
        li.element.className = 'mx-timeline__item';
        this.list.controls.add(li);
        const horizontal = as === 'horizontal';
        const face = part<HTMLElement>(li, this.pressable() ? 'button' : 'div', horizontal ? 'mx-timeline__flag' : 'mx-timeline__card');
        if (face.element instanceof HTMLButtonElement) face.element.type = 'button';
        const dot = part<HTMLSpanElement>(horizontal ? face : li, 'span', 'mx-timeline__dot');
        dot.element.setAttribute('aria-hidden', 'true');
        const dotGlyph = glyphPart(dot, look.glyph || 'clock', 'mx-timeline__dot-glyph');
        let dotIcon: ComponentBase | null = null;
        if (look.icon) {
            dotIcon = iconPart(dot, look.icon);
            dotIcon.element.classList.add('mx-timeline__dot-icon');
        }
        const date = part<HTMLTimeElement>(face, 'time', 'mx-timeline__date');
        const title = part<HTMLSpanElement>(face, 'span', 'mx-timeline__title');
        let description: Component<HTMLDivElement> | null = null;
        let content: ComponentBase | null = null;
        if (horizontal) {
            li.element.setAttribute('role', 'presentation');
            face.element.setAttribute('role', 'tab');
            face.element.id = nextId('timeline-flag');
            face.element.setAttribute('aria-controls', this.detail.element.id);
            face.element.tabIndex = -1;
            if (look.content) {
                content = look.content();
                this.detailContent.controls.add(content);
            }
        } else {
            description = part<HTMLDivElement>(face, 'div', 'mx-timeline__description');
            description.element.id = nextId('timeline-text');
            if (face.element instanceof HTMLButtonElement) face.element.setAttribute('aria-controls', description.element.id);
            const host = part<HTMLDivElement>(face, 'div', 'mx-timeline__content');
            if (look.content) {
                content = look.content();
                host.controls.add(content);
            }
        }
        return { item: look.item, li, dot, dotGlyph, dotIcon, face, date, title, description, content };
    }

    // The texts of every event, in the language and the date format of now.
    drawTexts(): void {
        this.looks.forEach((look, i) => {
            const entry = this.entries[i];
            if (!entry) return;
            const when = this.formatDate(look.date);
            text(entry.date.element, when);
            put(entry.date.element, 'datetime', look.date && !Number.isNaN(look.date.getTime()) ? look.date.toISOString() : null);
            shown(entry.date.element, when !== '');
            text(entry.title.element, look.title);
            put(entry.dotGlyph.element, 'data-icon', look.glyph || 'clock');
            shown(entry.dotGlyph.element, !look.icon && look.glyph !== '');
            put(entry.li.element, 'data-tone', look.tone);
            put(entry.dot.element, 'data-tone', look.tone);
            if (entry.description) {
                text(entry.description.element, look.description);
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
                put(entry.face.element, 'aria-selected', on ? 'true' : 'false');
                entry.face.element.tabIndex = on || (index < 0 && i === 0) ? 0 : -1;
                mark(entry.li.element, 'data-selected', on);
                if (entry.content) shown(entry.content.element as HTMLElement, on);
            } else {
                put(entry.li.element, 'data-side', alternate ? (i % 2 === 0 ? 'end' : 'start') : 'end');
                const open = !collapsible || this.expanded.has(look.item);
                if (entry.description) shown(entry.description.element, open && look.description !== '');
                if (entry.face.element instanceof HTMLButtonElement) put(entry.face.element, 'aria-expanded', open ? 'true' : 'false');
                mark(entry.li.element, 'data-expanded', collapsible && open);
            }
        });
        shown(this.detail.element, horizontal && index >= 0);
        shown(this.previousButton.element, horizontal && this.looks.length > 0);
        shown(this.nextButton.element, horizontal && this.looks.length > 0);
        if (horizontal) this.drawDetail(index);
        this.drawNav();
    }

    drawDetail(index: number): void {
        const look = this.looks[index];
        const entry = this.entries[index];
        if (!look || !entry) return;
        put(this.detail.element, 'role', 'tabpanel');
        put(this.detail.element, 'aria-labelledby', entry.face.element.id);
        const when = this.formatDate(look.date);
        text(this.detailDate.element, when);
        put(this.detailDate.element, 'datetime', look.date && !Number.isNaN(look.date.getTime()) ? look.date.toISOString() : null);
        shown(this.detailDate.element, when !== '');
        text(this.detailTitle.element, look.title);
        text(this.detailDescription.element, look.description);
        shown(this.detailDescription.element, look.description !== '');
        shown(this.detailContent.element, !!look.content);
    }

    // The earlier and later buttons: disabled at the ends of the track.
    drawNav(): void {
        if (!this.horizontal) return;
        const el = this.track.element;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const at = Math.abs(el.scrollLeft);
        const most = el.scrollWidth - el.clientWidth;
        const atStart = at <= 1;
        const atEnd = at >= most - 1;
        put(this.previousButton.element, 'aria-disabled', (rtl ? atStart : atStart) ? 'true' : null);
        put(this.nextButton.element, 'aria-disabled', atEnd ? 'true' : null);
    }

    makeNav(direction: 'previous' | 'next'): Component<HTMLButtonElement> {
        const nav = part<HTMLButtonElement>(this, 'button', 'mx-timeline__nav');
        nav.element.type = 'button';
        put(nav.element, 'data-direction', direction);
        glyphPart(nav, direction === 'previous' ? 'chevron-start' : 'chevron-end', 'mx-timeline__nav-glyph');
        nav.element.addEventListener('click', () => {
            if (nav.element.getAttribute('aria-disabled') === 'true') return;
            const el = this.track.element;
            const rtl = getComputedStyle(this.element).direction === 'rtl';
            const by = Math.max(80, el.clientWidth * 0.6) * (direction === 'next' ? 1 : -1) * (rtl ? -1 : 1);
            el.scrollBy({ left: by, behavior: 'smooth' });
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
        const flag = this.entries[index]?.face.element;
        if (flag && byUser) {
            flag.focus({ preventScroll: true });
            flag.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        }
        void event;
        return true;
    }

    click(e: MouseEvent): void {
        const face = (e.target as Element).closest<HTMLElement>('.mx-timeline__flag, .mx-timeline__card');
        const index = this.entries.findIndex(entry => entry.face.element === face);
        if (index < 0) return;
        const look = this.looks[index];
        if (this.horizontal) this.select(index, true, e);
        else if (this.collapsible) this.unfold(index, !this.expanded.has(look.item));
        this.itemClick.fire({ index, item: look.item, source: this, event: e });
    }

    // Horizontal: the arrow keys move along the dates and show the event; Home and End go to the ends.
    keyDown(e: KeyboardEvent): void {
        if (!this.horizontal || e.altKey || e.ctrlKey || e.metaKey) return;
        const from = this.entries.findIndex(entry => entry.face.element === e.target);
        if (from < 0) return;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
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
