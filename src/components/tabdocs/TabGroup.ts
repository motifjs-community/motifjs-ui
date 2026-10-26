import { Component, effect, read, Transporter, untracked, type Bind } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { deepActiveElement, isShown } from '../../core/focus';
import { chevronDown, dismissMark, gripMark, lockMark, maximizeMark, moreMark, pinMark, restoreMark, splitMark } from '../../core/glyphs';
import { nextId } from '../../core/next-id';
import { isElement, isNode } from '../../core/node-kind';
import { ResizeWatch } from '../../core/resize-watch';
import type { MenuItem } from '../../parts/menu/menu-item';
import { followPointer } from '../../parts/window/follow-pointer';
import { Toolbar } from '../toolbar/Toolbar';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { DocumentTab } from './DocumentTab';
import { keepScroll } from './keep-scroll';
import { placeNode } from './place-node';
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
  strip: HTMLDivElement;
  list: HTMLDivElement;
  pinnedRow: HTMLDivElement;
  /** The other tabs; it scrolls when they do not fit. */
  row: HTMLDivElement;
  back: HTMLSpanElement;
  forward: HTMLSpanElement;
  /** Without scroll buttons: a thin scrollbar over the tabs while the pointer is over the strip. */
  scrollbar: HTMLDivElement;
  thumb: HTMLDivElement;
  panels: Component<HTMLDivElement>;
  tips: Component<HTMLDivElement>;
  empty: HTMLDivElement;
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
  overflowQueued: boolean;
  /** Watches the strip and the active tab (a late font changes its width): the active tab stays in sight. */
  resize: ResizeWatch | null;
}

const PARTS = Symbol('mx.tab-group');

const NONE: readonly TabDocument[] = [];

const ALL_SIDES: readonly TabDropSide[] = ['center', 'left', 'right', 'up', 'down'];

/** What `'auto'` keeps: a dock area its pin and close button, a floating window its own close button. */
const AREA_BUTTONS: readonly TabBarButton[] = ['autoHide', 'close'];
const WINDOW_BUTTONS: readonly TabBarButton[] = ['closeWindow'];

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
 * A group of a `TabDocumentManager`: a strip of tabs and the active document's content under it.
 * The manager makes and closes groups (`split`, `closeGroup`); a group is a container, so focus
 * comes back to where it was when the group is focused again. Pinned tabs come first, in a row of
 * their own when the manager says so.
 */
export class TabGroup extends FocusContainer<HTMLDivElement> {
  constructor(manager: TabDocumentManager) {
    super('div', {});
    const self = this as unknown as { [PARTS]?: Parts };
    const parts = (self[PARTS] = this.createParts(manager));
    // The items read the group, so they come once its parts are in place. A compact bar keeps the
    // buttons it names and the app's that ask to stay; the others are in the "…" menu.
    parts.actions.items = () => {
      const app = [...this.appItems(), ...(this.activeDocument?.actions ?? [])];
      const kept = this.look().buttons;
      if (kept === 'all') return [parts.grip, ...app, ...parts.own];
      const named = new Map(parts.named.map(([name, item]) => [item, name]));
      return [parts.grip, ...app.filter(staysOut), ...parts.own.filter((item) => !named.has(item) || kept.includes(named.get(item)!))];
    };
    this.listen();
    const stopLook = effect(() => {
      const look = this.look();
      const title = look.singleTabTitle && this.documents.length === 1;
      const close = manager.groupActions && (!!this.dockArea || !!this.window) && (look.buttons === 'all' || look.buttons.includes('close'));
      untracked(() => this.renderLook(look, title, close));
    });
    this.motif.setDisposable(stopLook);
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
  /** The documents, in strip order: the pinned ones first. Reactive. */
  get documents(): readonly TabDocument[] {
    return this.getProperty<readonly TabDocument[] | undefined>('documents') ?? NONE;
  }
  /** Reactive. */
  get activeDocument(): TabDocument | null {
    return this.getProperty<TabDocument | null | undefined>('activeDocument') ?? null;
  }
  /** The documents, the one used last first. Reactive. */
  get recentDocuments(): readonly TabDocument[] {
    return this.getProperty<readonly TabDocument[] | undefined>('recent') ?? NONE;
  }
  /** The preview document, if the group has one. Reactive. */
  get previewDocument(): TabDocument | null {
    return this.documents.find((d) => d.preview) ?? null;
  }
  /**
   * A locked group takes no documents opened without naming it. Set it through `lock()` and
   * `unlock()` to be asked and told. Reactive.
   */
  get locked(): boolean {
    return !!this.getProperty<boolean>('locked');
  }
  set locked(value: Bind<boolean>) {
    this.assignProperty('locked', value, Boolean);
  }
  /** Dragged documents and groups may be dropped into it and beside it. Default `true`. Reactive. */
  get allowDrop(): boolean {
    return this.getProperty<boolean | undefined>('allowDrop') !== false;
  }
  set allowDrop(value: Bind<boolean>) {
    this.assignProperty('allowDrop', value, Boolean);
  }
  /** Where a drop on its content may go, over the manager's `dropSides`; `null` follows the manager. Reactive. */
  get dropSides(): readonly TabDropSide[] | null {
    return this.getProperty<readonly TabDropSide[] | null | undefined>('dropSides') ?? null;
  }
  set dropSides(value: Bind<readonly TabDropSide[] | null>) {
    this.assignProperty('dropSides', value);
  }
  /** Whether it is the manager's active group. Reactive. */
  get isActive(): boolean {
    return !!this.getProperty<boolean>('isActive');
  }
  /** Reactive. */
  get isMaximized(): boolean {
    return !!this.getProperty<boolean>('isMaximized');
  }
  get isEmpty(): boolean {
    return this.documents.length === 0;
  }
  /** The floating window it is in, `null` elsewhere. Reactive. */
  get window(): TabWindow | null {
    return this.getProperty<TabWindow | null | undefined>('window') ?? null;
  }
  /** The dock area it is in, `null` elsewhere. Reactive. */
  get dockArea(): TabDockArea | null {
    return this.getProperty<TabDockArea | null | undefined>('dockArea') ?? null;
  }
  /** The new browser window it is in, `null` in the main window. Reactive. */
  get browserWindow(): TabBrowserWindow | null {
    return this.getProperty<TabBrowserWindow | null | undefined>('browserWindow') ?? null;
  }
  /** Its place in the manager's `groups`, from 0. Reactive. */
  get index(): number {
    return this.manager.groups.indexOf(this);
  }
  /** How many of its tabs are not fully in sight in the strip now. Reactive. */
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

  /** Closes its documents, then the group. */
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

  /** Makes it the active group and focuses what had focus in it last. */
  override focus(): boolean {
    return this.manager.focusGroup(this);
  }

  protected override get focusElement(): HTMLElement {
    const parts = (this as unknown as { [PARTS]?: Parts })[PARTS];
    return parts?.active?.header ?? parts?.list ?? this.element;
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
  get listElement(): HTMLDivElement {
    return this.parts.list;
  }
  /** @internal The strip and the toolbar. */
  get barElement(): HTMLDivElement {
    return this.parts.bar.element;
  }
  /** @internal The row of the tabs that are not pinned: it scrolls. */
  get rowElement(): HTMLDivElement {
    return this.parts.row;
  }
  /** @internal Where the content shows. */
  get panelsElement(): HTMLDivElement {
    return this.parts.panels.element;
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
      const app = [...this.appItems(), ...(this.activeDocument?.actions ?? [])].filter((item) => !staysOut(item));
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
  get moreButton(): HTMLElement | null {
    const control = this.parts.actions.controlOf(this.parts.more);
    return control?.element.isConnected && isShown(control.element) ? control.element : null;
  }

  /** @internal Puts a tab (and its panel) in at `index`; pinned tabs stay first. */
  addTab(tab: DocumentTab, index: number): void {
    const parts = this.parts;
    const at = Math.max(0, Math.min(index, parts.tabs.length));
    parts.tabs.splice(at, 0, tab);
    parts.recent.push(tab);
    // Core moves the panel with appendChild: what scrolled inside it would start at the top again.
    if (tab.panel.parent) keepScroll(tab.panel.element, () => Transporter.transport(tab.panel, parts.panels));
    else parts.panels.controls.add(tab.panel);
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
    if (parts.active === tab) parts.active = null;
    tab.header.remove();
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
      const focus = deepActiveElement(this.element);
      const had = parts.tabs.find((t) => t.header === focus);
      syncChildren(
        parts.pinnedRow,
        pinned.map((t) => t.header),
      );
      syncChildren(
        parts.row,
        parts.tabs.filter((t) => !pinned.includes(t)).map((t) => t.header),
      );
      parts.pinnedRow.hidden = !pinned.length;
      if (had && deepActiveElement(this.element) !== had.header) had.header.focus({ preventScroll: true });
    });
    this.changed();
    this.queueOverflow();
  }

  /** @internal Shows a tab's panel and hides the one shown before. */
  showTab(tab: DocumentTab | null): void {
    const parts = this.parts;
    const previous = parts.active;
    if (previous && previous !== tab) {
      previous.show(false);
      parts.resize?.unobserve(previous.header);
    }
    parts.active = tab;
    if (tab) parts.resize?.observe(tab.header);
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
    this.element.toggleAttribute('data-floating', !!window);
    if (area) this.element.dataset.dock = area.side;
    else this.element.removeAttribute('data-dock');
  }

  /** @internal */
  markActive(on: boolean): void {
    this.element.toggleAttribute('data-active', on);
    this.setProperty('isActive', on);
  }

  /** @internal */
  markMaximized(on: boolean): void {
    this.element.toggleAttribute('data-maximized', on);
    this.setProperty('isMaximized', on);
  }

  /** @internal The texts that carry the group's number. */
  renderTexts(number: number): void {
    const manager = this.manager;
    const locked = untracked(() => this.locked);
    this.element.toggleAttribute('data-locked', locked);
    this.element.setAttribute('aria-label', manager.textOf(locked ? 'tabDocsLockState' : 'tabDocsGroup', { n: number }));
    this.parts.list.setAttribute('aria-label', manager.textOf('tabDocsTabs', { n: number }));
    this.parts.actions.controlOf(this.parts.grip)?.element.classList.add('mx-tabdocs__grip');
    this.parts.actions.controlOf(this.parts.autoHide)?.element.classList.add('mx-tabdocs__auto-hide');
    this.parts.actions.controlOf(this.parts.close)?.element.classList.add('mx-tabdocs__bar-close');
    this.parts.empty.textContent = manager.textOf('tabDocsEmpty');
  }

  /** @internal The tab whose header holds `target`. */
  tabOf(target: EventTarget | null): DocumentTab | undefined {
    const header = isElement(target) ? target.closest('.mx-tabdocs__tab') : null;
    return header ? this.parts.tabs.find((t) => t.header === header) : undefined;
  }

  /** @internal Whether `target` is on the group's drag handle. */
  isGrip(target: EventTarget | null): boolean {
    const control = this.parts.actions.controlOf(this.parts.grip);
    return isNode(target) && !!control?.element.contains(target);
  }

  /** @internal Whether `target` is the strip's empty room: in the bar, not on a tab or a toolbar button. */
  isStripSpace(target: EventTarget | null): boolean {
    const parts = this.parts;
    if (!isElement(target) || !parts.bar.element.contains(target) || this.tabOf(target) || parts.scrollbar.contains(target)) return false;
    return !parts.actions.element.contains(target) || target === parts.actions.element;
  }

  /** @internal Scrolls the strip, not the page, so that a tab is in sight. */
  reveal(tab: DocumentTab): void {
    const row = this.parts.row;
    const header = tab.header;
    if (!row.isConnected || header.parentElement !== row) return;
    const room = row.getBoundingClientRect();
    const box = header.getBoundingClientRect();
    // A tab wider than the room shows its start.
    if (box.left < room.left || box.width > room.width) row.scrollLeft += box.left - room.left;
    else if (box.right > room.right) row.scrollLeft += box.right - room.right;
  }

  /** @internal The roving tab stop: the active tab. */
  renderRoving(): void {
    const parts = this.parts;
    for (const tab of parts.tabs) tab.header.tabIndex = tab === parts.active ? 0 : -1;
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
    parts.active = null;
    this.changed();
  }

  /** @internal Shows the scroll buttons when the tabs do not fit, each dimmed at its end. */
  queueOverflow(): void {
    const parts = this.parts;
    if (parts.overflowQueued) return;
    parts.overflowQueued = true;
    queueMicrotask(() => {
      parts.overflowQueued = false;
      if (!this.isDisposed) this.renderOverflow();
    });
  }

  private renderOverflow(): void {
    const { row, strip, back, forward } = this.parts;
    const needed = row.scrollWidth;
    const room = row.clientWidth;
    const over = needed > room + 1;
    strip.toggleAttribute('data-overflow', over);
    const position = Math.abs(row.scrollLeft);
    back.toggleAttribute('data-end', position <= 1);
    forward.toggleAttribute('data-end', position + room >= needed - 1);
    let hidden = 0;
    if (over) {
      const box = row.getBoundingClientRect();
      for (const header of Array.from(row.children)) {
        const b = header.getBoundingClientRect();
        if (b.left < box.left - 1 || b.right > box.right + 1) hidden++;
      }
      this.placeThumb(box, needed, room, position);
    }
    if (hidden !== untracked(() => this.hiddenTabCount)) untracked(() => this.setProperty('hiddenTabs', hidden));
  }

  /** The thin scrollbar: along the tabs that scroll, its thumb as long as the share in sight. */
  private placeThumb(box: DOMRect, needed: number, room: number, position: number): void {
    const { strip, scrollbar } = this.parts;
    const outer = strip.getBoundingClientRect();
    const size = Math.min(1, room / needed);
    const style = scrollbar.style;
    style.setProperty('--_track-start', `${Math.round(isRtl(strip) ? outer.right - box.right : box.left - outer.left)}px`);
    style.setProperty('--_track-size', `${Math.round(box.width)}px`);
    style.setProperty('--_thumb-size', `${(size * 100).toFixed(2)}%`);
    style.setProperty('--_thumb-at', `${((Math.min(position, needed - room) / (needed - room)) * (1 - size) * 100).toFixed(2)}%`);
  }

  /** The thumb is dragged: the strip follows, as far as the tabs go for each pixel of the track. */
  private dragThumb(e: PointerEvent): void {
    const { row, scrollbar, thumb } = this.parts;
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const start = row.scrollLeft;
    const ratio = row.scrollWidth / Math.max(1, row.clientWidth);
    scrollbar.toggleAttribute('data-dragging', true);
    followPointer(
      thumb,
      e,
      (dx) => (row.scrollLeft = start + dx * ratio),
      () => scrollbar.removeAttribute('data-dragging'),
    );
  }

  /** What its bar follows now: its dock area's or window's own settings, else the manager's (`compact…` there). Reactive. */
  private look(): BarLook {
    const m = this.manager;
    const own = this.dockArea ?? this.window;
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
    const el = this.element;
    el.dataset.tabSize = look.tabSize;
    el.style.setProperty('--_tab-min', `${look.tabMinWidth}px`);
    el.toggleAttribute('data-scroll-buttons', look.scrollButtons);
    el.toggleAttribute('data-compact', look.buttons !== 'all');
    el.toggleAttribute('data-title', title);
    el.toggleAttribute('data-bar-close', close);
    el.dataset.barSize = look.buttonSize;
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

  private scrollBy(direction: 1 | -1): void {
    const row = this.parts.row;
    const view = row.ownerDocument.defaultView;
    const smooth = !!view && !view.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const rtl = view?.getComputedStyle(row).direction === 'rtl';
    row.scrollBy({ left: direction * (rtl ? -1 : 1) * row.clientWidth * 0.8, behavior: smooth ? 'smooth' : 'auto' });
  }

  /** The app's buttons, made again only when `toolbarItems` is another function. */
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
    this.element.toggleAttribute('data-empty', empty);
    parts.list.hidden = empty;
    parts.empty.hidden = !empty;
    this.renderRoving();
  }

  private get parts(): Parts {
    return (this as unknown as { [PARTS]: Parts })[PARTS];
  }

  private createParts(manager: TabDocumentManager): Parts {
    const el = this.element;
    const doc = el.ownerDocument;
    el.classList.add('mx-tabdocs__group');
    el.id = nextId('tabdocs-group');
    el.setAttribute('role', 'group');
    el.toggleAttribute('data-empty', true);
    // Child components go into their parent's element: core puts them there when the group is built.
    const bar = new Component<HTMLDivElement>('div');
    bar.element.className = 'mx-tabdocs__bar';
    const strip = div(doc, 'mx-tabdocs__strip');
    const list = div(doc, 'mx-tabdocs__tabs');
    list.setAttribute('role', 'tablist');
    list.hidden = true;
    const pinnedRow = div(doc, 'mx-tabdocs__pinned');
    pinnedRow.hidden = true;
    const row = div(doc, 'mx-tabdocs__row');
    for (const part of [pinnedRow, row]) part.setAttribute('role', 'presentation');
    list.append(pinnedRow, row);
    const back = scrollButton(doc, 'back');
    const forward = scrollButton(doc, 'forward');
    const scrollbar = div(doc, 'mx-tabdocs__scrollbar');
    scrollbar.setAttribute('aria-hidden', 'true');
    const thumb = div(doc, 'mx-tabdocs__thumb');
    scrollbar.append(thumb);
    // Both scroll buttons after the tabs: the pinned ones, which never scroll, stay at the start.
    strip.append(list, back, forward, scrollbar);
    bar.element.append(strip);

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
      visible: () => manager.groupActions && !!this.dockArea && manager.mayAutoHide(this.dockArea),
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
        return hidden ? countMark(this.element.ownerDocument, hidden) : moreMark();
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
      size: 'sm',
      overflow: 'menu',
      label: () => manager.textOf('tabDocsGroupActions'),
    });
    actions.element.classList.add('mx-tabdocs__actions');
    bar.controls.add(actions);

    const panels = new Component<HTMLDivElement>('div');
    panels.element.className = 'mx-tabdocs__panels';
    const empty = div(doc, 'mx-tabdocs__empty');
    panels.element.append(empty);
    const tips = new Component<HTMLDivElement>('div');
    tips.element.className = 'mx-tabdocs__tips';
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
      overflowQueued: false,
      resize: null,
    };
  }

  private listen(): void {
    const parts = this.parts;
    const { list, row, bar, manager } = parts;
    this.element.addEventListener('focusin', () => manager.groupFocused(this));
    list.addEventListener('click', (e) => {
      const tab = this.tabOf(e.target);
      if (!tab) return;
      const target = e.target as Element;
      // A title whose bar has the close button shows none of its own.
      const own = !this.element.matches('[data-title][data-bar-close]');
      if (own && target.closest('.mx-tabdocs__close')) {
        e.stopPropagation();
        void manager.closeByUser(tab.document);
      } else if (target.closest('.mx-tabdocs__pin')) {
        e.stopPropagation();
        manager.unpinByUser(tab.document);
      } else {
        manager.activateByUser(tab.document);
      }
    });
    list.addEventListener('mousedown', (e) => {
      // The close button and the pin mark do not take focus from where it is.
      if ((e.target as Element).closest('.mx-tabdocs__close, .mx-tabdocs__pin')) e.preventDefault();
    });
    list.addEventListener('auxclick', (e) => {
      const tab = this.tabOf(e.target);
      if (tab && e.button === 1) {
        e.preventDefault();
        void manager.closeByUser(tab.document);
      }
    });
    // A phone decides when the finger lands whether the page may scroll at once: the bar holds a
    // touchmove listener from the start, so a tab dragged after a long press can stop the scroll.
    bar.element.addEventListener('touchmove', (e) => manager.holdTouch(e), { passive: false });
    bar.element.addEventListener('mousedown', (e) => {
      // A press on the empty strip leaves focus where it is (the page around would take it).
      if (this.isStripSpace(e.target)) e.preventDefault();
    });
    bar.element.addEventListener('dblclick', (e) => {
      const tab = this.tabOf(e.target);
      if (tab && !(e.target as Element).closest('.mx-tabdocs__close, .mx-tabdocs__pin')) manager.tabDoubleClicked(this, tab.document);
      else if (!tab && this.isStripSpace(e.target)) manager.stripDoubleClicked(this);
    });
    row.addEventListener(
      'wheel',
      (e) => {
        // A plain mouse wheel scrolls the strip sideways.
        if (e.deltaX || !e.deltaY || row.scrollWidth <= row.clientWidth) return;
        e.preventDefault();
        row.scrollLeft += e.deltaY;
      },
      { passive: false },
    );
    row.addEventListener('scroll', () => this.renderOverflow());
    parts.thumb.addEventListener('pointerdown', (e) => this.dragThumb(e));
    for (const button of [parts.back, parts.forward]) {
      button.addEventListener('mousedown', (e) => e.preventDefault());
      button.addEventListener('click', () => this.scrollBy(button === parts.forward ? 1 : -1));
    }
    list.addEventListener('focusin', (e) => {
      const tab = this.tabOf(e.target);
      if (tab) this.reveal(tab);
    });
    parts.panels.element.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      const tab = parts.tabs.find((t) => t.panel.element.contains(target));
      if (tab && target !== tab.panel.element) tab.lastFocus = target;
    });
    const view = this.element.ownerDocument.defaultView;
    if (view && typeof view.MutationObserver === 'function') {
      // Content that comes and goes in the shown panel decides whether the panel takes focus.
      const observer = new view.MutationObserver(() => parts.active?.updatePanelFocus());
      observer.observe(parts.panels.element, { childList: true, subtree: true });
      this.motif.setDisposable(() => observer.disconnect());
    }
    if (view && typeof view.ResizeObserver === 'function') {
      // Watches that follow the group into a new browser window.
      const observer = (parts.resize = new ResizeWatch(() => {
        if (parts.active) this.reveal(parts.active);
        this.renderOverflow();
      }));
      observer.observe(row);
      // A toolbar with folded buttons keeps its size when the group grows: it unfolds them here.
      let width = -1;
      const bar = new ResizeWatch(() => {
        const now = parts.bar.element.clientWidth;
        if (now === width) return;
        width = now;
        parts.actions.updateOverflow();
      });
      bar.observe(parts.bar.element);
      this.motif.setDisposable(() => {
        observer.disconnect();
        bar.disconnect();
      });
    }
  }
}

function div(doc: Document, className: string): HTMLDivElement {
  const el = doc.createElement('div');
  el.className = className;
  return el;
}

function isRtl(el: Element): boolean {
  const view = el.ownerDocument.defaultView;
  return !!view && view.getComputedStyle(el).direction === 'rtl';
}

/** An app's button that asks to stay in the toolbar. */
function staysOut(item: ToolbarItem): boolean {
  return read(item.overflow) === 'never';
}

/** Toolbar buttons as menu items: their names, icons, states and menus; a separator starts a group. */
function menuItemsOf(items: readonly ToolbarItem[], toolbar: Toolbar): MenuItem[] {
  const out: MenuItem[] = [];
  let group = false;
  for (const item of items) {
    const type = read(item.type) ?? 'button';
    if (type === 'separator') {
      group = out.length > 0;
      continue;
    }
    const entry: MenuItem = {
      text: () => read(item.text) || read(item.hint) || '',
      icon: item.icon,
      hint: item.hint,
      tone: item.tone,
      enabled: item.enabled,
      visible: item.visible,
      beginGroup: group,
      data: item.data,
    };
    if (type === 'menu') entry.items = item.menu ?? [];
    else entry.click = (e) => item.click?.({ item, source: toolbar, event: e.event });
    if (type === 'toggle') entry.checked = () => !!read(item.pressed);
    out.push(entry);
    group = false;
  }
  return out;
}

/** How many tabs are out of sight, as `+2`. */
function countMark(doc: Document, count: number): HTMLSpanElement {
  const mark = doc.createElement('span');
  mark.className = 'mx-tabdocs__count';
  mark.textContent = `+${count}`;
  return mark;
}

function scrollButton(doc: Document, direction: 'back' | 'forward'): HTMLSpanElement {
  // The arrow keys reach every tab, so these are for the pointer only.
  const button = doc.createElement('span');
  button.className = 'mx-tabdocs__scroll';
  button.dataset.direction = direction;
  button.setAttribute('aria-hidden', 'true');
  button.append(chevronDown());
  return button;
}

/** Makes `parent`'s children `wanted`, in order, moving only what is out of place. */
function syncChildren(parent: HTMLElement, wanted: readonly HTMLElement[]): void {
  wanted.forEach((el, i) => {
    const at = parent.children[i] ?? null;
    if (at !== el) placeNode(parent, el, at);
  });
  while (parent.children.length > wanted.length) parent.lastElementChild!.remove();
}
