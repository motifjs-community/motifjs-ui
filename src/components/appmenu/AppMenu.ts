import { Component, Emitter, createSignal, reactive, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp, type Signal } from "@motifx/core";
import { accessKeyToken, parseAccessKey, renderAccessKey, setAccessKeyAttribute } from "../../core/access-key";
import { glyphPart, iconPart, loose, part } from "../../core/draw-parts";
import { fillTemplate } from "../../core/fill-template";
import { focusOn } from "../../core/focus";
import { foldText } from "../../core/fold-text";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { glyph, searchMark } from "../../core/glyphs";
import type { IconSource } from "../../core/icon-source";
import { onLanguage } from "../../core/on-language";
import { boxOf, lengthOf, measure, onLayout, probeLengths, styleOf } from "../../core/measure";
import { css, kept, mark, put, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { OverlayPanel } from "../../parts/overlay/OverlayPanel";
import { Badge } from "../badge/Badge";
import { Button } from "../button/Button";
import { TextBox } from "../textbox/TextBox";
import type { AppMenuItemsChangedEventArgs } from "./app-menu-items-changed-event-args";
import type { AppMenuSearchTextChangedEventArgs } from "./app-menu-search-text-changed-event-args";
import type { AppMenuItem } from "./app-menu-item";
import type { AppMenuItemClickEventArgs } from "./app-menu-item-click-event-args";
import type { AppMenuProps } from "./app-menu-props";
import type { AppMenuSelectingEventArgs } from "./app-menu-selecting-event-args";
import type { AppMenuSelectionChangedEventArgs } from "./app-menu-selection-changed-event-args";

const OWN = ['items', 'selected', 'closeOnCommand', 'listHeader', 'listFooter', 'searchEnabled', 'searchText'] as const;

// The layout's lengths: the share of the room the panel takes, the least width of the panel, the least width that holds
// the list and the page side by side.
const SHARE = 'calc(var(--_app-menu-share) * 1000px)';
const LEAST = '--_app-menu-min-size';
const SPLIT = '--_app-menu-split-size';

type Key = string | number;

/** What of an item the lists, the lines between the groups, the icon room, the search and the selection depend on. */
interface Look {
    item: AppMenuItem;
    key: Key;
    /** Has an `href`: made as a link. */
    link: boolean;
    /** Has an icon or a glyph. */
    pictured: boolean;
    enabled: boolean;
    visible: boolean;
    group: string;
    bottom: boolean;
    page: boolean;
    // What the search looks in, read only while there is something to find.
    text: string;
    hint: string;
}

const sameLooks = (a: readonly Look[], b: readonly Look[]) =>
    a.length === b.length && a.every((look, i) => (Object.keys(look) as (keyof Look)[]).every(name => Object.is(look[name], b[i][name])));

interface ItemPart {
    /** The item the part shows: its own fields are followed from it. */
    item: Signal<AppMenuItem>;
    key: Key;
    bottom: boolean;
    /** Made as a link (`a`), else as a button. */
    link: boolean;
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

/** The room of the menu and its layout's lengths, as read. */
interface Room {
    width: number;
    share: number;
    least: number;
    split: number;
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
    itemsChanged = new Emitter<AppMenuItemsChangedEventArgs>();
    searchTextChanged = new Emitter<AppMenuSearchTextChangedEventArgs>();
    headerHost: Component<HTMLDivElement>;
    footerHost: Component<HTMLDivElement>;
    searchHost: Component<HTMLDivElement>;
    search: TextBox | null = null;
    noMatch: Component<HTMLDivElement>;
    // What the app put at the top and the bottom of the list.
    headerControl: ComponentBase | null = null;
    footerControl: ComponentBase | null = null;
    // Changes made between beginUpdate() and endUpdate(), applied at once.
    batch = 0;
    pending: AppMenuItem[] | null = null;
    nav: Component<HTMLElement>;
    closer: Button;
    topList: Component<HTMLDivElement>;
    bottomList: Component<HTMLDivElement>;
    pageArea: Component<HTMLDivElement>;
    pageHead: Component<HTMLDivElement>;
    backer: Button;
    entries: ItemPart[] = [];
    // The items' parts by their key, list and kind; a count that tells the lists to take the entries again.
    slots = new Map<string, ItemPart>();
    drawn = reactive({ count: 0 });
    looks: Look[] = [];
    views = new Map<Key, View>();
    stopItems: (() => void) | null = null;
    // Between placing the panel and closing it: `isOpen` turns on only after the panel is placed.
    showing = false;
    // The list and the page take turns: the panel cannot hold both.
    stacked = false;
    // Which of the two is shown while they take turns.
    turnedTo: 'list' | 'page' = 'list';
    // The item Tab reaches in the list (its tabindex is 0); -1 while there is none.
    listStop = -1;
    typed = '';
    typedAt = 0;

    constructor(props?: IBaseProp<AppMenuProps>) {
        super(props);
        const own = (this.props ?? {}) as AppMenuProps;

        this.nav = new Component<HTMLElement>('nav');
        this.nav.class.add('mx-app-menu__nav');
        this.placeIn(this.nav, this.contentPart);
        // Its variant and size come from its place.
        this.closer = new Button({ icon: glyph('arrow-start') });
        this.closer.class.add('mx-app-menu__close');
        this.closer.motif.on('click', () => this.close('button'));
        this.nav.controls.add(this.closer);
        this.headerHost = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__header-slot');
        this.searchHost = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__search');
        this.topList = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__list');
        this.noMatch = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__no-match');
        this.noMatch.attr.add({ role: 'status' });
        this.bottomList = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__list mx-app-menu__list--bottom');
        this.footerHost = part<HTMLDivElement>(this.nav, 'div', 'mx-app-menu__footer-slot');
        for (const el of [this.headerHost, this.footerHost, this.searchHost, this.noMatch]) kept(el, false);
        // Built once: each list holds the parts of its items, made when an item comes and taken out when it goes.
        for (const [list, bottom] of [[this.topList, false], [this.bottomList, true]] as const) {
            list.bindings.list(
                () => {
                    void this.drawn.count;
                    return untracked(() => this.entries.filter(p => p.bottom === bottom).flatMap(p => [p.separator, p.host]));
                },
                (c: ComponentBase) => c
            );
        }

        this.pageArea = new Component<HTMLDivElement>('div');
        this.pageArea.class.add('mx-app-menu__page');
        this.placeIn(this.pageArea, this.contentPart);
        this.pageHead = part<HTMLDivElement>(this.pageArea, 'div', 'mx-app-menu__page-head');
        this.backer = new Button({ icon: glyph('arrow-start') });
        this.backer.class.add('mx-app-menu__back');
        this.backer.motif.on('click', () => this.showList());
        this.pageHead.controls.add(this.backer);

        probeLengths(this, [SHARE, LEAST, SPLIT]);
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onSelecting) this.onSelecting(own.onSelecting);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onItemClick) this.onItemClick(own.onItemClick);
        if (own.onItemsChanged) this.onItemsChanged(own.onItemsChanged);
        if (own.onSearchTextChanged) this.onSearchTextChanged(own.onSearchTextChanged);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty('selected', () => this.drawSelection());
        this.observeProperty('text', () => this.drawNames());
        this.observeProperty('listHeader', () => this.placeSlot('header'));
        this.observeProperty('listFooter', () => this.placeSlot('footer'));
        this.observeProperty('searchEnabled', () => this.drawSearch());
        this.observeProperty('searchText', () => this.drawSearch());
        this.observeProperty('label', () => this.drawNames());
        onLanguage(this, () => this.drawNames());
        this.nav.motif.on('click', (_, e) => this.navClick(e));
        // A turn ends with the animation of the list or the page itself.
        const turned = () => put(this, 'data-turn', null);
        this.nav.motif.on('animationend:self', turned);
        this.pageArea.motif.on('animationend:self', turned);
        this.nav.motif.on('keydown', (_, e) => this.navKeyDown(e));
        // Escape on a page that took the list's place goes back to the list before it closes the menu.
        this.panelPart.motif.on('keydown', (_, e) => {
            if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing || !this.pageShownAlone()) return;
            e.preventDefault();
            e.stopPropagation();
            this.showList();
        });
        // A change of the room or of a length (language, theme, density) lays it out again.
        onLayout(this, 'size', () => this.askLayout());
        onLayout(this, 'look', () => this.askLayout());
        this.drawNames();
        this.motif.setDisposable(() => {
            this.stopItems?.();
            for (const emitter of [this.selecting, this.selectionChanged, this.itemClick, this.itemsChanged, this.searchTextChanged]) emitter.dispose();
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
    get listHeader(): ComponentBase | null {
        return this.getProperty<ComponentBase | null | undefined>('listHeader') ?? null;
    }
    set listHeader(value: Bind<ComponentBase | null>) {
        this.assignProperty('listHeader', value);
    }
    get listFooter(): ComponentBase | null {
        return this.getProperty<ComponentBase | null | undefined>('listFooter') ?? null;
    }
    set listFooter(value: Bind<ComponentBase | null>) {
        this.assignProperty('listFooter', value);
    }
    get searchEnabled(): boolean {
        return this.getProperty<boolean | undefined>('searchEnabled') === true;
    }
    set searchEnabled(value: Bind<boolean>) {
        this.assignProperty('searchEnabled', value, Boolean);
    }
    get searchText(): string {
        return this.getProperty<string | undefined>('searchText') ?? '';
    }
    set searchText(value: Bind<string>) {
        this.assignProperty('searchText', value);
    }
    get onSearchTextChanged(): MotifEvent<AppMenuSearchTextChangedEventArgs> {
        return this.searchTextChanged.event;
    }
    get onItemsChanged(): MotifEvent<AppMenuItemsChangedEventArgs> {
        return this.itemsChanged.event;
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

    /** The item with `key`, as it is now. */
    findItem(key: Key): AppMenuItem | null {
        return this.looks.find(look => look.key === key)?.item ?? null;
    }

    // Changes by key. The items given are never changed: a new list is made, the item changed a new object and the
    // others the ones given, and it becomes `items`; `onItemsChanged` reports it.

    /** Adds an item at `index`, the end by default. */
    addItem(item: AppMenuItem, index?: number): boolean {
        return this.changeItems(list => {
            const at = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
            return [...list.slice(0, at), item, ...list.slice(at)];
        });
    }

    /** Removes the item with `key`. Returns `false` when there is none. */
    removeItem(key: Key): boolean {
        return this.changeItems(list => {
            const at = this.indexOfKey(list, key);
            return at < 0 ? null : list.filter((_, i) => i !== at);
        });
    }

    /** Moves the item with `key` to `index`. */
    moveItem(key: Key, index: number): boolean {
        return this.changeItems(list => {
            const at = this.indexOfKey(list, key);
            if (at < 0) return null;
            const rest = list.filter((_, i) => i !== at);
            const to = Math.max(0, Math.min(index, rest.length));
            return [...rest.slice(0, to), list[at], ...rest.slice(to)];
        });
    }

    /** Changes fields of the item with `key`; the others stay as they are. */
    updateItem(key: Key, changes: Partial<AppMenuItem>): boolean {
        return this.changeItems(list => {
            const at = this.indexOfKey(list, key);
            return at < 0 ? null : list.map((item, i) => (i === at ? { ...item, ...changes } : item));
        });
    }

    /** Holds the changes by key until `endUpdate()`, which applies them at once. */
    beginUpdate(): void {
        this.batch++;
    }

    endUpdate(): void {
        if (this.batch > 0) this.batch--;
        if (this.batch === 0 && this.pending) this.applyItems(this.pending);
    }

    changeItems(change: (list: readonly AppMenuItem[]) => AppMenuItem[] | null): boolean {
        const next = change(this.pending ?? givenList(this.peekProperty<readonly AppMenuItem[]>('items')));
        if (!next) return false;
        if (this.batch > 0) this.pending = next;
        else this.applyItems(next);
        return true;
    }

    applyItems(next: AppMenuItem[]): void {
        this.pending = null;
        this.changeProperty('items', next);
        this.itemsChanged.fire({ items: next, source: this });
    }

    indexOfKey(list: readonly AppMenuItem[], key: Key): number {
        return list.findIndex((item, i) => (givenValue<Key | undefined>(item, 'key') ?? i) === key);
    }

    /** Opens the menu on the page of the item with `key`. */
    openAt(key: Key): boolean {
        this.select(key);
        return this.open();
    }

    protected override placePanel(): void {
        this.showing = true;
        this.turnedTo = 'list';
        put(this, 'data-view', 'list');
        this.askLayout();
        this.drawSelection();
    }

    protected override panelClosed(): void {
        this.showing = false;
        this.turnedTo = 'list';
        put(this, 'data-view', 'list');
        put(this, 'data-turn', null);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly AppMenuItem[]>('items'));
        // The items' own functions are tracked; the list and the drawing are not. Only what decides the parts and the
        // layout of the items together is read here: each part follows the rest of its item's fields itself.
        let last: Look[] | null = null;
        this.stopItems = follow(
            this,
            'items',
            () => {
                const searching = this.query() !== '';
                const looks = items.map((item, index) => this.lookOf(item, index, searching));
                // The same layout is handed over as the same looks, and draws nothing.
                if (last && sameLooks(last, looks)) return last;
                return (last = looks);
            },
            looks => {
                this.looks = looks;
                this.drawItems();
            }
        );
    }

    lookOf(item: AppMenuItem, index: number, searching: boolean): Look {
        const field = (name: string) => String(givenField(item, name) ?? '');
        return {
            item,
            key: givenValue<Key | undefined>(item, 'key') ?? index,
            link: field('href') !== '',
            pictured: !!givenField(item, 'icon') || field('glyph') !== '',
            enabled: givenField(item, 'enabled') !== false,
            visible: givenField(item, 'visible') !== false,
            group: field('group'),
            bottom: givenField(item, 'bottom') === true,
            page: typeof givenValue(item, 'page') === 'function',
            text: searching ? field('text') : '',
            hint: searching ? field('hint') : ''
        };
    }

    /** Whether an item closes the menu when it is pressed, when it says so. */
    closesOf(look: Look): boolean | null {
        const closeOnClick = untracked(() => givenField<boolean | undefined>(look.item, 'closeOnClick'));
        return closeOnClick === undefined ? null : closeOnClick !== false;
    }

    /** An item's text as it is now. */
    textOf(look: Look): string {
        return untracked(() => String(givenField(look.item, 'text') ?? ''));
    }

    // An item's part is made when the item comes, moves between the lists or changes between button and link;
    // otherwise it is kept, and follows its item's own fields itself.
    drawItems(): void {
        // An item keeps its part while an item of its key stays in the same list as the same kind; the lists show the
        // parts in the items' order and take out only the parts of the items that are gone.
        const used = new Map<string, ItemPart>();
        this.entries = this.looks.map(look => {
            const base = `${look.bottom ? 'b' : 't'}${look.link ? 'a' : 'n'}:${typeof look.key}:${look.key}`;
            let name = base;
            for (let n = 1; used.has(name); n++) name = `${base}#${n}`;
            const p = this.slots.get(name) ?? this.makeItem(look);
            used.set(name, p);
            return p;
        });
        this.slots = used;
        untracked(() => this.drawn.count++);
        // A part given another item object follows that one from now on.
        untracked(() => this.looks.forEach((look, i) => this.entries[i].item.peek() !== look.item && (this.entries[i].item.value = look.item)));
        const lastGroup = new Map<boolean, string | null>();
        // When any item has an icon, an item without one keeps the room, so the labels line up.
        const icons = this.looks.some(look => look.visible && look.pictured);
        this.looks.forEach((look, i) => {
            const p = this.entries[i];
            const seen = this.shows(look);
            kept(p.host, seen);
            // A line before the first visible item of another group in the same list.
            const before = lastGroup.get(look.bottom);
            kept(p.separator, seen && before !== undefined && before !== null && before !== look.group);
            if (seen) lastGroup.set(look.bottom, look.group);
            kept(p.iconHost, look.pictured || icons);
            css(p.iconHost, 'visibility', look.pictured ? '' : 'hidden');
        });
        kept(this.bottomList, this.looks.some(look => look.bottom && this.shows(look)));
        const query = this.query();
        kept(this.noMatch, query !== '' && !this.looks.some(look => this.shows(look)));
        text(this.noMatch, query ? fillTemplate(uiLocale.strings.appMenuNoMatch, { text: query }) : '');
        this.dropViews();
        this.drawSelection();
    }

    makeItem(look: Look): ItemPart {
        const separator = loose<HTMLDivElement>('div', 'mx-app-menu__separator');
        separator.attr.add({ role: 'separator' });
        const host = loose<HTMLElement>(look.link ? 'a' : 'button', 'mx-app-menu__item');
        if (!look.link) host.attr.add({ type: 'button' });
        put(host, 'data-key', String(look.key));
        const iconHost = part<HTMLSpanElement>(host, 'span', 'mx-app-menu__icon');
        const itemGlyph = glyphPart(iconHost, '', 'mx-app-menu__glyph');
        const label = part<HTMLSpanElement>(host, 'span', 'mx-app-menu__label');
        const p: ItemPart = { item: createSignal(look.item), key: look.key, bottom: look.bottom, link: look.link, separator, host, iconHost, glyph: itemGlyph, icon: null, iconSource: null, label, badge: null, accessKey: null };
        // Each of the item's own fields writes only what shows it, when it changes.
        const watch = <T>(read: (item: AppMenuItem) => T, write: (value: T) => void) =>
            host.bindings.watch(() => {
                const value = read(p.item.value);
                untracked(() => write(value));
            });
        const field = (item: AppMenuItem, name: string) => String(givenField(item, name) ?? '');
        const enabled = (item: AppMenuItem) => givenField(item, 'enabled') !== false;
        watch(
            item => [field(item, 'text'), enabled(item)] as const,
            ([said, on]) => {
                const parsed = parseAccessKey(said);
                renderAccessKey(label, parsed);
                // A disabled item takes no key.
                const key = parsed.key && on ? accessKeyToken(parsed.key) : null;
                setAccessKeyAttribute(host, p.accessKey, key, () => this.pressItem(p));
                p.accessKey = key;
                // Its page is named by it.
                const view = this.views.get(p.key);
                if (view?.item === p.item.peek()) put(view.host, 'aria-label', parsed.text);
            }
        );
        watch(item => field(item, 'hint'), hint => put(host, 'title', hint || null));
        watch(enabled, on => put(host, 'aria-disabled', on ? null : 'true'));
        if (look.link) {
            watch(
                item => [field(item, 'href'), field(item, 'rel'), field(item, 'target'), enabled(item)] as const,
                ([href, rel, target, on]) => {
                    put(host, 'href', on ? href : null);
                    put(host, 'rel', rel || null);
                    put(host, 'target', target || null);
                }
            );
        }
        watch(
            item => [givenField<IconSource | null | undefined>(item, 'icon') ?? null, field(item, 'glyph')] as const,
            ([icon, name]) => this.drawIcon(p, icon, name)
        );
        watch(
            item => [givenField(item, 'dot') === true, givenField<number | null | undefined>(item, 'badge') ?? null] as const,
            ([dot, badge]) => this.drawBadge(p, dot, badge)
        );
        return p;
    }

    drawIcon(p: ItemPart, icon: IconSource | null, name: string): void {
        if (icon !== p.iconSource) {
            void p.icon?.dispose();
            p.icon = icon ? iconPart(p.iconHost, icon) : null;
            p.iconSource = icon;
        }
        put(p.glyph, 'data-icon', name || null);
        kept(p.glyph, !icon && name !== '');
    }

    drawBadge(p: ItemPart, dot: boolean, badge: number | null): void {
        const on = dot || badge !== null;
        if (on && !p.badge) {
            p.badge = new Badge({ size: 'sm' });
            p.badge.class.add('mx-app-menu__badge');
            p.host.controls.add(p.badge);
        }
        if (!p.badge) return;
        p.badge.dot = dot;
        p.badge.count = badge;
        kept(p.badge, on);
    }

    // Pages of items that are gone go with them.
    dropViews(): void {
        for (const [key, view] of this.views) {
            const look = this.looks.find(l => l.key === key && l.page);
            if (look) {
                view.item = look.item;
                continue;
            }
            void view.host.dispose();
            this.views.delete(key);
        }
    }

    drawSelection(): void {
        const key = this.shownKey;
        const stops = this.stops();
        const stop = stops.find(i => this.looks[i].key === key) ?? stops[0] ?? -1;
        this.listStop = stop;
        this.looks.forEach((look, i) => {
            const host = this.entries[i].host;
            const selected = look.page && look.key === key;
            mark(host, 'data-selected', selected);
            put(host, 'aria-current', selected ? 'page' : null);
            put(host, 'tabindex', i === stop ? '0' : '-1');
            // Where focus goes when the menu opens.
            mark(host, 'autofocus', i === stop);
        });
        if (this.showing && key !== null) this.showView(key);
    }

    showView(key: Key): void {
        const look = this.looks.find(l => l.key === key);
        if (!look) return;
        let view = this.views.get(key);
        if (!view) {
            const host = part<HTMLDivElement>(this.pageArea, 'div', 'mx-app-menu__view');
            host.attr.add({ role: 'region' });
            put(host, 'tabindex', '-1');
            const make = givenValue<(() => ComponentBase) | undefined>(look.item, 'page');
            const page = make?.();
            if (page) host.controls.add(page);
            view = { item: look.item, host };
            this.views.set(key, view);
        }
        put(view.host, 'aria-label', parseAccessKey(this.textOf(look)).text);
        for (const [k, v] of this.views) kept(v.host, k === key);
    }

    /** The items Tab and the arrows reach, in the order they stand: the list at the top, then the one at the bottom. */
    stops(): number[] {
        const can = (i: number) => this.shows(this.looks[i]) && this.looks[i].enabled;
        const all = this.looks.map((_, i) => i);
        return [...all.filter(i => !this.looks[i].bottom && can(i)), ...all.filter(i => this.looks[i].bottom && can(i))];
    }

    // Search: the items whose text or hint holds what was typed, without case and marks, in the locale.

    query(): string {
        return this.peekProperty('searchEnabled') === true ? foldText((this.peekProperty<string>('searchText') ?? '').trim(), uiLocale.locale) : '';
    }

    shows(look: Look): boolean {
        if (!look.visible) return false;
        const query = this.query();
        return !query || foldText(`${parseAccessKey(look.text).text} ${look.hint}`, uiLocale.locale).includes(query);
    }

    drawSearch(): void {
        const on = this.peekProperty('searchEnabled') === true;
        kept(this.searchHost, on);
        if (on && !this.search) {
            const search = new TextBox({ labelMode: 'hidden', size: 'md', type: 'search', icon: searchMark(), clearButton: true, autocomplete: 'off', spellcheck: false, label: () => uiLocale.strings.search, placeholder: () => uiLocale.strings.search });
            search.onValueChanged(e => e.byUser && this.searchBy(String(e.value ?? '')));
            search.motif.on('keydown', (_, e) => this.searchKeyDown(e));
            this.searchHost.controls.add(search);
            this.search = search;
        }
        if (this.search && this.search.value !== this.searchText) this.search.value = this.searchText;
        // What the search looks in is read again for what is typed.
        if (this.looks.length) this.renderItems();
    }

    searchKeyDown(e: KeyboardEvent): void {
        const stops = this.stops();
        if (e.key === 'ArrowDown' && stops.length) {
            e.preventDefault();
            this.moveTo(stops[0]);
        } else if (e.key === 'Enter' && stops.length) {
            e.preventDefault();
            this.moveTo(stops[0]);
            this.press(this.looks[stops[0]], e);
        } else if (e.key === 'Escape' && this.searchText) {
            // Escape clears the search before it closes the menu.
            e.preventDefault();
            e.stopPropagation();
            this.searchBy('');
        }
    }

    searchBy(text: string): void {
        this.changeProperty('searchText', text);
        this.searchTextChanged.fire({ text, source: this });
    }

    // The app's own content at the top and the bottom of the list.
    placeSlot(side: 'header' | 'footer'): void {
        const host = side === 'header' ? this.headerHost : this.footerHost;
        const old = side === 'header' ? this.headerControl : this.footerControl;
        const control = this.peekProperty<ComponentBase | null>(side === 'header' ? 'listHeader' : 'listFooter') ?? null;
        if (control === old) return;
        if (old && host.controls.items.includes(old)) host.controls.remove(old);
        if (control) host.controls.add(control);
        if (side === 'header') this.headerControl = control;
        else this.footerControl = control;
        kept(host, !!control);
    }

    drawNames(): void {
        const name = parseAccessKey(this.peekProperty<string>('text') ?? '').text || this.peekProperty<string>('label') || uiLocale.strings.appMenuLabel;
        if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) put(this.panelPart, 'aria-label', name);
        put(this.nav, 'aria-label', name);
        put(this.closer, 'aria-label', uiLocale.strings.appMenuClose);
        put(this.backer, 'aria-label', uiLocale.strings.appMenuBack);
    }

    // Layout: a panel over a share of the room, the whole room when that would be too narrow, and the list and the page
    // in turns when the panel cannot hold both.
    askLayout(): void {
        if (this.showing) measure(this, this.readRoom, this.layout);
    }

    readonly readRoom = (): Room => ({
        width: boxOf(this).clientWidth,
        share: lengthOf(this, SHARE, 500) / 1000,
        least: lengthOf(this, LEAST, 360),
        split: lengthOf(this, SPLIT, 560)
    });

    readonly layout = ({ width: room, share, least, split }: Room): void => {
        if (!this.showing || !room) return;
        const full = room * share < least;
        const width = full ? room : room * share;
        mark(this, 'data-full', full);
        const stacked = width < split;
        if (!stacked && this.stacked) {
            this.turnedTo = 'list';
            put(this, 'data-view', 'list');
            put(this, 'data-turn', null);
        }
        this.stacked = stacked;
        mark(this, 'data-stacked', stacked);
    };

    pageShownAlone(): boolean {
        return this.stacked && this.turnedTo === 'page';
    }

    showPage(): void {
        this.turn('page');
        if (!this.stacked) return;
        const key = this.shownKey;
        const view = key === null ? null : this.views.get(key);
        if (view) focusOn(view.host, { preventScroll: true });
    }

    showList(): void {
        this.turn('list');
        const stop = this.entries[this.listStop];
        if (stop) focusOn(stop.host, { preventScroll: true });
    }

    // While the list and the page take turns, the one coming in pushes the other out; the turn ends with its animation.
    turn(view: 'list' | 'page'): void {
        const from = this.turnedTo;
        this.turnedTo = view;
        put(this, 'data-view', view);
        if (from === view || !this.showing || !this.stacked) return;
        put(this, 'data-turn', view === 'page' ? 'forward' : 'back');
        measure(this, this.readAnimation, this.endStillTurn);
    }

    readonly readAnimation = (): string => styleOf(this.nav, ['animation-name'])['animation-name'];

    // Where nothing animates (motion turned off by a stylesheet), no end comes.
    readonly endStillTurn = (animation: string): void => {
        if (animation === '' || animation === 'none') put(this, 'data-turn', null);
    };

    /** The item an event came from, -1 for none. */
    indexOfEvent(e: Event): number {
        return this.entries.findIndex(p => p.host.motif.isEventFrom(e));
    }

    navClick(e: MouseEvent): void {
        const index = this.indexOfEvent(e);
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
        const args: AppMenuItemClickEventArgs = { item: look.item, key: look.key, keepOpen: !(this.closesOf(look) ?? this.closeOnCommand),originalEvent: e, source: this };
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
        const index = this.indexOfEvent(e);
        if (index < 0 || e.isComposing) return;
        if (e.key === ' ' && this.looks[index].link) {
            e.preventDefault();
            this.entries[index].host.attr.add({ click: true });
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
        const keyed = stops.find(i => parseAccessKey(this.textOf(this.looks[i])).key?.toLocaleLowerCase(uiLocale.locale) === letter);
        if (keyed !== undefined) {
            e.preventDefault();
            this.pressItem(this.entries[keyed]);
            return -1;
        }
        if (e.altKey || !letter.trim()) return -1;
        const now = Date.now();
        this.typed = now - this.typedAt < 700 ? this.typed + letter : letter;
        this.typedAt = now;
        const text = (i: number) => parseAccessKey(this.textOf(this.looks[i])).text.toLocaleLowerCase(uiLocale.locale);
        const order = [...stops.slice(at + (this.typed.length > 1 ? 0 : 1)), ...stops.slice(0, at + (this.typed.length > 1 ? 0 : 1))];
        return order.find(i => text(i).startsWith(this.typed)) ?? -1;
    }

    /** Moves focus to an item and clicks it: its access key, or its letter in the list. */
    pressItem(p: ItemPart): boolean {
        const index = this.entries.indexOf(p);
        if (index < 0) return false;
        this.moveTo(index);
        p.host.attr.add({ click: true });
        return true;
    }

    moveTo(index: number): void {
        for (const p of this.entries) put(p.host, 'tabindex', '-1');
        const host = this.entries[index].host;
        put(host, 'tabindex', '0');
        this.listStop = index;
        focusOn(host);
    }
}
