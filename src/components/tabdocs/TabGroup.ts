import { Component, untracked, type Bind, type ComponentBase } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import type { Control } from '../../core/control';
import { follow } from '../../core/follow';
import { focusOn, isFocused } from '../../core/focus';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { glyphPart, loose, part } from '../../core/draw-parts';
import { dismissMark, gripMark, lockMark, maximizeMark, moreMark, pinMark, restoreMark, splitMark } from '../../core/glyphs';
import { boxOf, isRendered, isRtl, keepScroll, measure, mediaOf, onLayout, rectOf, reveal as revealIn, scrollBy, scrollTo } from '../../core/measure';
import { orderControls } from '../../core/order-controls';
import { css, mark, put, text } from '../../core/part-writes';
import { nextId } from '../../core/next-id';
import type { MenuItem } from '../../parts/menu/menu-item';
import { followPointer } from '../../parts/window/follow-pointer';
import { Toolbar } from '../toolbar/Toolbar';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { DocumentTab } from './DocumentTab';
import { layoutPart } from './place-node';
import type { StripRoom } from './strip-room';
import type { TabHeader } from './tab-header';
import type { SplitDirection } from './split-direction';
import type { TabBarButton } from './tab-bar-button';
import type { TabBarButtonSize } from './tab-bar-button-size';
import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDockArea } from './TabDockArea';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropSide } from './tab-drop-side';
import type { TabOpenOptions } from './tab-open-options';
import type { TabSize } from './tab-size';
import type { TabToolbarItems } from './tab-toolbar-items';
import type { TabSplit } from './TabSplit';
import type { TabWindow } from './TabWindow';

interface Parts {
  manager: TabDocumentManager;
  bar: Component<HTMLDivElement>;
  /** The tab list and its scroll buttons. */
  strip: Component<HTMLDivElement>;
  list: Component<HTMLDivElement>;
  pinnedRow: Component<HTMLDivElement>;
  /** The other tabs; it scrolls when they do not fit. */
  row: Component<HTMLDivElement>;
  back: Component<HTMLSpanElement>;
  forward: Component<HTMLSpanElement>;
  /** Without scroll buttons: a thin scrollbar over the tabs while the pointer is over the strip. */
  scrollbar: Component<HTMLDivElement>;
  thumb: Component<HTMLDivElement>;
  panels: Component<HTMLDivElement>;
  tips: Component<HTMLDivElement>;
  empty: Component<HTMLDivElement>;
  actions: Toolbar;
  /** The built-in toolbar buttons: split, maximize, the lock mark, "…", auto hide, close, and a window's maximize and close. */
  own: ToolbarItem[];
  /** The built-in buttons by name, but "…", which always stays. */
  named: [TabBarButton, ToolbarItem][];
  /** The auto hide button of a group in a dock area. */
  autoHide: ToolbarItem;
  /** The close button of a dock area's (or a window's) active document. */
  close: ToolbarItem;
  /** The handle the group is dragged by (and moved with the keys), first in the toolbar. */
  grip: ToolbarItem;
  /** The app's buttons for this group, made once by the manager's `toolbarItems`. */
  app: { make: TabToolbarItems | null; items: readonly ToolbarItem[] };
  more: ToolbarItem;
  tabs: DocumentTab[];
  active: DocumentTab | null;
  /** The tabs, the one used last first. */
  recent: DocumentTab[];
  split: TabSplit | null;
  /** As `renderLook` drew the bar last: a single document shown as a title, and a close button of the bar's own. */
  title: boolean;
  barClose: boolean;
  /** Ends the size watch on the active tab's header (a late font changes its width): it stays in sight. */
  stopActiveWatch: (() => void) | null;
}

const PARTS = Symbol('mx.tab-group');

const NONE: readonly TabDocument[] = [];

const ALL_SIDES: readonly TabDropSide[] = ['center', 'left', 'right', 'up', 'down'];

/** What `'auto'` keeps: a dock area its pin and close button, a floating window its own close button. */
const AREA_BUTTONS: readonly TabBarButton[] = ['autoHide', 'close'];
const WINDOW_BUTTONS: readonly TabBarButton[] = ['closeWindow'];
/** What `'auto'` keeps in the documents' groups on a tablet or a phone: only the "…" menu, which holds the rest. */
const NO_BUTTONS: readonly TabBarButton[] = [];

/** What a group's bar follows: its dock area's or window's own settings, else the manager's. */
interface BarLook {
  scrollButtons: boolean;
  tabSize: TabSize;
  tabMinWidth: number;
  singleTabTitle: boolean;
  buttons: readonly TabBarButton[] | 'all';
  buttonSize: TabBarButtonSize;
}

/**
 * A group of a `TabDocumentManager`: a strip of tabs with the active document's content below it.
 * The manager creates and closes groups (`split`, `closeGroup`). A group is a container, so focus
 * returns to where it was when the group receives focus again. Pinned tabs come first, on their
 * own row when `pinnedTabsOnSeparateRow` is on.
 */
export class TabGroup extends FocusContainer<HTMLDivElement> {
  /** @internal The id written on the group's element. */
  readonly id = nextId('tabdocs-group');
  private readonly readStrip = (): StripRoom => {
    const { strip, row } = this.parts;
    const box = boxOf(row);
    const room: StripRoom = { needed: box.scrollWidth, room: box.clientWidth, position: box.scrollStart, hidden: 0, trackStart: 0, trackSize: box.width };
    if (room.needed <= room.room + 1) return room;
    for (const header of row.controls.items) {
      const b = rectOf(header);
      if (b.left < box.left - 1 || b.right > box.right + 1) room.hidden++;
    }
    const outer = rectOf(strip);
    room.trackStart = isRtl(strip) ? outer.right - box.right : box.left - outer.left;
    return room;
  };
  private readonly drawStrip = (room: StripRoom): void => {
    const { strip, back, forward } = this.parts;
    const over = room.needed > room.room + 1;
    mark(strip, 'data-overflow', over);
    mark(back, 'data-end', room.position <= 1);
    mark(forward, 'data-end', room.position + room.room >= room.needed - 1);
    if (over) this.placeThumb(room);
    if (room.hidden !== untracked(() => this.hiddenTabCount)) untracked(() => this.setProperty('hiddenTabs', room.hidden));
  };

  constructor(manager: TabDocumentManager) {
    super('div', {});
    const self = this as unknown as { [PARTS]?: Parts };
    const parts = (self[PARTS] = this.createParts(manager));
    layoutPart(this, true);
    // The items read the group, so they come once its parts are in place. A compact bar keeps the
    // buttons it names and the app's that ask to stay; the others are in the "…" menu.
    parts.actions.items = () => {
      // The documents' and the app's lists are read as they are; a list given anew is followed.
      const app = [...givenList(this.appItems()), ...givenList(this.activeDocument?.actions)];
      const kept = this.look().buttons;
      if (kept === 'all') return [parts.grip, ...app, ...parts.own];
      const named = new Map(parts.named.map(([name, item]) => [item, name]));
      return [parts.grip, ...app.filter(staysOut), ...parts.own.filter((item) => !named.has(item) || kept.includes(named.get(item)!))];
    };
    this.listen();
    follow(
      this,
      'look',
      () => {
        const look = this.look();
        // A tablet's strip that holds the tabs of groups folded into it is no title.
        const title = look.singleTabTitle && this.documents.length === 1 && !manager.groupHasGuests(this);
        const close = manager.groupActions && (!!this.dockArea || !!this.window) && (look.buttons === 'all' || look.buttons.includes('close'));
        return { look, title, close };
      },
      ({ look, title, close }) => this.renderLook(look, title, close),
    );
    this.observeProperty('locked', () =>
      untracked(() => {
        const n = manager.groups.indexOf(this);
        if (n >= 0) this.renderTexts(n + 1);
      }),
    );
  }

  get manager(): TabDocumentManager {
    return this.parts.manager;
  }
  /** The documents in strip order, with the pinned documents first. Reactive. */
  get documents(): readonly TabDocument[] {
    return this.getProperty<readonly TabDocument[] | undefined>('documents') ?? NONE;
  }
  /** The group's active document. Reactive. */
  get activeDocument(): TabDocument | null {
    return this.getProperty<TabDocument | null | undefined>('activeDocument') ?? null;
  }
  /** The documents, with the most recently used first. Reactive. */
  get recentDocuments(): readonly TabDocument[] {
    return this.getProperty<readonly TabDocument[] | undefined>('recent') ?? NONE;
  }
  /** The document of the group's preview tab, if it has one. Reactive. */
  get previewDocument(): TabDocument | null {
    return this.documents.find((d) => d.preview) ?? null;
  }
  /**
   * A locked group does not receive documents opened without naming the group. Use `lock()` and
   * `unlock()` so that events are raised. Reactive.
   */
  get locked(): boolean {
    return !!this.getProperty<boolean>('locked');
  }
  set locked(value: Bind<boolean>) {
    this.assignProperty('locked', value, Boolean);
  }
  /** Allows drops into and beside the group. The default is `true`. Reactive. */
  get allowDrop(): boolean {
    return this.getProperty<boolean | undefined>('allowDrop') !== false;
  }
  set allowDrop(value: Bind<boolean>) {
    this.assignProperty('allowDrop', value, Boolean);
  }
  /** The group's own drop sides, which override the manager's `dropSides`. `null` uses the manager's. Reactive. */
  get dropSides(): readonly TabDropSide[] | null {
    return this.getProperty<readonly TabDropSide[] | null | undefined>('dropSides') ?? null;
  }
  set dropSides(value: Bind<readonly TabDropSide[] | null>) {
    this.assignProperty('dropSides', value);
  }
  /** Indicates whether it is the manager's active group. Reactive. */
  get isActive(): boolean {
    return !!this.getProperty<boolean>('isActive');
  }
  /** Indicates whether the group is maximized. Reactive. */
  get isMaximized(): boolean {
    return !!this.getProperty<boolean>('isMaximized');
  }
  get isEmpty(): boolean {
    return this.documents.length === 0;
  }
  /** The floating window containing it, otherwise `null`. Reactive. */
  get window(): TabWindow | null {
    return this.getProperty<TabWindow | null | undefined>('window') ?? null;
  }
  /** The dock area containing it, otherwise `null`. Reactive. */
  get dockArea(): TabDockArea | null {
    return this.getProperty<TabDockArea | null | undefined>('dockArea') ?? null;
  }
  /** The new browser window containing it, or `null` in the main window. Reactive. */
  get browserWindow(): TabBrowserWindow | null {
    return this.getProperty<TabBrowserWindow | null | undefined>('browserWindow') ?? null;
  }
  /** Its position in the manager's `groups`, starting from 0. Reactive. */
  get index(): number {
    return this.manager.groups.indexOf(this);
  }
  /** The number of its tabs that are not fully visible in the strip. Reactive. */
  get hiddenTabCount(): number {
    return this.getProperty<number | undefined>('hiddenTabs') ?? 0;
  }

  open(document: TabDocument, options: Omit<TabOpenOptions, 'group'> = {}): TabDocument | null {
    return this.manager.open(document, { ...options, group: this });
  }

  activate(document: TabDocument, focus = false): boolean {
    return document.group === this && this.manager.activate(document, focus);
  }

  closeAll(): Promise<boolean> {
    return this.manager.closeAll(this);
  }

  /** Closes its documents, and then the group. */
  close(): Promise<boolean> {
    return this.manager.closeGroup(this);
  }

  split(direction: SplitDirection, document?: TabDocument): TabGroup | null {
    return this.manager.split(this, direction, document);
  }

  maximize(): boolean {
    return this.manager.maximizeGroup(this);
  }

  lock(): boolean {
    return this.manager.lock(this);
  }

  unlock(): boolean {
    return this.manager.unlock(this);
  }

  /** Makes it the active group and sets focus on what last had focus in it. */
  override focus(): boolean {
    return this.manager.focusGroup(this);
  }

  override get focusPart(): ComponentBase {
    const parts = (this as unknown as { [PARTS]?: Parts })[PARTS];
    return parts?.active?.headerPart ?? parts?.list ?? this;
  }

  override onMounted(): void {
    // The shown panel's content is in the page now: it decides whether the panel takes focus.
    this.parts.active?.updatePanelFocus();
  }

  // Called by the manager.

  /** @internal */
  get tabs(): readonly DocumentTab[] {
    return this.parts.tabs;
  }
  /** @internal */
  get activeTab(): DocumentTab | null {
    return this.parts.active;
  }
  /** @internal */
  get recentTabs(): readonly DocumentTab[] {
    return this.parts.recent;
  }
  /** @internal */
  get parentSplit(): TabSplit | null {
    return this.parts.split;
  }
  set parentSplit(split: TabSplit | null) {
    this.parts.split = split;
  }
  /** @internal The tab list. */
  get listPart(): Component<HTMLDivElement> {
    return this.parts.list;
  }
  /** @internal The tab list and its scroll buttons. */
  get stripPart(): Component<HTMLDivElement> {
    return this.parts.strip;
  }
  /** @internal The strip and the toolbar. */
  get barPart(): Component<HTMLDivElement> {
    return this.parts.bar;
  }
  /** @internal The row of the tabs that are not pinned: it scrolls. */
  get rowPart(): Component<HTMLDivElement> {
    return this.parts.row;
  }
  /** @internal Where the content shows. */
  get panelsPart(): Component<HTMLDivElement> {
    return this.parts.panels;
  }
  /** @internal Whether its bar keeps only some buttons and has one "…" menu for the rest and the documents. Reactive. */
  get isCompact(): boolean {
    return this.look().buttons !== 'all';
  }

  /** @internal In a compact bar: the buttons not in the toolbar, as items of the "…" menu; the built-in ones first. */
  foldedItems(): MenuItem[] {
    const parts = this.parts;
    return untracked(() => {
      const kept = this.look().buttons;
      if (kept === 'all') return [];
      // The lock mark has its command in the menu already.
      const own = parts.named.filter(([name]) => name !== 'lock' && !kept.includes(name)).map(([, item]) => item);
      const app = [...givenList(this.appItems()), ...givenList(this.activeDocument?.actions)].filter((item) => !staysOut(item));
      const line: ToolbarItem[] = own.length && app.length ? [{ type: 'separator' }] : [];
      return menuItemsOf([...own, ...line, ...app], parts.actions);
    });
  }

  /** @internal Whether drops are allowed now. */
  get acceptsDrop(): boolean {
    return untracked(() => this.allowDrop);
  }
  /** @internal The sides a drop on the content may take now: the group's own, else the manager's. */
  get dropSidesNow(): readonly TabDropSide[] {
    return untracked(() => this.dropSides ?? this.manager.dropSides ?? ALL_SIDES);
  }
  /** @internal The "…" button, while it is shown (not folded into the toolbar's menu). */
  get moreButtonPart(): Control | null {
    const control = this.parts.actions.controlOf(this.parts.more);
    return control && isRendered(control) ? control : null;
  }

  /** @internal Puts a tab (and its panel) in at `index`; pinned tabs stay first. */
  addTab(tab: DocumentTab, index: number): void {
    const parts = this.parts;
    const at = Math.max(0, Math.min(index, parts.tabs.length));
    parts.tabs.splice(at, 0, tab);
    parts.recent.push(tab);
    // A moved panel may lose what scrolled inside it (no `moveBefore`): it is given back.
    const restore = tab.panel.parent ? keepScroll(tab.panel) : null;
    parts.panels.controls.add(tab.panel);
    restore?.();
    tab.group = this;
    tab.attachTooltip(parts.tips);
    this.arrange();
  }

  /** @internal Takes a tab out without disposing it; the manager has chosen the next active one. */
  removeTab(tab: DocumentTab): void {
    const parts = this.parts;
    const at = parts.tabs.indexOf(tab);
    if (at < 0) return;
    parts.tabs.splice(at, 1);
    parts.recent.splice(parts.recent.indexOf(tab), 1);
    if (parts.active === tab) this.setActive(null);
    // Out of the strip, alive: the tab goes on elsewhere or is disposed.
    tab.headerPart.parent?.controls.silentDetach(tab.headerPart);
    tab.attachTooltip(null);
    tab.group = null;
    this.changed();
  }

  /** @internal Moves a tab to `index` in the strip; pinned tabs stay first. */
  moveTab(tab: DocumentTab, index: number): void {
    const parts = this.parts;
    const from = parts.tabs.indexOf(tab);
    if (from < 0) return;
    parts.tabs.splice(from, 1);
    parts.tabs.splice(Math.max(0, Math.min(index, parts.tabs.length)), 0, tab);
    this.arrange();
  }

  /** @internal How many tabs are pinned (they are the first ones). */
  pinnedCount(): number {
    return untracked(() => this.parts.tabs.filter((t) => t.document.pinned).length);
  }

  /** @internal Puts the pinned tabs first, keeping each side's order, and the headers where they belong. */
  arrange(): void {
    const parts = this.parts;
    untracked(() => {
      const pinned = parts.tabs.filter((t) => t.document.pinned);
      parts.tabs.splice(0, parts.tabs.length, ...pinned, ...parts.tabs.filter((t) => !t.document.pinned));
    });
    this.placeHeaders();
    this.changed();
  }

  /**
   * @internal The headers where they belong: the pinned ones in their row, the others in theirs. On
   * a tablet a group shown for others folded into it holds their headers too, before and after its own.
   */
  placeHeaders(): void {
    const parts = this.parts;
    if (parts.manager.groupFolded(this)) {
      // Its headers are in the strip of the group shown for it: that strip is drawn again.
      this.renderRoving();
      parts.manager.presentationSettingChanged();
      return;
    }
    untracked(() => {
      const pinned = parts.tabs.filter((t) => t.document.pinned);
      const guests = parts.manager.guestHeaders(this);
      const had = [...parts.tabs.map((t) => t.headerPart), ...(guests?.before ?? []), ...(guests?.after ?? [])].find((h) => isFocused(h));
      syncChildren(
        parts.pinnedRow,
        pinned.map((t) => t.headerPart),
      );
      syncChildren(parts.row, [...(guests?.before ?? []), ...parts.tabs.filter((t) => !pinned.includes(t)).map((t) => t.headerPart), ...(guests?.after ?? [])]);
      for (const guest of [...(guests?.before ?? []), ...(guests?.after ?? [])]) {
        // Another group's tab: its panel is not the one shown here.
        mark(guest, 'data-guest', true);
        put(guest, 'aria-selected', 'false');
        put(guest, 'tabindex', '-1');
      }
      // Its own headers are all in its rows now: none of them is another strip's guest.
      for (const tab of parts.tabs) {
        put(tab.headerPart, 'data-guest', null);
        put(tab.headerPart, 'aria-selected', String(tab === parts.active));
      }
      mark(parts.pinnedRow, 'hidden', !pinned.length);
      if (had && !isFocused(had)) focusOn(had, { preventScroll: true });
    });
    this.renderRoving();
    this.queueOverflow();
  }

  /** @internal Shows a tab's panel and hides the one shown before. */
  showTab(tab: DocumentTab | null): void {
    const parts = this.parts;
    const previous = parts.active;
    if (previous && previous !== tab) previous.show(false);
    this.setActive(tab);
    if (tab) {
      tab.show(true);
      parts.recent.splice(parts.recent.indexOf(tab), 1);
      parts.recent.unshift(tab);
    }
    this.changed();
    if (tab) this.reveal(tab);
  }

  /** @internal Where the manager has put it: a floating window, a dock area, a new window, or among the documents; `title`: its strip is the floating window's title. */
  placeIn(window: TabWindow | null, area: TabDockArea | null, title: boolean, browser: TabBrowserWindow | null = null): void {
    untracked(() => {
      if (this.window !== window) this.setProperty('window', window);
      if (this.dockArea !== area) this.setProperty('dockArea', area);
      if (this.browserWindow !== browser) this.setProperty('browserWindow', browser);
      if (!!this.getProperty('windowTitle') !== title) this.setProperty('windowTitle', title);
    });
    mark(this, 'data-floating', !!window);
    if (area) put(this, 'data-dock', area.side);
    else put(this, 'data-dock', null);
  }

  /** @internal */
  markActive(on: boolean): void {
    mark(this, 'data-active', on);
    this.setProperty('isActive', on);
  }

  /** @internal */
  markMaximized(on: boolean): void {
    mark(this, 'data-maximized', on);
    this.setProperty('isMaximized', on);
  }

  /** @internal The texts that carry the group's number. */
  renderTexts(number: number): void {
    const manager = this.manager;
    const locked = untracked(() => this.locked);
    mark(this, 'data-locked', locked);
    put(this, 'aria-label', manager.textOf(locked ? 'tabDocsLockState' : 'tabDocsGroup', { n: number }));
    put(this.parts.list, 'aria-label', manager.textOf('tabDocsTabs', { n: number }));
    this.parts.actions.controlOf(this.parts.grip)?.class.add('mx-tabdocs__grip');
    this.parts.actions.controlOf(this.parts.autoHide)?.class.add('mx-tabdocs__auto-hide');
    this.parts.actions.controlOf(this.parts.close)?.class.add('mx-tabdocs__bar-close');
    text(this.parts.empty, manager.textOf('tabDocsEmpty'));
  }

  /** @internal The tab whose header an event started on. */
  tabOfEvent(e: Event): DocumentTab | undefined {
    return this.parts.tabs.find((t) => t.headerPart.motif.isEventFrom(e));
  }

  /** @internal The tab whose header an event started on: one of its own, or on a tablet one of a group folded into it. */
  stripTabOfEvent(e: Event): DocumentTab | undefined {
    return this.tabOfEvent(e) ?? untracked(() => this.manager.groups).flatMap((g) => g.tabs).find((t) => t.headerPart.motif.isEventFrom(e));
  }

  /** @internal Whether an event started on the group's drag handle. */
  isGripEvent(e: Event): boolean {
    return !!this.parts.actions.controlOf(this.parts.grip)?.motif.isEventFrom(e);
  }

  /** @internal Whether an event started in the strip's empty room: in the bar, not on one of its tabs, the scrollbar or a toolbar button. */
  isStripSpaceEvent(e: Event): boolean {
    const parts = this.parts;
    if (!parts.bar.motif.isEventFrom(e) || this.tabOfEvent(e) || parts.scrollbar.motif.isEventFrom(e)) return false;
    // The toolbar's own room counts; its buttons do not.
    return !parts.actions.controls.items.some((c) => c.motif.isEventFrom(e));
  }

  /** @internal Whether an event started on one of the strip's scroll buttons. */
  isScrollButtonEvent(e: Event): boolean {
    return this.parts.back.motif.isEventFrom(e) || this.parts.forward.motif.isEventFrom(e);
  }

  /** @internal Scrolls the strip, not the page, so that a tab is in sight. */
  reveal(tab: DocumentTab): void {
    // On a tablet the header may be in the row of the group this one is folded into. The pinned row never scrolls.
    const holder = tab.headerPart.parent;
    const group = holder === this.parts.row ? this : untracked(() => this.manager.groups).find((g) => g.rowPart === holder);
    // A tab wider than the room shows its start.
    if (group) revealIn(group.rowPart, tab.headerPart, { axis: 'x' });
  }

  /** @internal The roving tab stop: the active tab. */
  renderRoving(): void {
    const parts = this.parts;
    // Folded into another group on a tablet, its headers are that strip's guests: none of them is a stop.
    const folded = parts.manager.groupFolded(this);
    for (const tab of parts.tabs) put(tab.headerPart, 'tabindex', tab === parts.active && !folded ? '0' : '-1');
  }

  /** @internal Puts the recently used order back, as `saveLayout` wrote it. */
  restoreRecent(order: readonly number[]): void {
    const parts = this.parts;
    const recent = order.map((i) => parts.tabs[i]).filter((t): t is DocumentTab => !!t);
    for (const tab of parts.recent) if (!recent.includes(tab)) recent.push(tab);
    parts.recent = recent;
    this.changed();
  }

  /** @internal */
  disposeTabs(): void {
    const parts = this.parts;
    for (const tab of parts.tabs.splice(0)) tab.dispose();
    parts.recent = [];
    this.setActive(null);
    this.changed();
  }

  /** @internal Shows the scroll buttons when the tabs do not fit, each dimmed at its end; drawn in the window's next frame. */
  queueOverflow(): void {
    measure(this, this.readStrip, this.drawStrip);
  }

  /** Makes `tab` the active one and watches its header's size: a late font changes its width, and it stays in sight. */
  private setActive(tab: DocumentTab | null): void {
    const parts = this.parts;
    if (parts.active === tab) return;
    parts.stopActiveWatch?.();
    parts.active = tab;
    parts.stopActiveWatch = tab ? onLayout(tab.headerPart, 'size', () => this.stripResized(), { owner: this }) : null;
  }

  private stripResized(): void {
    if (this.parts.active) this.reveal(this.parts.active);
    this.queueOverflow();
  }

  /** The thin scrollbar: along the tabs that scroll, its thumb as long as the share in sight. */
  private placeThumb({ needed, room, position, trackStart, trackSize }: StripRoom): void {
    const scrollbar = this.parts.scrollbar;
    const size = Math.min(1, room / needed);
    css(scrollbar, '--_track-start', `${Math.round(trackStart)}px`);
    css(scrollbar, '--_track-size', `${Math.round(trackSize)}px`);
    css(scrollbar, '--_thumb-size', `${(size * 100).toFixed(2)}%`);
    css(scrollbar, '--_thumb-at', `${((Math.min(position, needed - room) / (needed - room)) * (1 - size) * 100).toFixed(2)}%`);
  }

  /** The thumb is dragged: the strip follows, as far as the tabs go for each pixel of the track. */
  private dragThumb(e: PointerEvent): void {
    const { row, scrollbar, thumb } = this.parts;
    if (e.button !== 0) return;
    const box = boxOf(row);
    e.preventDefault();
    e.stopPropagation();
    // Right to left the track runs the other way, and so does the pointer along it.
    const ratio = (box.scrollWidth / Math.max(1, box.clientWidth)) * (box.rtl ? -1 : 1);
    mark(scrollbar, 'data-dragging', true);
    followPointer(
      thumb,
      e,
      (dx) => scrollTo(row, { start: box.scrollStart + dx * ratio }),
      () => put(scrollbar, 'data-dragging', null),
    );
  }

  /** What its bar follows now: its dock area's or window's own settings, else the manager's (`compact…` there). Reactive. */
  private look(): BarLook {
    const m = this.manager;
    const own = this.dockArea ?? this.window;
    // On a tablet or a phone the documents' groups are narrow: they take the compact settings too (`narrowBars`).
    if (!own && !this.browserWindow && m.currentPresentation !== 'desktop' && m.narrowBars === 'compact') {
      const buttons = m.compactBarButtons;
      return {
        scrollButtons: m.compactScrollButtons,
        tabSize: m.compactTabSize,
        tabMinWidth: m.compactTabMinWidth,
        singleTabTitle: m.compactSingleTabTitle,
        buttons: buttons === 'auto' ? NO_BUTTONS : buttons,
        buttonSize: m.compactBarButtonSize,
      };
    }
    if (!own) return { scrollButtons: m.scrollButtons, tabSize: m.tabSize, tabMinWidth: m.tabMinWidth, singleTabTitle: m.singleTabTitle, buttons: m.barButtons, buttonSize: m.barButtonSize };
    const buttons = own.barButtons ?? m.compactBarButtons;
    return {
      scrollButtons: own.scrollButtons ?? m.compactScrollButtons,
      tabSize: own.tabSize ?? m.compactTabSize,
      tabMinWidth: own.tabMinWidth ?? m.compactTabMinWidth,
      singleTabTitle: own.singleTabTitle ?? m.compactSingleTabTitle,
      buttons: buttons === 'auto' ? (this.dockArea ? AREA_BUTTONS : WINDOW_BUTTONS) : buttons,
      buttonSize: own.barButtonSize ?? m.compactBarButtonSize,
    };
  }

  /** `close`: the bar has a close button of its own, so a title shows none. */
  private renderLook(look: BarLook, title: boolean, close: boolean): void {
    const parts = this.parts;
    parts.title = title;
    parts.barClose = close;
    put(this, 'data-tab-size', look.tabSize);
    css(this, '--_tab-min', `${look.tabMinWidth}px`);
    mark(this, 'data-scroll-buttons', look.scrollButtons);
    mark(this, 'data-compact', look.buttons !== 'all');
    mark(this, 'data-title', title);
    mark(this, 'data-bar-close', close);
    put(this, 'data-bar-size', look.buttonSize);
    this.queueOverflow();
  }

  /** The name of the "…" button: the documents, or the documents and the commands, and how many tabs are out of sight. */
  private moreText(): string {
    const m = this.manager;
    const look = this.look();
    const hidden = look.scrollButtons ? 0 : this.hiddenTabCount;
    if (look.buttons === 'all') return hidden ? m.textOf('tabDocsOpenListHidden', { n: hidden }) : m.textOf('tabDocsOpenList');
    if (!m.openList) return m.textOf('moreOptions');
    return hidden ? m.textOf('tabDocsBarMenuHidden', { n: hidden }) : m.textOf('tabDocsBarMenu');
  }

  private scrollStrip(direction: 1 | -1): void {
    const row = this.parts.row;
    const width = boxOf(row).clientWidth;
    const smooth = mediaOf(row, '(prefers-reduced-motion: no-preference)');
    scrollBy(row, { start: direction * width * 0.8 }, smooth ? 'smooth' : 'auto');
  }

  /** The app's buttons, recreated only when `toolbarItems` is another function. */
  private appItems(): readonly ToolbarItem[] {
    const parts = this.parts;
    const make = parts.manager.toolbarItems;
    if (make !== parts.app.make) parts.app = { make, items: make ? untracked(() => make(this)) : [] };
    return parts.app.items;
  }

  private changed(): void {
    const parts = this.parts;
    untracked(() => {
      this.setProperty(
        'documents',
        parts.tabs.map((t) => t.document),
      );
      this.setProperty('activeDocument', parts.active?.document ?? null);
      this.setProperty(
        'recent',
        parts.recent.map((t) => t.document),
      );
    });
    const empty = !parts.tabs.length;
    mark(this, 'data-empty', empty);
    mark(parts.list, 'hidden', empty);
    mark(parts.empty, 'hidden', !empty);
    this.renderRoving();
  }

  private get parts(): Parts {
    return (this as unknown as { [PARTS]: Parts })[PARTS];
  }

  private createParts(manager: TabDocumentManager): Parts {
    this.class.add('mx-tabdocs__group');
    this.attr.add({ id: this.id, role: 'group' });
    mark(this, 'data-empty', true);
    // Child components go into their parent's element: core puts them there when the group is built.
    const bar = new Component<HTMLDivElement>('div');
    bar.class.add('mx-tabdocs__bar');
    const strip = part<HTMLDivElement>(bar, 'div', 'mx-tabdocs__strip');
    const list = part<HTMLDivElement>(strip, 'div', 'mx-tabdocs__tabs');
    list.attr.add({ role: 'tablist' });
    mark(list, 'hidden', true);
    const pinnedRow = part<HTMLDivElement>(list, 'div', 'mx-tabdocs__pinned');
    mark(pinnedRow, 'hidden', true);
    const row = part<HTMLDivElement>(list, 'div', 'mx-tabdocs__row');
    for (const c of [pinnedRow, row]) c.attr.add({ role: 'presentation' });
    // Both scroll buttons after the tabs: the pinned ones, which never scroll, stay at the start.
    const back = scrollButton(strip, 'back');
    const forward = scrollButton(strip, 'forward');
    const scrollbar = part<HTMLDivElement>(strip, 'div', 'mx-tabdocs__scrollbar');
    scrollbar.attr.add({ 'aria-hidden': 'true' });
    const thumb = part<HTMLDivElement>(scrollbar, 'div', 'mx-tabdocs__thumb');

    const split: ToolbarItem = {
      icon: () => splitMark(),
      hint: () => manager.textOf('tabDocsSplitRight'),
      // A tool in a dock area splits from its menu; its toolbar keeps to the tool's own buttons.
      visible: () => manager.groupActions && !this.dockArea,
      click: () => manager.splitByUser(this, 'right'),
    };
    const maximize: ToolbarItem = {
      icon: () => (this.isMaximized ? restoreMark() : maximizeMark()),
      hint: () => manager.textOf(this.isMaximized ? 'tabDocsRestore' : 'tabDocsMaximize'),
      visible: () => manager.groupActions && !this.window && !this.dockArea && (this.isMaximized || manager.canMaximize(this)),
      click: () => manager.toggleMaximizeByUser(this),
    };
    // A dock area's pin: folds the area to its edge, or brings it back. It stays in sight in a narrow area.
    const autoHide: ToolbarItem = {
      overflow: 'never',
      icon: () => pinMark(),
      hint: () => manager.textOf(this.dockArea?.autoHidden ? 'tabDocsAutoHideOff' : 'tabDocsAutoHide'),
      // On a tablet or a phone the area is in a drawer or a sheet already: nothing to fold.
      visible: () => manager.groupActions && !!this.dockArea && manager.mayAutoHide(this.dockArea) && manager.currentPresentation === 'desktop',
      click: () => manager.toggleAutoHideByUser(this),
    };
    // In a dock area: the active document closes, or hides when it may not close. It stays in sight next to the pin.
    const close: ToolbarItem = {
      overflow: 'never',
      icon: () => dismissMark(),
      hint: () => {
        const doc = this.activeDocument;
        return doc ? manager.textOf(doc.closable ? 'tabDocsCloseActive' : 'tabDocsHideActive', { title: doc.title }) : manager.textOf('close');
      },
      enabled: () => !!this.activeDocument && manager.mayCloseOrHide(this.activeDocument),
      visible: () => manager.groupActions && (!!this.dockArea || !!this.window),
      click: () => manager.closeActiveByUser(this),
    };
    // The window's own buttons, in the group whose strip is its title.
    const windowMaximize: ToolbarItem = {
      icon: () => (this.window?.isMaximized ? restoreMark() : maximizeMark()),
      hint: () => manager.textOf(this.window?.isMaximized ? 'tabDocsRestoreWindow' : 'tabDocsMaximizeWindow'),
      visible: () => manager.groupActions && !!this.getProperty('windowTitle'),
      click: () => manager.toggleWindowMaximizeByUser(this),
    };
    const windowClose: ToolbarItem = {
      icon: () => dismissMark(),
      hint: () => manager.textOf('tabDocsCloseWindow'),
      visible: () => manager.groupActions && !!this.getProperty('windowTitle'),
      click: () => manager.closeWindowByUser(this),
    };
    const lock: ToolbarItem = {
      icon: () => lockMark(),
      hint: () => manager.textOf('tabDocsUnlock'),
      visible: () => this.locked,
      click: () => manager.unlockByUser(this),
    };
    // Without scroll buttons it shows how many tabs are out of sight, in place of its mark (its size
    // stays: the room for the tabs does not change with the count). In a compact bar it also holds
    // the other buttons.
    const more: ToolbarItem = {
      icon: () => {
        const hidden = this.look().scrollButtons ? 0 : this.hiddenTabCount;
        return hidden ? countMark(hidden) : moreMark();
      },
      hint: () => this.moreText(),
      overflow: () => (this.isCompact ? 'never' : 'auto'),
      visible: () => manager.groupActions && (manager.openList || this.isCompact),
      click: () => manager.showOpenList(this),
    };
    const own = [split, maximize, lock, more, autoHide, close, windowMaximize, windowClose];
    const named: [TabBarButton, ToolbarItem][] = [
      ['split', split],
      ['maximize', maximize],
      ['lock', lock],
      ['autoHide', autoHide],
      ['close', close],
      ['maximizeWindow', windowMaximize],
      ['closeWindow', windowClose],
    ];
    // Its click starts "Move group to…"; it never folds into the toolbar's menu.
    const grip: ToolbarItem = {
      icon: () => gripMark(),
      hint: () => manager.textOf('tabDocsMoveGroupTo'),
      visible: () => manager.groupDragHandle && manager.allowDragGroups,
      overflow: 'never',
      click: () => manager.showMoveTo(this),
    };
    // A narrow group folds its buttons into the toolbar's "…" menu before it squeezes the tabs.
    const actions = new Toolbar({
      overflow: 'menu',
      label: () => manager.textOf('tabDocsGroupActions'),
    });
    actions.class.add('mx-tabdocs__actions');
    bar.controls.add(actions);

    const panels = new Component<HTMLDivElement>('div');
    panels.class.add('mx-tabdocs__panels');
    const empty = part<HTMLDivElement>(panels, 'div', 'mx-tabdocs__empty');
    const tips = new Component<HTMLDivElement>('div');
    tips.class.add('mx-tabdocs__tips');
    this.controls.add(bar, panels, tips);
    return {
      manager,
      bar,
      strip,
      list,
      pinnedRow,
      row,
      back,
      forward,
      scrollbar,
      thumb,
      panels,
      tips,
      empty,
      actions,
      own,
      named,
      autoHide,
      close,
      grip,
      app: { make: null, items: [] },
      more,
      tabs: [],
      active: null,
      recent: [],
      split: null,
      title: false,
      barClose: false,
      stopActiveWatch: null,
    };
  }

  private listen(): void {
    const parts = this.parts;
    const { list, bar, row, manager } = parts;
    this.motif.on('focusin', () => manager.groupFocused(this));
    list.motif.on('click', (_, e) => {
      // On a tablet the strip may hold the tabs of groups folded into this one.
      const tab = this.stripTabOfEvent(e);
      if (!tab) return;
      // A title whose bar has the close button shows none of its own.
      const own = !(parts.title && parts.barClose);
      if (own && tab.isCloseEvent(e)) {
        e.stopPropagation();
        void manager.closeByUser(tab.document);
      } else if (tab.isPinEvent(e)) {
        e.stopPropagation();
        manager.unpinByUser(tab.document);
      } else {
        manager.activateByUser(tab.document);
      }
    });
    list.motif.on('mousedown', (_, e) => {
      // The close button and the pin mark do not take focus from where it is.
      const tab = this.stripTabOfEvent(e);
      if (tab && (tab.isCloseEvent(e) || tab.isPinEvent(e))) e.preventDefault();
    });
    list.motif.on('auxclick', (_, e: MouseEvent) => {
      const tab = this.stripTabOfEvent(e);
      if (tab && e.button === 1) {
        e.preventDefault();
        void manager.closeByUser(tab.document);
      }
    });
    // A phone decides when the finger lands whether the page may scroll at once: the bar holds a
    // touchmove listener from the start, so a tab dragged after a long press can stop the scroll.
    bar.motif.on('touchmove', (_, e: TouchEvent | undefined) => e && manager.holdTouch(e));
    bar.motif.on('mousedown', (_, e) => {
      // A click on the empty strip leaves focus where it is (the page around would take it).
      if (this.isStripSpaceEvent(e)) e.preventDefault();
    });
    bar.motif.on('dblclick', (_, e) => {
      const tab = this.tabOfEvent(e);
      if (tab && !tab.isCloseEvent(e) && !tab.isPinEvent(e)) manager.tabDoubleClicked(this, tab.document);
      else if (!tab && this.isStripSpaceEvent(e)) manager.stripDoubleClicked(this);
    });
    row.motif.on('wheel', (_, e) => {
      // A plain mouse wheel scrolls the strip sideways, as the browser's own sideways wheel does.
      if (e.deltaX || !e.deltaY) return;
      const box = boxOf(row);
      if (box.scrollWidth <= box.clientWidth) return;
      e.preventDefault();
      scrollBy(row, { start: box.rtl ? -e.deltaY : e.deltaY });
    });
    row.motif.on('scroll', () => this.queueOverflow());
    parts.thumb.motif.on('pointerdown', (_, e) => this.dragThumb(e));
    for (const button of [parts.back, parts.forward]) {
      button.motif.on('mousedown', (_, e) => e.preventDefault());
      button.motif.on('click', () => this.scrollStrip(button === parts.forward ? 1 : -1));
    }
    list.motif.on('focusin', (_, e) => {
      const tab = this.stripTabOfEvent(e);
      if (tab) this.reveal(tab);
    });
    // A press on text or empty space in a panel moves no focus, yet the group is the one in use.
    parts.panels.motif.on('pointerdown:capture:passive', () => manager.groupFocused(this));
    // Before Tab moves focus: what the shown panel holds now (content may come later) decides whether it is a stop.
    this.motif.on('keydown:capture', (_, e) => {
      if (e.key === 'Tab') parts.active?.updatePanelFocus();
    });
    // The active tab stays in sight when the strip changes size.
    onLayout(row, 'size', () => this.stripResized(), { owner: this });
    // A toolbar with folded buttons keeps its size when the group grows: it unfolds them here.
    let width = -1;
    onLayout(
      bar,
      'size',
      (size) => {
        if (size.width === width) return;
        width = size.width;
        parts.actions.updateOverflow();
      },
      { owner: this },
    );
  }
}

/** An app's button that asks to stay in the toolbar. */
function staysOut(item: ToolbarItem): boolean {
  return givenField(item, 'overflow') === 'never';
}

/** Toolbar buttons as menu items: their names, icons, states and menus; a separator starts a group. */
function menuItemsOf(items: readonly ToolbarItem[], toolbar: Toolbar): MenuItem[] {
  const out: MenuItem[] = [];
  let group = false;
  for (const item of items) {
    const type = givenField<ToolbarItem['type']>(item, 'type') ?? 'button';
    if (type === 'separator') {
      group = out.length > 0;
      continue;
    }
    const field = <K extends keyof ToolbarItem>(name: K) => givenValue<ToolbarItem[K]>(item, name);
    const entry: MenuItem = {
      text: () => givenField<string | undefined>(item, 'text') || givenField<string | undefined>(item, 'hint') || '',
      icon: field('icon'),
      hint: field('hint'),
      tone: field('tone'),
      enabled: field('enabled'),
      visible: field('visible'),
      beginGroup: group,
      data: field('data'),
    };
    if (type === 'menu') entry.items = field('menu') ?? [];
    else entry.click = (e) => givenValue<ToolbarItem['click']>(item, 'click')?.({ item, source: toolbar, event: e.event });
    if (type === 'toggle') entry.checked = () => !!givenField(item, 'pressed');
    out.push(entry);
    group = false;
  }
  return out;
}

/** How many tabs are out of sight, as `+2`. */
function countMark(count: number): Component<HTMLSpanElement> {
  const mark = loose<HTMLSpanElement>('span', 'mx-tabdocs__count');
  text(mark, `+${count}`);
  return mark;
}

function scrollButton(strip: Component<HTMLDivElement>, direction: 'back' | 'forward'): Component<HTMLSpanElement> {
  // The arrow keys reach every tab, so these are for the pointer only.
  const button = part<HTMLSpanElement>(strip, 'span', 'mx-tabdocs__scroll');
  button.attr.add({ 'data-direction': direction, 'aria-hidden': 'true' });
  glyphPart(button, 'chevron-down');
  return button;
}

/**
 * Makes `parent`'s headers `wanted`, in order, moving only what is out of place (never the focused one). A header no
 * longer here is taken out alive: it belongs to its tab, which goes on in another strip or is disposed.
 */
function syncChildren(parent: Component<HTMLDivElement>, wanted: readonly TabHeader[]): void {
  const keep = new Set<unknown>(wanted);
  for (const c of [...parent.controls.items]) if (!keep.has(c)) parent.controls.silentDetach(c);
  orderControls(parent, wanted);
}
