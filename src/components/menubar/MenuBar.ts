import { Component, Emitter, reactive, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { accessKeyToken, parseAccessKey, renderAccessKey, setAccessKeyAttribute, type ParsedAccessKey } from '../../core/access-key';
import { loose, part, partBefore, removePart } from '../../core/draw-parts';
import { kept, put, shown } from '../../core/part-writes';
import { onDocument, onWindow } from '../../core/window-events';
import { windowOf } from '../../core/page-documents';
import { holderOf, isInPage, isRendered, isRtl, measure, onLayout } from '../../core/measure';
import { Control } from '../../core/control';
import { focusOn, holdsFocus, isFocused } from '../../core/focus';
import { follow } from '../../core/follow';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { addShortcut, installKeyboard } from '../../core/keyboard';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../parts/popup/Popup';
import { ItemTree } from '../../parts/item-tree/ItemTree';
import { Customizer } from '../../parts/customizer/Customizer';
import type { CustomizerNode } from '../../parts/customizer/customizer-node';
import type { CustomizerSource } from '../../parts/customizer/customizer-source';
import { ItemLayout } from '../../parts/item-layout/ItemLayout';
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
  /** The item's part, as a component. */
  part: Component<HTMLButtonElement>;
  enabled: boolean;
  submenu: boolean;
  /** The label, lower case, for typing to an item. */
  text: string;
}

/** A top item's part, built once and kept while an item of its key is shown: a change writes only what it changes. */
interface Slot {
  key: string;
  button: Component<HTMLButtonElement>;
  label: Component<HTMLSpanElement>;
  icon: ComponentBase | null;
  iconSource: IconSource | null;
  releaseIcon: (() => void) | null;
  /** The label as drawn (`index:text`), and the access key it declares. */
  drawnLabel: string | null;
  token: string | null;
  entry: Entry | null;
  /** The bar a merged item comes from, and whether the part waits hidden for that bar to merge again. */
  from: MenuBar | null;
  stashed: boolean;
}

interface Parts {
  barPart: Component<HTMLDivElement>;
  entries: Entry[];
  /**
   * The top items' parts by key, and the parts in order, the shown ones first and then those of merged bars that left,
   * kept hidden: the bar's list follows `drawn`.
   */
  slots: Map<string, Slot>;
  shownSlots: Slot[];
  drawn: { count: number };
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
  layout: ItemLayout<MenuItem, MenuBarCustomization>;
  customizer: Customizer | null;
  /** Names the bar's items in a main bar. */
  mergeKey: string;
  /** As a main bar: the bars merged into it, in the order they came. */
  merged: MenuBar[];
  /** As a bar that merges: its main bar while merged. */
  mergedHost: MenuBar | null;
  /** As a bar that merges: the main bar it merged into last, which keeps its items' parts while it is away. */
  stashedIn: MenuBar | null;
  /** The name it is the main bar of. */
  hostName: string | null;
  /** `mergeScope`, the component given. */
  scope: ComponentBase | null;
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
      if (label) put(parts.barPart, 'aria-label', label);
      else put(parts.barPart, 'aria-label', null);
    });
    this.observeProperty('items', () => {
      this.followItems();
      if (!parts.mergedHost) parts.stashedIn?.dropStash(this);
    });
    this.observeProperty('customization', () => this.takeCustomization());
    this.observeProperty('mergeHost', () => this.registerHost());
    this.observeProperty('mergeName', () => this.registerHost());
    this.observeProperty('mergeInto', () => this.watchMerge());
    this.observeProperty('mergeWhen', () => this.watchMerge());
    this.observeProperty<ComponentBase | null | undefined>('mergeScope', (given) => {
      parts.scope = given ?? null;
      this.watchMerge();
    });
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
      for (const slot of parts.slots.values()) slot.releaseIcon?.();
      parts.slots.clear();
      parts.itemClick.dispose();
      parts.itemsChanged.dispose();
      parts.customized.dispose();
      parts.customMenuOpening.dispose();
      listening.dispose();
      parts.stopWatch?.();
      this.unmerge();
      parts.stashedIn?.dropStash(this);
      parts.stashedIn = null;
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
  get mergeScope(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('mergeScope') ?? null;
  }
  set mergeScope(value: Bind<ComponentBase | null>) {
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
    if (parts.stashedIn !== host) {
      parts.stashedIn?.dropStash(this);
      parts.stashedIn = host;
    }
    parts.mergedHost = host;
    host.parts.merged.push(this);
    if (this.peekProperty('hideWhenMerged') !== false) shown(this, false);
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

  /** `show`: the bar is shown in its place again; not while its place is hidden and a main bar may take it back. */
  private leave(show = true): boolean {
    const parts = this.parts;
    const host = parts.mergedHost;
    if (!host) return false;
    parts.mergedHost = null;
    host.parts.merged = host.parts.merged.filter((bar) => bar !== this);
    if (!this.isDisposed && show) shown(this, true);
    if (!host.isDisposed) {
      host.followItems();
      host.parts.unmergedEvent.fire({ bar: this, source: host });
    }
    return true;
  }

  // Merged when built, before it is in the page; mounted, its place is watched in the page too.
  override onBuilt(): void {
    this.watchMerge();
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
    const into = this.peekProperty('mergeInto');
    const when = this.peekProperty<MenuBarMergeWhen>('mergeWhen') ?? 'shown';
    // A bar that merges when shown waits hidden from the start, before it is in the page and before its place is
    // known, so it is never drawn in its place first; any other bar is shown there unless merged.
    const hides = !!into && when === 'shown' && this.peekProperty('hideWhenMerged') !== false;
    if (!parts.mergedHost) shown(this, !hides);
    if (!into) {
      this.unmerge();
      return;
    }
    if (when === 'manual') return;
    const place = this.mergePlace();
    // No place yet (built and mounted watch again), or it is gone.
    if (!place || place.isDisposed) return;
    const stops: (() => void)[] = [];
    parts.stopWatch = () => {
      for (const stop of stops.splice(0)) stop();
    };
    // The window the place is in may be another one, and may close: the bar leaves its main bar then.
    let view: Window | null = null;
    let stopView: (() => void) | null = null;
    const leave = () => untracked(() => this.unmerge());
    const followWindow = () => {
      const now = windowOf(place);
      if (now === view) return;
      stopView?.();
      view = now;
      stopView = now ? onWindow(place, 'pagehide', leave) : null;
    };
    stops.push(() => stopView?.());
    followWindow();
    if (when === 'shown') {
      // Its place, not the bar: the bar itself is hidden while merged. Read in the window's next frame, then merged or left.
      // Until then the bar waits hidden (above), so it is never drawn in its place before it merges: it is shown there
      // only when its place is shown and no main bar takes it. With `hideWhenMerged` off it stays shown all along.
      const read = () => isInPage(place) && !windowOf(place)?.closed && isRendered(place);
      const write = (open: boolean) =>
        untracked(() => {
          followWindow();
          if (open) {
            if (!this.merge()) shown(this, true);
            return;
          }
          mergeHosts.stopWaiting(this);
          this.leave(!hides);
          if (hides) shown(this, false);
        });
      // The tree tells at once whether the place is shown: merged when built, before the bar is in the page; the frame's
      // read only confirms it (a place hidden by CSS alone, as in a folded dock area, is found out there).
      if (shownInTree(place)) untracked(() => this.merge());
      let cancel: (() => void) | null = null;
      const check = () => {
        cancel = measure(place, read, write);
      };
      stops.push(() => cancel?.());
      stops.push(onLayout(place, 'size', check, { owner: this }));
      // Put back, moved or kept aside hidden: its size may not change, so it is checked then too.
      void place.motif.on('x:activated', check);
      void place.motif.on('x:deactivated', check);
      stops.push(() => {
        void place.motif.off('x:activated', check);
        void place.motif.off('x:deactivated', check);
      });
      check();
      return;
    }
    // Focus in its place merges, and so does focus on a part standing for it (a tab's header); focus elsewhere leaves,
    // except in the main bar, its menus and its windows. The place and the main bar may be in different windows: each
    // one's document is listened to.
    const heard = new Set<Window>();
    const onFocus = (e: FocusEvent) =>
      untracked(() => {
        // Focus in the place itself is heard by the place.
        if (place.motif.isEventFrom(e)) return;
        if (holdsFocus(place, e)) onPlaceFocus();
        else if (!parts.mergedHost || !holdsFocus(parts.mergedHost, e)) this.unmerge();
      });
    const listen = (part: ComponentBase | null) => {
      const win = part ? windowOf(part) : null;
      if (!part || !win || heard.has(win)) return;
      heard.add(win);
      stops.push(onDocument(part, 'focusin', onFocus));
    };
    const onPlaceFocus = () =>
      untracked(() => {
        followWindow();
        this.merge();
        listen(place);
        listen(parts.mergedHost);
      });
    // The place hears focus come into it, in whatever window it is moved to; its document hears the parts standing for it.
    void place.motif.on('focusin', onPlaceFocus);
    stops.push(() => void place.motif.off('focusin', onPlaceFocus));
    listen(place);
    if (holdsFocus(place)) onPlaceFocus();
    else untracked(() => this.unmerge());
  }

  /** The place `mergeWhen` follows: `mergeScope`, else the component the bar is in (past a fragment, which has no element). */
  private mergePlace(): ComponentBase | null {
    if (this.parts.scope) return this.parts.scope;
    return this.parent ? holderOf(this.parent) : null;
  }

  /** Holds the changes by path until `endUpdate()`, which applies them at once. */
  beginUpdate(): void {
    this.parts.tree.beginUpdate();
  }

  endUpdate(): void {
    this.parts.tree.endUpdate();
  }

  /** The top item Tab reaches. */
  override get focusPart(): ComponentBase {
    return this.stop()?.part ?? this.parts.barPart;
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
    this.class.add('mx-menubar');
    const barPart = partBefore<HTMLDivElement>(this, this.controls.items[0] ?? null, 'div', 'mx-menubar__bar');
    barPart.attr.add({ role: 'menubar' });
    const drawn = reactive({ count: 0 });
    const self: { parts?: Parts } = {};
    // Built once: an item's part stays while an item of its key is shown, in the order drawn.
    barPart.bindings.list(
      () => {
        void drawn.count;
        return untracked(() => self.parts?.shownSlots ?? []);
      },
      (slot: Slot) => slot.button,
    );
    return (self.parts = {
      barPart,
      entries: [],
      slots: new Map(),
      shownSlots: [],
      drawn,
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
      layout: new ItemLayout<MenuItem, MenuBarCustomization>({
        items: () => givenList(this.peekProperty<readonly MenuItem[]>('items')),
        commands: () => this.catalog(),
        custom: () => this.parts.custom,
        childrenField: 'items',
      }),
      customizer: null,
      mergeKey: `bar${++barCount}`,
      merged: [],
      mergedHost: null,
      stashedIn: null,
      hostName: null,
      scope: null,
      stopWatch: null,
      mergedEvent: new Emitter(),
      unmergedEvent: new Emitter(),
      customized: new Emitter(),
      customMenuOpening: new Emitter(),
      tree: new ItemTree<MenuItem>(() => 'items', () => givenList(this.peekProperty<readonly MenuItem[]>('items')), (next) => this.applyItems(next)),
    });
  }

  private applyItems(next: MenuItem[]): void {
    this.changeProperty('items', next);
    this.parts.itemsChanged.fire({ items: next, source: this });
  }

  /** Draws the items again whenever a function in one of them reads something that changes, or on `reState()`. */
  private followItems(): void {
    const parts = this.parts;
    // Going away: its parts are disposed before its own cleanup lets the merged bars go.
    if (this.isDisposed || parts.barPart.isDisposed) return;
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
      visible: fieldOf(item, 'visible', this) !== false,
      text: fieldOf<string | undefined>(item, 'text', this) ?? '',
      hint: fieldOf<string | undefined>(item, 'hint', this),
      enabled: fieldOf(item, 'enabled', this) !== false,
      submenu: children.some((child) => fieldOf(child, 'visible', this) !== false),
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
    const focused = parts.entries.findIndex((entry) => isFocused(entry.part));
    const openKey = parts.open?.key;
    parts.entries = [];
    const shownSlots: Slot[] = [];
    // A merged bar's item takes another letter when the main bar's items already use its own.
    const used = new Set(looks.filter((l) => l.visible && (l.merged?.owner ?? this) === this).map((l) => parseAccessKey(l.text).key?.toLowerCase()));
    for (const look of looks) {
      if (!look.visible) continue;
      const parsed = (look.merged?.owner ?? this) === this ? parseAccessKey(look.text) : freeAccessKey(parseAccessKey(look.text), used);
      const slot = this.slotOf(look.key);
      const button = slot.button;
      if (slot.stashed) {
        slot.stashed = false;
        kept(button, true);
      }
      slot.from = look.merged && look.merged.owner !== this ? look.merged.owner : null;
      const entry: Entry = { item: look.item, node: look.node, merged: look.merged, key: look.key, part: button, enabled: look.enabled, submenu: look.submenu, text: foldText(parsed.text) };
      slot.entry = entry;
      put(button, 'aria-haspopup', look.submenu ? 'menu' : null);
      put(button, 'aria-expanded', look.submenu ? 'false' : null);
      put(button, 'aria-disabled', look.enabled ? null : 'true');
      put(button, 'title', look.hint || null);
      this.drawIcon(slot, fieldOf<IconSource | null | undefined>(look.merged?.drawn ?? look.node.drawn, 'icon', this) ?? null);
      const drawnLabel = `${parsed.index}:${parsed.text}`;
      if (slot.drawnLabel !== drawnLabel) {
        renderAccessKey(slot.label, parsed);
        slot.drawnLabel = drawnLabel;
      }
      // A disabled item takes no key.
      const token = parsed.key && look.enabled ? accessKeyToken(parsed.key) : null;
      if (slot.token !== token) {
        setAccessKeyAttribute(button, slot.token, token, () => this.pressAccessKey(slot.entry!));
        slot.token = token;
        if (token) installKeyboard();
      }
      parts.entries.push(entry);
      shownSlots.push(slot);
    }
    // The parts of the items no longer shown go with them. Those of a bar that left wait hidden for it to merge again,
    // and so do the bar's own items a merged bar takes away, until it leaves.
    const drawn = new Set(shownSlots);
    const stashed: Slot[] = [];
    let own: Set<string> | undefined;
    const away = (slot: Slot) => {
      if (slot.from) return !slot.from.isDisposed && slot.from.parts.stashedIn === this;
      if (!parts.merged.length) return false;
      own ??= new Set(parts.layout.childrenOf(null).filter((n) => !n.hidden).map((n) => n.key));
      return own.has(slot.key);
    };
    for (const slot of parts.slots.values()) {
      if (drawn.has(slot)) continue;
      if (away(slot)) {
        if (!slot.stashed) {
          slot.stashed = true;
          // Kept aside the MotifJS way: the item stays a child of the bar and core knows it is hidden.
          kept(slot.button, false);
          setAccessKeyAttribute(slot.button, slot.token, null);
          slot.token = null;
        }
        stashed.push(slot);
        continue;
      }
      slot.releaseIcon?.();
      parts.slots.delete(slot.key);
    }
    parts.shownSlots = stashed.length ? [...shownSlots, ...stashed] : shownSlots;
    parts.drawn.count++;
    this.renderRoving();
    const refocus = focused >= 0 ? parts.entries[Math.min(focused, parts.entries.length - 1)] : undefined;
    if (refocus) focusOn(refocus.part);
    if (openKey !== undefined) {
      const entry = parts.entries.find((e) => e.key === openKey);
      if (entry?.submenu && entry.enabled) this.openMenu(entry, null);
      else this.close();
    }
  }

  /** Lets go of the parts kept for `bar`'s items: the bar is going away, or its items changed while it was away. */
  private dropStash(bar: MenuBar): void {
    const parts = this.parts;
    if (this.isDisposed || parts.barPart.isDisposed) return;
    const left = parts.shownSlots.filter((slot) => !(slot.stashed && slot.from === bar));
    if (left.length === parts.shownSlots.length) return;
    for (const slot of parts.shownSlots) {
      if (left.includes(slot)) continue;
      slot.releaseIcon?.();
      parts.slots.delete(slot.key);
    }
    parts.shownSlots = left;
    parts.drawn.count++;
  }

  /** The part of the top item of `key`: the one kept, else a new one. */
  private slotOf(key: string): Slot {
    const slots = this.parts.slots;
    let slot = slots.get(key);
    if (slot) return slot;
    const button = loose<HTMLButtonElement>('button', 'mx-menubar__item');
    button.attr.add({ type: 'button', role: 'menuitem' });
    put(button, 'tabindex', '-1');
    const label = part<HTMLSpanElement>(button, 'span', 'mx-menubar__label');
    slot = { key, button, label, icon: null, iconSource: null, releaseIcon: null, drawnLabel: null, token: null, entry: null, from: null, stashed: false };
    slots.set(key, slot);
    return slot;
  }

  /** The item's icon, drawn again only when its source changes. */
  private drawIcon(slot: Slot, source: IconSource | null): void {
    if (slot.iconSource === source) return;
    slot.releaseIcon?.();
    slot.releaseIcon = null;
    slot.iconSource = source;
    if (!source) {
      removePart(slot.icon);
      slot.icon = null;
      return;
    }
    if (!slot.icon) {
      slot.icon = partBefore<HTMLSpanElement>(slot.button, slot.label, 'span', 'mx-menubar__icon');
      slot.icon.attr.add({ 'aria-hidden': 'true' });
    }
    slot.releaseIcon = showIcon(source, slot.icon);
  }

  /** The item Tab reaches: the last one focused, else the first. */
  private stop(): Entry | undefined {
    const entries = this.parts.entries;
    return entries.find((e) => e.key === this.parts.current) ?? entries[0];
  }

  private renderRoving(): void {
    const stop = this.peekProperty('tabStop') === false ? undefined : this.stop();
    for (const entry of this.parts.entries) put(entry.part, 'tabindex', entry === stop ? '0' : '-1');
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
      if (parts.open) put(parts.open.part, 'aria-expanded', 'false');
      const merged = entry.merged;
      list.setItems(merged ? () => merged.children().map((m) => m.drawn) : this.menuOf(entry.node));
    }
    parts.open = entry;
    parts.current = entry.key;
    this.renderRoving();
    popup.open(entry.part);
    put(entry.part, 'aria-expanded', 'true');
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
      if (parts.open) put(parts.open.part, 'aria-expanded', 'false');
      parts.open = null;
      this.setProperty('openItem', null);
    });
    parts.list = list;
    return popup;
  }

  // The user's changes: applied while drawing (ItemLayout); the items given stay as they are.

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
    if (!inMenu && parts.popup?.motif.isEventFrom(e.event)) {
      e.cancel = true;
      return;
    }
    let node: MenuNode | null = null;
    // An item of a merged bar is that bar's: its menu, its changes.
    let owner: MenuBar = this;
    if (inMenu) {
      let item: MenuItem | null = null;
      for (let list = parts.list; list && !item; list = list.submenu) item = list.itemFrom(e.event);
      const merged = item ? mergedOf.get(item) : undefined;
      if (merged && parts.merged.length) {
        node = merged.node;
        owner = merged.owner;
      } else {
        node = item ? parts.layout.nodeOf(item) : null;
      }
    } else {
      const entry = this.entryOf(e.event);
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
      const name = parseAccessKey(String(fieldOf(node.drawn, 'text', this) ?? '')).text;
      const move = (step: 1 | -1) => () => this.changeByUser(layout.moved(node, step, false), node);
      items.push({ text: fillTemplate(s.menuBarHide, { name }), click: () => this.changeByUser(layout.shown(node, false), node) });
      if (node.parent) {
        items.push(
          { text: s.menuBarMoveUp, enabled: layout.canMove(node, -1, false), click: move(-1) },
          { text: s.menuBarMoveDown, enabled: layout.canMove(node, 1, false), click: move(1) },
        );
      } else {
        // Left is earlier in a left-to-right page, later in a right-to-left one.
        const left: 1 | -1 = isRtl(this) ? 1 : -1;
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
          focusOn(entry.part);
          return;
        }
      }
      for (let list = parts.list; list; list = list.submenu) {
        if (list.focusWhere((x) => mine(x, found.id))) return;
      }
    }
    const stop = bar.stop();
    if (parts.popup?.isOpen) parts.list?.focusItem('first');
    else if (stop) focusOn(stop.part);
  }

  /** The customizer's view of the bar: its tree, and each change applied as the user's. */
  private customizerSource(): CustomizerSource {
    const layout = this.parts.layout;
    const s = uiLocale.strings;
    const view = (n: MenuNode): CustomizerNode => ({
      id: n.id,
      parent: n.parent,
      text: parseAccessKey(String(fieldOf(n.drawn, 'text', this) ?? '')).text,
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
        untracked(() => layout.options.commands().map((cmd) => ({ key: String(givenValue(cmd, 'key')), text: parseAccessKey(String(fieldOf(cmd, 'text', this) ?? '')).text }))),
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
          const added = layout.addedTo(find(parent), what, { after: after ? find(after) : null });
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
    runItem(args.item, args, owner, e.event, owner);
    owner.parts.itemClick.fire(args);
  }

  // Pointer and keys.

  /** The top item an event started on. */
  private entryOf(e: Event): Entry | undefined {
    return this.parts.entries.find((entry) => entry.part.motif.isEventFrom(e));
  }

  private listen(): void {
    const parts = this.parts;
    parts.barPart.motif.on('click', (_, e) => untracked(() => this.onClick(e)));
    parts.barPart.motif.on('focusin', (_, e) => {
      const entry = this.entryOf(e);
      if (!entry || parts.current === entry.key) return;
      parts.current = entry.key;
      this.renderRoving();
    });
    parts.barPart.motif.on('pointerover', (_, e) => {
      const entry = this.entryOf(e);
      if (!entry || !parts.open || parts.open === entry || this.peekProperty('openOnHover') === false) return;
      if (entry.submenu && entry.enabled) this.openMenu(entry, 'list');
      else {
        this.close();
        focusOn(entry.part);
      }
    });
    this.motif.on('keydown', (_, e) => untracked(() => this.onKeyDown(e)));
  }

  /** An item's access key: its menu opens at once, focus on its first item; an item without a menu is clicked. */
  private pressAccessKey(entry: Entry): boolean {
    focusOn(entry.part);
    if (!entry.submenu) entry.part.attr.add({ click: true });
    else if (this.parts.open === entry) this.close();
    else this.openMenu(entry, 'first');
    return true;
  }

  private onClick(e: MouseEvent): void {
    const entry = this.entryOf(e);
    if (!entry?.enabled) return;
    if (entry.submenu) {
      if (this.parts.open === entry) this.close();
      // From the keyboard (Enter, Space) focus goes to the first item.
      else this.openMenu(entry, e.detail === 0 ? 'first' : 'list');
      return;
    }
    this.close();
    const owner = entry.merged?.owner ?? this;
    const args: MenuItemClickEventArgs = { item: entry.item, source: owner, event: e };
    runItem(entry.item, args, owner, e, owner);
    owner.parts.itemClick.fire(args);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const parts = this.parts;
    const entries = parts.entries;
    const entry = this.entryOf(e);
    const inMenu = !entry && !!parts.open && !!parts.popup?.motif.isEventFrom(e);
    if ((!entry && !inMenu) || !entries.length) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const from = entry ?? parts.open!;
        const step = (e.key === 'ArrowRight') !== isRtl(this) ? 1 : -1;
        const next = entries[(entries.indexOf(from) + step + entries.length) % entries.length];
        if (inMenu && next.submenu && next.enabled) {
          this.openMenu(next, 'first');
        } else {
          this.close();
          focusOn(next.part);
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
        focusOn(entries[e.key === 'Home' ? 0 : entries.length - 1].part);
        break;
      default: {
        if (!entry || e.key.length !== 1 || e.key === ' ') return;
        const letter = foldText(e.key);
        const at = entries.indexOf(entry);
        for (let step = 1; step <= entries.length; step++) {
          const candidate = entries[(at + step) % entries.length];
          if (candidate.text.startsWith(letter)) {
            focusOn(candidate.part);
            break;
          }
        }
      }
    }
    e.preventDefault();
  }
}

/**
 * Shown as far as the component tree says: neither it nor a component above it is hidden or waiting (core), or marked
 * hidden (a part some components still hide by its `hidden` attribute).
 */
function shownInTree(component: ComponentBase): boolean {
  for (let c: ComponentBase | null | undefined = component; c; c = c.parent as ComponentBase | null | undefined) {
    if (!c.isVisible || c.isWait || c.attr.has('hidden')) return false;
  }
  return true;
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
