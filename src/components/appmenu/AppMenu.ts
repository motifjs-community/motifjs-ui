import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { accessKeyToken, parseAccessKey, renderAccessKey, setAccessKeyAttribute } from "../../core/access-key";
import { css, glyphPart, iconPart, mark, part, put, shown } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { glyph } from "../../core/glyphs";
import type { IconSource } from "../../core/icon-source";
import { onLanguage } from "../../core/on-language";
import { TokenLengths } from "../../core/token-lengths";
import { uiLocale } from "../../core/ui-locale";
import { OverlayPanel } from "../../parts/overlay/OverlayPanel";
import { Badge } from "../badge/Badge";
import { Button } from "../button/Button";
import type { AppMenuItem } from "./app-menu-item";
import type { AppMenuItemClickEventArgs } from "./app-menu-item-click-event-args";
import type { AppMenuProps } from "./app-menu-props";
import type { AppMenuSelectingEventArgs } from "./app-menu-selecting-event-args";
import type { AppMenuSelectionChangedEventArgs } from "./app-menu-selection-changed-event-args";

const OWN = ['items', 'selected', 'closeOnCommand'] as const;

// The layout's lengths: the share of the room the panel takes, the least width of the panel, the least width that holds
// the list and the page side by side.
const SHARE = 'calc(var(--_app-menu-share) * 1000px)';
const LEAST = '--_app-menu-min-size';
const SPLIT = '--_app-menu-split-size';

type Key = string | number;

interface Look {
    item: AppMenuItem;
    key: Key;
    text: string;
    glyph: string;
    icon: IconSource | null;
    hint: string;
    href: string;
    rel: string;
    target: string;
    badge: number | null;
    dot: boolean;
    enabled: boolean;
    visible: boolean;
    group: string;
    bottom: boolean;
    closeOnClick: boolean | null;
    page: boolean;
}

interface ItemPart {
    item: AppMenuItem;
    bottom: boolean;
    separator: Component<HTMLDivElement>;
    host: Component<HTMLElement>;
    iconHost: Component<HTMLSpanElement>;
    glyph: Component<HTMLSpanElement>;
    icon: ComponentBase | null;
    iconSource: IconSource | null;
    label: Component<HTMLSpanElement>;
    badge: Badge | null;
    accessKey: string | null;
}

interface View {
    item: AppMenuItem;
    host: Component<HTMLDivElement>;
}

/**
 * The main menu of an application: a list of items at the side and, beside it, the page of the item chosen. On a wide
 * screen it is a panel over half of the window, from the start edge; on a narrow one it takes the whole window. When
 * the panel is too narrow for both, the list and the page take turns: a page item opens its page in place of the list,
 * and the back button or Escape returns to it.
 *
 * Nothing is in it until it is given: every item comes from `items`, and every page from an item's `page`. An item
 * without a page is a command (`click`, `onItemClick`) or a link (`href`), and closes the menu unless it says otherwise.
 * It is a dialog: modal, closed by Escape, a click outside and the browser's back action; focus goes to the chosen item
 * when it opens and comes back when it closes. In the list the arrow keys, Home and End move, Enter chooses, and a
 * letter goes to the item it starts, or chooses the item whose access key it is.
 *
 * @example
 * <AppMenu label="File" x-model={() => this.menuOpen} items={[
 *     { key: 'home', text: '&Home', glyph: 'home', page: () => new HomePage() },
 *     { key: 'save', text: '&Save', glyph: 'save', click: () => this.save() },
 *     { key: 'options', text: 'O&ptions', glyph: 'settings', bottom: true, page: () => new OptionsPage() },
 * ]} />
 */
export class AppMenu extends OverlayPanel<AppMenuProps> {
    static override overlayClass = 'mx-app-menu';

    selecting = new Emitter<AppMenuSelectingEventArgs>();
    selectionChanged = new Emitter<AppMenuSelectionChangedEventArgs>();
    itemClick = new Emitter<AppMenuItemClickEventArgs>();
    nav: Component<HTMLElement>;
    closer: Button;
    topList: Component<HTMLDivElement>;
    bottomList: Component<HTMLDivElement>;
    pageArea: Component<HTMLDivElement>;
    pageHead: Component<HTMLDivElement>;
    backer: Button;
    entries: ItemPart[] = [];
    looks: Look[] = [];
    views = new Map<Key, View>();
    lengths: TokenLengths;
    roomObserver: ResizeObserver | null = null;
    stopItems: (() => void) | null = null;
    // Between placing the panel and closing it: `isOpen` turns on only after the panel is placed.
    showing = false;
    typed = '';
    typedAt = 0;

    constructor(props?: IBaseProp<AppMenuProps>) {
        super(props);
        const own = (this.props ?? {}) as AppMenuProps;
        const body = this.contentElement;

        this.nav = new Component<HTMLElement>('nav');
        this.nav.element.className = 'mx-app-menu__nav';
        this.placeIn(this.nav, body);
        // Its variant and size come from its place.
        this.closer = new Button({ icon: glyph('arrow-start') });
        this.closer.element.classList.add('mx-app-menu__close');
        this.closer.element.addEventListener('click', () => this.close('button'));
        this.nav.controls.add(this.closer);
        this.topList = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__list');
        this.bottomList = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__list mx-app-menu__list--bottom');

        this.pageArea = new Component<HTMLDivElement>('div');
        this.pageArea.element.className = 'mx-app-menu__page';
        this.placeIn(this.pageArea, body);
        this.pageHead = part<HTMLDivElement>(this.pageArea, 'div', 'mx-app-menu__page-head');
        this.backer = new Button({ icon: glyph('arrow-start') });
        this.backer.element.classList.add('mx-app-menu__back');
        this.backer.element.addEventListener('click', () => this.showList());
        this.pageHead.controls.add(this.backer);

        this.lengths = new TokenLengths(this.element, [SHARE, LEAST, SPLIT], () => this.layout());
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onSelecting) this.onSelecting(own.onSelecting);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onItemClick) this.onItemClick(own.onItemClick);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty('selected', () => this.drawSelection());
        this.observeProperty('text', () => this.drawNames());
        this.observeProperty('label', () => this.drawNames());
        onLanguage(this, () => this.drawNames());
        this.nav.element.addEventListener('click', e => this.navClick(e));
        body.addEventListener('animationend', e => {
            if (e.target === this.nav.element || e.target === this.pageArea.element) put(this.element, 'data-turn', null);
        });
        this.nav.element.addEventListener('keydown', e => this.navKeyDown(e));
        // Escape on a page that took the list's place goes back to the list before it closes the menu.
        this.panelElement.addEventListener('keydown', e => {
            if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing || !this.pageShownAlone()) return;
            e.preventDefault();
            e.stopPropagation();
            this.showList();
        });
        const Observer = this.element.ownerDocument.defaultView?.ResizeObserver;
        if (Observer) {
            this.roomObserver = new Observer(() => this.layout());
            this.roomObserver.observe(this.element);
        }
        this.drawNames();
        this.motif.setDisposable(() => {
            this.stopItems?.();
            this.roomObserver?.disconnect();
            this.lengths.dispose();
            for (const emitter of [this.selecting, this.selectionChanged, this.itemClick]) emitter.dispose();
        });
    }

    // Properties (see AppMenuProps).

    get items(): readonly AppMenuItem[] {
        return this.getProperty<readonly AppMenuItem[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly AppMenuItem[]>) {
        this.assignProperty('items', value);
    }
    get selected(): Key | null {
        return this.getProperty<Key | null | undefined>('selected') ?? null;
    }
    set selected(value: Bind<Key | null>) {
        this.assignProperty('selected', value);
    }
    get closeOnCommand(): boolean {
        return this.getProperty<boolean | undefined>('closeOnCommand') !== false;
    }
    set closeOnCommand(value: Bind<boolean>) {
        this.assignProperty('closeOnCommand', value, Boolean);
    }
    get onSelecting(): MotifEvent<AppMenuSelectingEventArgs> {
        return this.selecting.event;
    }
    get onSelectionChanged(): MotifEvent<AppMenuSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }
    get onItemClick(): MotifEvent<AppMenuItemClickEventArgs> {
        return this.itemClick.event;
    }

    /** The key of the page shown: `selected`, else the first page item that can be chosen. */
    get shownKey(): Key | null {
        const wanted = this.peekProperty<Key | null | undefined>('selected') ?? null;
        const pages = this.looks.filter(look => look.page && look.visible && look.enabled);
        return pages.find(look => look.key === wanted)?.key ?? pages[0]?.key ?? null;
    }

    /** The page of an item, once it has been shown. */
    pageOf(key: Key): ComponentBase | null {
        return this.views.get(key)?.host.controls.items[0] ?? null;
    }

    /** Shows the page of the item with `key`, as a click on it does. Returns `false` when `onSelecting` refused. */
    select(key: Key): boolean {
        const look = this.looks.find(l => l.key === key && l.page);
        return look ? this.choose(look, null) : false;
    }

    /** Opens the menu on the page of the item with `key`. */
    openAt(key: Key): boolean {
        this.select(key);
        return this.open();
    }

    protected override placePanel(): void {
        this.showing = true;
        put(this.element, 'data-view', 'list');
        this.layout();
        this.drawSelection();
    }

    protected override panelClosed(): void {
        this.showing = false;
        put(this.element, 'data-view', 'list');
        put(this.element, 'data-turn', null);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly AppMenuItem[]>('items'));
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

    lookOf(item: AppMenuItem, index: number): Look {
        const closeOnClick = givenField<boolean | undefined>(item, 'closeOnClick');
        return {
            item,
            key: givenValue<Key | undefined>(item, 'key') ?? index,
            text: String(givenField(item, 'text') ?? ''),
            glyph: String(givenField(item, 'glyph') ?? ''),
            icon: givenField<IconSource | null | undefined>(item, 'icon') ?? null,
            hint: String(givenField(item, 'hint') ?? ''),
            href: String(givenField(item, 'href') ?? ''),
            rel: String(givenField(item, 'rel') ?? ''),
            target: String(givenField(item, 'target') ?? ''),
            badge: givenField<number | null | undefined>(item, 'badge') ?? null,
            dot: givenField(item, 'dot') === true,
            enabled: givenField(item, 'enabled') !== false,
            visible: givenField(item, 'visible') !== false,
            group: String(givenField(item, 'group') ?? ''),
            bottom: givenField(item, 'bottom') === true,
            closeOnClick: closeOnClick === undefined ? null : closeOnClick !== false,
            page: typeof givenValue(item, 'page') === 'function'
        };
    }

    // The items are made again when they are others, move between the lists or change between button and link;
    // otherwise they are written in place.
    drawItems(): void {
        const tagOf = (look: Look) => (look.href ? 'A' : 'BUTTON');
        const stale = this.entries.length !== this.looks.length || this.entries.some((p, i) => p.item !== this.looks[i].item || p.bottom !== this.looks[i].bottom || p.host.element.tagName !== tagOf(this.looks[i]));
        if (stale) {
            for (const p of this.entries) {
                void p.separator.dispose();
                void p.host.dispose();
            }
            this.entries = this.looks.map(look => this.makeItem(look));
        }
        const lastGroup = new Map<boolean, string | null>();
        // When any item has an icon, an item without one keeps the room, so the labels line up.
        const icons = this.looks.some(look => look.visible && (!!look.icon || look.glyph !== ''));
        this.looks.forEach((look, i) => {
            const p = this.entries[i];
            const host = p.host.element;
            const parsed = parseAccessKey(look.text);
            renderAccessKey(p.label.element, parsed);
            const key = parsed.key ? accessKeyToken(parsed.key) : null;
            setAccessKeyAttribute(host, p.accessKey, key);
            p.accessKey = key;
            shown(host, look.visible);
            put(host, 'title', look.hint || null);
            put(host, 'aria-disabled', look.enabled ? null : 'true');
            put(host, 'data-key', String(look.key));
            if (look.href) {
                put(host, 'href', look.enabled ? look.href : null);
                put(host, 'rel', look.rel || null);
                put(host, 'target', look.target || null);
            }
            // A line before the first visible item of another group in the same list.
            const before = lastGroup.get(look.bottom);
            shown(p.separator.element, look.visible && before !== undefined && before !== null && before !== look.group);
            if (look.visible) lastGroup.set(look.bottom, look.group);
            this.drawIcon(p, look, icons);
            this.drawBadge(p, look);
        });
        shown(this.bottomList.element, this.looks.some(look => look.bottom && look.visible));
        this.dropViews();
        this.drawSelection();
    }

    makeItem(look: Look): ItemPart {
        const list = look.bottom ? this.bottomList : this.topList;
        const separator = part<HTMLDivElement>(list, 'div', 'mx-app-menu__separator');
        separator.element.setAttribute('role', 'separator');
        const host = part<HTMLElement>(list, look.href ? 'a' : 'button', 'mx-app-menu__item');
        if (!look.href) (host.element as HTMLButtonElement).type = 'button';
        const iconHost = part<HTMLSpanElement>(host, 'span', 'mx-app-menu__icon');
        const itemGlyph = glyphPart(iconHost, '', 'mx-app-menu__glyph');
        const label = part<HTMLSpanElement>(host, 'span', 'mx-app-menu__label');
        return { item: look.item, bottom: look.bottom, separator, host, iconHost, glyph: itemGlyph, icon: null, iconSource: null, label, badge: null, accessKey: null };
    }

    drawIcon(p: ItemPart, look: Look, room: boolean): void {
        if (look.icon !== p.iconSource) {
            void p.icon?.dispose();
            p.icon = look.icon ? iconPart(p.iconHost, look.icon) : null;
            p.iconSource = look.icon;
        }
        put(p.glyph.element, 'data-icon', look.glyph || null);
        shown(p.glyph.element, !look.icon && look.glyph !== '');
        const has = !!look.icon || look.glyph !== '';
        shown(p.iconHost.element, has || room);
        css(p.iconHost.element, 'visibility', has ? '' : 'hidden');
    }

    drawBadge(p: ItemPart, look: Look): void {
        const on = look.dot || look.badge !== null;
        if (on && !p.badge) {
            p.badge = new Badge({ size: 'sm' });
            p.badge.element.classList.add('mx-app-menu__badge');
            p.host.controls.add(p.badge);
        }
        if (!p.badge) return;
        p.badge.dot = look.dot;
        p.badge.count = look.badge;
        shown(p.badge.element, on);
    }

    // Pages of items that are gone go with them.
    dropViews(): void {
        for (const [key, view] of this.views) {
            if (this.looks.some(look => look.key === key && look.item === view.item && look.page)) continue;
            void view.host.dispose();
            this.views.delete(key);
        }
    }

    drawSelection(): void {
        const key = this.shownKey;
        const stops = this.stops();
        const stop = stops.find(i => this.looks[i].key === key) ?? stops[0] ?? -1;
        this.looks.forEach((look, i) => {
            const host = this.entries[i].host.element;
            const selected = look.page && look.key === key;
            mark(host, 'data-selected', selected);
            put(host, 'aria-current', selected ? 'page' : null);
            host.tabIndex = i === stop ? 0 : -1;
            // Where focus goes when the menu opens.
            host.toggleAttribute('autofocus', i === stop);
        });
        if (this.showing && key !== null) this.showView(key);
    }

    showView(key: Key): void {
        const look = this.looks.find(l => l.key === key);
        if (!look) return;
        let view = this.views.get(key);
        if (!view) {
            const host = part<HTMLDivElement>(this.pageArea, 'div', 'mx-app-menu__view');
            host.element.setAttribute('role', 'region');
            host.element.tabIndex = -1;
            const make = givenValue<(() => ComponentBase) | undefined>(look.item, 'page');
            const page = make?.();
            if (page) host.controls.add(page);
            view = { item: look.item, host };
            this.views.set(key, view);
        }
        put(view.host.element, 'aria-label', parseAccessKey(look.text).text);
        for (const [k, v] of this.views) shown(v.host.element, k === key);
    }

    /** The items Tab and the arrows reach, in the order they stand: the list at the top, then the one at the bottom. */
    stops(): number[] {
        const can = (i: number) => this.looks[i].visible && this.looks[i].enabled;
        const all = this.looks.map((_, i) => i);
        return [...all.filter(i => !this.looks[i].bottom && can(i)), ...all.filter(i => this.looks[i].bottom && can(i))];
    }

    drawNames(): void {
        const name = parseAccessKey(this.peekProperty<string>('text') ?? '').text || this.peekProperty<string>('label') || uiLocale.strings.appMenuLabel;
        if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) this.panelElement.setAttribute('aria-label', name);
        this.nav.element.setAttribute('aria-label', name);
        this.closer.element.setAttribute('aria-label', uiLocale.strings.appMenuClose);
        this.backer.element.setAttribute('aria-label', uiLocale.strings.appMenuBack);
    }

    // Layout: a panel over a share of the room, the whole room when that would be too narrow, and the list and the page
    // in turns when the panel cannot hold both.
    layout(): void {
        if (!this.showing) return;
        const room = this.element.clientWidth;
        if (!room) return;
        const share = this.lengths.get(SHARE, 500) / 1000;
        const least = this.lengths.get(LEAST, 360);
        const split = this.lengths.get(SPLIT, 560);
        const full = room * share < least;
        const width = full ? room : room * share;
        mark(this.element, 'data-full', full);
        const stacked = width < split;
        if (!stacked && this.element.hasAttribute('data-stacked')) {
            put(this.element, 'data-view', 'list');
            put(this.element, 'data-turn', null);
        }
        mark(this.element, 'data-stacked', stacked);
    }

    pageShownAlone(): boolean {
        return this.element.hasAttribute('data-stacked') && this.element.getAttribute('data-view') === 'page';
    }

    showPage(): void {
        this.turn('page');
        if (!this.element.hasAttribute('data-stacked')) return;
        const key = this.shownKey;
        const view = key === null ? null : this.views.get(key);
        view?.host.element.focus({ preventScroll: true });
    }

    showList(): void {
        this.turn('list');
        const stop = this.entries.find(p => p.host.element.tabIndex === 0);
        stop?.host.element.focus({ preventScroll: true });
    }

    // While the list and the page take turns, the one coming in pushes the other out; the turn ends with its animation.
    turn(view: 'list' | 'page'): void {
        const from = this.element.getAttribute('data-view');
        put(this.element, 'data-view', view);
        if (from === view || !this.showing || !this.element.hasAttribute('data-stacked')) return;
        put(this.element, 'data-turn', view === 'page' ? 'forward' : 'back');
        // Where nothing animates (motion turned off by a stylesheet), no end comes.
        if (!this.nav.element.getAnimations?.().length) put(this.element, 'data-turn', null);
    }

    indexOfElement(target: EventTarget | null): number {
        const host = (target as Element | null)?.closest?.('.mx-app-menu__item');
        return this.entries.findIndex(p => p.host.element === host);
    }

    navClick(e: MouseEvent): void {
        const index = this.indexOfElement(e.target);
        if (index < 0) return;
        this.press(this.looks[index], e);
    }

    press(look: Look, e: Event): void {
        if (!look.enabled || !this.isEnabled) {
            e.preventDefault();
            return;
        }
        if (look.page) {
            if (this.choose(look, e)) this.showPage();
            return;
        }
        const args: AppMenuItemClickEventArgs = { item: look.item, key: look.key, keepOpen: !(look.closeOnClick ?? this.closeOnCommand), originalEvent: e, source: this };
        givenValue<((e: AppMenuItemClickEventArgs) => void) | undefined>(look.item, 'click')?.(args);
        this.itemClick.fire(args);
        if (!args.keepOpen) this.close('button');
    }

    /** Shows the page of `look` unless `onSelecting` refuses. Returns `false` when it was refused. */
    choose(look: Look, originalEvent: Event | null): boolean {
        const old = this.shownKey;
        if (look.key === old) return true;
        const previous = this.looks.find(l => l.key === old) ?? null;
        const args: AppMenuSelectingEventArgs = { key: look.key, previous: old, item: look.item, previousItem: previous?.item ?? null, originalEvent, source: this, cancel: false };
        this.selecting.fire(args);
        if (args.cancel) return false;
        this.changeProperty('selected', look.key);
        this.selectionChanged.fire({ key: look.key, previous: old, item: look.item, previousItem: previous?.item ?? null, originalEvent, source: this });
        return true;
    }

    navKeyDown(e: KeyboardEvent): void {
        const index = this.indexOfElement(e.target);
        if (index < 0 || e.isComposing) return;
        if (e.key === ' ' && this.looks[index].href) {
            e.preventDefault();
            this.entries[index].host.element.click();
            return;
        }
        const stops = this.stops();
        if (!stops.length) return;
        const at = stops.indexOf(index);
        let to = -1;
        if (e.key === 'ArrowDown') to = stops[(at + 1) % stops.length];
        else if (e.key === 'ArrowUp') to = stops[(at - 1 + stops.length) % stops.length];
        else if (e.key === 'Home') to = stops[0];
        else if (e.key === 'End') to = stops[stops.length - 1];
        else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) to = this.byLetter(e, stops, at);
        if (to < 0) return;
        e.preventDefault();
        this.moveTo(to);
    }

    // A letter chooses the item whose access key it is; otherwise it goes to the next item that starts with what was typed.
    byLetter(e: KeyboardEvent, stops: number[], at: number): number {
        const letter = e.key.toLocaleLowerCase(uiLocale.locale);
        const keyed = stops.find(i => parseAccessKey(this.looks[i].text).key?.toLocaleLowerCase(uiLocale.locale) === letter);
        if (keyed !== undefined) {
            e.preventDefault();
            this.moveTo(keyed);
            this.entries[keyed].host.element.click();
            return -1;
        }
        if (e.altKey || !letter.trim()) return -1;
        const now = Date.now();
        this.typed = now - this.typedAt < 700 ? this.typed + letter : letter;
        this.typedAt = now;
        const text = (i: number) => parseAccessKey(this.looks[i].text).text.toLocaleLowerCase(uiLocale.locale);
        const order = [...stops.slice(at + (this.typed.length > 1 ? 0 : 1)), ...stops.slice(0, at + (this.typed.length > 1 ? 0 : 1))];
        return order.find(i => text(i).startsWith(this.typed)) ?? -1;
    }

    moveTo(index: number): void {
        for (const p of this.entries) p.host.element.tabIndex = -1;
        const host = this.entries[index].host.element;
        host.tabIndex = 0;
        host.focus();
    }
}
