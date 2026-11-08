import { Emitter, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { accessKeyToken, parseAccessKey, renderAccessKey, setAccessKeyAttribute, type ParsedAccessKey } from '../../core/access-key';
import { shown } from '../../core/draw-parts';
import { Control } from '../../core/control';
import { follow } from '../../core/follow';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { addShortcut, installKeyboard } from '../../core/keyboard';
import { isNode } from '../../core/node-kind';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../parts/popup/Popup';
import { ItemTree } from '../../parts/item-tree/ItemTree';
import { Customizer } from '../../parts/customizer/Customizer';
import type { CustomizerNode } from '../../parts/customizer/customizer-node';
import type { CustomizerSource } from '../../parts/customizer/customizer-source';
import { MenuLayout } from './MenuLayout';
import { mergedFrom, mergedLevel, mergedOf } from './menu-merge';
import { mergeHosts } from './merge-hosts';
import type { MergedItem } from './merged-item';
import type { MenuBarMergeWhen } from './menu-bar-merge-when';
import type { MenuBarMergedEventArgs } from './menu-bar-merged-event-args';
import type { MenuNode } from './menu-node';
import { ContextMenu } from '../contextmenu/ContextMenu';
import type { ContextMenuOpeningEventArgs } from '../contextmenu/context-menu-opening-event-args';
import { fillTemplate } from '../../core/fill-template';
import { uiLocale } from '../../core/ui-locale';
import type { MenuBarCustomization } from './menu-bar-customization';
import type { MenuBarCustomizedEventArgs } from './menu-bar-customized-event-args';
import type { MenuBarCustomMenuOpeningEventArgs } from './menu-bar-custom-menu-opening-event-args';
import type { MenuBarItemsChangedEventArgs } from './menu-bar-items-changed-event-args';
import type { MenuBarProps } from './menu-bar-props';
import { foldText } from '../../core/fold-text';
import { fieldOf, namesCommands, runItem } from '../../core/command-fields';
import { commands } from '../../core/command-registry';
import { shortcuts } from '../../core/shortcut-registry';

const OWN = ['items', 'focusOnF10', 'openOnHover', 'customizable', 'customization', 'commands', 'customizer', 'customizerKeyboard', 'mergeHost', 'mergeName', 'mergeInto', 'mergeWhen', 'mergeScope', 'hideWhenMerged'] as const;

let barCount = 0;

/** A top item's fields as read for one drawing. */
interface ItemLook {
  item: MenuItem;
  node: MenuNode;
  /** While bars are merged: the item as merged, with the bar it comes from. */
  merged: MergedItem | null;
  /** Its key, else its position in the items. */
  key: string;
  visible: boolean;
  text: string;
  hint: string | undefined;
  enabled: boolean;
  submenu: boolean;
}

interface Entry {
  item: MenuItem;
  node: MenuNode;
  merged: MergedItem | null;
  key: string;
  element: HTMLButtonElement;
  enabled: boolean;
  submenu: boolean;
  /** The label, lower case, for typing to an item. */
  text: string;
}

interface Parts {
  bar: HTMLDivElement;
  entries: Entry[];
  releases: (() => void)[];
  /** The key of the item Tab reaches. */
  current: string | null;
  open: Entry | null;
  popup: Popup | null;
  list: MenuList | null;
  stopDrawing: (() => void) | null;
  removeF10: (() => void) | null;
  itemClick: Emitter<MenuItemClickEventArgs>;
  itemsChanged: Emitter<MenuBarItemsChangedEventArgs>;
  tree: ItemTree<MenuItem>;
  /** What the user changed. */
  custom: MenuBarCustomization;
  /** The menu of the right button on the bar, and the one in the open menu (inside it, so that it stays open). */
  barMenu: ContextMenu | null;
  listMenu: ContextMenu | null;
  /** The items as the user arranged them. */
  layout: MenuLayout;
  customizer: Customizer | null;
  /** Names the bar's items in a main bar. */
  mergeKey: string;
  /** As a main bar: the bars merged into it, in the order they came. */
  merged: MenuBar[];
  /** As a bar that merges: its main bar while merged. */
  mergedHost: MenuBar | null;
  /** The name it is the main bar of. */
  hostName: string | null;
  stopWatch: (() => void) | null;
  mergedEvent: Emitter<MenuBarMergedEventArgs>;
  unmergedEvent: Emitter<MenuBarMergedEventArgs>;
  customized: Emitter<MenuBarCustomizedEventArgs>;
  customMenuOpening: Emitter<MenuBarCustomMenuOpeningEventArgs>;
}

const PARTS = Symbol('mx.menubar');

/**
 * A bar of menus (`role="menubar"`), as at the top of an application: File, Edit, View. Left and Right
 * move along the bar and, while a menu is open, open the next one. Down, Enter and Space open a
 * menu, Escape closes it and returns to the bar, and a letter moves to the item that starts with it. `&File`
 * makes Alt+F open File. Menus contain submenus, check and radio items and shortcuts (`MenuItem`).
 *
 * @example
 * <MenuBar label="Main" items={[{ text: '&File', items: [{ text: '&New', shortcut: 'Ctrl+N', click: () => this.create() }] }]} />
 *
 * const bar = new MenuBar({ items: this.menus, focusOnF10: true });
 * bar.onItemClick((e) => console.log(e.item.text));
 */
export class MenuBar extends Control<HTMLDivElement, MenuBarProps> {
  /** The items made for the app's commands in the customizer, kept by key. */
  private registryItems: Map<string, MenuItem> | undefined;

  constructor(props?: IBaseProp<MenuBarProps>) {
    super(props);
    const own = (this.props ?? {}) as MenuBarProps;
    const parts = this.parts;
    this.observeProperty<string>('text', (text) => {
      const label = parseAccessKey(text ?? '').text;
      if (label) parts.bar.setAttribute('aria-label', label);
      else parts.bar.removeAttribute('aria-label');
    });
    this.observeProperty('items', () => this.followItems());
    this.observeProperty('customization', () => this.takeCustomization());
    this.observeProperty('mergeHost', () => this.registerHost());
    this.observeProperty('mergeName', () => this.registerHost());
    this.observeProperty('mergeInto', () => this.watchMerge());
    this.observeProperty('mergeWhen', () => this.watchMerge());
    this.observeProperty('mergeScope', () => this.watchMerge());
    this.observeProperty<boolean>('focusOnF10', (on) => this.renderF10(!!on));
    this.observeProperty<boolean>('openOnHover', (on) => {
      if (parts.list) parts.list.openOnHover = on !== false;
    });
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onItemClick) this.onItemClick(own.onItemClick);
    if (own.onItemsChanged) this.onItemsChanged(own.onItemsChanged);
    if (own.onCustomized) this.onCustomized(own.onCustomized);
    if (own.onCustomMenuOpening) this.onCustomMenuOpening(own.onCustomMenuOpening);
    if (own.onMerged) this.onMerged(own.onMerged);
    if (own.onUnmerged) this.onUnmerged(own.onUnmerged);
    // Items that name commands take their texts and states from them: drawn again when the commands change.
    const listening = commands.onChanged(() => {
      if (namesCommands(givenList(this.peekProperty<readonly MenuItem[]>('items')))) this.followItems();
    });
    const barMenu = new ContextMenu();
    barMenu.onOpening((e) => this.customMenuOpening(e, false));
    this.controls.add(barMenu);
    parts.barMenu = barMenu;
    this.listen();
    this.motif.setDisposable(() => {
      parts.stopDrawing?.();
      parts.removeF10?.();
      for (const release of parts.releases.splice(0)) release();
      parts.itemClick.dispose();
      parts.itemsChanged.dispose();
      parts.customized.dispose();
      parts.customMenuOpening.dispose();
      listening.dispose();
      parts.stopWatch?.();
      this.unmerge();
      if (parts.hostName !== null) mergeHosts.remove(parts.hostName, this);
      for (const bar of [...parts.merged]) bar.release();
      parts.mergedEvent.dispose();
      parts.unmergedEvent.dispose();
    });
  }

  // Properties (see MenuBarProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get items(): readonly MenuItem[] {
    return this.getProperty<readonly MenuItem[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly MenuItem[]>) {
    this.assignProperty('items', value);
  }
  get focusOnF10(): boolean {
    return !!this.getProperty<boolean>('focusOnF10');
  }
  set focusOnF10(value: Bind<boolean>) {
    this.assignProperty('focusOnF10', value, Boolean);
  }
  get openOnHover(): boolean {
    return this.getProperty<boolean | undefined>('openOnHover') !== false;
  }
  set openOnHover(value: Bind<boolean>) {
    this.assignProperty('openOnHover', value, Boolean);
  }

  get customizable(): boolean {
    return !!this.getProperty<boolean>('customizable');
  }
  set customizable(value: Bind<boolean>) {
    this.assignProperty('customizable', value, Boolean);
  }
  /** What the user changed so far: a copy, to save. Give it back to restore the bar as the user left it. */
  get customization(): MenuBarCustomization {
    return copyOf(this.parts.custom);
  }
  set customization(value: Bind<MenuBarCustomization | null>) {
    this.assignProperty('customization', value);
  }
  get commands(): readonly MenuItem[] {
    return this.getProperty<readonly MenuItem[] | undefined>('commands') ?? [];
  }
  set commands(value: Bind<readonly MenuItem[]>) {
    this.assignProperty('commands', value);
  }
  get customizerKeyboard(): boolean {
    return this.getProperty<boolean | undefined>('customizerKeyboard') !== false;
  }
  set customizerKeyboard(value: Bind<boolean>) {
    this.assignProperty('customizerKeyboard', value, Boolean);
  }
  get customizer(): boolean {
    return this.getProperty<boolean | undefined>('customizer') !== false;
  }
  set customizer(value: Bind<boolean>) {
    this.assignProperty('customizer', value, Boolean);
  }

  get mergeHost(): boolean {
    return !!this.getProperty<boolean>('mergeHost');
  }
  set mergeHost(value: Bind<boolean>) {
    this.assignProperty('mergeHost', value, Boolean);
  }
  get mergeName(): string {
    return this.getProperty<string | undefined>('mergeName') || 'main';
  }
  set mergeName(value: Bind<string>) {
    this.assignProperty('mergeName', value);
  }
  get mergeInto(): string | MenuBar | null {
    return this.getProperty<string | MenuBar | null | undefined>('mergeInto') ?? null;
  }
  set mergeInto(value: Bind<string | MenuBar | null>) {
    this.assignProperty('mergeInto', value);
  }
  get mergeWhen(): MenuBarMergeWhen {
    return this.getProperty<MenuBarMergeWhen | undefined>('mergeWhen') ?? 'shown';
  }
  set mergeWhen(value: Bind<MenuBarMergeWhen>) {
    this.assignProperty('mergeWhen', value);
  }
  get mergeScope(): HTMLElement | ComponentBase | null {
    return this.getProperty<HTMLElement | ComponentBase | null | undefined>('mergeScope') ?? null;
  }
  set mergeScope(value: Bind<HTMLElement | ComponentBase | null>) {
    this.assignProperty('mergeScope', value);
  }
  get hideWhenMerged(): boolean {
    return this.getProperty<boolean | undefined>('hideWhenMerged') !== false;
  }
  set hideWhenMerged(value: Bind<boolean>) {
    this.assignProperty('hideWhenMerged', value, Boolean);
  }
  /** As a main bar: the bars merged into it, in the order they came. */
  get mergedBars(): readonly MenuBar[] {
    return [...this.parts.merged];
  }
  /** As a bar that merges: the main bar it is merged into, or `null`. */
  get mergedInto(): MenuBar | null {
    return this.parts.mergedHost;
  }
  /** The top items as drawn now, the merged bars' included. */
  get mergedItems(): readonly MenuItem[] {
    return untracked(() => (this.parts.merged.length ? this.mergedTop().map((m) => m.drawn) : this.parts.layout.childrenOf(null).filter((n) => !n.hidden).map((n) => n.drawn)));
  }

  /** The top-level item whose menu is open, or `null` if there is none. Reactive. */
  get openItem(): MenuItem | null {
    return this.getProperty<MenuItem | null | undefined>('openItem') ?? null;
  }

  /**
   * Occurs when an item is selected (a top-level item without a menu, or an item in a menu), after the item's own
   * `click`.
   */
  get onItemClick(): MotifEvent<MenuItemClickEventArgs> {
    return this.parts.itemClick.event;
  }

  /** On the main bar: occurs when a bar merged into it. */
  get onMerged(): MotifEvent<MenuBarMergedEventArgs> {
    return this.parts.mergedEvent.event;
  }

  /** On the main bar: occurs when a bar left it. */
  get onUnmerged(): MotifEvent<MenuBarMergedEventArgs> {
    return this.parts.unmergedEvent.event;
  }

  /** Occurs when the user changed the bar, with everything changed so far. */
  get onCustomized(): MotifEvent<MenuBarCustomizedEventArgs> {
    return this.parts.customized.event;
  }

  /** Occurs before the menu of the right button opens: add commands of your own or leave some out. */
  get onCustomMenuOpening(): MotifEvent<MenuBarCustomMenuOpeningEventArgs> {
    return this.parts.customMenuOpening.event;
  }

  /** Occurs after a change by path, with the new list of items to keep. */
  get onItemsChanged(): MotifEvent<MenuBarItemsChangedEventArgs> {
    return this.parts.itemsChanged.event;
  }

  /**
   * Opens the menu of a top-level item: the item itself, its index among the items shown, or its key. Focus goes to its
   * first item. Returns `false` if it has none or cannot be used.
   */
  open(item: MenuItem | number | string): boolean {
    const parts = this.parts;
    const entry =
      typeof item === 'number' ? parts.entries[item] : typeof item === 'string' ? parts.entries.find((e) => e.key === item) : parts.entries.find((e) => e.item === item);
    if (!entry?.submenu || !entry.enabled || !this.isEnabled) return false;
    this.openMenu(entry, 'first');
    return true;
  }

  close(): void {
    this.parts.popup?.close('code');
  }

  /**
   * Re-reads the items after they have been changed in place, and updates the bar, the open menu and its submenus.
   * Your items can be plain or reactive, and the bar reads them as they are.
   */
  refresh(): void {
    this.followItems();
    if (this.parts.popup?.isOpen) this.parts.list?.refresh();
  }

  // Changes by path: `file/recent/clear`, each part a key or a position. The items given are never changed: a new list
  // is made, the items along the changed path new objects and the others the ones given, and it becomes `items`;
  // `onItemsChanged` reports it.

  /** The item at `path`, as it is now; `null` when there is none. */
  findItem(path: string): MenuItem | null {
    return this.parts.tree.find(path) as MenuItem | null;
  }

  /** Adds an item to the menu at `parentPath` (the bar when empty) at `index`, the end by default. */
  addItem(parentPath: string, item: MenuItem, index?: number): boolean {
    return this.parts.tree.add(parentPath, item, index);
  }

  /** Removes the item at `path`, with its menu. */
  removeItem(path: string): boolean {
    return this.parts.tree.remove(path);
  }

  /** Moves the item at `path` to `index` in its menu, or in the menu at `toParent` (the bar when empty). */
  moveItem(path: string, index: number, toParent?: string): boolean {
    return this.parts.tree.move(path, index, toParent);
  }

  /** Changes fields of the item at `path`; the others stay as they are. */
  updateItem(path: string, changes: Partial<MenuItem>): boolean {
    return this.parts.tree.update(path, changes);
  }

  /**
   * Opens the customizer: every item of the bar in a tree, to show and hide, move, rename, and add commands of
   * `commands` and menus of the user's own. Returns `false` when it is already open.
   */
  openCustomizer(): boolean {
    const parts = this.parts;
    if (parts.customizer) return false;
    const s = uiLocale.strings;
    // The keyboard page lists the shortcuts the user can change; with none, it is left out.
    const keyboard = this.peekProperty('customizerKeyboard') !== false && shortcuts.list().some(s => s.customizable);
    const customizer = new Customizer(this.customizerSource(), { group: s.menuBarMenu, groups: s.menuBarMenus, top: s.menuBarTop }, keyboard);
    customizer.onClosed(() => (parts.customizer = null));
    parts.customizer = customizer;
    customizer.open(parts.mergedHost ?? this);
    return true;
  }

  /**
   * Merges the bar into its main bar (`mergeInto`): its items are shown there by their `merge` and `mergeAt`, and the
   * bar is hidden (`hideWhenMerged`). With the main bar not there yet, it merges when the main bar comes. `mergeWhen`
   * calls it by itself, except `'manual'`.
   */
  merge(): boolean {
    const parts = this.parts;
    if (parts.mergedHost) return true;
    const host = this.hostToMerge();
    if (!host) {
      if (this.peekProperty('mergeInto')) mergeHosts.wait(this);
      return false;
    }
    mergeHosts.stopWaiting(this);
    this.close();
    parts.mergedHost = host;
    host.parts.merged.push(this);
    if (this.peekProperty('hideWhenMerged') !== false) shown(this.element as HTMLElement, false);
    host.followItems();
    host.parts.mergedEvent.fire({ bar: this, source: host });
    return true;
  }

  /** Takes the bar's items back from its main bar, and shows the bar again. */
  unmerge(): boolean {
    mergeHosts.stopWaiting(this);
    return this.leave();
  }

  /** Leaves the main bar that is going away or stops being one; the bar merges again when a main bar comes. */
  release(): void {
    if (this.leave() && !this.isDisposed) mergeHosts.wait(this);
  }

  private leave(): boolean {
    const parts = this.parts;
    const host = parts.mergedHost;
    if (!host) return false;
    parts.mergedHost = null;
    host.parts.merged = host.parts.merged.filter((bar) => bar !== this);
    if (!this.isDisposed) shown(this.element as HTMLElement, true);
    if (!host.isDisposed) {
      host.followItems();
      host.parts.unmergedEvent.fire({ bar: this, source: host });
    }
    return true;
  }

  override onMounted(): void {
    this.watchMerge();
  }

  private hostToMerge(): MenuBar | null {
    const into = this.peekProperty<string | MenuBar | null>('mergeInto');
    const host = into instanceof MenuBar ? into : typeof into === 'string' && into ? mergeHosts.get(into) : null;
    return host && host !== this && !host.isDisposed && host.peekProperty('mergeHost') === true ? host : null;
  }

  private registerHost(): void {
    const parts = this.parts;
    if (parts.hostName !== null) mergeHosts.remove(parts.hostName, this);
    parts.hostName = null;
    if (this.peekProperty('mergeHost') !== true) {
      for (const bar of [...parts.merged]) bar.release();
      return;
    }
    parts.hostName = this.peekProperty<string>('mergeName') || 'main';
    mergeHosts.add(parts.hostName, this);
  }

  /** Follows what `mergeWhen` merges on: the bar's place shown, or focus in it. */
  private watchMerge(): void {
    const parts = this.parts;
    parts.stopWatch?.();
    parts.stopWatch = null;
    if (!this.peekProperty('mergeInto')) {
      this.unmerge();
      return;
    }
    const when = this.peekProperty<MenuBarMergeWhen>('mergeWhen') ?? 'shown';
    if (when === 'manual') return;
    const given = this.peekProperty<HTMLElement | ComponentBase | null>('mergeScope');
    const scope = given ? (given instanceof HTMLElement ? given : (given.element as HTMLElement)) : this.element.parentElement;
    // Not in the page yet: onMounted watches.
    if (!scope) return;
    const stops: (() => void)[] = [];
    parts.stopWatch = () => {
      for (const stop of stops.splice(0)) stop();
    };
    // The window the place is in may be another one, and may close: the bar leaves its main bar then.
    let view: Window | null = null;
    const leave = () => untracked(() => this.unmerge());
    const followWindow = () => {
      const now = scope.ownerDocument.defaultView;
      if (now === view) return;
      view?.removeEventListener('pagehide', leave);
      view = now;
      view?.addEventListener('pagehide', leave);
    };
    stops.push(() => view?.removeEventListener('pagehide', leave));
    followWindow();
    if (when === 'shown') {
      // Its place, not the bar: the bar itself is hidden while merged.
      const check = () =>
        untracked(() => {
          followWindow();
          const open = scope.isConnected && !view?.closed && scope.getClientRects().length > 0;
          if (open) this.merge();
          else this.unmerge();
        });
      if (typeof ResizeObserver === 'function') {
        const observer = new ResizeObserver(check);
        observer.observe(scope);
        stops.push(() => observer.disconnect());
      }
      check();
      return;
    }
    // Focus in its place merges; focus elsewhere leaves, except in the main bar, its menus and its windows. The place
    // and the main bar may be in different windows: each one's document is listened to.
    const docs = new Set<Document>();
    const onFocus = (e: FocusEvent) =>
      untracked(() => {
        const target = e.target as Node;
        if (scope.contains(target) || parts.mergedHost?.element.contains(target)) return;
        this.unmerge();
      });
    const listen = (doc: Document | undefined) => {
      if (!doc || docs.has(doc)) return;
      docs.add(doc);
      doc.addEventListener('focusin', onFocus);
      stops.push(() => doc.removeEventListener('focusin', onFocus));
    };
    const onPlaceFocus = () =>
      untracked(() => {
        followWindow();
        this.merge();
        listen(scope.ownerDocument);
        listen(parts.mergedHost?.element.ownerDocument);
      });
    scope.addEventListener('focusin', onPlaceFocus);
    stops.push(() => scope.removeEventListener('focusin', onPlaceFocus));
    if (scope.contains(scope.ownerDocument.activeElement)) onPlaceFocus();
    else untracked(() => this.unmerge());
  }

  /** Holds the changes by path until `endUpdate()`, which applies them at once. */
  beginUpdate(): void {
    this.parts.tree.beginUpdate();
  }

  endUpdate(): void {
    this.parts.tree.endUpdate();
  }

  /** The top item Tab reaches. */
  protected override get focusElement(): HTMLElement {
    return this.stop()?.element ?? this.parts.bar;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'tabStop') {
      this.renderRoving();
      return;
    }
    super.applyProperty(name, value);
    if (name === 'enabled' && value === false) this.close();
  }

  // Drawing the bar.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.element.classList.add('mx-menubar');
    const bar = document.createElement('div');
    bar.className = 'mx-menubar__bar';
    bar.setAttribute('role', 'menubar');
    this.element.prepend(bar);
    return {
      bar,
      entries: [],
      releases: [],
      current: null,
      open: null,
      popup: null,
      list: null,
      stopDrawing: null,
      removeF10: null,
      itemClick: new Emitter(),
      itemsChanged: new Emitter(),
      custom: {},
      barMenu: null,
      listMenu: null,
      layout: new MenuLayout(
        () => givenList(this.peekProperty<readonly MenuItem[]>('items')),
        () => this.catalog(),
        () => this.parts.custom,
      ),
      customizer: null,
      mergeKey: `bar${++barCount}`,
      merged: [],
      mergedHost: null,
      hostName: null,
      stopWatch: null,
      mergedEvent: new Emitter(),
      unmergedEvent: new Emitter(),
      customized: new Emitter(),
      customMenuOpening: new Emitter(),
      tree: new ItemTree<MenuItem>(() => 'items', () => givenList(this.peekProperty<readonly MenuItem[]>('items')), (next) => this.applyItems(next)),
    };
  }

  private applyItems(next: MenuItem[]): void {
    this.changeProperty('items', next);
    this.parts.itemsChanged.fire({ items: next, source: this });
  }

  /** Draws the items again whenever a function in one of them reads something that changes, or on `reState()`. */
  private followItems(): void {
    const parts = this.parts;
    parts.stopDrawing?.();
    const items = this.peekProperty<readonly MenuItem[]>('items') ?? [];
    // The items' own functions are tracked; the list and the fields are not.
    parts.stopDrawing = follow(this, 'items', () => {
      const layout = parts.layout;
      void givenList(items);
      if (parts.merged.length) return this.mergedTop().map((m) => this.lookOf(m.node, m.drawn, m.children().map((c) => c.drawn), m.key, m));
      return layout.childrenOf(null).filter((node) => !node.hidden).map((node) => {
        const children = layout.untouched ? givenList(givenField<readonly MenuItem[] | undefined>(node.drawn, 'items')) : node.children().filter((n) => !n.hidden).map((n) => n.drawn);
        return this.lookOf(node, node.drawn, children, node.key, null);
      });
    }, (looks) => this.draw(looks));
    // A main bar draws this bar's items too.
    parts.mergedHost?.followItems();
  }

  private lookOf(node: MenuNode, item: MenuItem, children: readonly MenuItem[], key: string, merged: MergedItem | null): ItemLook {
    return {
      item: node.item,
      node,
      merged,
      key,
      visible: fieldOf(item, 'visible', this.element) !== false,
      text: fieldOf<string | undefined>(item, 'text', this.element) ?? '',
      hint: fieldOf<string | undefined>(item, 'hint', this.element),
      enabled: fieldOf(item, 'enabled', this.element) !== false,
      submenu: children.some((child) => fieldOf(child, 'visible', this.element) !== false),
    };
  }

  /** The top items with the merged bars' items: the main bar's first, then each bar's by its rules. */
  private mergedTop(): MergedItem[] {
    const shownOf = (bar: MenuBar) => bar.parts.layout.childrenOf(null).filter((n) => !n.hidden);
    const own = shownOf(this).map((n) => mergedFrom(n, this));
    return mergedLevel(own, this.parts.merged.map((bar) => shownOf(bar).map((n) => mergedFrom(n, bar, `${bar.parts.mergeKey}/`))));
  }

  private draw(looks: readonly ItemLook[]): void {
    const parts = this.parts;
    const focused = parts.entries.findIndex((entry) => entry.element === document.activeElement);
    const openKey = parts.open?.key;
    for (const release of parts.releases.splice(0)) release();
    parts.bar.replaceChildren();
    parts.entries = [];
    // A merged bar's item takes another letter when the main bar's items already use its own.
    const used = new Set(looks.filter((l) => l.visible && (l.merged?.owner ?? this) === this).map((l) => parseAccessKey(l.text).key?.toLowerCase()));
    for (const look of looks) {
      if (!look.visible) continue;
      const parsed = (look.merged?.owner ?? this) === this ? parseAccessKey(look.text) : freeAccessKey(parseAccessKey(look.text), used);
      const element = document.createElement('button');
      element.type = 'button';
      element.tabIndex = -1;
      element.className = 'mx-menubar__item';
      element.setAttribute('role', 'menuitem');
      if (look.submenu) {
        element.setAttribute('aria-haspopup', 'menu');
        element.setAttribute('aria-expanded', 'false');
      }
      if (!look.enabled) element.setAttribute('aria-disabled', 'true');
      if (look.hint) element.title = look.hint;
      const source = fieldOf<IconSource | null | undefined>(look.merged?.drawn ?? look.node.drawn, 'icon', this.element);
      if (source) {
        const icon = element.appendChild(document.createElement('span'));
        icon.className = 'mx-menubar__icon';
        icon.setAttribute('aria-hidden', 'true');
        const shown = iconNode(source);
        icon.append(shown.node);
        parts.releases.push(shown.release);
      }
      const label = element.appendChild(document.createElement('span'));
      label.className = 'mx-menubar__label';
      renderAccessKey(label, parsed);
      if (parsed.key) {
        setAccessKeyAttribute(element, null, accessKeyToken(parsed.key));
        installKeyboard();
      }
      parts.bar.append(element);
      parts.entries.push({ item: look.item, node: look.node, merged: look.merged, key: look.key, element, enabled: look.enabled, submenu: look.submenu, text: foldText(parsed.text) });
    }
    this.renderRoving();
    if (focused >= 0) parts.entries[Math.min(focused, parts.entries.length - 1)]?.element.focus();
    if (openKey !== undefined) {
      const entry = parts.entries.find((e) => e.key === openKey);
      if (entry?.submenu && entry.enabled) this.openMenu(entry, null);
      else this.close();
    }
  }

  /** The item Tab reaches: the last one focused, else the first. */
  private stop(): Entry | undefined {
    const entries = this.parts.entries;
    return entries.find((e) => e.key === this.parts.current) ?? entries[0];
  }

  private renderRoving(): void {
    const stop = this.peekProperty('tabStop') === false ? undefined : this.stop();
    for (const entry of this.parts.entries) entry.element.tabIndex = entry === stop ? 0 : -1;
  }

  private renderF10(on: boolean): void {
    const parts = this.parts;
    if (on && !parts.removeF10) {
      // Page-wide on purpose: the key reaches the bar from wherever focus is.
      parts.removeF10 = addShortcut('F10', () => this.focus(), {
        name: 'menuBar.focus',
        text: () => uiLocale.strings.menuBarFocusKey,
        category: () => uiLocale.strings.shortcutsMenuBar,
      });
    } else if (!on && parts.removeF10) {
      parts.removeF10();
      parts.removeF10 = null;
    }
  }

  // The menus.

  private openMenu(entry: Entry, focus: 'first' | 'last' | 'list' | null): void {
    const parts = this.parts;
    const popup = (parts.popup ??= this.createPopup());
    const list = parts.list!;
    if (parts.open !== entry) {
      list.closeSubmenu();
      parts.open?.element.setAttribute('aria-expanded', 'false');
      const merged = entry.merged;
      list.setItems(merged ? () => merged.children().map((m) => m.drawn) : this.menuOf(entry.node));
    }
    parts.open = entry;
    parts.current = entry.key;
    this.renderRoving();
    popup.open(entry.element, { toggle: entry.element });
    entry.element.setAttribute('aria-expanded', 'true');
    this.setProperty('openItem', entry.item);
    if (focus === 'list') list.focusList();
    else if (focus) list.focusItem(focus);
  }

  private createPopup(): Popup {
    const parts = this.parts;
    const popup = new Popup();
    popup.placement = 'bottom-start';
    popup.matchWidth = false;
    const list = new MenuList();
    list.source = this;
    list.openOnHover = this.peekProperty('openOnHover') !== false;
    list.onChosen((e) => this.chosen(e));
    popup.controls.add(list);
    const listMenu = new ContextMenu();
    listMenu.onOpening((e) => this.customMenuOpening(e, true));
    popup.controls.add(listMenu);
    parts.listMenu = listMenu;
    this.controls.add(popup);
    popup.onClosed(() => {
      parts.open?.element.setAttribute('aria-expanded', 'false');
      parts.open = null;
      this.setProperty('openItem', null);
    });
    parts.list = list;
    return popup;
  }

  // The user's changes: applied while drawing (MenuLayout); the items given stay as they are.

  /** The items of the menu of `node`: as given while the user changed nothing, so that its functions stay followed. */
  /** The commands the user can add: `commands` when given, else those of the app (`commands` registry) with a text. */
  private catalog(): readonly MenuItem[] {
    const given = this.peekProperty<readonly MenuItem[] | undefined>('commands');
    if (given !== undefined) return givenList(given);
    const made = (this.registryItems ??= new Map());
    const out: MenuItem[] = [];
    for (const command of commands.list()) {
      if (out.some((item) => item.key === command.key) || !untracked(() => givenField(command, 'text'))) continue;
      let item = made.get(command.key);
      if (!item) made.set(command.key, (item = { key: command.key, command: command.key }));
      out.push(item);
    }
    return out;
  }

  private menuOf(node: MenuNode): Bind<readonly MenuItem[]> {
    if (this.parts.layout.untouched) return givenValue<Bind<readonly MenuItem[]> | undefined>(node.item, 'items') ?? [];
    return () => node.children().filter((n) => !n.hidden).map((n) => n.drawn);
  }

  private takeCustomization(): void {
    const given = this.peekProperty<MenuBarCustomization | null>('customization');
    this.parts.custom = given ? copyOf(given) : {};
    this.followItems();
    this.parts.customizer?.refresh();
  }

  private remember(custom: MenuBarCustomization): void {
    this.parts.custom = custom;
    this.followItems();
    this.parts.customized.fire({ customization: copyOf(custom), source: this });
  }

  private customMenuOpening(e: ContextMenuOpeningEventArgs, inMenu: boolean): void {
    const parts = this.parts;
    // The open menu has a menu of its own.
    if (!inMenu && parts.popup?.element.contains(e.target)) {
      e.cancel = true;
      return;
    }
    let node: MenuNode | null = null;
    // An item of a merged bar is that bar's: its menu, its changes.
    let owner: MenuBar = this;
    if (inMenu) {
      let item: MenuItem | null = null;
      for (let list = parts.list; list && !item; list = list.submenu) item = list.itemOf(e.target);
      const merged = item ? mergedOf.get(item) : undefined;
      if (merged && parts.merged.length) {
        node = merged.node;
        owner = merged.owner;
      } else {
        node = item ? parts.layout.nodeOf(item) : null;
      }
    } else {
      const entry = this.entryOf(e.target);
      node = entry?.node ?? null;
      owner = entry?.merged?.owner ?? this;
    }
    const args: MenuBarCustomMenuOpeningEventArgs = {
      item: node?.item ?? null,
      path: node?.path ?? null,
      items: owner.peekProperty('customizable') === true ? owner.customCommands(node) : [],
      cancel: false,
      byKeyboard: e.byKeyboard,
      event: e.event,
      source: owner,
    };
    owner.parts.customMenuOpening.fire(args);
    e.items = args.items;
    e.cancel = args.cancel;
  }

  private customCommands(node: MenuNode | null): MenuItem[] {
    const s = uiLocale.strings;
    const layout = this.parts.layout;
    const items: MenuItem[] = [];
    if (node && !node.fixed) {
      const name = parseAccessKey(String(fieldOf(node.drawn, 'text', this.element) ?? '')).text;
      const move = (step: 1 | -1) => () => this.changeByUser(layout.moved(node, step, false), node);
      items.push({ text: fillTemplate(s.menuBarHide, { name }), click: () => this.changeByUser(layout.shown(node, false), node) });
      if (node.parent) {
        items.push(
          { text: s.menuBarMoveUp, enabled: layout.canMove(node, -1, false), click: move(-1) },
          { text: s.menuBarMoveDown, enabled: layout.canMove(node, 1, false), click: move(1) },
        );
      } else {
        // Left is earlier in a left-to-right page, later in a right-to-left one.
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const left: 1 | -1 = rtl ? 1 : -1;
        items.push(
          { text: s.menuBarMoveLeft, enabled: layout.canMove(node, left, false), click: move(left) },
          { text: s.menuBarMoveRight, enabled: layout.canMove(node, -left as 1 | -1, false), click: move(-left as 1 | -1) },
        );
      }
    }
    const custom = this.parts.custom;
    const general: MenuItem[] = [];
    if (custom.hidden?.length) general.push({ text: s.menuBarShowHidden, click: () => this.changeByUser({ ...custom, hidden: [] }, node) });
    if (this.peekProperty('customizer') !== false) general.push({ text: s.menuBarCustomize, click: () => this.openCustomizer() });
    if (!layout.untouched) general.push({ text: s.menuBarReset, click: () => this.changeByUser({}, node) });
    if (items.length && general.length) general[0] = { ...general[0], beginGroup: true };
    return [...items, ...general];
  }

  /** Applies a change made from the menu, and puts focus back on its item, else on the first item of the open menu. */
  private changeByUser(custom: MenuBarCustomization | null, node: MenuNode | null): void {
    if (!custom) return;
    this.remember(custom);
    const layout = this.parts.layout;
    // Merged, the item is drawn in the main bar.
    const bar = this.parts.mergedHost ?? this;
    const parts = bar.parts;
    const mine = (item: MenuItem, id: string) => {
      const merged = parts.merged.length ? mergedOf.get(item) : undefined;
      return merged ? merged.owner === this && merged.node.id === id : layout.nodeOf(item)?.id === id;
    };
    const found = node ? layout.find(node.id) : null;
    if (found && !found.hidden) {
      if (!found.parent) {
        const entry = parts.entries.find((e) => e.node.id === found.id && (e.merged?.owner ?? bar) === this);
        if (entry) {
          entry.element.focus();
          return;
        }
      }
      for (let list = parts.list; list; list = list.submenu) {
        if (list.focusWhere((x) => mine(x, found.id))) return;
      }
    }
    if (parts.popup?.isOpen) parts.list?.focusItem('first');
    else bar.stop()?.element.focus();
  }

  /** The customizer's view of the bar: its tree, and each change applied as the user's. */
  private customizerSource(): CustomizerSource {
    const layout = this.parts.layout;
    const s = uiLocale.strings;
    const view = (n: MenuNode): CustomizerNode => ({
      id: n.id,
      parent: n.parent,
      text: parseAccessKey(String(fieldOf(n.drawn, 'text', this.element) ?? '')).text,
      shown: !n.hidden,
      fixed: n.fixed,
      holds: n.holds,
      added: n.added,
      children: n.holds ? n.children().map(view) : [],
    });
    const apply = (custom: MenuBarCustomization | null) => {
      if (!custom) return false;
      this.remember(custom);
      return true;
    };
    const find = (id: string) => (id ? layout.find(id) : null);
    return {
      nodes: () => untracked(() => layout.childrenOf(null).map(view)),
      commands: () =>
        untracked(() => layout.commands().map((cmd) => ({ key: String(givenValue(cmd, 'key')), text: parseAccessKey(String(fieldOf(cmd, 'text', this.element) ?? '')).text }))),
      targets: (id) =>
        untracked(() => {
          const node = find(id);
          if (!node) return [];
          const top: CustomizerNode = { id: '', parent: '', text: s.menuBarTop, shown: true, fixed: false, holds: true, added: false, children: [] };
          const menus = layout.all().filter((n) => n.holds && layout.canMoveInto(node, n)).map((n) => ({ ...view(n), children: [] }));
          return layout.canMoveInto(node, null) ? [top, ...menus] : menus;
        }),
      canMove: (id, step) => untracked(() => !!find(id) && layout.canMove(find(id)!, step, true)),
      show: (id, on) => untracked(() => apply(find(id) && layout.shown(find(id)!, on))),
      move: (id, step) => untracked(() => apply(find(id) && layout.moved(find(id)!, step, true))),
      moveInto: (id, target) => untracked(() => apply(find(id) && layout.movedInto(find(id)!, find(target)))),
      rename: (id, text) => untracked(() => apply(find(id) && layout.renamed(find(id)!, text))),
      remove: (id) => untracked(() => apply(find(id) && layout.removed(find(id)!))),
      add: (parent, after, what) =>
        untracked(() => {
          const added = layout.addedTo(find(parent), what, after ? find(after) : null);
          if (!added) return null;
          this.remember(added.custom);
          return added.id;
        }),
      reset: (id) => untracked(() => apply(id === null ? {} : find(id) && layout.reset(find(id)!))),
    };
  }

  private chosen(e: MenuItemClickEventArgs): void {
    this.close();
    // An item of a merged bar reports to that bar; a copy drawn with the user's name reports the item it was made from.
    const merged = this.parts.merged.length ? mergedOf.get(e.item) : undefined;
    const owner = merged?.owner ?? this;
    const node = merged?.node ?? owner.parts.layout.drawnNodes.get(e.item);
    const args = { ...e, item: node?.item ?? e.item, source: owner };
    runItem(args.item, args, owner, e.event, owner.element as Element);
    owner.parts.itemClick.fire(args);
  }

  // Pointer and keys.

  private entryOf(target: EventTarget | null): Entry | undefined {
    return isNode(target) ? this.parts.entries.find((e) => e.element.contains(target)) : undefined;
  }

  private listen(): void {
    const parts = this.parts;
    parts.bar.addEventListener('click', (e) => untracked(() => this.onClick(e)));
    parts.bar.addEventListener('focusin', (e) => {
      const entry = this.entryOf(e.target);
      if (!entry || parts.current === entry.key) return;
      parts.current = entry.key;
      this.renderRoving();
    });
    parts.bar.addEventListener('pointerover', (e) => {
      const entry = this.entryOf(e.target);
      if (!entry || !parts.open || parts.open === entry || this.peekProperty('openOnHover') === false) return;
      if (entry.submenu && entry.enabled) this.openMenu(entry, 'list');
      else {
        this.close();
        entry.element.focus();
      }
    });
    this.element.addEventListener('keydown', (e) => untracked(() => this.onKeyDown(e)));
  }

  private onClick(e: MouseEvent): void {
    const entry = this.entryOf(e.target);
    if (!entry?.enabled) return;
    if (entry.submenu) {
      if (this.parts.open === entry) this.close();
      // From the keyboard (Enter, Space, the access key) focus goes to the first item.
      else this.openMenu(entry, e.detail === 0 ? 'first' : 'list');
      return;
    }
    this.close();
    const owner = entry.merged?.owner ?? this;
    const args: MenuItemClickEventArgs = { item: entry.item, source: owner, event: e };
    runItem(entry.item, args, owner, e, owner.element as Element);
    owner.parts.itemClick.fire(args);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const parts = this.parts;
    const entries = parts.entries;
    const entry = this.entryOf(e.target);
    const inMenu = !entry && !!parts.open && !!parts.popup?.element.contains(e.target as Node);
    if ((!entry && !inMenu) || !entries.length) return;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const from = entry ?? parts.open!;
        const step = (e.key === 'ArrowRight') !== rtl ? 1 : -1;
        const next = entries[(entries.indexOf(from) + step + entries.length) % entries.length];
        if (inMenu && next.submenu && next.enabled) {
          this.openMenu(next, 'first');
        } else {
          this.close();
          next.element.focus();
        }
        break;
      }
      case 'ArrowDown':
      case 'ArrowUp':
        if (!entry?.submenu || !entry.enabled) return;
        this.openMenu(entry, e.key === 'ArrowUp' ? 'last' : 'first');
        break;
      case 'Home':
      case 'End':
        if (!entry) return;
        entries[e.key === 'Home' ? 0 : entries.length - 1].element.focus();
        break;
      default: {
        if (!entry || e.key.length !== 1 || e.key === ' ') return;
        const letter = foldText(e.key);
        const at = entries.indexOf(entry);
        for (let step = 1; step <= entries.length; step++) {
          const candidate = entries[(at + step) % entries.length];
          if (candidate.text.startsWith(letter)) {
            candidate.element.focus();
            break;
          }
        }
      }
    }
    e.preventDefault();
  }
}

function copyOf(c: MenuBarCustomization): MenuBarCustomization {
  const out: MenuBarCustomization = {};
  if (c.hidden?.length) out.hidden = [...c.hidden];
  if (c.order && Object.keys(c.order).length) out.order = Object.fromEntries(Object.entries(c.order).map(([k, v]) => [k, [...v]]));
  if (c.moves && Object.keys(c.moves).length) out.moves = { ...c.moves };
  if (c.texts && Object.keys(c.texts).length) out.texts = { ...c.texts };
  if (c.added?.length) out.added = c.added.map((a) => ({ ...a }));
  return out;
}

/** `parsed` with a letter of its text no other item uses, else with none. */
function freeAccessKey(parsed: ParsedAccessKey, used: Set<string | undefined>): ParsedAccessKey {
  if (!parsed.key) return parsed;
  const order = [parsed.index, ...Array.from(parsed.text, (_, i) => i).filter((i) => i !== parsed.index)];
  for (const i of order) {
    const ch = parsed.text[i];
    if (!/[\p{L}\p{N}]/u.test(ch) || used.has(ch.toLowerCase())) continue;
    used.add(ch.toLowerCase());
    return { text: parsed.text, key: ch, index: i };
  }
  return { text: parsed.text, key: null, index: -1 };
}
