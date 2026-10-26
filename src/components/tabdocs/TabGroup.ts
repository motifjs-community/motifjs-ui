import { Component, Transporter, untracked, type Bind } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { deepActiveElement } from '../../core/focus';
import { chevronDown, lockMark, maximizeMark, moreMark, restoreMark, splitMark } from '../../core/glyphs';
import { nextId } from '../../core/next-id';
import { Toolbar } from '../toolbar/Toolbar';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { DocumentTab } from './DocumentTab';
import { placeNode } from './place-node';
import type { SplitDirection } from './split-direction';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabOpenOptions } from './tab-open-options';
import type { TabToolbarItems } from './tab-toolbar-items';
import type { TabSplit } from './TabSplit';

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
  panels: Component<HTMLDivElement>;
  tips: Component<HTMLDivElement>;
  empty: HTMLDivElement;
  actions: Toolbar;
  /** The built-in toolbar buttons: split, maximize, the lock mark, "…". */
  own: ToolbarItem[];
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
  resize: ResizeObserver | null;
}

const PARTS = Symbol('mx.tab-group');

const NONE: readonly TabDocument[] = [];

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
    // The items read the group, so they come once its parts are in place.
    parts.actions.items = () => [...this.appItems(), ...(this.activeDocument?.actions ?? []), ...parts.own];
    this.listen();
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
  /** Its place in the manager's `groups`, from 0. Reactive. */
  get index(): number {
    return this.manager.groups.indexOf(this);
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
  /** @internal The "…" button, while it is shown. */
  get moreButton(): HTMLElement | null {
    const control = this.parts.actions.controlOf(this.parts.more);
    return control?.element.isConnected ? control.element : null;
  }

  /** @internal Puts a tab (and its panel) in at `index`; pinned tabs stay first. */
  addTab(tab: DocumentTab, index: number): void {
    const parts = this.parts;
    const at = Math.max(0, Math.min(index, parts.tabs.length));
    parts.tabs.splice(at, 0, tab);
    parts.recent.push(tab);
    if (tab.panel.parent) Transporter.transport(tab.panel, parts.panels);
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
      const focus = deepActiveElement();
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
      if (had && deepActiveElement() !== had.header) had.header.focus({ preventScroll: true });
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
    this.parts.empty.textContent = manager.textOf('tabDocsEmpty');
  }

  /** @internal The tab whose header holds `target`. */
  tabOf(target: EventTarget | null): DocumentTab | undefined {
    const header = target instanceof Element ? target.closest('.mx-tabdocs__tab') : null;
    return header ? this.parts.tabs.find((t) => t.header === header) : undefined;
  }

  /** @internal Whether `target` is the strip's empty room: in the bar, not on a tab or a toolbar button. */
  isStripSpace(target: EventTarget | null): boolean {
    const parts = this.parts;
    if (!(target instanceof Element) || !parts.bar.element.contains(target) || this.tabOf(target)) return false;
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
    strip.toggleAttribute('data-overflow', needed > room + 1);
    const position = Math.abs(row.scrollLeft);
    back.toggleAttribute('data-end', position <= 1);
    forward.toggleAttribute('data-end', position + room >= needed - 1);
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
    // Both scroll buttons after the tabs: the pinned ones, which never scroll, stay at the start.
    strip.append(list, back, forward);
    bar.element.append(strip);

    const split: ToolbarItem = {
      icon: () => splitMark(),
      hint: () => manager.textOf('tabDocsSplitRight'),
      visible: () => manager.groupActions,
      click: () => manager.splitByUser(this, 'right'),
    };
    const maximize: ToolbarItem = {
      icon: () => (this.isMaximized ? restoreMark() : maximizeMark()),
      hint: () => manager.textOf(this.isMaximized ? 'tabDocsRestore' : 'tabDocsMaximize'),
      visible: () => manager.groupActions && (this.isMaximized || manager.groups.length > 1),
      click: () => manager.toggleMaximizeByUser(this),
    };
    const lock: ToolbarItem = {
      icon: () => lockMark(),
      hint: () => manager.textOf('tabDocsUnlock'),
      visible: () => this.locked,
      click: () => manager.unlockByUser(this),
    };
    const more: ToolbarItem = {
      icon: () => moreMark(),
      hint: () => manager.textOf('tabDocsOpenList'),
      visible: () => manager.groupActions && manager.openList,
      click: () => manager.showOpenList(this),
    };
    const own = [split, maximize, lock, more];
    const actions = new Toolbar({
      size: 'sm',
      overflow: 'scroll',
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
      panels,
      tips,
      empty,
      actions,
      own,
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
      if (target.closest('.mx-tabdocs__close')) {
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
      const observer = (parts.resize = new view.ResizeObserver(() => {
        if (parts.active) this.reveal(parts.active);
        this.renderOverflow();
      }));
      observer.observe(row);
      this.motif.setDisposable(() => observer.disconnect());
    }
  }
}

function div(doc: Document, className: string): HTMLDivElement {
  const el = doc.createElement('div');
  el.className = className;
  return el;
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
