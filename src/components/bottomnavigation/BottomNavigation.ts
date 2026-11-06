import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, iconPart, mark, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { onLanguage } from "../../core/on-language";
import { scrollParent, watchScroll } from "../../core/scroll-watch";
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

interface ItemPart {
    item: BottomNavigationItem;
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
    parts: ItemPart[] = [];
    looks: Look[] = [];
    stopItems: (() => void) | null = null;
    stopScroll: (() => void) | null = null;

    constructor(props?: IBaseProp<BottomNavigationProps>) {
        super('nav', props);
        const own = (this.props ?? {}) as BottomNavigationProps;
        const el = this.element;
        el.classList.add('mx-bottom-navigation');
        this.list = part<HTMLDivElement>(this, 'div', 'mx-bottom-navigation__list');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.label !== undefined) this.bindProperty('text', own.label);
        if (own.onSelecting) this.onSelecting(own.onSelecting);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onItemClick) this.onItemClick(own.onItemClick);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty('value', () => this.drawSelection());
        this.observeProperty('text', () => this.drawName());
        for (const name of ['labelMode', 'position'] as const) this.observeProperty(name, () => this.drawLook());
        for (const name of ['hideOnScroll', 'scrollTarget'] as const) this.observeProperty(name, () => this.followScroll());
        onLanguage(this, () => this.drawName());
        this.list.element.addEventListener('click', e => this.listClick(e));
        this.list.element.addEventListener('keydown', e => this.listKeyDown(e));
        // A hidden bar comes back for the keyboard, or focus would be out of sight.
        el.addEventListener('focusin', () => mark(el, 'data-hidden', false));
        this.motif.setDisposable(() => {
            this.stopItems?.();
            this.stopScroll?.();
            for (const emitter of [this.selecting, this.selectionChanged, this.itemClick]) emitter.dispose();
        });
    }

    // In the page now: what scrolls around the bar can be found.
    override onMounted(): void {
        this.followScroll();
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
    get scrollTarget(): HTMLElement | null {
        return this.getProperty<HTMLElement | null | undefined>('scrollTarget') ?? null;
    }
    set scrollTarget(value: Bind<HTMLElement | null>) {
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
        const target = this.parts.find(p => p.host.element.tabIndex === 0);
        target?.host.element.focus();
        return !!target;
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly BottomNavigationItem[]>('items'));
        // The items' own functions are tracked; the list and the drawing are not.
        this.stopItems = follow(
            this,
            'items',
            () => items.map((item, index) => this.lookOf(item, index)),
            looks => {
                this.looks = looks;
                this.drawItems();
            }
        );
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

    // The items are recreated when they are others or change between button and link; otherwise written in place.
    drawItems(): void {
        const tagOf = (look: Look) => (look.href ? 'A' : 'BUTTON');
        const stale = this.parts.length !== this.looks.length || this.parts.some((p, i) => p.item !== this.looks[i].item || p.host.element.tagName !== tagOf(this.looks[i]));
        if (stale) {
            for (const p of this.parts) void p.host.dispose();
            this.parts = this.looks.map(look => this.makeItem(look));
        }
        this.looks.forEach((look, i) => {
            const p = this.parts[i];
            const host = p.host.element;
            text(p.label.element, look.text);
            shown(host, look.visible);
            put(host, 'aria-disabled', look.enabled ? null : 'true');
            put(host, 'data-value', String(look.value));
            if (look.href) {
                put(host, 'href', look.enabled ? look.href : null);
                put(host, 'rel', look.rel || null);
                put(host, 'target', look.target || null);
            }
            this.drawBadge(p, look);
        });
        this.drawSelection();
    }

    makeItem(look: Look): ItemPart {
        const host = part<HTMLElement>(this.list, look.href ? 'a' : 'button', 'mx-bottom-navigation__item');
        if (!look.href) (host.element as HTMLButtonElement).type = 'button';
        part<HTMLSpanElement>(host, 'span', 'mx-bottom-navigation__indicator');
        const iconHost = part<HTMLSpanElement>(host, 'span', 'mx-bottom-navigation__icon-host');
        const itemGlyph = glyphPart(iconHost, '', 'mx-bottom-navigation__glyph');
        const label = part<HTMLSpanElement>(host, 'span', 'mx-bottom-navigation__label');
        return { item: look.item, host, iconHost, glyph: itemGlyph, icon: null, iconSource: null, label, badge: null };
    }

    drawBadge(p: ItemPart, look: Look): void {
        const on = look.dot || look.badge !== null;
        if (on && !p.badge) {
            p.badge = new Badge({ size: 'sm', position: 'top-end' });
            p.badge.element.classList.add('mx-bottom-navigation__badge');
            p.iconHost.controls.add(p.badge);
        }
        if (!p.badge) return;
        p.badge.dot = look.dot;
        p.badge.count = look.badge;
        shown(p.badge.element, on);
    }

    drawIcon(p: ItemPart, look: Look, selected: boolean): void {
        const source = selected ? (look.activeIcon ?? look.icon) : look.icon;
        if (source !== p.iconSource) {
            void p.icon?.dispose();
            p.icon = source ? iconPart(p.iconHost, source) : null;
            p.icon?.element.classList.add('mx-bottom-navigation__icon');
            p.iconSource = source;
        }
        const name = selected ? look.activeGlyph || look.glyph : look.glyph;
        put(p.glyph.element, 'data-icon', name || null);
        shown(p.glyph.element, !source && name !== '');
    }

    drawSelection(): void {
        const value = this.peekProperty<Value | null | undefined>('value') ?? null;
        const stop = this.looks.findIndex(look => look.value === value && look.visible && look.enabled);
        const first = stop >= 0 ? stop : this.looks.findIndex(look => look.visible && look.enabled);
        this.looks.forEach((look, i) => {
            const p = this.parts[i];
            const selected = look.value === value;
            mark(p.host.element, 'data-selected', selected);
            put(p.host.element, 'aria-current', selected ? 'page' : null);
            p.host.element.tabIndex = i === first ? 0 : -1;
            this.drawIcon(p, look, selected);
        });
    }

    drawName(): void {
        this.element.setAttribute('aria-label', this.text || uiLocale.strings.navigation);
    }

    drawLook(): void {
        put(this.element, 'data-label-mode', this.labelMode);
        put(this.element, 'data-position', this.position);
    }

    followScroll(): void {
        this.stopScroll?.();
        this.stopScroll = null;
        const el = this.element;
        mark(el, 'data-hidden', false);
        if (!this.hideOnScroll || !el.isConnected) return;
        this.stopScroll = watchScroll(this.scrollTarget ?? scrollParent(el), (top, moved) => {
            if (moved !== 0) mark(el, 'data-hidden', moved > 0 && top > el.offsetHeight);
        });
    }

    lookOfValue(value: Value | null): Look | null {
        return this.looks.find(look => look.value === value) ?? null;
    }

    indexOfElement(target: EventTarget | null): number {
        const host = (target as Element | null)?.closest?.('.mx-bottom-navigation__item');
        return this.parts.findIndex(p => p.host.element === host);
    }

    listClick(e: MouseEvent): void {
        const index = this.indexOfElement(e.target);
        if (index < 0) return;
        const look = this.looks[index];
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
        const index = this.indexOfElement(e.target);
        if (index < 0) return;
        if (e.key === ' ' && this.looks[index].href) {
            e.preventDefault();
            this.parts[index].host.element.click();
            return;
        }
        const stops = this.looks.flatMap((look, i) => (look.visible && look.enabled ? [i] : []));
        if (!stops.length) return;
        const at = stops.indexOf(index);
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const next = rtl ? 'ArrowLeft' : 'ArrowRight';
        const previous = rtl ? 'ArrowRight' : 'ArrowLeft';
        let to: number;
        if (e.key === next) to = stops[(at + 1) % stops.length];
        else if (e.key === previous) to = stops[(at - 1 + stops.length) % stops.length];
        else if (e.key === 'Home') to = stops[0];
        else if (e.key === 'End') to = stops[stops.length - 1];
        else return;
        e.preventDefault();
        for (const p of this.parts) p.host.element.tabIndex = -1;
        const host = this.parts[to].host.element;
        host.tabIndex = 0;
        host.focus();
    }
}
