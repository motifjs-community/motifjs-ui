import { Component, Emitter, Transporter, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { accessKeyToken, parseAccessKey, renderAccessKey, setAccessKeyAttribute } from "../../core/access-key";
import { Control } from "../../core/control";
import { glyphPart, mark, part, put, shown } from "../../core/draw-parts";
import { fillTemplate } from "../../core/fill-template";
import { focusInitial, focusableIn } from "../../core/focus";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { chevronDown, glyph, moreMark } from "../../core/glyphs";
import type { IconSource } from "../../core/icon-source";
import { onLookChanged } from "../../core/look-watch";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
import { ResizeWatch } from "../../core/resize-watch";
import { TokenLengths } from "../../core/token-lengths";
import { uiLocale } from "../../core/ui-locale";
import type { MenuItem } from "../../parts/menu/menu-item";
import type { MenuItemClickEventArgs } from "../../parts/menu/menu-item-click-event-args";
import { Popup } from "../../parts/popup/Popup";
import { Button } from "../button/Button";
import type { ButtonProps } from "../button/button-props";
import { menuItemOf } from "../button/menu-item-of";
import { ContextMenu } from "../contextmenu/ContextMenu";
import type { ContextMenuOpeningEventArgs } from "../contextmenu/context-menu-opening-event-args";
import { RibbonGallery } from "./RibbonGallery";
import { RibbonKeyHints, type InnerHints, type KeyHint } from "./RibbonKeyHints";
import { changedTabs, indexOfKey, inserted, itemsAlong, partsOf } from "./ribbon-paths";
import type { RibbonAppButtonEventArgs } from "./ribbon-app-button-event-args";
import type { RibbonCommand } from "./ribbon-command";
import type { RibbonCommandClickEventArgs } from "./ribbon-command-click-event-args";
import type { RibbonCommandSize } from "./ribbon-command-size";
import type { RibbonCommandType } from "./ribbon-command-type";
import type { RibbonGalleryItem } from "./ribbon-gallery-item";
import type { RibbonGroup } from "./ribbon-group";
import type { RibbonGroupMoreEventArgs } from "./ribbon-group-more-event-args";
import type { RibbonMenuCustomization } from "./ribbon-menu-customization";
import type { RibbonMenuCustomizedEventArgs } from "./ribbon-menu-customized-event-args";
import type { RibbonMenuDisplay } from "./ribbon-menu-display";
import type { RibbonMenuDisplayChangedEventArgs } from "./ribbon-menu-display-changed-event-args";
import type { RibbonMenuItemsChangedEventArgs } from "./ribbon-menu-items-changed-event-args";
import type { RibbonMenuLayout } from "./ribbon-menu-layout";
import type { RibbonMenuLayoutChangedEventArgs } from "./ribbon-menu-layout-changed-event-args";
import type { RibbonMenuProps } from "./ribbon-menu-props";
import type { RibbonQuickBarPosition } from "./ribbon-quick-bar-position";
import type { RibbonTab } from "./ribbon-tab";
import type { RibbonTabSelectingEventArgs } from "./ribbon-tab-selecting-event-args";
import type { RibbonTabSelectionChangedEventArgs } from "./ribbon-tab-selection-changed-event-args";

const OWN = ['items', 'value', 'layout', 'adaptive', 'layoutSwitch', 'barStart', 'barEnd', 'display', 'appButton', 'quickCommands', 'quickBar', 'keyHints', 'customizable', 'customization'] as const;

// Narrower than this, the menu shows a single row and a tab picker in place of the tabs.
const COMPACT = '--_ribbon-menu-compact-size';

type Key = string | number;

interface TabLook {
    tab: RibbonTab;
    key: Key;
    text: string;
    hint: string;
    context: string;
    visible: boolean;
    enabled: boolean;
}

interface TabPart {
    tab: RibbonTab;
    key: string;
    host: Component<HTMLButtonElement>;
    caption: Component<HTMLSpanElement>;
    accessKey: string | null;
}

interface Panel {
    tab: RibbonTab;
    key: string;
    // The groups as given, before the user's changes.
    raw: GroupLook[];
    host: Component<HTMLDivElement>;
    groups: Map<RibbonGroup, GroupPart>;
    stop: () => void;
    // The "more" button of the simplified layout: the groups that do not fit, and the commands it does not show.
    overflow: Button | null;
}

interface GroupLook {
    group: RibbonGroup;
    // Its key in the tab: its own, else its position.
    key: string;
    fixed: boolean;
    text: string;
    visible: boolean;
    more: boolean;
    moreHint: string;
    priority: number;
    collapsible: boolean;
}

interface GroupPart {
    group: RibbonGroup;
    divider: Component<HTMLDivElement>;
    host: Component<HTMLDivElement>;
    inner: Component<HTMLDivElement>;
    commands: Component<HTMLDivElement>;
    foot: Component<HTMLDivElement>;
    label: Component<HTMLSpanElement>;
    more: Button | null;
    made: Map<RibbonCommand, Made>;
    stop: () => void;
    // The element Tab reaches in the group.
    current: HTMLElement | null;
    look: GroupLook | null;
    wanted: Wanted[];
    // How far it gave way to the room: 0 as given, 1 large commands medium, 2 all small, 3 folded into one button (in
    // the simplified layout 2 is in the "more" menu).
    level: number;
    // The button the group folds into, and the popup it opens with the group in it.
    fold: Button | null;
    popup: Popup | null;
}

interface Wanted {
    command: RibbonCommand;
    key: string;
    fixed: boolean;
    type: RibbonCommandType;
    size: RibbonCommandSize;
    visible: boolean;
    simple: boolean;
}

interface Made {
    control: ComponentBase;
    type: RibbonCommandType;
    want: Wanted;
    made: Map<RibbonCommand, Made> | null;
    stop: (() => void) | null;
}

interface Where {
    tab: RibbonTab | null;
    group: RibbonGroup | null;
}

// A command found by its path in what the app gave.
interface Found {
    command: RibbonCommand;
    group: RibbonGroup;
    tab: RibbonTab;
}

/**
 * The commands of an application in tabs, each tab in named groups: large commands with the icon above the text,
 * medium and small ones three to a column, rows of small commands, menus, split buttons and any content of the app.
 * Tabs of a context (a picture being edited, a table chosen) are drawn in the context color while it lasts.
 *
 * Nothing is in it until it is given: every tab, group and command comes from `items`, each field a value or a
 * function that is followed. A tab's groups are made the first time it is shown, and kept. The tabs are one Tab stop,
 * moved between with the arrow keys; in the commands each group is a Tab stop and the arrow keys move between the
 * commands, Escape goes back to the tabs. An `&` in a tab's text gives it an access key.
 *
 * @example
 * <RibbonMenu x-model={() => this.tab} items={[
 *     { key: 'home', text: '&Home', groups: [
 *         { text: 'Clipboard', commands: [
 *             { text: 'Paste', glyph: 'paste', size: 'large', type: 'split', menu: pasteOptions, click: () => this.paste() },
 *             { text: 'Copy', glyph: 'copy', click: () => this.copy() }
 *         ] }
 *     ] }
 * ]} />
 */
export class RibbonMenu extends Control<HTMLDivElement, RibbonMenuProps> {
    selecting = new Emitter<RibbonTabSelectingEventArgs>();
    selectionChanged = new Emitter<RibbonTabSelectionChangedEventArgs>();
    commandClick = new Emitter<RibbonCommandClickEventArgs>();
    groupMore = new Emitter<RibbonGroupMoreEventArgs>();
    layoutChanged = new Emitter<RibbonMenuLayoutChangedEventArgs>();
    displayChanged = new Emitter<RibbonMenuDisplayChangedEventArgs>();
    customized = new Emitter<RibbonMenuCustomizedEventArgs>();
    appButtonClick = new Emitter<RibbonAppButtonEventArgs>();
    itemsChanged = new Emitter<RibbonMenuItemsChangedEventArgs>();
    // Changes made between beginUpdate() and endUpdate(), applied at once.
    batch = 0;
    pending: RibbonTab[] | null = null;
    reveal: Component<HTMLButtonElement>;
    frame: Component<HTMLDivElement>;
    bar: Component<HTMLDivElement>;
    app: Component<HTMLButtonElement>;
    appCaption: Component<HTMLSpanElement>;
    appKey: string | null = null;
    quickTop: Component<HTMLDivElement>;
    quickBelow: Component<HTMLDivElement>;
    quickHost: Component<HTMLDivElement> | null = null;
    quickMade = new Map<RibbonCommand, Made>();
    stopQuick: (() => void) | null = null;
    picker: Button;
    startHost: Component<HTMLDivElement>;
    endHost: Component<HTMLDivElement>;
    switcher: Button;
    tabList: Component<HTMLDivElement>;
    body: Component<HTMLDivElement>;
    stage: Component<HTMLDivElement>;
    back: Button;
    forward: Button;
    // What the app put at the start and the end of the row of tabs.
    startControl: ComponentBase | null = null;
    endControl: ComponentBase | null = null;
    entries: TabPart[] = [];
    looks: TabLook[] = [];
    panels = new Map<RibbonTab, Panel>();
    stopTabs: (() => void) | null = null;
    rovingQueued = false;
    layoutQueued = false;
    laidOut = -1;
    // The commands are open over the page (display 'tabs' or 'auto').
    floating = false;
    compact = false;
    // The user's changes: our own copy, never the object the app gave.
    custom: RibbonMenuCustomization = {};
    hints: RibbonKeyHints;
    customMenu: ContextMenu;
    lengths: TokenLengths;
    altDown = false;
    altChord = false;

    constructor(props?: IBaseProp<RibbonMenuProps>) {
        super(props);
        const own = (this.props ?? {}) as RibbonMenuProps;
        this.element.classList.add('mx-ribbon-menu');
        // Hidden automatically, the menu is this strip until it is opened over the page.
        this.reveal = part<HTMLButtonElement>(this, 'button', 'mx-ribbon-menu__reveal');
        this.reveal.element.type = 'button';
        glyphPart(this.reveal, 'chevron-down', 'mx-ribbon-menu__reveal-glyph');
        this.frame = part<HTMLDivElement>(this, 'div', 'mx-ribbon-menu__frame');
        this.bar = part<HTMLDivElement>(this.frame, 'div', 'mx-ribbon-menu__bar');
        this.startHost = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__bar-start');
        this.app = part<HTMLButtonElement>(this.bar, 'button', 'mx-ribbon-menu__app');
        this.app.element.type = 'button';
        this.appCaption = part<HTMLSpanElement>(this.app, 'span', 'mx-ribbon-menu__app-text');
        shown(this.app.element, false);
        this.quickTop = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__quick');
        this.picker = new Button({ menu: [] });
        this.picker.element.classList.add('mx-ribbon-menu__picker');
        this.bar.controls.add(this.picker);
        this.tabList = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__tabs');
        this.tabList.element.setAttribute('role', 'tablist');
        this.endHost = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__bar-end');
        shown(this.startHost.element, false);
        shown(this.endHost.element, false);
        this.body = part<HTMLDivElement>(this.frame, 'div', 'mx-ribbon-menu__body');
        // The commands scroll in the stage when they do not fit even after giving way; the buttons at its ends scroll it.
        this.stage = part<HTMLDivElement>(this.body, 'div', 'mx-ribbon-menu__stage');
        this.back = this.makeScroll(-1);
        this.forward = this.makeScroll(1);
        // Its variant and size come from its place.
        this.switcher = new Button({ icon: glyph('chevron-up') });
        this.switcher.element.classList.add('mx-ribbon-menu__switch');
        this.switcher.element.addEventListener('click', e => this.switchLayout(e));
        this.body.controls.add(this.switcher);
        this.quickBelow = part<HTMLDivElement>(this.frame, 'div', 'mx-ribbon-menu__quick mx-ribbon-menu__quick--below');
        for (const quick of [this.quickTop, this.quickBelow]) {
            quick.element.setAttribute('role', 'toolbar');
            shown(quick.element, false);
        }
        this.hints = new RibbonKeyHints(this, () => this.tabHints(), () => this.commandHints(), () => {});
        this.customMenu = new ContextMenu();
        this.customMenu.onOpening(e => this.customMenuOpening(e));
        this.controls.add(this.customMenu);
        this.lengths = new TokenLengths(this.element, [COMPACT], () => this.queueLayout());

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.label !== undefined) this.bindProperty('text', own.label);
        if (own.onSelecting) this.onSelecting(own.onSelecting);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onCommandClick) this.onCommandClick(own.onCommandClick);
        if (own.onGroupMore) this.onGroupMore(own.onGroupMore);
        if (own.onLayoutChanged) this.onLayoutChanged(own.onLayoutChanged);
        if (own.onDisplayChanged) this.onDisplayChanged(own.onDisplayChanged);
        if (own.onCustomized) this.onCustomized(own.onCustomized);
        if (own.onAppButton) this.onAppButton(own.onAppButton);
        if (own.onItemsChanged) this.onItemsChanged(own.onItemsChanged);

        this.observeProperty('items', () => this.renderTabs());
        this.observeProperty('value', () => this.drawSelection());
        this.observeProperty('text', () => this.drawNames());
        this.observeProperty('layout', () => this.drawLayout());
        this.observeProperty('adaptive', () => this.queueLayout());
        this.observeProperty('layoutSwitch', () => this.drawLayout());
        this.observeProperty('barStart', () => this.placeSlot('start'));
        this.observeProperty('barEnd', () => this.placeSlot('end'));
        this.observeProperty('display', () => this.drawDisplay());
        this.observeProperty('appButton', () => this.drawApp());
        this.observeProperty('quickCommands', () => this.drawQuick());
        this.observeProperty('quickBar', () => this.drawQuick());
        this.observeProperty('customization', () => this.takeCustomization());
        onLanguage(this, () => this.drawNames());
        this.tabList.element.addEventListener('click', e => this.tabClick(e));
        this.tabList.element.addEventListener('dblclick', e => this.tabDoubleClick(e));
        this.app.element.addEventListener('click', e => this.appButtonClick.fire({ target: this.app.element, originalEvent: e, source: this }));
        this.reveal.element.addEventListener('click', () => this.openOver(true));
        this.element.addEventListener('keydown', e => this.ownKeyDown(e));
        this.element.addEventListener('focusout', e => this.focusLeft(e));
        const doc = this.element.ownerDocument;
        const keyDown = (e: KeyboardEvent) => this.pageKeyDown(e);
        const keyUp = (e: KeyboardEvent) => this.pageKeyUp(e);
        const pointerDown = (e: PointerEvent) => this.pagePointerDown(e);
        doc.addEventListener('keydown', keyDown, true);
        doc.addEventListener('keyup', keyUp, true);
        doc.addEventListener('pointerdown', pointerDown, true);
        this.tabList.element.addEventListener('keydown', e => this.tabKeyDown(e));
        this.body.element.addEventListener('keydown', e => this.commandKeyDown(e));
        this.body.element.addEventListener('focusin', e => this.commandFocused(e));
        // Another width, design language, theme or density: the groups give way again.
        const room = new ResizeWatch(() => {
            if (this.element.clientWidth !== this.laidOut) this.queueLayout();
        });
        room.observe(this.element);
        this.motif.setDisposable(onLookChanged(() => this.queueLayout()));
        this.drawNames();
        this.drawLayout();
        this.drawDisplay();
        this.motif.setDisposable(() => {
            doc.removeEventListener('keydown', keyDown, true);
            doc.removeEventListener('keyup', keyUp, true);
            doc.removeEventListener('pointerdown', pointerDown, true);
            this.stopQuick?.();
            this.dropMade(this.quickMade);
            this.lengths.dispose();
            room.disconnect();
            this.stopTabs?.();
            for (const panel of this.panels.values()) this.dropPanel(panel);
            for (const emitter of [this.selecting, this.selectionChanged, this.commandClick, this.groupMore, this.layoutChanged, this.displayChanged, this.customized, this.appButtonClick, this.itemsChanged]) emitter.dispose();
        });
    }

    // Properties (see RibbonMenuProps).

    get items(): readonly RibbonTab[] {
        return this.getProperty<readonly RibbonTab[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly RibbonTab[]>) {
        this.assignProperty('items', value);
    }
    get value(): Key | null {
        return this.getProperty<Key | null | undefined>('value') ?? null;
    }
    set value(value: Bind<Key | null>) {
        this.assignProperty('value', value);
    }
    get label(): string {
        return this.text;
    }
    set label(value: Bind<string>) {
        this.text = value;
    }
    get layout(): RibbonMenuLayout {
        return this.getProperty<RibbonMenuLayout | undefined>('layout') ?? 'classic';
    }
    set layout(value: Bind<RibbonMenuLayout>) {
        this.assignProperty('layout', value);
    }
    get adaptive(): boolean {
        return this.getProperty<boolean | undefined>('adaptive') !== false;
    }
    set adaptive(value: Bind<boolean>) {
        this.assignProperty('adaptive', value, Boolean);
    }
    get layoutSwitch(): boolean {
        return this.getProperty<boolean | undefined>('layoutSwitch') !== false;
    }
    set layoutSwitch(value: Bind<boolean>) {
        this.assignProperty('layoutSwitch', value, Boolean);
    }
    get barStart(): ComponentBase | null {
        return this.getProperty<ComponentBase | null | undefined>('barStart') ?? null;
    }
    set barStart(value: Bind<ComponentBase | null>) {
        this.assignProperty('barStart', value);
    }
    get barEnd(): ComponentBase | null {
        return this.getProperty<ComponentBase | null | undefined>('barEnd') ?? null;
    }
    set barEnd(value: Bind<ComponentBase | null>) {
        this.assignProperty('barEnd', value);
    }
    get display(): RibbonMenuDisplay {
        return this.getProperty<RibbonMenuDisplay | undefined>('display') ?? 'always';
    }
    set display(value: Bind<RibbonMenuDisplay>) {
        this.assignProperty('display', value);
    }
    get appButton(): string {
        return this.getProperty<string | undefined>('appButton') ?? '';
    }
    set appButton(value: Bind<string>) {
        this.assignProperty('appButton', value);
    }
    get quickCommands(): readonly RibbonCommand[] {
        return this.getProperty<readonly RibbonCommand[] | undefined>('quickCommands') ?? [];
    }
    set quickCommands(value: Bind<readonly RibbonCommand[]>) {
        this.assignProperty('quickCommands', value);
    }
    get quickBar(): RibbonQuickBarPosition {
        return this.getProperty<RibbonQuickBarPosition | undefined>('quickBar') ?? 'start';
    }
    set quickBar(value: Bind<RibbonQuickBarPosition>) {
        this.assignProperty('quickBar', value);
    }
    get keyHints(): boolean {
        return this.getProperty<boolean | undefined>('keyHints') !== false;
    }
    set keyHints(value: Bind<boolean>) {
        this.assignProperty('keyHints', value, Boolean);
    }
    get customizable(): boolean {
        return this.getProperty<boolean | undefined>('customizable') !== false;
    }
    set customizable(value: Bind<boolean>) {
        this.assignProperty('customizable', value, Boolean);
    }
    get customization(): RibbonMenuCustomization {
        return copyOf(this.custom);
    }
    set customization(value: Bind<RibbonMenuCustomization | null>) {
        this.assignProperty('customization', value);
    }
    get onDisplayChanged(): MotifEvent<RibbonMenuDisplayChangedEventArgs> {
        return this.displayChanged.event;
    }
    get onCustomized(): MotifEvent<RibbonMenuCustomizedEventArgs> {
        return this.customized.event;
    }
    get onItemsChanged(): MotifEvent<RibbonMenuItemsChangedEventArgs> {
        return this.itemsChanged.event;
    }
    get onAppButton(): MotifEvent<RibbonAppButtonEventArgs> {
        return this.appButtonClick.event;
    }
    /** `true` while the commands are open over the page (`display` `'tabs'` or `'auto'`). */
    get isOpenOver(): boolean {
        return this.floating;
    }
    /** `true` while the menu is narrower than its compact size: a single row and a tab picker. */
    get isCompact(): boolean {
        return this.compact;
    }
    get onLayoutChanged(): MotifEvent<RibbonMenuLayoutChangedEventArgs> {
        return this.layoutChanged.event;
    }
    get onSelecting(): MotifEvent<RibbonTabSelectingEventArgs> {
        return this.selecting.event;
    }
    get onSelectionChanged(): MotifEvent<RibbonTabSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }
    get onCommandClick(): MotifEvent<RibbonCommandClickEventArgs> {
        return this.commandClick.event;
    }
    get onGroupMore(): MotifEvent<RibbonGroupMoreEventArgs> {
        return this.groupMore.event;
    }

    /** The key of the tab shown: `value`, else the first tab that can be chosen. */
    get shownKey(): Key | null {
        const wanted = this.peekProperty<Key | null | undefined>('value') ?? null;
        const open = this.looks.filter(look => look.visible && look.enabled);
        return open.find(look => look.key === wanted)?.key ?? open[0]?.key ?? null;
    }

    /** Shows the tab with `key`, as a click on it does. Returns `false` when `onSelecting` refused. */
    select(key: Key): boolean {
        const look = this.looks.find(l => l.key === key && l.visible && l.enabled);
        return look ? this.choose(look, null) : false;
    }

    /** The control made for a command, once its tab has been shown. */
    controlOf(command: RibbonCommand): ComponentBase | null {
        const find = (made: Map<RibbonCommand, Made>): ComponentBase | null => {
            for (const [c, m] of made) {
                if (c === command) return m.control;
                const inner = m.made && find(m.made);
                if (inner) return inner;
            }
            return null;
        };
        for (const panel of this.panels.values()) {
            for (const group of panel.groups.values()) {
                const found = find(group.made);
                if (found) return found;
            }
        }
        return null;
    }

    /** The tab with `key`, as the app gave it. */
    findTab(key: Key): RibbonTab | null {
        return this.looks.find(look => look.key === key)?.tab ?? null;
    }

    /** The group at `path` (`tab/group`, each a key or a position), as it is now. */
    findGroup(path: string): RibbonGroup | null {
        const parts = partsOf(path);
        return parts.length === 2 ? ((itemsAlong(this.currentTabs(), parts)?.[1] as RibbonGroup | undefined) ?? null) : null;
    }

    /** The command at `path` (`tab/group/command`, a row's command a fourth part), as it is now. */
    findCommand(path: string): RibbonCommand | null {
        const parts = partsOf(path);
        if (parts.length < 3) return null;
        return (itemsAlong(this.currentTabs(), parts)?.[parts.length - 1] as RibbonCommand | undefined) ?? null;
    }

    // Changes by path. The tabs, groups and commands given are never changed: a new list is made, the items along the
    // changed path new objects and the others the ones given, and it becomes `items`; `onItemsChanged` reports it.

    /** Adds a tab at `index`, the end by default. Returns `false` when nothing changed. */
    addTab(tab: RibbonTab, index?: number): boolean {
        return this.changeItems([], list => inserted(list, tab, index));
    }

    /** Adds a group to the tab at `tabPath`. */
    addGroup(tabPath: string, group: RibbonGroup, index?: number): boolean {
        const parent = partsOf(tabPath);
        return parent.length === 1 && this.changeItems(parent, list => inserted(list, group, index));
    }

    /** Adds a command to the group at `parentPath` (`tab/group`), or to a row (`tab/group/row`). */
    addCommand(parentPath: string, command: RibbonCommand, index?: number): boolean {
        const parent = partsOf(parentPath);
        return (parent.length === 2 || parent.length === 3) && this.changeItems(parent, list => inserted(list, command, index));
    }

    /** Removes the tab, group or command at `path`. */
    remove(path: string): boolean {
        const parts = partsOf(path);
        if (!parts.length) return false;
        const key = parts[parts.length - 1];
        return this.changeItems(parts.slice(0, -1), list => {
            const at = indexOfKey(list, key);
            return at < 0 ? null : list.filter((_, i) => i !== at);
        });
    }

    /**
     * Moves the tab, group or command at `path` to `index` in its list, or in the list at `toParent`: another tab for a
     * group, another group (or row) for a command.
     */
    move(path: string, index: number, toParent?: string): boolean {
        const parts = partsOf(path);
        const from = parts.slice(0, -1);
        const to = toParent === undefined ? from : partsOf(toParent);
        const item = itemsAlong(this.currentTabs(), parts)?.[parts.length - 1];
        if (!item || to.length !== from.length || (to.length > 0 && !itemsAlong(this.currentTabs(), to))) return false;
        this.beginUpdate();
        const removed = this.remove(path);
        const added = removed && this.changeItems(to, list => inserted(list, item, index));
        this.endUpdate();
        return added;
    }

    /** Changes fields of the tab, group or command at `path`; the others stay as they are. */
    update(path: string, changes: Partial<RibbonTab> | Partial<RibbonGroup> | Partial<RibbonCommand>): boolean {
        const parts = partsOf(path);
        if (!parts.length) return false;
        const key = parts[parts.length - 1];
        return this.changeItems(parts.slice(0, -1), list => {
            const at = indexOfKey(list, key);
            return at < 0 ? null : list.map((x, i) => (i === at ? { ...(x as object), ...changes } : x));
        });
    }

    /** Holds the changes by path until `endUpdate()`, which applies them at once. */
    beginUpdate(): void {
        this.batch++;
    }

    endUpdate(): void {
        if (this.batch > 0) this.batch--;
        if (this.batch === 0 && this.pending) this.applyItems(this.pending);
    }

    currentTabs(): readonly RibbonTab[] {
        return this.pending ?? givenList(this.peekProperty<readonly RibbonTab[]>('items'));
    }

    changeItems(parent: string[], change: (list: readonly unknown[]) => unknown[] | null): boolean {
        const next = changedTabs(this.currentTabs(), parent, change) as RibbonTab[] | null;
        if (!next) return false;
        if (this.batch > 0) this.pending = next;
        else this.applyItems(next);
        return true;
    }

    applyItems(next: RibbonTab[]): void {
        this.pending = null;
        this.changeProperty('items', next);
        this.itemsChanged.fire({ items: next, source: this });
    }

    /**
     * Reads the tabs, groups and commands again after they were changed in place. Your items can be plain or reactive,
     * and the menu reads them as they are.
     */
    refresh(): void {
        this.reState();
    }

    /** Opens the commands over the page when the menu shows only its tabs or hides itself; `false` closes them. */
    openOver(open: boolean): void {
        if (this.display === 'always') return;
        this.setFloating(open);
        if (open) queueMicrotask(() => this.focus());
    }

    /** Shows the key hints, as Alt or F10 does. */
    showKeyHints(): void {
        if (this.display === 'auto' && !this.floating) this.setFloating(true);
        this.hints.start('tabs');
    }

    /** The tabs Tab and the arrows reach, in their order. */
    protected override get focusElement(): HTMLElement {
        const key = this.shownKey;
        const index = this.looks.findIndex(look => look.key === key);
        return index >= 0 ? this.entries[index].host.element : this.element;
    }

    // Tabs.

    renderTabs(): void {
        this.stopTabs?.();
        const tabs = givenList(this.peekProperty<readonly RibbonTab[]>('items'));
        // The tabs' own functions are tracked; the list and the drawing are not.
        this.stopTabs = follow(
            this,
            'items',
            () => tabs.map((tab, index) => this.tabLookOf(tab, index)),
            looks => {
                this.looks = looks;
                this.drawTabs();
            }
        );
    }

    tabLookOf(tab: RibbonTab, index: number): TabLook {
        return {
            tab,
            key: givenValue<Key | undefined>(tab, 'key') ?? index,
            text: String(givenField(tab, 'text') ?? ''),
            hint: String(givenField(tab, 'hint') ?? ''),
            context: String(givenField(tab, 'context') ?? ''),
            visible: givenField(tab, 'visible') !== false,
            enabled: givenField(tab, 'enabled') !== false
        };
    }

    // The tabs are made again when they are others; a tab's panel stays while its tab does.
    drawTabs(): void {
        const stale = this.entries.length !== this.looks.length || this.entries.some((p, i) => p.key !== String(this.looks[i].key));
        if (stale) {
            for (const p of this.entries) void p.host.dispose();
            this.entries = this.looks.map(look => this.makeTab(look));
        }
        this.looks.forEach((look, i) => (this.entries[i].tab = look.tab));
        // A tab given again under the same key, as another object, keeps its panel; its groups are read from it.
        for (const look of this.looks) {
            const panel = [...this.panels.values()].find(p => p.key === String(look.key));
            if (!panel || panel.tab === look.tab) continue;
            this.panels.delete(panel.tab);
            panel.tab = look.tab;
            this.panels.set(look.tab, panel);
            this.followGroups(panel);
        }
        this.looks.forEach((look, i) => {
            const p = this.entries[i];
            const host = p.host.element;
            const parsed = parseAccessKey(look.text);
            renderAccessKey(p.caption.element, parsed);
            const key = parsed.key ? accessKeyToken(parsed.key) : null;
            setAccessKeyAttribute(host, p.accessKey, key);
            p.accessKey = key;
            shown(host, look.visible);
            put(host, 'title', look.hint || null);
            put(host, 'aria-disabled', look.enabled ? null : 'true');
            put(host, 'data-key', String(look.key));
            // A tab of a context is drawn in the context color; its name is told, not shown.
            put(host, 'data-context', look.context || null);
            put(host, 'aria-description', look.context || null);
        });
        for (const [tab, panel] of this.panels) {
            if (this.looks.some(look => look.tab === tab)) continue;
            this.dropPanel(panel);
            this.panels.delete(tab);
        }
        this.drawSelection();
    }

    makeTab(look: TabLook): TabPart {
        const host = part<HTMLButtonElement>(this.tabList, 'button', 'mx-ribbon-menu__tab');
        host.element.type = 'button';
        host.element.setAttribute('role', 'tab');
        host.element.id = nextId('mx-ribbon-tab');
        const caption = part<HTMLSpanElement>(host, 'span', 'mx-ribbon-menu__tab-text');
        return { tab: look.tab, key: String(look.key), host, caption, accessKey: null };
    }

    drawNames(): void {
        put(this.tabList.element, 'aria-label', parseAccessKey(this.text ?? '').text || uiLocale.strings.ribbonMenuLabel);
        for (const panel of this.panels.values()) for (const group of panel.groups.values()) this.drawMoreHint(group);
        const simple = this.peekProperty<RibbonMenuLayout>('layout') === 'simple';
        const name = simple ? uiLocale.strings.ribbonMenuClassic : uiLocale.strings.ribbonMenuSimple;
        this.switcher.hint = name;
        for (const panel of this.panels.values()) if (panel.overflow) panel.overflow.hint = uiLocale.strings.moreOptions;
    }

    drawSelection(): void {
        const key = this.shownKey;
        this.looks.forEach((look, i) => {
            const host = this.entries[i].host.element;
            const selected = look.key === key;
            host.setAttribute('aria-selected', String(selected));
            host.tabIndex = selected ? 0 : -1;
        });
        const look = this.looks.find(l => l.key === key);
        if (look) this.showPanel(look);
        for (const [tab, panel] of this.panels) shown(panel.host.element, tab === look?.tab);
        this.drawPicker();
        this.queueLayout();
    }

    // In a compact menu, a button with the tab shown chooses the others.
    drawPicker(): void {
        const key = this.shownKey;
        const shownLook = this.looks.find(l => l.key === key);
        this.picker.text = parseAccessKey(shownLook?.text ?? '').text;
        this.picker.hint = uiLocale.strings.ribbonMenuTabs;
        this.picker.menu = this.looks
            .filter(l => l.visible && l.enabled)
            .map(l => ({ text: parseAccessKey(l.text).text, checked: l.key === key, group: 'tab', click: () => this.choose(l, null) }));
        this.picker.refresh();
    }

    tabClick(e: MouseEvent): void {
        const index = this.indexOfTab(e.target);
        if (index < 0) return;
        const look = this.looks[index];
        if (!look.enabled || !this.isEnabled) return;
        // Showing only the tabs, a tab opens its commands over the page, and closes them again.
        if (this.display !== 'always' && this.floating && look.key === this.shownKey && this.display === 'tabs') {
            this.setFloating(false);
            return;
        }
        if (this.choose(look, e) && this.display !== 'always') this.setFloating(true);
    }

    tabDoubleClick(e: MouseEvent): void {
        if (this.indexOfTab(e.target) < 0 || this.display === 'auto') return;
        this.changeDisplay(this.display === 'tabs' ? 'always' : 'tabs', e);
    }

    tabKeyDown(e: KeyboardEvent): void {
        const index = this.indexOfTab(e.target);
        if (index < 0 || e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
        const stops = this.looks.map((_, i) => i).filter(i => this.looks[i].visible && this.looks[i].enabled);
        const at = stops.indexOf(index);
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        let to = -1;
        if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) to = stops[(at + 1) % stops.length];
        else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) to = stops[(at - 1 + stops.length) % stops.length];
        else if (e.key === 'Home') to = stops[0];
        else if (e.key === 'End') to = stops[stops.length - 1];
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.display !== 'always' && !this.floating) {
                this.setFloating(true);
                queueMicrotask(() => this.focusCommands());
            } else {
                this.focusCommands();
            }
            return;
        }
        if (to === undefined || to < 0) return;
        e.preventDefault();
        if (this.choose(this.looks[to], e)) this.entries[to].host.element.focus();
    }

    indexOfTab(target: EventTarget | null): number {
        const host = (target as Element | null)?.closest?.('.mx-ribbon-menu__tab');
        return this.entries.findIndex(p => p.host.element === host);
    }

    /** Shows the tab of `look` unless `onSelecting` refuses. Returns `false` when it was refused. */
    choose(look: TabLook, originalEvent: Event | null): boolean {
        const old = this.shownKey;
        if (look.key === old) return true;
        const previous = this.looks.find(l => l.key === old) ?? null;
        const args: RibbonTabSelectingEventArgs = { key: look.key, previous: old, tab: look.tab, previousTab: previous?.tab ?? null, originalEvent, source: this, cancel: false };
        this.selecting.fire(args);
        if (args.cancel) return false;
        this.changeProperty('value', look.key);
        this.selectionChanged.fire({ key: look.key, previous: old, tab: look.tab, previousTab: previous?.tab ?? null, originalEvent, source: this });
        return true;
    }

    // Panels and groups.

    showPanel(look: TabLook): void {
        const index = this.looks.indexOf(look);
        const tabHost = this.entries[index].host.element;
        let panel = this.panels.get(look.tab);
        if (!panel) {
            const host = part<HTMLDivElement>(this.stage, 'div', 'mx-ribbon-menu__panel');
            host.element.setAttribute('role', 'tabpanel');
            host.element.addEventListener('scroll', () => this.drawEnds());
            host.element.addEventListener('wheel', e => this.wheel(host.element, e), { passive: false });
            host.element.id = nextId('mx-ribbon-panel');
            const made: Panel = { tab: look.tab, key: String(look.key), raw: [], host, groups: new Map(), stop: () => {}, overflow: null };
            this.followGroups(made);
            panel = made;
            this.panels.set(look.tab, panel);
        }
        put(panel.host.element, 'aria-labelledby', tabHost.id);
        put(tabHost, 'aria-controls', panel.host.element.id);
    }

    followGroups(panel: Panel): void {
        panel.stop();
        panel.stop = follow(
            this,
            'groups',
            () => givenList(givenField<readonly RibbonGroup[] | undefined>(panel.tab, 'groups')).map((group, i) => this.groupLookOf(group, i)),
            groups => {
                panel.raw = groups;
                this.drawGroups(panel, this.customGroups(panel, groups));
            }
        );
    }

    dropPanel(panel: Panel): void {
        panel.stop();
        for (const group of panel.groups.values()) this.dropGroup(group);
        void panel.host.dispose();
    }

    groupLookOf(group: RibbonGroup, index: number): GroupLook {
        return {
            group,
            key: String(givenValue<Key | undefined>(group, 'key') ?? index),
            fixed: givenField(group, 'fixed') === true,
            text: String(givenField(group, 'text') ?? ''),
            visible: givenField(group, 'visible') !== false,
            more: typeof givenValue(group, 'more') === 'function',
            moreHint: String(givenField(group, 'moreHint') ?? ''),
            priority: Number(givenField(group, 'priority') ?? 0),
            collapsible: givenField(group, 'collapsible') !== false
        };
    }

    drawGroups(panel: Panel, looks: GroupLook[]): void {
        const keep = new Map<RibbonGroup, GroupPart>();
        const used = new Set<GroupPart>();
        for (const look of looks) {
            let old = panel.groups.get(look.group);
            if (!old) {
                old = [...panel.groups.values()].find(g => !used.has(g) && g.look?.key === look.key);
                if (old) {
                    old.group = look.group;
                    this.followCommands(panel, old);
                }
            }
            const part = old ?? this.makeGroup(panel, look.group);
            used.add(part);
            keep.set(look.group, part);
        }
        for (const old of panel.groups.values()) if (!used.has(old)) this.dropGroup(old);
        panel.groups = keep;
        // In the order they are given: each group after its divider.
        let index = 0;
        for (const group of keep.values()) {
            for (const control of [group.divider, group.host]) {
                const items = panel.host.controls.items;
                if (items.indexOf(control) !== index) panel.host.controls.moveToIndex(control, index);
                index++;
            }
        }
        for (const look of looks) {
            const group = keep.get(look.group)!;
            group.look = look;
            group.label.element.textContent = look.text;
            shown(group.host.element, look.visible);
            this.drawMore(panel, group, look);
        }
        this.drawDividers(panel);
        this.queueRoving();
        this.queueLayout();
    }

    makeGroup(panel: Panel, group: RibbonGroup): GroupPart {
        const divider = part<HTMLDivElement>(panel.host, 'div', 'mx-ribbon-menu__divider');
        divider.element.setAttribute('aria-hidden', 'true');
        const host = part<HTMLDivElement>(panel.host, 'div', 'mx-ribbon-menu__group');
        host.element.setAttribute('role', 'group');
        const inner = part<HTMLDivElement>(host, 'div', 'mx-ribbon-menu__group-inner');
        const commands = part<HTMLDivElement>(inner, 'div', 'mx-ribbon-menu__commands');
        const foot = part<HTMLDivElement>(inner, 'div', 'mx-ribbon-menu__group-foot');
        const label = part<HTMLSpanElement>(foot, 'span', 'mx-ribbon-menu__group-label');
        label.element.id = nextId('mx-ribbon-group');
        host.element.setAttribute('aria-labelledby', label.element.id);
        const made: GroupPart = { group, divider, host, inner, commands, foot, label, more: null, made: new Map(), stop: () => {}, current: null, look: null, wanted: [], level: 0, fold: null, popup: null };
        this.followCommands(panel, made);
        return made;
    }

    followCommands(panel: Panel, part: GroupPart): void {
        part.stop();
        part.stop = follow(
            this,
            'commands',
            () => this.wantedOf(givenField<readonly RibbonCommand[] | undefined>(part.group, 'commands'), false),
            wanted => {
                part.wanted = wanted;
                this.placeGroup(panel, part);
            }
        );
    }

    placeGroup(panel: Panel, group: GroupPart): void {
        // The tab and the group as they are when a command is pressed: a change by path gives them anew.
        const where: Where = {
            get tab() {
                return panel.tab;
            },
            get group() {
                return group.group;
            }
        };
        group.made = this.placeCommands(group.commands, group.made, this.customCommands(panel, group), where, false);
        this.drawSizes(group);
        this.queueRoving();
        this.queueLayout();
    }

    dropGroup(group: GroupPart): void {
        group.stop();
        group.popup?.close('code');
        void group.fold?.dispose();
        this.dropMade(group.made);
        void group.divider.dispose();
        void group.host.dispose();
    }

    drawMore(panel: Panel, group: GroupPart, look: GroupLook): void {
        if (look.more && !group.more) {
            const more = new Button({ icon: glyph('more') });
            more.element.classList.add('mx-ribbon-menu__more');
            more.element.addEventListener('click', e => this.morePressed(panel.tab, group, more, e));
            group.foot.controls.add(more);
            group.more = more;
        } else if (!look.more && group.more) {
            void group.more.dispose();
            group.more = null;
        }
        this.drawMoreHint(group);
    }

    drawMoreHint(group: GroupPart): void {
        if (!group.more) return;
        const own = String(givenField(group.group, 'moreHint') ?? '');
        group.more.hint = own || fillTemplate(uiLocale.strings.ribbonMenuMore, { group: group.label.element.textContent ?? '' });
    }

    morePressed(tab: RibbonTab, group: GroupPart, more: Button, e: Event): void {
        const args: RibbonGroupMoreEventArgs = { group: group.group, tab, target: more.element, originalEvent: e, source: this };
        givenValue<((e: RibbonGroupMoreEventArgs) => void) | undefined>(group.group, 'more')?.(args);
        this.groupMore.fire(args);
    }

    // Commands.

    wantedOf(list: readonly RibbonCommand[] | undefined, inRow: boolean): Wanted[] {
        return givenList(list).map((command, index) => {
            const type = givenField<RibbonCommandType | undefined>(command, 'type') ?? 'button';
            const key = String(givenValue<Key | undefined>(command, 'key') ?? index);
            const fixed = givenField(command, 'fixed') === true;
            const size = inRow ? 'small' : (givenField<RibbonCommandSize | undefined>(command, 'size') ?? (type === 'gallery' ? 'large' : 'medium'));
            return { command, key, fixed, type, size, visible: givenField(command, 'visible') !== false, simple: givenField(command, 'simple') !== false };
        });
    }

    // A command is made again only when its type changes; its place follows the list.
    placeCommands(host: Component<HTMLDivElement>, made: Map<RibbonCommand, Made>, wanted: Wanted[], where: Where | ((command: RibbonCommand) => Where), inRow: boolean): Map<RibbonCommand, Made> {
        const keep = new Map<RibbonCommand, Made>();
        for (const want of wanted) {
            const old = made.get(want.command);
            const m = old && old.type === want.type ? old : this.makeCommand(want, typeof where === 'function' ? where(want.command) : where, inRow);
            m.want = want;
            keep.set(want.command, m);
        }
        const gone = new Map<RibbonCommand, Made>();
        for (const [command, old] of made) if (keep.get(command) !== old) gone.set(command, old);
        this.dropMade(gone);
        let index = 0;
        for (const want of wanted) {
            const m = keep.get(want.command)!;
            const items = host.controls.items;
            if (!items.includes(m.control)) host.controls.add(index, m.control);
            else if (items.indexOf(m.control) !== index) host.controls.moveToIndex(m.control, index);
            index++;
            shown(m.control.element as HTMLElement, want.visible);
            // A row's commands are small; a group's take their size from how far the group gave way.
            if (inRow) this.drawSize(m, 'small');
        }
        return keep;
    }

    dropMade(made: Map<RibbonCommand, Made>): void {
        for (const m of made.values()) {
            m.stop?.();
            if (m.made) this.dropMade(m.made);
            void m.control.dispose();
        }
    }

    makeCommand(want: Wanted, where: Where, inRow: boolean): Made {
        const { command, type } = want;
        if (type === 'separator') {
            const line = new Component<HTMLDivElement>('div');
            line.element.className = 'mx-ribbon-menu__separator';
            line.element.setAttribute('role', 'separator');
            line.element.setAttribute('aria-orientation', 'vertical');
            return { control: line, type, want, made: null, stop: null };
        }
        if (type === 'content') {
            const box = new Component<HTMLDivElement>('div');
            box.element.className = 'mx-ribbon-menu__content';
            const content = givenValue<(() => ComponentBase) | undefined>(command, 'content')?.();
            if (content) box.controls.add(content);
            return { control: box, type, want, made: null, stop: null };
        }
        if (type === 'gallery') {
            const gallery = new RibbonGallery(command, (item, e) => this.galleryPicked(command, item, where, e));
            return { control: gallery, type, want, made: null, stop: null };
        }
        if (type === 'row') {
            const row = new Component<HTMLDivElement>('div');
            row.element.className = 'mx-ribbon-menu__row';
            row.element.setAttribute('role', 'group');
            const made: Made = { control: row, type, want, made: new Map(), stop: null };
            made.stop = follow(
                this,
                'row',
                () => this.wantedOf(givenField<readonly RibbonCommand[] | undefined>(command, 'commands'), true),
                wanted => {
                    made.made = this.placeCommands(row, made.made!, wanted, where, true);
                    this.queueRoving();
                    this.queueLayout();
                }
            );
            return made;
        }
        return { control: this.makeButton(command, type, where), type, want, made: null, stop: null };
    }

    makeButton(command: RibbonCommand, type: RibbonCommandType, where: Where): Button {
        // Its text and hint are given by its size (drawSize).
        const props: ButtonProps = {
            icon: () => {
                const name = String(givenField(command, 'glyph') ?? '');
                return name ? glyph(name) : (givenField<IconSource | null | undefined>(command, 'icon') ?? null);
            },
            enabled: () => givenField(command, 'enabled') !== false
        };
        if (type === 'toggle') {
            props.toggle = true;
            props.pressed = givenValue<Bind<boolean> | undefined>(command, 'pressed');
        }
        if (type === 'split' || type === 'menu') props.menu = () => givenField<readonly MenuItem[] | undefined>(command, 'menu') ?? [];
        if (type === 'split') props.split = true;
        // A command chosen from its menu closes commands open over the page.
        if (type === 'split' || type === 'menu') props.onItemClick = () => this.floating && this.setFloating(false);
        const made = new Button(props);
        made.element.classList.add('mx-ribbon-menu__command');
        if (type !== 'menu') made.element.addEventListener('click', e => this.commandPressed(command, made, where, e));
        return made;
    }

    galleryPicked(command: RibbonCommand, item: RibbonGalleryItem, where: Where, e: Event): void {
        const args: RibbonCommandClickEventArgs = { command, group: where.group, tab: where.tab, item, originalEvent: e, source: this };
        givenValue<((e: RibbonCommandClickEventArgs) => void) | undefined>(command, 'click')?.(args);
        this.commandClick.fire(args);
        if (this.floating) this.setFloating(false);
    }

    commandPressed(command: RibbonCommand, button: Button, where: Where, e: Event): void {
        // The arrow of a split command opens its menu; only its own part runs it.
        if ((e.target as Element | null)?.closest?.('.mx-button__arrow')) return;
        const args: RibbonCommandClickEventArgs = { command, group: where.group, tab: where.tab, originalEvent: e, source: this };
        givenValue<((e: RibbonCommandClickEventArgs) => void) | undefined>(command, 'click')?.(args);
        // A click set the toggle's own state; one bound to the app follows the app again.
        const pressed = givenValue<Bind<boolean> | undefined>(command, 'pressed');
        if (typeof pressed === 'function') button.pressed = pressed;
        this.commandClick.fire(args);
        if (this.floating) this.setFloating(false);
    }

    // Layouts: the classic one in columns under the groups' names, the simplified one in a single row. When the commands
    // do not fit, groups give way one step at a time, the least important first (lowest `priority`, the last of equals).

    // The layout drawn: the one chosen, the simplified one in a compact menu.
    shownLayout(): RibbonMenuLayout {
        return this.compact ? 'simple' : (this.peekProperty<RibbonMenuLayout>('layout') ?? 'classic');
    }

    drawLayout(): void {
        const simple = this.shownLayout() === 'simple';
        put(this.element, 'data-layout', simple ? 'simple' : 'classic');
        shown(this.switcher.element, this.peekProperty('layoutSwitch') !== false && !this.compact);
        this.switcher.icon = glyph(simple ? 'chevron-down' : 'chevron-up');
        put(this.switcher.element.querySelector<HTMLElement>('.mx-button__main') ?? this.switcher.element, 'aria-expanded', String(!simple));
        this.drawNames();
        this.queueLayout();
    }

    switchLayout(e: Event): void {
        this.changeLayout(this.layout === 'simple' ? 'classic' : 'simple', e);
    }

    changeLayout(next: RibbonMenuLayout, e: Event | null): void {
        const old = this.layout;
        if (old === next) return;
        this.changeProperty('layout', next);
        this.drawLayout();
        this.layoutChanged.fire({ layout: next, previous: old, originalEvent: e, source: this });
        this.remember({ layout: next });
    }

    queueLayout(): void {
        if (this.layoutQueued) return;
        this.layoutQueued = true;
        queueMicrotask(() => {
            this.layoutQueued = false;
            if (!this.isDisposed) untracked(() => this.fit());
        });
    }

    fit(): void {
        const panel = this.shownPanel();
        const width = this.element.clientWidth;
        this.laidOut = width;
        const compact = width > 0 && width < this.lengths.get(COMPACT, 480);
        if (compact !== this.compact) {
            this.compact = compact;
            mark(this.element, 'data-compact', compact);
            this.drawLayout();
        }
        if (!panel) return;
        const simple = this.shownLayout() === 'simple';
        const groups = [...panel.groups.values()].filter(g => g.look?.visible !== false);
        for (const group of panel.groups.values()) this.setLevel(group, 0, simple);
        this.drawOverflow(panel, simple);
        const el = panel.host.element;
        const fits = () => el.scrollWidth <= el.clientWidth + 0.5;
        if (this.peekProperty('adaptive') === false || !el.clientWidth || fits()) return this.finishFit(panel);
        const order = groups
            .map((group, index) => ({ group, index }))
            .sort((a, b) => (a.group.look?.priority ?? 0) - (b.group.look?.priority ?? 0) || b.index - a.index)
            .map(x => x.group);
        const last = simple ? 2 : 3;
        for (let level = 1; level <= last; level++) {
            for (const group of order) {
                if (level === last && group.look?.collapsible === false) continue;
                this.setLevel(group, level, simple);
                if (simple && level === last) this.drawOverflow(panel, simple);
                if (fits()) return this.finishFit(panel);
            }
        }
        this.finishFit(panel);
    }

    finishFit(panel: Panel): void {
        this.drawDividers(panel);
        this.drawEnds();
        this.queueRoving();
    }

    // Scrolling: what does not fit even after giving way scrolls, by the buttons at the ends, the wheel and a finger.

    makeScroll(direction: 1 | -1): Button {
        const button = new Button({ icon: glyph(direction > 0 ? 'chevron-end' : 'chevron-start') });
        button.element.classList.add('mx-ribbon-menu__scroll', direction > 0 ? 'mx-ribbon-menu__scroll--forward' : 'mx-ribbon-menu__scroll--back');
        button.element.tabIndex = -1;
        button.element.setAttribute('aria-hidden', 'true');
        button.element.addEventListener('mousedown', e => e.preventDefault());
        button.element.addEventListener('click', () => this.scrollBy(direction));
        shown(button.element, false);
        this.stage.controls.add(button);
        return button;
    }

    drawEnds(): void {
        const el = this.shownPanel()?.host.element;
        const room = el?.clientWidth ?? 0;
        const needed = el?.scrollWidth ?? 0;
        const at = Math.abs(el?.scrollLeft ?? 0);
        shown(this.back.element, needed > room + 1 && at > 1);
        shown(this.forward.element, needed > room + 1 && at + room < needed - 1);
    }

    scrollBy(direction: 1 | -1): void {
        const el = this.shownPanel()?.host.element;
        if (!el) return;
        const smooth = typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        el.scrollBy({ left: direction * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: smooth ? 'smooth' : 'auto' });
    }

    // A plain mouse wheel scrolls the commands sideways.
    wheel(el: HTMLElement, e: WheelEvent): void {
        if (e.deltaX || !e.deltaY || el.scrollWidth <= el.clientWidth) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY;
    }

    // The app's own content at the start and the end of the row of tabs: a button, a search field, any editor.
    placeSlot(side: 'start' | 'end'): void {
        const host = side === 'start' ? this.startHost : this.endHost;
        const old = side === 'start' ? this.startControl : this.endControl;
        const control = this.peekProperty<ComponentBase | null>(side === 'start' ? 'barStart' : 'barEnd') ?? null;
        if (control === old) return;
        if (old && host.controls.items.includes(old)) host.controls.remove(old);
        if (control) host.controls.add(control);
        if (side === 'start') this.startControl = control;
        else this.endControl = control;
        shown(host.element, !!control);
    }

    setLevel(group: GroupPart, level: number, simple: boolean): void {
        group.level = level;
        this.drawSizes(group);
        if (!simple && level >= 3) this.foldGroup(group);
        else this.unfold(group);
        mark(group.host.element, 'data-out', simple && level >= 2);
    }

    // The size a command of the group is drawn at.
    sizeAt(given: RibbonCommandSize, level: number): RibbonCommandSize {
        const simple = this.shownLayout() === 'simple';
        if (given === 'small' || level >= 2 || (simple && level >= 1)) return 'small';
        if (simple || level >= 1) return 'medium';
        return given;
    }

    drawSizes(group: GroupPart): void {
        for (const m of group.made.values()) {
            if (m.type === 'row') continue;
            // A gallery is as high as the group until it gives way to its button alone.
            const simple = this.shownLayout() === 'simple';
            const size = m.type === 'gallery' ? (group.level >= 2 || simple || m.want.size === 'small' ? 'small' : 'large') : this.sizeAt(m.want.size, group.level);
            this.drawSize(m, size);
            mark(m.control.element as HTMLElement, 'data-simple-hidden', !m.want.simple);
        }
    }

    drawSize(m: Made, size: RibbonCommandSize): void {
        const el = m.control.element as HTMLElement;
        if (el.getAttribute('data-ribbon-size') === size) return;
        el.setAttribute('data-ribbon-size', size);
        if (m.control instanceof RibbonGallery) m.control.setSmall(size === 'small');
        if (!(m.control instanceof Button)) return;
        // A small command shows its icon alone; its text names it, as its tooltip.
        const command = m.want.command;
        const button = m.control;
        if (size === 'small') {
            button.text = '';
            button.hint = () => String(givenField(command, 'hint') ?? '') || parseAccessKey(String(givenField(command, 'text') ?? '')).text;
        } else {
            button.text = () => String(givenField(command, 'text') ?? '');
            button.hint = () => String(givenField(command, 'hint') ?? '');
        }
        button.readLook();
    }

    // A folded group is one large button with its name; it opens a popup with the group as it is. The popup stands
    // beside the button, not in it, so the button's place does not reach the commands.
    foldGroup(group: GroupPart): void {
        if (!group.fold) {
            const fold = new Button({
                text: () => group.look?.text ?? '',
                icon: () => {
                    const name = String(givenField(group.group, 'glyph') ?? '');
                    return name ? glyph(name) : (givenField<IconSource | null | undefined>(group.group, 'icon') ?? null);
                }
            });
            fold.element.classList.add('mx-ribbon-menu__command', 'mx-ribbon-menu__fold');
            fold.element.setAttribute('data-ribbon-size', 'large');
            fold.element.setAttribute('aria-haspopup', 'dialog');
            fold.element.setAttribute('aria-expanded', 'false');
            const arrow = new Component<HTMLSpanElement>('span');
            arrow.element.className = 'mx-ribbon-menu__fold-arrow';
            arrow.element.append(chevronDown());
            fold.controls.add(arrow);
            fold.element.addEventListener('click', () => this.toggleFold(group));
            const popup = new Popup();
            popup.matchWidth = false;
            popup.element.classList.add('mx-ribbon-menu__drop');
            popup.element.setAttribute('role', 'dialog');
            popup.onClosed(() => this.lend(group, false));
            group.host.controls.add(fold);
            group.host.controls.add(popup);
            group.fold = fold;
            group.popup = popup;
        }
        mark(group.host.element, 'data-folded', true);
    }

    toggleFold(group: GroupPart): void {
        const { fold, popup } = group;
        if (!fold || !popup) return;
        if (popup.isOpen) {
            popup.close('code');
            return;
        }
        this.lend(group, true);
        put(popup.element, 'aria-label', group.look?.text ?? '');
        popup.open(fold.element);
        fold.element.setAttribute('aria-expanded', 'true');
        if (!focusInitial(popup.element)) popup.element.focus();
    }

    unfold(group: GroupPart): void {
        group.popup?.close('code');
        this.lend(group, false);
        mark(group.host.element, 'data-folded', false);
    }

    lend(group: GroupPart, open: boolean): void {
        // A group never folded has nothing to lend or take back.
        if (!group.popup || group.host.isDisposed) return;
        group.fold?.element.setAttribute('aria-expanded', String(open));
        const into = open ? group.popup : group.host;
        if (group.inner.parent === into) return;
        Transporter.transport(group.inner, into);
        if (!open) group.host.controls.moveToIndex(group.inner, 0);
        this.queueRoving();
    }

    drawDividers(panel: Panel): void {
        let first = true;
        for (const group of panel.groups.values()) {
            const on = group.look?.visible !== false && !group.host.element.hasAttribute('data-out');
            shown(group.divider.element, on && !first);
            if (on) first = false;
        }
    }

    // The "more" button at the end of a simplified row: each group that does not fit, and each command the row does not
    // show, under the name of its group.
    drawOverflow(panel: Panel, simple: boolean): void {
        const items: MenuItem[] = [];
        if (simple) {
            for (const group of panel.groups.values()) {
                if (group.look?.visible === false) continue;
                const out = group.host.element.hasAttribute('data-out');
                const commands = this.menuItemsOf(group.made, m => out || !m.want.simple);
                if (commands.length) items.push({ text: group.look?.text ?? '', items: commands });
            }
        }
        if (items.length && !panel.overflow) {
            const more = new Button({ menu: [], icon: moreMark() });
            more.element.classList.add('mx-ribbon-menu__command', 'mx-ribbon-menu__overflow');
            more.element.setAttribute('data-ribbon-size', 'small');
            more.hint = uiLocale.strings.moreOptions;
            panel.host.controls.add(more);
            panel.overflow = more;
        }
        if (!panel.overflow) return;
        panel.overflow.menu = items;
        panel.overflow.refresh();
        shown(panel.overflow.element, items.length > 0);
    }

    menuItemsOf(made: Map<RibbonCommand, Made>, wanted: (m: Made) => boolean): MenuItem[] {
        const items: MenuItem[] = [];
        let line = false;
        for (const m of made.values()) {
            if (!m.want.visible || !wanted(m)) continue;
            if (m.type === 'separator') {
                line = items.length > 0;
                continue;
            }
            if (m.type === 'row' && m.made) {
                for (const inner of this.menuItemsOf(m.made, () => true)) {
                    items.push({ ...inner, beginGroup: line });
                    line = false;
                }
                continue;
            }
            if (m.control instanceof RibbonGallery) {
                const gallery = m.control;
                const where = this.whereOfMade(m);
                items.push({
                    text: parseAccessKey(String(givenField(m.want.command, 'text') ?? '')).text,
                    beginGroup: line,
                    items: gallery.looks.map(look => ({ text: look.text, enabled: look.enabled, group: 'gallery', checked: look.key === gallery.chosen, click: (e: MenuItemClickEventArgs) => this.galleryPicked(m.want.command, look.item, where, e.event) }))
                });
                line = false;
                continue;
            }
            if (!(m.control instanceof Button)) continue;
            items.push({ ...menuItemOf(m.control), text: () => parseAccessKey(String(givenField(m.want.command, 'text') ?? '')).text, beginGroup: line });
            line = false;
        }
        return items;
    }

    // Showing: always, only the tabs (a tab opens its commands over the page), or behind a strip (the whole menu opens
    // over the page). What is open over the page closes on a command, Escape, a click elsewhere and focus leaving.

    drawDisplay(): void {
        const display = this.peekProperty<RibbonMenuDisplay>('display') ?? 'always';
        put(this.element, 'data-display', display);
        if (display === 'always') this.setFloating(false);
        put(this.reveal.element, 'aria-label', uiLocale.strings.ribbonMenuReveal);
        this.reveal.element.title = uiLocale.strings.ribbonMenuReveal;
        put(this.reveal.element, 'aria-expanded', String(this.floating));
        this.queueLayout();
    }

    changeDisplay(next: RibbonMenuDisplay, e: Event | null): void {
        const old = this.display;
        if (old === next) return;
        this.changeProperty('display', next);
        this.drawDisplay();
        this.displayChanged.fire({ display: next, previous: old, originalEvent: e, source: this });
        this.remember({ display: next });
    }

    setFloating(on: boolean): void {
        if (on === this.floating) return;
        this.floating = on;
        mark(this.element, 'data-floating', on);
        put(this.reveal.element, 'aria-expanded', String(on));
        if (!on) this.hints.stop();
        this.queueLayout();
    }

    ownKeyDown(e: KeyboardEvent): void {
        if (e.defaultPrevented) return;
        if (e.key === 'F1' && e.ctrlKey && !e.altKey && !e.metaKey && this.display !== 'auto') {
            e.preventDefault();
            this.changeDisplay(this.display === 'tabs' ? 'always' : 'tabs', e);
        } else if (e.key === 'Escape' && this.floating) {
            e.preventDefault();
            this.setFloating(false);
            if (this.display === 'tabs') this.focus();
            else this.reveal.element.focus();
        }
    }

    focusLeft(e: FocusEvent): void {
        const to = e.relatedTarget as Node | null;
        if (this.floating && to && !this.element.contains(to)) this.setFloating(false);
    }

    pagePointerDown(e: PointerEvent): void {
        const inside = this.element.contains(e.target as Node);
        if (this.hints.active && !inside) this.hints.stop();
        if (this.floating && !inside) this.setFloating(false);
    }

    // Key hints: Alt tapped alone, or F10, while focus is in this menu or it is the first menu of the page.

    pageKeyDown(e: KeyboardEvent): void {
        if (this.hints.active) {
            if (this.hints.key(e)) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            return;
        }
        if (e.key === 'Alt') {
            this.altDown = true;
            this.altChord = false;
            return;
        }
        if (this.altDown) this.altChord = true;
        if (e.key === 'F10' && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && this.claimsKeys()) {
            e.preventDefault();
            this.showKeyHints();
        }
    }

    pageKeyUp(e: KeyboardEvent): void {
        if (e.key !== 'Alt') return;
        const tap = this.altDown && !this.altChord;
        this.altDown = false;
        if (!tap || !this.claimsKeys()) return;
        if (this.hints.active) this.hints.stop();
        else this.showKeyHints();
    }

    claimsKeys(): boolean {
        if (this.peekProperty('keyHints') === false || !this.isEnabled || !this.element.isConnected) return false;
        const doc = this.element.ownerDocument;
        const focus = doc.activeElement;
        const holder = focus?.closest?.('.mx-ribbon-menu');
        if (holder) return holder === this.element;
        const first = Array.from(doc.querySelectorAll<HTMLElement>('.mx-ribbon-menu')).find(el => el.getClientRects().length > 0);
        return first === this.element;
    }

    tabHints(): KeyHint[] {
        const hints: KeyHint[] = [];
        if (!this.app.element.hidden) {
            const parsed = parseAccessKey(this.appButton);
            hints.push({ element: this.app.element, keys: parsed.key ?? '', text: parsed.text, press: () => this.app.element.click() });
        }
        this.looks.forEach((look, i) => {
            if (!look.visible || !look.enabled) return;
            const parsed = parseAccessKey(look.text);
            const host = this.entries[i].host.element;
            hints.push({ element: this.compact ? this.picker.element : host, keys: parsed.key ?? '', text: parsed.text, press: () => this.pressTab(look) });
        });
        let n = 1;
        for (const m of this.quickMade.values()) {
            if (!(m.control instanceof Button) || !m.want.visible || n > 9) continue;
            const face = faceOf(m.control);
            hints.push({ element: face, keys: String(n++), text: '', press: () => face.click() });
        }
        return hints;
    }

    pressTab(look: TabLook): void {
        this.choose(look, null);
        if (this.display !== 'always') this.setFloating(true);
        this.fit();
    }

    commandHints(): KeyHint[] {
        const panel = this.shownPanel();
        if (!panel) return [];
        const hints: KeyHint[] = [];
        for (const group of panel.groups.values()) {
            if (group.look?.visible === false || group.host.element.hasAttribute('data-out')) continue;
            if (group.host.element.hasAttribute('data-folded') && group.fold) {
                const fold = group.fold.element;
                hints.push({ element: fold, keys: '', text: group.look?.text ?? '', press: () => !group.popup?.isOpen && this.toggleFold(group), opens: () => this.foldedHints(group) });
                continue;
            }
            hints.push(...this.groupHints(group));
        }
        if (panel.overflow && !panel.overflow.element.hidden) {
            const more = faceOf(panel.overflow);
            hints.push({ element: more, keys: '', text: uiLocale.strings.moreOptions, press: () => more.click() });
        }
        return hints;
    }

    // The hints of a folded group, in the popup its button opened.
    foldedHints(group: GroupPart): InnerHints {
        return { hints: this.groupHints(group), host: group.popup!, close: () => group.popup?.close('code') };
    }

    // The letters of a group's commands and of the button beside its name.
    groupHints(group: GroupPart): KeyHint[] {
        const hints: KeyHint[] = [];
        const add = (m: Made) => {
            if (!m.want.visible) return;
            const command = m.want.command;
            const text = parseAccessKey(String(givenField(command, 'text') ?? ''));
            const keys = String(givenField(command, 'keyHint') ?? '') || text.key || '';
            if (m.control instanceof Button || m.control instanceof RibbonGallery) {
                const face = faceOf(m.control instanceof Button ? m.control : m.control.opener);
                hints.push({ element: face, keys, text: text.text, press: () => face.click() });
            } else if (m.type === 'content') {
                const target = focusableIn(m.control.element as HTMLElement)[0];
                if (target) hints.push({ element: target, keys, text: text.text || nameOf(target), press: () => target.focus() });
            } else if (m.made) {
                for (const inner of m.made.values()) add(inner);
            }
        };
        for (const m of group.made.values()) add(m);
        if (group.more) {
            const more = group.more.element;
            hints.push({ element: more, keys: '', text: group.look?.text ?? '', press: () => more.click() });
        }
        return hints;
    }

    // The button before the tabs.
    drawApp(): void {
        const parsed = parseAccessKey(this.peekProperty<string>('appButton') ?? '');
        renderAccessKey(this.appCaption.element, parsed);
        const key = parsed.key ? accessKeyToken(parsed.key) : null;
        setAccessKeyAttribute(this.app.element, this.appKey, key);
        this.appKey = key;
        shown(this.app.element, parsed.text !== '');
    }

    // The quick commands: the app's, then the ones the user added, small, in the row of tabs or under the commands.
    drawQuick(): void {
        const position = this.custom.quickBar ?? this.peekProperty<RibbonQuickBarPosition>('quickBar') ?? 'start';
        const host = position === 'start' ? this.quickTop : position === 'below' ? this.quickBelow : null;
        if (host !== this.quickHost) {
            this.stopQuick?.();
            this.stopQuick = null;
            this.dropMade(this.quickMade);
            this.quickMade = new Map();
            this.quickHost = host;
        }
        shown(this.quickTop.element, false);
        shown(this.quickBelow.element, false);
        if (!host) return;
        put(host.element, 'aria-label', uiLocale.strings.ribbonMenuQuick);
        this.stopQuick?.();
        const own = this.peekProperty<readonly RibbonCommand[]>('quickCommands');
        this.stopQuick = follow(
            this,
            'quick',
            () => {
                const list = [...givenList(own)];
                for (const path of this.custom.quick ?? []) {
                    const found = this.resolve(path);
                    if (found && !list.includes(found.command)) list.push(found.command);
                }
                return this.wantedOf(list, true);
            },
            wanted => {
                this.quickMade = this.placeCommands(host, this.quickMade, wanted, command => this.whereOf(command), true);
                shown(host.element, wanted.some(w => w.visible));
                this.queueLayout();
            }
        );
    }

    whereOf(command: RibbonCommand): Where {
        for (const path of this.custom.quick ?? []) {
            const found = this.resolve(path);
            if (found?.command === command) return { tab: found.tab, group: found.group };
        }
        return { tab: null, group: null };
    }

    // Paths: `tab/group/command`, each a key or a position, read in what the app gave.

    resolve(path: string): Found | null {
        const [tabKey, groupKey, commandKey] = path.split('/');
        const tabs = this.currentTabs();
        for (const [ti, tab] of tabs.entries()) {
            if (String(givenValue<Key | undefined>(tab, 'key') ?? ti) !== tabKey) continue;
            const groups = givenList(givenField<readonly RibbonGroup[] | undefined>(tab, 'groups'));
            for (const [gi, group] of groups.entries()) {
                if (String(givenValue<Key | undefined>(group, 'key') ?? gi) !== groupKey) continue;
                const commands = givenList(givenField<readonly RibbonCommand[] | undefined>(group, 'commands'));
                for (const [ci, command] of commands.entries()) {
                    if (String(givenValue<Key | undefined>(command, 'key') ?? ci) === commandKey) return { command, group, tab };
                }
            }
        }
        return null;
    }

    tabKeyOf(tab: RibbonTab): string {
        return String(this.looks.find(look => look.tab === tab)?.key ?? '');
    }

    // The user's changes: groups and commands hidden and moved, commands added to the quick commands.

    takeCustomization(): void {
        const given = this.peekProperty<RibbonMenuCustomization | null>('customization');
        this.custom = given ? copyOf(given) : {};
        if (this.custom.layout && this.custom.layout !== this.layout) this.changeProperty('layout', this.custom.layout);
        if (this.custom.display && this.custom.display !== this.display) this.changeProperty('display', this.custom.display);
        this.drawLayout();
        this.drawDisplay();
        this.redrawCustom();
    }

    remember(change: Partial<RibbonMenuCustomization>): void {
        this.custom = { ...this.custom, ...change };
        this.customized.fire({ customization: copyOf(this.custom), source: this });
    }

    redrawCustom(): void {
        for (const panel of this.panels.values()) {
            this.drawGroups(panel, this.customGroups(panel, panel.raw));
            for (const group of panel.groups.values()) this.placeGroup(panel, group);
        }
        this.drawQuick();
        this.queueLayout();
    }

    customGroups(panel: Panel, raw: GroupLook[]): GroupLook[] {
        const tab = this.tabKeyOf(panel.tab);
        const hidden = new Set(this.custom.hidden ?? []);
        return ordered(raw.filter(look => look.fixed || !hidden.has(`${tab}/${look.key}`)), this.custom.order?.[tab], look => look.key);
    }

    customCommands(panel: Panel, group: GroupPart): Wanted[] {
        const path = `${this.tabKeyOf(panel.tab)}/${group.look?.key ?? ''}`;
        const hidden = new Set(this.custom.hidden ?? []);
        return ordered(group.wanted.filter(w => w.fixed || !hidden.has(`${path}/${w.key}`)), this.custom.order?.[path], w => w.key);
    }

    hideByUser(path: string): void {
        this.remember({ hidden: [...(this.custom.hidden ?? []).filter(p => p !== path), path], quick: (this.custom.quick ?? []).filter(p => p !== path) });
        this.redrawCustom();
    }

    // Moves a group in its tab, or a command in its group, one place earlier or later among the ones shown.
    moveByUser(parent: string, keys: string[], key: string, step: 1 | -1): void {
        const at = keys.indexOf(key);
        const to = at + step;
        if (at < 0 || to < 0 || to >= keys.length) return;
        const next = [...keys];
        [next[at], next[to]] = [next[to], next[at]];
        this.remember({ order: { ...(this.custom.order ?? {}), [parent]: next } });
        this.redrawCustom();
    }

    pinByUser(path: string, on: boolean): void {
        const quick = (this.custom.quick ?? []).filter(p => p !== path);
        this.remember({ quick: on ? [...quick, path] : quick });
        this.drawQuick();
    }

    resetCustom(): void {
        this.custom = {};
        this.customized.fire({ customization: {}, source: this });
        this.redrawCustom();
    }

    // The context menu: what can be done with the command or the group under the pointer, and how the menu is shown.
    customMenuOpening(e: ContextMenuOpeningEventArgs): void {
        if (this.peekProperty('customizable') === false || e.target.closest('.mx-ribbon-menu__content')) {
            e.cancel = true;
            return;
        }
        const s = uiLocale.strings;
        const items: MenuItem[] = [];
        const hit = this.hitOf(e.target);
        if (hit?.quick) {
            if (hit.path) items.push({ text: s.ribbonMenuUnpin, click: () => this.pinByUser(hit.path!, false) });
        } else if (hit) {
            const { panel, group, made } = hit;
            const tab = this.tabKeyOf(panel.tab);
            const groupPath = `${tab}/${group.look?.key ?? ''}`;
            if (made) {
                const path = `${groupPath}/${made.want.key}`;
                const name = parseAccessKey(String(givenField(made.want.command, 'text') ?? '')).text;
                if (made.control instanceof Button) {
                    const pinned = (this.custom.quick ?? []).includes(path);
                    items.push({ text: pinned ? s.ribbonMenuUnpin : s.ribbonMenuPin, click: () => this.pinByUser(path, !pinned) });
                }
                if (!made.want.fixed) {
                    // A fixed neighbor keeps its place: nothing moves past it.
                    const shownWanted = this.customCommands(panel, group);
                    const keys = shownWanted.map(w => w.key);
                    const at = keys.indexOf(made.want.key);
                    items.push(
                        { text: fillTemplate(s.ribbonMenuHide, { name }), click: () => this.hideByUser(path) },
                        { text: s.ribbonMenuMoveEarlier, enabled: at > 0 && !shownWanted[at - 1].fixed, click: () => this.moveByUser(groupPath, keys, made.want.key, -1) },
                        { text: s.ribbonMenuMoveLater, enabled: at < keys.length - 1 && !shownWanted[at + 1].fixed, click: () => this.moveByUser(groupPath, keys, made.want.key, 1) }
                    );
                }
            }
            if (group.look && !group.look.fixed) {
                const looks = [...panel.groups.values()].map(g => g.look);
                const keys = looks.map(l => l?.key ?? '');
                const at = keys.indexOf(group.look.key);
                const name = group.look.text;
                items.push(
                    { text: fillTemplate(s.ribbonMenuHideGroup, { name }), beginGroup: items.length > 0, click: () => this.hideByUser(groupPath) },
                    { text: s.ribbonMenuMoveGroupEarlier, enabled: at > 0 && !looks[at - 1]?.fixed, click: () => this.moveByUser(tab, keys, group.look!.key, -1) },
                    { text: s.ribbonMenuMoveGroupLater, enabled: at < keys.length - 1 && !looks[at + 1]?.fixed, click: () => this.moveByUser(tab, keys, group.look!.key, 1) }
                );
            }
        }
        const display = this.display;
        const layout = this.layout;
        const quick = this.custom.quickBar ?? this.quickBar;
        const general: MenuItem[] = [];
        if ((this.custom.hidden ?? []).length) general.push({ text: s.ribbonMenuShowHidden, click: () => {
            this.remember({ hidden: [] });
            this.redrawCustom();
        } });
        if (this.peekProperty('layoutSwitch') !== false && !this.compact) {
            general.push({ text: s.ribbonMenuLayout, items: [
                { text: s.ribbonMenuLayoutClassic, group: 'layout', checked: layout === 'classic', click: () => this.changeLayout('classic', null) },
                { text: s.ribbonMenuLayoutSimple, group: 'layout', checked: layout === 'simple', click: () => this.changeLayout('simple', null) }
            ] });
        }
        general.push(
            { text: s.ribbonMenuDisplay, items: [
                { text: s.ribbonMenuDisplayAlways, group: 'display', checked: display === 'always', click: () => this.changeDisplay('always', null) },
                { text: s.ribbonMenuDisplayTabs, group: 'display', checked: display === 'tabs', click: () => this.changeDisplay('tabs', null) },
                { text: s.ribbonMenuDisplayAuto, group: 'display', checked: display === 'auto', click: () => this.changeDisplay('auto', null) }
            ] },
            { text: s.ribbonMenuQuick, items: [
                { text: s.ribbonMenuQuickStart, group: 'quick', checked: quick === 'start', click: () => this.placeQuick('start') },
                { text: s.ribbonMenuQuickBelow, group: 'quick', checked: quick === 'below', click: () => this.placeQuick('below') },
                { text: s.ribbonMenuQuickHidden, group: 'quick', checked: quick === 'hidden', click: () => this.placeQuick('hidden') }
            ] }
        );
        const changed = Object.keys(this.custom).some(k => k !== 'layout' && k !== 'display');
        if (changed) general.push({ text: s.ribbonMenuReset, click: () => this.resetCustom() });
        general[0].beginGroup = items.length > 0;
        e.items = [...items, ...general];
    }

    placeQuick(position: RibbonQuickBarPosition): void {
        this.remember({ quickBar: position });
        this.drawQuick();
    }

    // The tab and the group a command shown in a panel belongs to.
    whereOfMade(m: Made): Where {
        for (const panel of this.panels.values()) {
            for (const group of panel.groups.values()) if ([...group.made.values()].includes(m)) return { tab: panel.tab, group: group.group };
        }
        return { tab: null, group: null };
    }

    // What is under the pointer: a command of a group (or of a row in it), a group, or a quick command.
    hitOf(target: Element): { panel: Panel; group: GroupPart; made: Made | null; quick?: false; path?: undefined } | { quick: true; path: string | null } | null {
        if (this.quickHost?.element.contains(target)) {
            for (const [command, m] of this.quickMade) {
                if (!(m.control.element as HTMLElement).contains(target)) continue;
                const path = (this.custom.quick ?? []).find(p => this.resolve(p)?.command === command) ?? null;
                return { quick: true, path };
            }
            return null;
        }
        const panel = this.shownPanel();
        if (!panel) return null;
        for (const group of panel.groups.values()) {
            if (!group.host.element.contains(target) && !group.popup?.element.contains(target)) continue;
            for (const m of group.made.values()) if ((m.control.element as HTMLElement).contains(target) && m.type !== 'row') return { panel, group, made: m };
            return { panel, group, made: null };
        }
        return null;
    }

    // Keys in the commands: each group is a Tab stop, the arrows move between the commands, Escape goes to the tabs.

    stopsOf(host: HTMLElement): HTMLElement[] {
        return focusableIn(host).filter(el => !(el as HTMLButtonElement).disabled && !el.closest('.mx-ribbon-menu__content, .mx-popup'));
    }

    shownPanel(): Panel | null {
        const look = this.looks.find(l => l.key === this.shownKey);
        return (look && this.panels.get(look.tab)) ?? null;
    }

    queueRoving(): void {
        if (this.rovingQueued) return;
        this.rovingQueued = true;
        queueMicrotask(() => {
            this.rovingQueued = false;
            if (!this.isDisposed) untracked(() => this.drawRoving());
        });
    }

    drawRoving(): void {
        for (const panel of this.panels.values()) {
            for (const group of panel.groups.values()) {
                const stops = this.stopsOf(group.host.element);
                const current = group.current && stops.includes(group.current) ? group.current : stops[0];
                group.current = current ?? null;
                for (const el of stops) el.tabIndex = el === current ? 0 : -1;
            }
        }
    }

    groupOf(target: Element): GroupPart | null {
        const panel = this.shownPanel();
        if (!panel) return null;
        for (const group of panel.groups.values()) if (group.host.element.contains(target)) return group;
        return null;
    }

    focusCommands(): void {
        const panel = this.shownPanel();
        if (!panel) return;
        this.drawRoving();
        for (const group of panel.groups.values()) {
            if (group.host.element.hidden || !group.current) continue;
            group.current.focus();
            return;
        }
    }

    commandFocused(e: FocusEvent): void {
        const target = e.target as HTMLElement;
        const group = this.groupOf(target);
        if (!group || !this.stopsOf(group.host.element).includes(target)) return;
        group.current = target;
        for (const el of this.stopsOf(group.host.element)) el.tabIndex = el === target ? 0 : -1;
    }

    commandKeyDown(e: KeyboardEvent): void {
        const target = e.target as HTMLElement;
        if (e.defaultPrevented || e.isComposing || target.closest('.mx-ribbon-menu__content, .mx-popup')) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            this.focus();
            return;
        }
        const panel = this.shownPanel();
        if (!panel) return;
        const stops = this.stopsOf(panel.host.element);
        const at = stops.indexOf(target);
        if (at < 0) return;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        let to = -1;
        if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') || e.key === 'ArrowDown') to = (at + 1) % stops.length;
        else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') || e.key === 'ArrowUp') to = (at - 1 + stops.length) % stops.length;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = stops.length - 1;
        if (to < 0) return;
        e.preventDefault();
        stops[to].focus();
    }
}

// What is pressed of a button: its main part when it has a menu.
function faceOf(button: Button): HTMLElement {
    return button.element.querySelector<HTMLElement>(':scope > .mx-button__main') ?? button.element;
}

// The items in the order the user gave, the ones not in it after them, as given.
function ordered<T>(items: T[], order: readonly string[] | undefined, keyOf: (item: T) => string): T[] {
    if (!order?.length) return items;
    const rank = new Map(order.map((key, i) => [key, i]));
    return items
        .map((item, i) => ({ item, i, r: rank.get(keyOf(item)) }))
        .sort((a, b) => (a.r ?? Infinity) - (b.r ?? Infinity) || a.i - b.i)
        .map(x => x.item);
}

function copyOf(c: RibbonMenuCustomization): RibbonMenuCustomization {
    const out: RibbonMenuCustomization = { ...c };
    if (c.hidden) out.hidden = [...c.hidden];
    if (c.quick) out.quick = [...c.quick];
    if (c.order) out.order = Object.fromEntries(Object.entries(c.order).map(([k, v]) => [k, [...v]]));
    return out;
}

// The name assistive technology gives a field: its label, else its tooltip or placeholder.
function nameOf(el: HTMLElement): string {
    const by = el.getAttribute('aria-labelledby');
    const labelled = by ? by.split(/\s+/).map(id => el.ownerDocument.getElementById(id)?.textContent ?? '').join(' ').trim() : '';
    const label = (el as HTMLInputElement).labels?.[0]?.textContent?.trim() ?? '';
    return el.getAttribute('aria-label') || labelled || label || el.title || el.getAttribute('placeholder') || '';
}
