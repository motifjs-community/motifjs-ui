import { Emitter, untracked, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, iconPart, loose, part } from "../../core/draw-parts";
import { focusOn } from "../../core/focus";
import { givenField, givenList, givenValue } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { boxOf, isRtl, measure, onLayout, pageOf, scrollerOf } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { kept, mark, put, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { Badge } from "../badge/Badge";
import type { BottomNavigationItem } from "./bottom-navigation-item";
import type { BottomNavigationItemClickEventArgs } from "./bottom-navigation-item-click-event-args";
import type { BottomNavigationLabelMode } from "./bottom-navigation-label-mode";
import type { BottomNavigationPosition } from "./bottom-navigation-position";
import type { BottomNavigationProps } from "./bottom-navigation-props";
import type { BottomNavigationSelectingEventArgs } from "./bottom-navigation-selecting-event-args";
import type { BottomNavigationSelectionChangedEventArgs } from "./bottom-navigation-selection-changed-event-args";

const OWN = ['items', 'value', 'labelMode', 'position', 'hideOnScroll', 'scrollTarget'] as const;

type Value = string | number;

interface Look {
    item: BottomNavigationItem;
    value: Value;
    text: string;
    glyph: string;
    activeGlyph: string;
    icon: IconSource | null;
    activeIcon: IconSource | null;
    href: string;
    rel: string;
    target: string;
    badge: number | null;
    dot: boolean;
    enabled: boolean;
    visible: boolean;
}

/** An item in the list: a new slot when the item turns between button and link. */
interface Slot {
    item: BottomNavigationItem;
    link: boolean;
    part: ItemPart | null;
}

interface ItemPart {
    item: BottomNavigationItem;
    /** Made as a link (`href`), not a button. */
    link: boolean;
    host: Component<HTMLElement>;
    iconHost: Component<HTMLSpanElement>;
    glyph: Component<HTMLSpanElement>;
    icon: ComponentBase | null;
    iconSource: IconSource | null;
    label: Component<HTMLSpanElement>;
    badge: Badge | null;
}

/**
 * The destinations of an application at the bottom of the screen (`<nav>`), three to five of them, each an icon with a
 * label. It is one Tab stop: the arrow keys, Home and End move between the items, and Enter or Space selects one. The
 * selected item is marked for screen readers with `aria-current`. An item with `href` is a link, for routed pages. The
 * bar keeps clear of the home indicator of a phone, and it can leave while scrolling down (`hideOnScroll`).
 *
 * @example
 * <BottomNavigation x-model={() => this.page} items={[
 *     { value: 'home', text: 'Home', glyph: 'star' },
 *     { value: 'inbox', text: 'Inbox', glyph: 'file', badge: () => this.unread },
 *     { value: 'me', text: 'Profile', glyph: 'person' },
 * ]} />
 */
export class BottomNavigation extends Control<HTMLElement, BottomNavigationProps> {
    selecting = new Emitter<BottomNavigationSelectingEventArgs>();
    selectionChanged = new Emitter<BottomNavigationSelectionChangedEventArgs>();
    itemClick = new Emitter<BottomNavigationItemClickEventArgs>();
    list: Component<HTMLDivElement>;
    /** The slot of each item, the same while the item stays a button or a link. */
    slots = new WeakMap<BottomNavigationItem, Slot>();
    /** The item Tab reaches, null for none. */
    stop: Slot | null = null;
    /** What `hideOnScroll` watches when the app gives it (`scrollTarget`). */
    scrollPart: ComponentBase | null = null;
    /** Where the scroll `hideOnScroll` follows was last read; null before the first read. */
    lastTop: number | null = null;
    stopScroll: (() => void) | null = null;

    constructor(props?: IBaseProp<BottomNavigationProps>) {
        super('nav', props);
        const own = (this.props ?? {}) as BottomNavigationProps;
        this.class.add('mx-bottom-navigation');
        this.list = part<HTMLDivElement>(this, 'div', 'mx-bottom-navigation__list');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.label !== undefined) this.bindProperty('text', own.label);
        if (own.onSelecting) this.onSelecting(own.onSelecting);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onItemClick) this.onItemClick(own.onItemClick);

        // Built once: an item stays while it is given, and a changed value or item changes only what shows it.
        this.list.bindings.list(() => this.slotList(), (slot: Slot) => this.makeItem(slot));
        this.observeProperty('text', () => this.drawName());
        for (const name of ['labelMode', 'position'] as const) this.observeProperty(name, () => this.drawLook());
        this.observeProperty('hideOnScroll', () => this.followScroll());
        this.observeProperty<ComponentBase | null | undefined>('scrollTarget', target => {
            this.scrollPart = target ?? null;
            this.followScroll();
        });
        onLanguage(this, () => this.drawName());
        this.list.motif.on('click', (_, e) => this.listClick(e));
        this.list.motif.on('keydown', (_, e) => this.listKeyDown(e));
        // A hidden bar comes back for the keyboard, or focus would be out of sight.
        this.motif.on('focusin', () => mark(this, 'data-hidden', false));
        this.motif.setDisposable(() => {
            for (const emitter of [this.selecting, this.selectionChanged, this.itemClick]) emitter.dispose();
        });
    }

    // Properties (see BottomNavigationProps).

    get items(): readonly BottomNavigationItem[] {
        return this.getProperty<readonly BottomNavigationItem[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly BottomNavigationItem[]>) {
        this.assignProperty('items', value);
    }
    get value(): Value | null {
        return this.getProperty<Value | null | undefined>('value') ?? null;
    }
    set value(value: Bind<Value | null>) {
        this.assignProperty('value', value);
    }
    get label(): string {
        return this.text;
    }
    set label(value: Bind<string>) {
        this.text = value;
    }
    get labelMode(): BottomNavigationLabelMode {
        return this.getProperty<BottomNavigationLabelMode | undefined>('labelMode') ?? 'always';
    }
    set labelMode(value: Bind<BottomNavigationLabelMode>) {
        this.assignProperty('labelMode', value);
    }
    get position(): BottomNavigationPosition {
        return this.getProperty<BottomNavigationPosition | undefined>('position') ?? 'fixed';
    }
    set position(value: Bind<BottomNavigationPosition>) {
        this.assignProperty('position', value);
    }
    get hideOnScroll(): boolean {
        return this.getProperty<boolean | undefined>('hideOnScroll') ?? false;
    }
    set hideOnScroll(value: Bind<boolean>) {
        this.assignProperty('hideOnScroll', value);
    }
    get scrollTarget(): ComponentBase | null {
        return this.getProperty<ComponentBase | null | undefined>('scrollTarget') ?? null;
    }
    set scrollTarget(value: Bind<ComponentBase | null>) {
        this.assignProperty('scrollTarget', value);
    }
    get onSelecting(): MotifEvent<BottomNavigationSelectingEventArgs> {
        return this.selecting.event;
    }
    get onSelectionChanged(): MotifEvent<BottomNavigationSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }
    get onItemClick(): MotifEvent<BottomNavigationItemClickEventArgs> {
        return this.itemClick.event;
    }

    /** The selected item, or `null`. */
    get selectedItem(): BottomNavigationItem | null {
        return this.lookOfValue(this.value)?.item ?? null;
    }

    /** Moves focus to the item Tab reaches. */
    override focus(): boolean {
        // A disabled bar has no Tab stop: its items are out of the Tab order.
        const target = this.isEnabled ? this.stop?.part?.host : undefined;
        if (target) focusOn(target);
        return !!target;
    }

    /** The items in order, each with its slot: a new slot (and item) only when an item turns between button and link. */
    slotList(): Slot[] {
        return givenList(this.getProperty<readonly BottomNavigationItem[]>('items')).map(item => {
            const link = !!givenField(item, 'href');
            let slot = this.slots.get(item);
            if (!slot || slot.link !== link) this.slots.set(item, (slot = { item, link, part: null }));
            return slot;
        });
    }

    /** What the items say now, in order; read without being followed. */
    looksNow(): { slot: Slot; look: Look }[] {
        return untracked(() => this.slotList().map((slot, i) => ({ slot, look: this.lookOf(slot.item, i) })));
    }

    /** The item Tab reaches: the selected one, or the first usable one. */
    stopSlot(): Slot | null {
        const value = this.getProperty<Value | null | undefined>('value') ?? null;
        const usable = this.slotList()
            .map((slot, i) => ({ slot, look: this.lookOf(slot.item, i) }))
            .filter(x => x.look.visible && x.look.enabled);
        return (usable.find(x => x.look.value === value) ?? usable[0])?.slot ?? null;
    }

    lookOfSlot(slot: Slot): Look {
        return this.lookOf(slot.item, this.slotList().indexOf(slot));
    }

    lookOf(item: BottomNavigationItem, index: number): Look {
        return {
            item,
            value: givenValue<Value | undefined>(item, 'value') ?? index,
            text: String(givenField(item, 'text') ?? ''),
            glyph: String(givenField(item, 'glyph') ?? ''),
            activeGlyph: String(givenField(item, 'activeGlyph') ?? ''),
            icon: givenField<IconSource | null | undefined>(item, 'icon') ?? null,
            activeIcon: givenField<IconSource | null | undefined>(item, 'activeIcon') ?? null,
            href: String(givenField(item, 'href') ?? ''),
            rel: String(givenField(item, 'rel') ?? ''),
            target: String(givenField(item, 'target') ?? ''),
            badge: givenField<number | null | undefined>(item, 'badge') ?? null,
            dot: givenField(item, 'dot') === true,
            enabled: givenField(item, 'enabled') !== false,
            visible: givenField(item, 'visible') !== false
        };
    }

    /** An item, built once: what it says and whether it is selected change only what shows them. */
    makeItem(slot: Slot): Component<HTMLElement> {
        const host = loose<HTMLElement>(slot.link ? 'a' : 'button', 'mx-bottom-navigation__item');
        if (!slot.link) host.attr.add({ type: 'button' });
        part<HTMLSpanElement>(host, 'span', 'mx-bottom-navigation__indicator');
        const iconHost = part<HTMLSpanElement>(host, 'span', 'mx-bottom-navigation__icon-host');
        const itemGlyph = glyphPart(iconHost, '', 'mx-bottom-navigation__glyph');
        const label = part<HTMLSpanElement>(host, 'span', 'mx-bottom-navigation__label');
        const p: ItemPart = { item: slot.item, link: slot.link, host, iconHost, glyph: itemGlyph, icon: null, iconSource: null, label, badge: null };
        slot.part = p;
        host.motif.setDisposable(() => {
            if (slot.part === p) slot.part = null;
        });
        host.bindings.watch(() => {
            const look = this.lookOfSlot(slot);
            untracked(() => {
                text(label, look.text);
                kept(host, look.visible);
                put(host, 'aria-disabled', look.enabled ? null : 'true');
                put(host, 'data-value', String(look.value));
                if (slot.link) {
                    put(host, 'href', look.enabled ? look.href : null);
                    put(host, 'rel', look.rel || null);
                    put(host, 'target', look.target || null);
                }
                this.drawBadge(p, look);
            });
        });
        host.bindings.watch(() => {
            const look = this.lookOfSlot(slot);
            const selected = look.value === (this.getProperty<Value | null | undefined>('value') ?? null);
            const stop = this.stopSlot();
            untracked(() => {
                this.stop = stop;
                mark(host, 'data-selected', selected);
                put(host, 'aria-current', selected ? 'page' : null);
                put(host, 'tabindex', stop === slot ? '0' : '-1');
                this.drawIcon(p, look, selected);
            });
        });
        return host;
    }

    drawBadge(p: ItemPart, look: Look): void {
        const on = look.dot || look.badge !== null;
        if (on && !p.badge) {
            p.badge = new Badge({ size: 'sm', position: 'top-end' });
            p.badge.class.add('mx-bottom-navigation__badge');
            p.iconHost.controls.add(p.badge);
        }
        if (!p.badge) return;
        p.badge.dot = look.dot;
        p.badge.count = look.badge;
        kept(p.badge, on);
    }

    drawIcon(p: ItemPart, look: Look, selected: boolean): void {
        const source = selected ? (look.activeIcon ?? look.icon) : look.icon;
        if (source !== p.iconSource) {
            void p.icon?.dispose();
            p.icon = source ? iconPart(p.iconHost, source) : null;
            p.icon?.class.add('mx-bottom-navigation__icon');
            p.iconSource = source;
        }
        const name = selected ? look.activeGlyph || look.glyph : look.glyph;
        put(p.glyph, 'data-icon', name || null);
        kept(p.glyph, !source && name !== '');
    }

    drawName(): void {
        put(this, 'aria-label', this.text || uiLocale.strings.navigation);
    }

    drawLook(): void {
        put(this, 'data-label-mode', this.labelMode);
        put(this, 'data-position', this.position);
    }

    followScroll(): void {
        this.stopScroll?.();
        this.stopScroll = null;
        this.lastTop = null;
        mark(this, 'data-hidden', false);
        if (!this.hideOnScroll) return;
        this.stopScroll = onLayout(this, 'scroll', () => measure(this, this.readScroll, this.drawScroll));
    }

    // What scrolls is the app's `scrollTarget`, else the nearest scroller around the bar, else the page.
    readonly readScroll = (): { top: number; height: number } => {
        const source = this.scrollPart ?? (this.parent ? scrollerOf(this.parent) : null);
        return { top: source ? boxOf(source).scrollTop : pageOf(this).scrollTop, height: boxOf(this).offsetHeight };
    };

    readonly drawScroll = (at: { top: number; height: number }): void => {
        const moved = this.lastTop === null ? 0 : at.top - this.lastTop;
        this.lastTop = at.top;
        if (moved !== 0) mark(this, 'data-hidden', moved > 0 && at.top > at.height);
    };

    lookOfValue(value: Value | null): Look | null {
        return this.looksNow().find(x => x.look.value === value)?.look ?? null;
    }

    /** The item an event came from, or null. */
    entryOfEvent(e: Event): { slot: Slot; look: Look } | null {
        return this.looksNow().find(x => !!x.slot.part?.host.motif.isEventFrom(e)) ?? null;
    }

    listClick(e: MouseEvent): void {
        const look = this.entryOfEvent(e)?.look;
        if (!look) return;
        if (!look.enabled || !this.isEnabled) {
            e.preventDefault();
            return;
        }
        const args: BottomNavigationItemClickEventArgs = { item: look.item, value: look.value, originalEvent: e, source: this };
        givenValue<((e: BottomNavigationItemClickEventArgs) => void) | undefined>(look.item, 'click')?.(args);
        this.itemClick.fire(args);
        if (!this.select(look, e)) e.preventDefault();
    }

    /** Selects `look` unless `onSelecting` refuses. Returns `false` when it was refused. */
    select(look: Look, originalEvent: Event): boolean {
        const old = this.value;
        if (look.value === old) return true;
        const previous = this.lookOfValue(old);
        const args: BottomNavigationSelectingEventArgs = { value: look.value, previous: old, item: look.item, previousItem: previous?.item ?? null, originalEvent, source: this, cancel: false };
        this.selecting.fire(args);
        if (args.cancel) return false;
        this.changeProperty('value', look.value);
        this.bindings.writeModel(look.value);
        this.selectionChanged.fire({ value: look.value, previous: old, item: look.item, previousItem: previous?.item ?? null, originalEvent, source: this });
        return true;
    }

    listKeyDown(e: KeyboardEvent): void {
        const entries = this.looksNow();
        const index = entries.findIndex(x => !!x.slot.part?.host.motif.isEventFrom(e));
        if (index < 0) return;
        const rtl = isRtl(this);
        if (e.key === ' ' && entries[index].look.href) {
            e.preventDefault();
            entries[index].slot.part?.host.attr.add({ click: true });
            return;
        }
        const stops = entries.flatMap((x, i) => (x.look.visible && x.look.enabled ? [i] : []));
        if (!stops.length) return;
        const at = stops.indexOf(index);
        const next = rtl ? 'ArrowLeft' : 'ArrowRight';
        const previous = rtl ? 'ArrowRight' : 'ArrowLeft';
        let to: number;
        if (e.key === next) to = stops[(at + 1) % stops.length];
        else if (e.key === previous) to = stops[(at - 1 + stops.length) % stops.length];
        else if (e.key === 'Home') to = stops[0];
        else if (e.key === 'End') to = stops[stops.length - 1];
        else return;
        e.preventDefault();
        for (const x of entries) if (x.slot.part) put(x.slot.part.host, 'tabindex', '-1');
        this.stop = entries[to].slot;
        const host = this.stop.part?.host;
        if (!host) return;
        put(host, 'tabindex', '0');
        focusOn(host);
    }
}
