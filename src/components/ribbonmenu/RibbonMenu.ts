import { Component, Emitter, createSignal, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp, type Signal } from "@motifx/core";
import { accessKeyToken, parseAccessKey, renderAccessKey, setAccessKeyAttribute } from "../../core/access-key";
import { compareTreeOrder, treeDepth } from "../../core/component-tree";
import { Control } from "../../core/control";
import { glyphPart, part } from "../../core/draw-parts";
import { fillTemplate } from "../../core/fill-template";
import { canTakeFocus, focusFirstIn, focusOn, hasFocusableIn, holdsFocus } from "../../core/focus";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { glyph, moreMark } from "../../core/glyphs";
import type { IconSource } from "../../core/icon-source";
import { liveControls } from "../../core/live-controls";
import { boxOf, isRendered, isRtl, lengthOf, measure, mediaOf, onLayout, probeLengths, readAgain, sameWindow, scrollBy, whenMeasured } from "../../core/measure";
import { onDocument } from "../../core/window-events";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
import { kept, mark, put, text } from "../../core/part-writes";
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
import { ItemTree } from "../../parts/item-tree/ItemTree";
import { partsOf } from "../../parts/item-tree/item-paths";
import { fieldOf, runItem, valueOf } from "../../core/command-fields";
import { commands } from "../../core/command-registry";
import { ordered } from "../../parts/item-tree/ordered";
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
import type { RibbonMenuCustomMenuOpeningEventArgs } from "./ribbon-menu-custom-menu-opening-event-args";
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
    id: string;
    host: Component<HTMLButtonElement>;
    caption: Component<HTMLSpanElement>;
    accessKey: string | null;
}

interface Panel {
    tab: RibbonTab;
    key: string;
    id: string;
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
    hiddenByUser?: boolean;
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
    // The part Tab reaches in the group.
    current: ComponentBase | null;
    look: GroupLook | null;
    wanted: Wanted[];
    // How far it gave way to the room: 0 as given, 1 large commands medium, 2 all small, 3 folded into one button (in
    // the simplified layout 2 is in the "more" menu).
    level: number;
    // Left out of the simplified row for the "more" menu, or folded into its button.
    out: boolean;
    folded: boolean;
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
    // The command it draws: a command given anew under its key is written here, and what shows it follows.
    command: Signal<RibbonCommand>;
    made: Map<RibbonCommand, Made> | null;
    stop: (() => void) | null;
    // The size it is drawn at.
    size?: RibbonCommandSize;
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
    customMenuOpened = new Emitter<RibbonMenuCustomMenuOpeningEventArgs>();
    // Changes by path; the children of a tab are its groups, of a group and of a row their commands.
    tree = new ItemTree<RibbonTab>(depth => ['groups', 'commands', 'commands'][depth] ?? null, () => givenList(this.peekProperty<readonly RibbonTab[]>('items')), next => this.applyItems(next));
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
    // The commands are open over the page (display 'tabs' or 'auto').
    floating = false;
    compact = false;
    /** What the last fit was for: the room's width, and whether something changed since (content, look, layout). */
    fittedWidth = -1;
    fitDue = true;
    /** The steps the groups of `fitPanel` gave way by at the last fit: where the next fit starts. */
    fitCount = 0;
    fitPanel: Panel | null = null;
    fitSimple = false;
    /** Buttons a fit step sized, whose looks it reads together. */
    lookDue: Button[] = [];
    // The user's changes: our own copy, never the object the app gave.
    custom: RibbonMenuCustomization = {};
    hints: RibbonKeyHints;
    customMenu: ContextMenu;
    altDown = false;
    altChord = false;
    // Focus went out of a part of the menu to an element; where it lands decides whether what is open over the page closes.
    focusLeaving = false;

    constructor(props?: IBaseProp<RibbonMenuProps>) {
        super(props);
        const own = (this.props ?? {}) as RibbonMenuProps;
        this.class.add('mx-ribbon-menu');
        // Hidden automatically, the menu is this strip until it is opened over the page.
        this.reveal = part<HTMLButtonElement>(this, 'button', 'mx-ribbon-menu__reveal');
        this.reveal.attr.add({ type: 'button' });
        glyphPart(this.reveal, 'chevron-down', 'mx-ribbon-menu__reveal-glyph');
        this.frame = part<HTMLDivElement>(this, 'div', 'mx-ribbon-menu__frame');
        this.bar = part<HTMLDivElement>(this.frame, 'div', 'mx-ribbon-menu__bar');
        this.startHost = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__bar-start');
        this.app = part<HTMLButtonElement>(this.bar, 'button', 'mx-ribbon-menu__app');
        this.app.attr.add({ type: 'button' });
        this.appCaption = part<HTMLSpanElement>(this.app, 'span', 'mx-ribbon-menu__app-text');
        kept(this.app, false);
        this.quickTop = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__quick');
        this.picker = new Button({ menu: [] });
        this.picker.class.add('mx-ribbon-menu__picker');
        this.bar.controls.add(this.picker);
        this.tabList = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__tabs');
        this.tabList.attr.add({ role: 'tablist' });
        this.endHost = part<HTMLDivElement>(this.bar, 'div', 'mx-ribbon-menu__bar-end');
        kept(this.startHost, false);
        kept(this.endHost, false);
        this.body = part<HTMLDivElement>(this.frame, 'div', 'mx-ribbon-menu__body');
        // The commands scroll in the stage when they do not fit even after giving way; the buttons at its ends scroll it.
        this.stage = part<HTMLDivElement>(this.body, 'div', 'mx-ribbon-menu__stage');
        this.back = this.makeScroll(-1);
        this.forward = this.makeScroll(1);
        // Its variant and size come from its place.
        this.switcher = new Button({ icon: glyph('chevron-up') });
        this.switcher.class.add('mx-ribbon-menu__switch');
        this.switcher.motif.on('click', (_, e) => this.switchLayout(e));
        this.body.controls.add(this.switcher);
        this.quickBelow = part<HTMLDivElement>(this.frame, 'div', 'mx-ribbon-menu__quick mx-ribbon-menu__quick--below');
        for (const quick of [this.quickTop, this.quickBelow]) {
            quick.attr.add({ role: 'toolbar' });
            kept(quick, false);
        }
        this.hints = new RibbonKeyHints(this, () => this.tabHints(), () => this.commandHints(), () => {});
        this.customMenu = new ContextMenu();
        this.customMenu.onOpening(e => this.customMenuOpening(e));
        this.controls.add(this.customMenu);
        probeLengths(this, [COMPACT]);

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.label !== undefined) this.bindProperty('text', own.label);
        if (own.onSelecting) this.onSelecting(own.onSelecting);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onCommandClick) this.onCommandClick(own.onCommandClick);
        if (own.onGroupMore) this.onGroupMore(own.onGroupMore);
        if (own.onLayoutChanged) this.onLayoutChanged(own.onLayoutChanged);
        if (own.onCustomMenuOpening) this.onCustomMenuOpening(own.onCustomMenuOpening);
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
        this.tabList.motif.on('click', (_, e) => this.tabClick(e));
        this.tabList.motif.on('dblclick', (_, e) => this.tabDoubleClick(e));
        this.app.motif.on('click', (_, e) => this.appButtonClick.fire({ part: this.app, originalEvent: e, source: this }));
        this.reveal.motif.on('click', () => this.openOver(true));
        this.motif.on('keydown', (_, e) => this.ownKeyDown(e));
        this.motif.on('focusout', (_, e) => this.focusLeft(e));
        // Key hints and the open commands answer keys, presses and focus anywhere in the page.
        const stopPage = [
            onDocument(this, 'keydown', e => this.pageKeyDown(e), true),
            onDocument(this, 'keyup', e => this.pageKeyUp(e), true),
            onDocument(this, 'pointerdown', e => this.pagePointerDown(e), true),
            onDocument(this, 'focusin', e => this.focusLanded(e), true),
        ];
        this.tabList.motif.on('keydown', (_, e) => this.tabKeyDown(e));
        this.body.motif.on('keydown', (_, e) => this.commandKeyDown(e));
        this.body.motif.on('focusin', (_, e) => this.commandFocused(e));
        // Another width, design language, theme or density: the groups give way again.
        // Only another width: the fit itself makes the menu higher or lower, which must not fit it again.
        onLayout(this, 'size', () => measure(this, this.readRoom, this.fit));
        onLayout(this, 'look', () => this.queueLayout());
        // Commands that name commands of the app take their fields from them: read again when those change.
        const listening = commands.onChanged(() => this.namesCommands() && this.refresh());
        this.motif.setDisposable(() => listening.dispose());
        this.drawNames();
        this.drawLayout();
        this.drawDisplay();
        this.motif.setDisposable(() => {
            for (const stop of stopPage) stop();
            this.stopQuick?.();
            this.dropMade(this.quickMade);
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

    /** Occurs before the menu of the right button opens: add commands of your own or leave some out. */
    get onCustomMenuOpening(): MotifEvent<RibbonMenuCustomMenuOpeningEventArgs> {
        return this.customMenuOpened.event;
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
        return partsOf(path).length === 2 ? (this.tree.find(path) as RibbonGroup | null) : null;
    }

    /** The command at `path` (`tab/group/command`, a row's command a fourth part), as it is now. */
    findCommand(path: string): RibbonCommand | null {
        return partsOf(path).length >= 3 ? (this.tree.find(path) as RibbonCommand | null) : null;
    }

    // Changes by path. The tabs, groups and commands given are never changed: a new list is made, the items along the
    // changed path new objects and the others the ones given, and it becomes `items`; `onItemsChanged` reports it.

    /** Adds a tab at `index`, the end by default. Returns `false` when nothing changed. */
    addTab(tab: RibbonTab, index?: number): boolean {
        return this.tree.add('', tab, index);
    }

    /** Adds a group to the tab at `tabPath`. */
    addGroup(tabPath: string, group: RibbonGroup, index?: number): boolean {
        return partsOf(tabPath).length === 1 && this.tree.add(tabPath, group, index);
    }

    /** Adds a command to the group at `parentPath` (`tab/group`), or to a row (`tab/group/row`). */
    addCommand(parentPath: string, command: RibbonCommand, index?: number): boolean {
        const depth = partsOf(parentPath).length;
        return (depth === 2 || depth === 3) && this.tree.add(parentPath, command, index);
    }

    /** Removes the tab, group or command at `path`. */
    remove(path: string): boolean {
        return this.tree.remove(path);
    }

    /**
     * Moves the tab, group or command at `path` to `index` in its list, or in the list at `toParent`: another tab for a
     * group, another group (or row) for a command.
     */
    move(path: string, index: number, toParent?: string): boolean {
        const from = partsOf(path).length - 1;
        return (toParent === undefined || partsOf(toParent).length === from) && this.tree.move(path, index, toParent);
    }

    /** Changes fields of the tab, group or command at `path`; the others stay as they are. */
    update(path: string, changes: Partial<RibbonTab> | Partial<RibbonGroup> | Partial<RibbonCommand>): boolean {
        return this.tree.update(path, changes);
    }

    /** Holds the changes by path until `endUpdate()`, which applies them at once. */
    beginUpdate(): void {
        this.tree.beginUpdate();
    }

    endUpdate(): void {
        this.tree.endUpdate();
    }

    currentTabs(): readonly RibbonTab[] {
        return this.tree.current;
    }

    changeItems(parent: string[], change: (list: readonly unknown[]) => unknown[] | null): boolean {
        return this.tree.change(parent, change);
    }

    applyItems(next: RibbonTab[]): void {
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

    /** Whether a command of the tabs names a command of the app. */
    namesCommands(): boolean {
        const walk = (list: readonly unknown[]): boolean => list.some(c => givenValue(c, 'command') !== undefined || walk(givenList(givenField<readonly unknown[] | undefined>(c, 'commands'))));
        return untracked(() => this.currentTabs().some(tab => givenList(givenField<readonly RibbonGroup[] | undefined>(tab, 'groups')).some(group => walk(givenList(givenField<readonly unknown[] | undefined>(group, 'commands'))))));
    }

    /** Opens the commands over the page when the menu shows only its tabs or hides itself; `false` closes them. */
    openOver(open: boolean): void {
        if (this.display === 'always') return;
        this.setFloating(open);
        // Focus goes in once the open commands are laid out.
        if (open) void whenMeasured(this).then(() => this.floating && this.focus());
    }

    /** Shows the key hints, as Alt or F10 does. */
    showKeyHints(): void {
        if (this.display === 'auto' && !this.floating) this.setFloating(true);
        this.hints.start('tabs');
    }

    /** The tabs Tab and the arrows reach, in their order. */
    override get focusPart(): ComponentBase {
        const key = this.shownKey;
        const index = this.looks.findIndex(look => look.key === key);
        return index >= 0 ? this.entries[index].host : this;
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

    // Each tab is made once for its key and kept while its key is given: a tab added, removed or moved changes only
    // that; a tab's panel stays while its tab does.
    drawTabs(): void {
        const free = new Map(this.entries.map(p => [p.key, p]));
        this.entries = this.looks.map(look => {
            const old = free.get(String(look.key));
            free.delete(String(look.key));
            return old ?? this.makeTab(look);
        });
        for (const p of free.values()) void p.host.dispose();
        this.entries.forEach((p, i) => {
            if (this.tabList.controls.items.indexOf(p.host) !== i) this.tabList.controls.moveToIndex(p.host, i);
        });
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
            const host = p.host;
            const parsed = parseAccessKey(look.text);
            renderAccessKey(p.caption, parsed);
            // A disabled tab takes no key.
            const key = parsed.key && look.enabled ? accessKeyToken(parsed.key) : null;
            setAccessKeyAttribute(p.host, p.accessKey, key);
            p.accessKey = key;
            kept(host, look.visible);
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
        const id = nextId('mx-ribbon-tab');
        host.attr.add({ type: 'button', role: 'tab', id });
        const caption = part<HTMLSpanElement>(host, 'span', 'mx-ribbon-menu__tab-text');
        return { tab: look.tab, key: String(look.key), id, host, caption, accessKey: null };
    }

    drawNames(): void {
        put(this.tabList, 'aria-label', parseAccessKey(this.text ?? '').text || uiLocale.strings.ribbonMenuLabel);
        for (const panel of this.panels.values()) for (const group of panel.groups.values()) this.drawMoreHint(group);
        const simple = this.peekProperty<RibbonMenuLayout>('layout') === 'simple';
        const name = simple ? uiLocale.strings.ribbonMenuClassic : uiLocale.strings.ribbonMenuSimple;
        this.switcher.hint = name;
        for (const panel of this.panels.values()) if (panel.overflow) panel.overflow.hint = uiLocale.strings.moreOptions;
    }

    drawSelection(): void {
        const key = this.shownKey;
        this.looks.forEach((look, i) => {
            const host = this.entries[i].host;
            const selected = look.key === key;
            put(host, 'aria-selected', String(selected));
            put(host, 'tabindex', selected ? '0' : '-1');
        });
        const look = this.looks.find(l => l.key === key);
        if (look) this.showPanel(look);
        for (const [tab, panel] of this.panels) kept(panel.host, tab === look?.tab);
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
        const index = this.indexOfTab(e);
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
        if (this.indexOfTab(e) < 0 || this.display === 'auto') return;
        this.changeDisplay(this.display === 'tabs' ? 'always' : 'tabs', e);
    }

    tabKeyDown(e: KeyboardEvent): void {
        const index = this.indexOfTab(e);
        if (index < 0 || e.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
        const stops = this.looks.map((_, i) => i).filter(i => this.looks[i].visible && this.looks[i].enabled);
        const at = stops.indexOf(index);
        const rtl = isRtl(this);
        let to = -1;
        if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) to = stops[(at + 1) % stops.length];
        else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) to = stops[(at - 1 + stops.length) % stops.length];
        else if (e.key === 'Home') to = stops[0];
        else if (e.key === 'End') to = stops[stops.length - 1];
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.display !== 'always' && !this.floating) {
                this.setFloating(true);
                void whenMeasured(this).then(() => this.floating && this.focusCommands());
            } else {
                this.focusCommands();
            }
            return;
        }
        if (to === undefined || to < 0) return;
        e.preventDefault();
        if (this.choose(this.looks[to], e)) focusOn(this.entries[to].host);
    }

    // The tab an event started in; -1 when it started in none.
    indexOfTab(e: Event): number {
        return this.entries.findIndex(p => p.host.motif.isEventFrom(e));
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
        const tab = this.entries[this.looks.indexOf(look)];
        let panel = this.panels.get(look.tab);
        if (!panel) {
            const host = part<HTMLDivElement>(this.stage, 'div', 'mx-ribbon-menu__panel');
            host.attr.add({ role: 'tabpanel' });
            host.motif.on('scroll', () => this.drawEnds());
            host.motif.on('wheel', (_, e) => this.wheel(host, e));
            const id = nextId('mx-ribbon-panel');
            host.attr.add({ id });
            const made: Panel = { tab: look.tab, key: String(look.key), id, raw: [], host, groups: new Map(), stop: () => {}, overflow: null };
            this.followGroups(made);
            panel = made;
            this.panels.set(look.tab, panel);
        }
        put(panel.host, 'aria-labelledby', tab.id);
        put(tab.host, 'aria-controls', panel.id);
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
            text(group.label, look.text);
            kept(group.host, look.visible);
            this.drawMore(panel, group, look);
        }
        this.drawDividers(panel);
        this.queueRoving();
        this.queueLayout();
    }

    makeGroup(panel: Panel, group: RibbonGroup): GroupPart {
        const divider = part<HTMLDivElement>(panel.host, 'div', 'mx-ribbon-menu__divider');
        divider.attr.add({ 'aria-hidden': 'true' });
        const host = part<HTMLDivElement>(panel.host, 'div', 'mx-ribbon-menu__group');
        host.attr.add({ role: 'group' });
        const inner = part<HTMLDivElement>(host, 'div', 'mx-ribbon-menu__group-inner');
        const commands = part<HTMLDivElement>(inner, 'div', 'mx-ribbon-menu__commands');
        const foot = part<HTMLDivElement>(inner, 'div', 'mx-ribbon-menu__group-foot');
        const label = part<HTMLSpanElement>(foot, 'span', 'mx-ribbon-menu__group-label');
        const labelId = nextId('mx-ribbon-group');
        label.attr.add({ id: labelId });
        host.attr.add({ 'aria-labelledby': labelId });
        const made: GroupPart = { group, divider, host, inner, commands, foot, label, more: null, made: new Map(), stop: () => {}, current: null, look: null, wanted: [], level: 0, out: false, folded: false, fold: null, popup: null };
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
        // A command the user hid is kept out of sight, after the others, for when it is shown again.
        const shownWanted = this.customCommands(panel, group);
        const hidden = group.wanted.filter(w => !shownWanted.includes(w)).map(w => ({ ...w, visible: false }));
        group.made = this.placeCommands(group.commands, group.made, [...shownWanted, ...hidden], where, false);
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
            more.class.add('mx-ribbon-menu__more');
            more.motif.on('click', (_, e) => this.morePressed(panel.tab, group, more, e));
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
        group.more.hint = own || fillTemplate(uiLocale.strings.ribbonMenuMore, { group: group.look?.text ?? '' });
    }

    morePressed(tab: RibbonTab, group: GroupPart, more: Button, e: Event): void {
        const args: RibbonGroupMoreEventArgs = { group: group.group, tab, part: more, originalEvent: e, source: this };
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
            return { command, key, fixed, type, size, visible: fieldOf(command, 'visible', this) !== false, simple: givenField(command, 'simple') !== false };
        });
    }

    // A command is made once and kept while it is given, as itself or anew under its key (a change by path gives a new
    // object); it is made again only when its kind changes. Its place follows the list.
    placeCommands(host: Component<HTMLDivElement>, made: Map<RibbonCommand, Made>, wanted: Wanted[], where: Where | ((command: RibbonCommand) => Where), inRow: boolean): Map<RibbonCommand, Made> {
        const keep = new Map<RibbonCommand, Made>();
        const used = new Set<Made>();
        const same = (m: Made | undefined, want: Wanted): m is Made =>
            !!m && !used.has(m) && m.type === want.type && (want.type !== 'content' || givenValue(m.command.peek(), 'content') === givenValue(want.command, 'content'));
        const found = new Map<Wanted, Made>();
        for (const want of wanted) {
            const old = made.get(want.command);
            if (same(old, want)) {
                found.set(want, old);
                used.add(old);
            }
        }
        for (const want of wanted) {
            if (found.has(want)) continue;
            const old = [...made.values()].find(m => m.want.key === want.key && same(m, want));
            if (old) {
                found.set(want, old);
                used.add(old);
            }
        }
        for (const want of wanted) {
            const m = found.get(want) ?? this.makeCommand(want, typeof where === 'function' ? where(want.command) : where, inRow);
            if (m.command.peek() !== want.command) this.giveCommand(m, want.command);
            m.want = want;
            keep.set(want.command, m);
        }
        const gone = new Map<RibbonCommand, Made>();
        for (const [command, old] of made) if (!used.has(old)) gone.set(command, old);
        this.dropMade(gone);
        let index = 0;
        for (const want of wanted) {
            const m = keep.get(want.command)!;
            const items = host.controls.items;
            if (!items.includes(m.control)) host.controls.add(index, m.control);
            else if (items.indexOf(m.control) !== index) host.controls.moveToIndex(m.control, index);
            index++;
            kept(m.control, want.visible);
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

    // A command given anew under its key: what shows it reads it from here on.
    giveCommand(m: Made, command: RibbonCommand): void {
        untracked(() => {
            m.command.value = command;
            if (m.control instanceof RibbonGallery) m.control.command = command;
            if (m.control instanceof Button && m.type === 'toggle') {
                // A toggle bound to the app follows the new binding; one of its own keeps its state.
                const pressed = valueOf<Bind<boolean> | undefined>(command, 'pressed', this, 'checked');
                if (typeof pressed === 'function') m.control.pressed = pressed;
            }
        });
    }

    makeCommand(want: Wanted, where: Where, inRow: boolean): Made {
        const { command, type } = want;
        const box = createSignal(command);
        if (type === 'separator') {
            const line = new Component<HTMLDivElement>('div');
            line.class.add('mx-ribbon-menu__separator');
            line.attr.add({ role: 'separator', 'aria-orientation': 'vertical' });
            return { control: line, type, want, command: box, made: null, stop: null };
        }
        if (type === 'content') {
            const holder = new Component<HTMLDivElement>('div');
            holder.class.add('mx-ribbon-menu__content');
            const content = givenValue<(() => ComponentBase) | undefined>(command, 'content')?.();
            if (content) holder.controls.add(content);
            return { control: holder, type, want, command: box, made: null, stop: null };
        }
        if (type === 'gallery') {
            const gallery = new RibbonGallery(command, (item, e) => this.galleryPicked(box.peek(), item, where, e));
            return { control: gallery, type, want, command: box, made: null, stop: null };
        }
        if (type === 'row') {
            const row = new Component<HTMLDivElement>('div');
            row.class.add('mx-ribbon-menu__row');
            row.attr.add({ role: 'group' });
            const made: Made = { control: row, type, want, command: box, made: new Map(), stop: null };
            made.stop = follow(
                this,
                'row',
                () => this.wantedOf(givenField<readonly RibbonCommand[] | undefined>(box.value, 'commands'), true),
                wanted => {
                    made.made = this.placeCommands(row, made.made!, wanted, where, true);
                    this.queueRoving();
                    this.queueLayout();
                }
            );
            return made;
        }
        return { control: this.makeButton(box, type, where), type, want, command: box, made: null, stop: null };
    }

    makeButton(box: Signal<RibbonCommand>, type: RibbonCommandType, where: Where): Button {
        // Its text and hint are given by its size (drawSize).
        const props: ButtonProps = {
            icon: () => {
                const name = String(fieldOf(box.value, 'glyph', this) ?? '');
                return name ? glyph(name) : (fieldOf<IconSource | null | undefined>(box.value, 'icon', this) ?? null);
            },
            enabled: () => fieldOf(box.value, 'enabled', this) !== false
        };
        if (type === 'toggle') {
            props.toggle = true;
            props.pressed = valueOf<Bind<boolean> | undefined>(box.peek(), 'pressed', this, 'checked');
        }
        if (type === 'split' || type === 'menu') props.menu = () => givenField<readonly MenuItem[] | undefined>(box.value, 'menu') ?? [];
        if (type === 'split') props.split = true;
        // A command chosen from its menu closes commands open over the page.
        if (type === 'split' || type === 'menu') props.onItemClick = () => this.floating && this.setFloating(false);
        const made = new Button(props);
        made.class.add('mx-ribbon-menu__command');
        // Heard on the part that is pressed: the arrow of a split command opens its menu, only its own part runs it.
        if (type !== 'menu') made.faceComponent.motif.on('click', (_, e) => this.commandPressed(box.peek(), made, where, e));
        return made;
    }

    galleryPicked(command: RibbonCommand, item: RibbonGalleryItem, where: Where, e: Event): void {
        const args: RibbonCommandClickEventArgs = { command, group: where.group, tab: where.tab, item, originalEvent: e, source: this };
        givenValue<((e: RibbonCommandClickEventArgs) => void) | undefined>(command, 'click')?.(args);
        this.commandClick.fire(args);
        if (this.floating) this.setFloating(false);
    }

    commandPressed(command: RibbonCommand, button: Button, where: Where, e: Event): void {
        const args: RibbonCommandClickEventArgs = { command, group: where.group, tab: where.tab, originalEvent: e, source: this };
        runItem(command, args, this, e, this);
        // A click set the toggle's own state; one bound to the app follows the app again.
        const pressed = valueOf<Bind<boolean> | undefined>(command, 'pressed', this, 'checked');
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
        put(this, 'data-layout', simple ? 'simple' : 'classic');
        kept(this.switcher, this.peekProperty('layoutSwitch') !== false && !this.compact);
        this.switcher.icon = glyph(simple ? 'chevron-down' : 'chevron-up');
        put(this.switcher.faceComponent, 'aria-expanded', String(!simple));
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
        this.fitDue = true;
        measure(this, this.readRoom, this.fit);
    }

    // The room of the menu, and the width it turns compact under.
    readonly readRoom = (): { width: number; compact: number } => ({ width: boxOf(this).clientWidth, compact: lengthOf(this, COMPACT, 480) });

    // Each step a group gives way is measured at once: the one place the menu reads after it wrote.
    readonly fit = (room: { width: number; compact: number }): void => {
        if (!this.fitDue && room.width === this.fittedWidth) return;
        const panel = this.shownPanel();
        const compact = room.width > 0 && room.width < room.compact;
        if (compact !== this.compact) {
            this.compact = compact;
            mark(this, 'data-compact', compact);
            this.drawLayout();
        }
        // After drawing the layout, which asks for a fit itself: this fit is that one.
        this.fitDue = false;
        this.fittedWidth = room.width;
        if (!panel) return;
        const simple = this.shownLayout() === 'simple';
        const groups = [...panel.groups.values()].filter(g => g.look?.visible !== false);
        // Another layout draws every level anew: the steps mean other sizes there.
        const relayout = simple !== this.fitSimple || panel !== this.fitPanel;
        this.fitSimple = simple;
        for (const group of panel.groups.values()) if (!groups.includes(group) && (relayout || group.level !== 0)) this.setLevel(group, 0, simple);
        const order = groups
            .map((group, index) => ({ group, index }))
            .sort((a, b) => (a.group.look?.priority ?? 0) - (b.group.look?.priority ?? 0) || b.index - a.index)
            .map(x => x.group);
        const last = simple ? 2 : 3;
        // The steps in the order the groups give way; each one narrows the menu.
        const steps: { group: GroupPart; level: number }[] = [];
        if (this.peekProperty('adaptive') !== false) {
            for (let level = 1; level <= last; level++) {
                for (const group of order) if (level < last || group.look?.collapsible !== false) steps.push({ group, level });
            }
        }
        let fresh = relayout;
        const take = (count: number) => {
            const levels = new Map<GroupPart, number>(groups.map(group => [group, 0]));
            for (let i = 0; i < count; i++) levels.set(steps[i].group, steps[i].level);
            for (const [group, level] of levels) if (fresh || group.level !== level) this.setLevel(group, level, simple);
            fresh = false;
            Button.readLooksNow(this.lookDue.splice(0));
            this.drawOverflow(panel, simple);
        };
        const fits = () =>
            readAgain(() => {
                const box = boxOf(panel.host);
                return !box.clientWidth || box.scrollWidth <= box.clientWidth + 0.5;
            });
        const done = (count: number) => {
            this.fitCount = count;
            this.fitPanel = panel;
            this.finishFit(panel);
        };
        // The last fit is where to start: it mostly still holds, and two layouts tell so. Otherwise the fewest steps
        // that fit are searched by halves, a few layouts instead of one for each step.
        const known = relayout ? 0 : Math.min(this.fitCount, steps.length);
        take(known);
        let low: number;
        let high: number;
        if (fits()) {
            if (known === 0) return done(0);
            take(known - 1);
            if (!fits()) {
                take(known);
                return done(known);
            }
            low = 0;
            high = known - 1;
        } else {
            if (known === steps.length) return done(known);
            low = known + 1;
            high = steps.length;
            take(high);
            if (!fits()) return done(high);
        }
        while (low < high) {
            const middle = (low + high) >> 1;
            take(middle);
            if (fits()) high = middle;
            else low = middle + 1;
        }
        take(low);
        done(low);
    };

    finishFit(panel: Panel): void {
        this.drawDividers(panel);
        this.drawEnds();
        this.queueRoving();
    }

    // Scrolling: what does not fit even after giving way scrolls, by the buttons at the ends, the wheel and a finger.

    makeScroll(direction: 1 | -1): Button {
        const button = new Button({ icon: glyph(direction > 0 ? 'chevron-end' : 'chevron-start') });
        button.class.add('mx-ribbon-menu__scroll', direction > 0 ? 'mx-ribbon-menu__scroll--forward' : 'mx-ribbon-menu__scroll--back');
        put(button, 'tabindex', '-1');
        button.attr.add({ 'aria-hidden': 'true' });
        button.motif.on('mousedown', (_, e) => e.preventDefault());
        button.motif.on('click', () => this.scrollPanel(direction));
        kept(button, false);
        this.stage.controls.add(button);
        return button;
    }

    drawEnds(): void {
        measure(this, this.readEnds, this.writeEnds);
    }

    // How wide the commands of the shown panel are, the room they have and how far they are scrolled.
    readonly readEnds = (): { room: number; needed: number; at: number } => {
        const panel = this.shownPanel();
        const box = panel ? boxOf(panel.host) : null;
        return { room: box?.clientWidth ?? 0, needed: box?.scrollWidth ?? 0, at: box?.scrollStart ?? 0 };
    };

    readonly writeEnds = ({ room, needed, at }: { room: number; needed: number; at: number }): void => {
        kept(this.back, needed > room + 1 && at > 1);
        kept(this.forward, needed > room + 1 && at + room < needed - 1);
    };

    scrollPanel(direction: 1 | -1): void {
        const host = this.shownPanel()?.host;
        if (!host) return;
        const smooth = mediaOf(this, '(prefers-reduced-motion: no-preference)');
        scrollBy(host, { start: direction * boxOf(host).clientWidth * 0.8 }, smooth ? 'smooth' : 'auto');
    }

    // A plain mouse wheel scrolls the commands sideways.
    wheel(host: Component<HTMLDivElement>, e: WheelEvent): void {
        if (e.deltaX || !e.deltaY) return;
        const box = boxOf(host);
        if (box.scrollWidth <= box.clientWidth) return;
        e.preventDefault();
        scrollBy(host, { start: box.rtl ? -e.deltaY : e.deltaY });
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
        kept(host, !!control);
    }

    setLevel(group: GroupPart, level: number, simple: boolean): void {
        group.level = level;
        this.drawSizes(group, true);
        if (!simple && level >= 3) this.foldGroup(group);
        else this.unfold(group);
        group.out = simple && level >= 2;
        mark(group.host, 'data-out', group.out);
    }

    // The size a command of the group is drawn at.
    sizeAt(given: RibbonCommandSize, level: number): RibbonCommandSize {
        const simple = this.shownLayout() === 'simple';
        if (given === 'small' || level >= 2 || (simple && level >= 1)) return 'small';
        if (simple || level >= 1) return 'medium';
        return given;
    }

    // In the fit (`now`), each button takes its look at once, so the next step measures it as drawn.
    drawSizes(group: GroupPart, now = false): void {
        for (const m of group.made.values()) {
            if (m.type === 'row') continue;
            // A gallery is as high as the group until it gives way to its button alone.
            const simple = this.shownLayout() === 'simple';
            const size = m.type === 'gallery' ? (group.level >= 2 || simple || m.want.size === 'small' ? 'small' : 'large') : this.sizeAt(m.want.size, group.level);
            this.drawSize(m, size, now);
            mark(m.control, 'data-simple-hidden', !m.want.simple);
        }
    }

    drawSize(m: Made, size: RibbonCommandSize, now = false): void {
        if (m.size === size) return;
        m.size = size;
        put(m.control, 'data-ribbon-size', size);
        if (m.control instanceof RibbonGallery) m.control.setSmall(size === 'small');
        if (!(m.control instanceof Button)) return;
        // A small command shows its icon alone; its text names it, as its tooltip.
        const box = m.command;
        const button = m.control;
        if (size === 'small') {
            button.text = '';
            button.hint = () => String(fieldOf(box.value, 'hint', this) ?? '') || parseAccessKey(String(fieldOf(box.value, 'text', this) ?? '')).text;
        } else {
            button.text = () => String(fieldOf(box.value, 'text', this) ?? '');
            button.hint = () => String(fieldOf(box.value, 'hint', this) ?? '');
        }
        // In a fit the looks are read together once the step is written: one layout for all of them.
        if (now) this.lookDue.push(button);
        else button.readLook();
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
            fold.class.add('mx-ribbon-menu__command', 'mx-ribbon-menu__fold');
            fold.attr.add({ 'data-ribbon-size': 'large', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
            glyphPart(part(fold, 'span', 'mx-ribbon-menu__fold-arrow'), 'chevron-down');
            fold.motif.on('click', () => this.toggleFold(group));
            const popup = new Popup();
            popup.matchWidth = false;
            popup.class.add('mx-ribbon-menu__drop');
            popup.attr.add({ role: 'dialog' });
            popup.onClosed(() => this.lend(group, false));
            group.host.controls.add(fold);
            group.host.controls.add(popup);
            group.fold = fold;
            group.popup = popup;
        }
        group.folded = true;
        mark(group.host, 'data-folded', true);
    }

    toggleFold(group: GroupPart): void {
        const { fold, popup } = group;
        if (!fold || !popup) return;
        if (popup.isOpen) {
            popup.close('code');
            return;
        }
        this.lend(group, true);
        put(popup, 'aria-label', group.look?.text ?? '');
        popup.open(fold);
        put(fold, 'aria-expanded', 'true');
        if (!focusFirstIn(popup)) focusOn(popup);
    }

    unfold(group: GroupPart): void {
        group.popup?.close('code');
        this.lend(group, false);
        group.folded = false;
        mark(group.host, 'data-folded', false);
    }

    lend(group: GroupPart, open: boolean): void {
        // A group never folded has nothing to lend or take back.
        if (!group.popup || group.host.isDisposed) return;
        if (group.fold) put(group.fold, 'aria-expanded', String(open));
        const into = open ? group.popup : group.host;
        if (group.inner.parent === into) return;
        // Moved, not made again: the commands stay alive.
        into.controls.add(group.inner);
        if (!open) group.host.controls.moveToIndex(group.inner, 0);
        this.queueRoving();
    }

    drawDividers(panel: Panel): void {
        let first = true;
        for (const group of panel.groups.values()) {
            const on = group.look?.visible !== false && !group.out;
            kept(group.divider, on && !first);
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
                const commands = this.menuItemsOf(group.made, m => group.out || !m.want.simple);
                if (commands.length) items.push({ text: group.look?.text ?? '', items: commands });
            }
        }
        if (items.length && !panel.overflow) {
            const more = new Button({ menu: [], icon: moreMark() });
            more.class.add('mx-ribbon-menu__command', 'mx-ribbon-menu__overflow');
            more.attr.add({ 'data-ribbon-size': 'small' });
            more.hint = uiLocale.strings.moreOptions;
            panel.host.controls.add(more);
            panel.overflow = more;
        }
        if (!panel.overflow) return;
        panel.overflow.menu = items;
        panel.overflow.refresh();
        kept(panel.overflow, items.length > 0);
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
                    text: parseAccessKey(String(fieldOf(m.want.command, 'text', this) ?? '')).text,
                    beginGroup: line,
                    items: gallery.items().map(item => ({ text: String(givenField(item, 'text') ?? ''), enabled: givenField(item, 'enabled') !== false, group: 'gallery', checked: gallery.isChosen(item), click: (e: MenuItemClickEventArgs) => this.galleryPicked(m.want.command, item, where, e.event) }))
                });
                line = false;
                continue;
            }
            if (!(m.control instanceof Button)) continue;
            items.push({ ...menuItemOf(m.control), text: () => parseAccessKey(String(fieldOf(m.want.command, 'text', this) ?? '')).text, beginGroup: line });
            line = false;
        }
        return items;
    }

    // Showing: always, only the tabs (a tab opens its commands over the page), or behind a strip (the whole menu opens
    // over the page). What is open over the page closes on a command, Escape, a click elsewhere and focus leaving.

    drawDisplay(): void {
        const display = this.peekProperty<RibbonMenuDisplay>('display') ?? 'always';
        put(this, 'data-display', display);
        if (display === 'always') this.setFloating(false);
        put(this.reveal, 'aria-label', uiLocale.strings.ribbonMenuReveal);
        put(this.reveal, 'title', uiLocale.strings.ribbonMenuReveal);
        put(this.reveal, 'aria-expanded', String(this.floating));
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
        mark(this, 'data-floating', on);
        put(this.reveal, 'aria-expanded', String(on));
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
            else focusOn(this.reveal);
        }
    }

    // Focus that goes nowhere keeps what is open over the page; focus that goes to an element is decided where it lands.
    focusLeft(e: FocusEvent): void {
        this.focusLeaving = !!e.relatedTarget;
    }

    // Focus that left the menu for something else in the page closes what is open over the page.
    focusLanded(e: FocusEvent): void {
        if (!this.focusLeaving) return;
        this.focusLeaving = false;
        if (this.floating && !this.motif.isEventFrom(e)) this.setFloating(false);
    }

    pagePointerDown(e: PointerEvent): void {
        const inside = this.motif.isEventFrom(e);
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
        if (e.key === 'F10' && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && this.claimsKeys(e)) {
            e.preventDefault();
            this.showKeyHints();
        }
    }

    pageKeyUp(e: KeyboardEvent): void {
        if (e.key !== 'Alt') return;
        const tap = this.altDown && !this.altChord;
        this.altDown = false;
        if (!tap || !this.claimsKeys(e)) return;
        if (this.hints.active) this.hints.stop();
        else this.showKeyHints();
    }

    // The keys are this menu's when focus is in it (the innermost menu holding focus), or, with focus in no menu, when
    // it is the first menu shown in the page.
    claimsKeys(e: KeyboardEvent): boolean {
        if (this.peekProperty('keyHints') === false || !this.isEnabled) return false;
        const menus = [...liveControls()].filter((c): c is RibbonMenu => c instanceof RibbonMenu && sameWindow(c, this));
        const holder = menus.filter(m => holdsFocus(m, e)).sort((a, b) => treeDepth(b) - treeDepth(a))[0];
        if (holder) return holder === this;
        return menus.sort(compareTreeOrder).find(m => isRendered(m)) === this;
    }

    tabHints(): KeyHint[] {
        const hints: KeyHint[] = [];
        // The button before the tabs is shown while it has a text (drawApp).
        const app = parseAccessKey(this.appButton);
        if (app.text) hints.push({ part: this.app, keys: app.key ?? '', text: app.text, press: () => this.app.attr.add({ click: true }) });
        this.looks.forEach((look, i) => {
            if (!look.visible || !look.enabled) return;
            const parsed = parseAccessKey(look.text);
            const host = this.compact ? this.picker : this.entries[i].host;
            hints.push({ part: host, keys: parsed.key ?? '', text: parsed.text, press: () => this.pressTab(look) });
        });
        let n = 1;
        for (const m of this.quickMade.values()) {
            if (!(m.control instanceof Button) || !m.want.visible || n > 9) continue;
            hints.push(buttonHint(m.control, String(n++), ''));
        }
        return hints;
    }

    pressTab(look: TabLook): void {
        this.choose(look, null);
        if (this.display !== 'always') this.setFloating(true);
    }

    commandHints(): KeyHint[] {
        const panel = this.shownPanel();
        if (!panel) return [];
        const hints: KeyHint[] = [];
        for (const group of panel.groups.values()) {
            if (group.look?.visible === false || group.out) continue;
            if (group.folded && group.fold) {
                hints.push({ part: group.fold, keys: '', text: group.look?.text ?? '', press: () => !group.popup?.isOpen && this.toggleFold(group), opens: () => this.foldedHints(group) });
                continue;
            }
            hints.push(...this.groupHints(group));
        }
        // The "more" button is shown while its menu has items (drawOverflow).
        if (panel.overflow && panel.overflow.menu.length) hints.push(buttonHint(panel.overflow, '', uiLocale.strings.moreOptions));
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
            const text = parseAccessKey(String(fieldOf(command, 'text', this) ?? ''));
            const keys = String(givenField(command, 'keyHint') ?? '') || text.key || '';
            if (m.control instanceof Button) {
                hints.push(buttonHint(m.control, keys, text.text));
            } else if (m.control instanceof RibbonGallery) {
                // Its grid opens at once, as a menu does (buttonHint).
                const gallery = m.control;
                hints.push({ part: gallery.opener.faceComponent, keys, text: text.text, press: () => gallery.toggle() });
            } else if (m.type === 'content') {
                // The app's content: its letters stand on it, and typing them gives focus to its first field. With no
                // text, its hint names it.
                const content = m.control;
                if (hasFocusableIn(content)) hints.push({ part: content, keys, text: text.text || String(fieldOf(command, 'hint', this) ?? ''), press: () => focusFirstIn(content) });
            } else if (m.made) {
                for (const inner of m.made.values()) add(inner);
            }
        };
        for (const m of group.made.values()) add(m);
        if (group.more) hints.push(buttonHint(group.more, '', group.look?.text ?? ''));
        return hints;
    }

    // The button before the tabs.
    drawApp(): void {
        const parsed = parseAccessKey(this.peekProperty<string>('appButton') ?? '');
        renderAccessKey(this.appCaption, parsed);
        const key = parsed.key ? accessKeyToken(parsed.key) : null;
        setAccessKeyAttribute(this.app, this.appKey, key);
        this.appKey = key;
        kept(this.app, parsed.text !== '');
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
        kept(this.quickTop, false);
        kept(this.quickBelow, false);
        if (!host) return;
        put(host, 'aria-label', uiLocale.strings.ribbonMenuQuick);
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
                kept(host, wanted.some(w => w.visible));
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
        const shownLooks = ordered(raw.filter(look => look.fixed || !hidden.has(`${tab}/${look.key}`)), this.custom.order?.[tab], look => look.key);
        // A group the user hid is kept out of sight, after the others, for when it is shown again.
        return [...shownLooks, ...raw.filter(look => !shownLooks.includes(look)).map(look => ({ ...look, visible: false, hiddenByUser: true }))];
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

    // The menu of the right button: the menu's own commands when customizable, and the app's, from onCustomMenuOpening.
    customMenuOpening(e: ContextMenuOpeningEventArgs): void {
        // The app's own content keeps its own menu.
        if (this.fromContent(e.event)) {
            e.cancel = true;
            return;
        }
        const { item, path } = this.customTarget(e.event);
        const args: RibbonMenuCustomMenuOpeningEventArgs = {
            item,
            path,
            items: this.peekProperty('customizable') === false ? [] : this.menuCommands(e.event),
            cancel: false,
            byKeyboard: e.byKeyboard,
            event: e.event,
            source: this
        };
        this.customMenuOpened.fire(args);
        e.items = args.items;
        e.cancel = args.cancel;
    }

    // What the pointer or the focus is on: a tab, a group or a command, with its path.
    customTarget(e: Event): { item: RibbonTab | RibbonGroup | RibbonCommand | null; path: string | null } {
        const hit = this.hitOf(e);
        if (hit?.quick) return { item: hit.path ? this.findCommand(hit.path) : null, path: hit.path };
        if (hit) {
            const groupPath = `${this.tabKeyOf(hit.panel.tab)}/${hit.group.look?.key ?? ''}`;
            if (hit.made) return { item: hit.made.want.command, path: `${groupPath}/${hit.made.want.key}` };
            return { item: this.findGroup(groupPath), path: groupPath };
        }
        const tab = this.entries[this.indexOfTab(e)];
        return tab ? { item: tab.tab, path: tab.key } : { item: null, path: null };
    }

    // The menu's own commands: what can be done with the command or the group under the pointer, and how it is shown.
    menuCommands(e: Event): MenuItem[] {
        const s = uiLocale.strings;
        const items: MenuItem[] = [];
        const hit = this.hitOf(e);
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
                const looks = [...panel.groups.values()].map(g => g.look).filter(l => !l?.hiddenByUser);
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
        return [...items, ...general];
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

    // What the event started in: a command of a group (or of a row in it), a group, or a quick command.
    hitOf(e: Event): { panel: Panel; group: GroupPart; made: Made | null; quick?: false; path?: undefined } | { quick: true; path: string | null } | null {
        if (this.quickHost?.motif.isEventFrom(e)) {
            for (const [command, m] of this.quickMade) {
                if (!m.control.motif.isEventFrom(e)) continue;
                const path = (this.custom.quick ?? []).find(p => this.resolve(p)?.command === command) ?? null;
                return { quick: true, path };
            }
            return null;
        }
        const panel = this.shownPanel();
        if (!panel) return null;
        for (const group of panel.groups.values()) {
            if (!group.host.motif.isEventFrom(e) && !group.popup?.motif.isEventFrom(e)) continue;
            for (const m of group.made.values()) if (m.control.motif.isEventFrom(e) && m.type !== 'row') return { panel, group, made: m };
            return { panel, group, made: null };
        }
        return null;
    }

    // Whether an event started in the app's own content among the commands: it keeps its keys and its menu.
    fromContent(e: Event): boolean {
        const within = (made: Map<RibbonCommand, Made>): boolean => {
            for (const m of made.values()) {
                if (m.type === 'content' && m.control.motif.isEventFrom(e)) return true;
                if (m.made && within(m.made)) return true;
            }
            return false;
        };
        if (within(this.quickMade)) return true;
        for (const panel of this.panels.values()) for (const group of panel.groups.values()) if (within(group.made)) return true;
        return false;
    }

    // Keys in the commands: each group is a Tab stop, the arrows move between the commands, Escape goes to the tabs.

    // The parts Tab and the arrows reach in a group, in their order: those of its commands (not the app's content), the
    // button beside its name, and the button it folds into. While a folded group's popup is open, its commands are
    // in the popup, not among these.
    groupStops(group: GroupPart): ComponentBase[] {
        const stops: ComponentBase[] = [];
        if (group.inner.parent !== group.popup) {
            this.madeStops(group.made, stops);
            if (group.more) partStops(group.more, stops);
        }
        if (group.fold) partStops(group.fold, stops);
        return stops;
    }

    madeStops(made: Map<RibbonCommand, Made>, stops: ComponentBase[]): void {
        for (const m of made.values()) {
            if (m.made) this.madeStops(m.made, stops);
            else if (m.type !== 'content') partStops(m.control, stops);
        }
    }

    // The stops of the groups of a panel, then the "more" button of the simplified row.
    panelStops(panel: Panel): ComponentBase[] {
        const stops: ComponentBase[] = [];
        for (const group of panel.groups.values()) stops.push(...this.groupStops(group));
        if (panel.overflow) partStops(panel.overflow, stops);
        return stops;
    }

    // The stop Tab reaches in a group: `current` takes 0, the others -1.
    drawStops(stops: ComponentBase[], current: ComponentBase | null): void {
        for (const stop of stops) put(stop, 'tabindex', stop === current ? '0' : '-1');
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
                const stops = this.groupStops(group);
                const current = group.current && stops.includes(group.current) ? group.current : (stops[0] ?? null);
                group.current = current;
                this.drawStops(stops, current);
            }
        }
    }

    // The group of the shown panel an event started in.
    groupOf(e: Event): GroupPart | null {
        const panel = this.shownPanel();
        if (!panel) return null;
        for (const group of panel.groups.values()) if (group.host.motif.isEventFrom(e)) return group;
        return null;
    }

    focusCommands(): void {
        const panel = this.shownPanel();
        if (!panel) return;
        this.drawRoving();
        for (const group of panel.groups.values()) {
            if (group.look?.visible === false || !group.current) continue;
            focusOn(group.current);
            return;
        }
    }

    commandFocused(e: FocusEvent): void {
        const group = this.groupOf(e);
        if (!group) return;
        const stops = this.groupStops(group);
        const stop = stops.find(s => s.motif.isEventFrom(e));
        if (!stop) return;
        group.current = stop;
        this.drawStops(stops, stop);
    }

    commandKeyDown(e: KeyboardEvent): void {
        // The app's content keeps its keys. A popup among the commands closes on Escape itself, and its other keys
        // reach no stop.
        if (e.defaultPrevented || e.isComposing || this.fromContent(e)) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            this.focus();
            return;
        }
        const panel = this.shownPanel();
        if (!panel) return;
        const stops = this.panelStops(panel);
        const at = stops.findIndex(s => s.motif.isEventFrom(e));
        if (at < 0) return;
        const rtl = isRtl(this);
        let to = -1;
        if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') || e.key === 'ArrowDown') to = (at + 1) % stops.length;
        else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') || e.key === 'ArrowUp') to = (at - 1 + stops.length) % stops.length;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = stops.length - 1;
        if (to < 0) return;
        e.preventDefault();
        focusOn(stops[to]);
    }
}

// The parts of `part` that can take focus now, in their order, what opens over the page (a popup) left out.
function partStops(part: ComponentBase, stops: ComponentBase[]): void {
    if (part instanceof Popup) return;
    if (canTakeFocus(part)) stops.push(part);
    for (const child of part.controls.items) partStops(child, stops);
}

// A key hint on a button: its letters stand on the part that is pressed (its main part when it has a menu), and
// typing them clicks that part. A menu opens or closes at once, before the hints close a popup the button is in.
function buttonHint(button: Button, keys: string, text: string): KeyHint {
    const face = button.faceComponent;
    const press = () => {
        if (!button.hasMenu || button.split) face.attr.add({ click: true });
        else if (button.opened) button.close();
        else button.open();
    };
    return { part: face, keys, text, press };
}

// The items in the order the user gave, the ones not in it after them, as given.

function copyOf(c: RibbonMenuCustomization): RibbonMenuCustomization {
    const out: RibbonMenuCustomization = { ...c };
    if (c.hidden) out.hidden = [...c.hidden];
    if (c.quick) out.quick = [...c.quick];
    if (c.order) out.order = Object.fromEntries(Object.entries(c.order).map(([k, v]) => [k, [...v]]));
    return out;
}
