import { Component, effect, Transporter, untracked, type Bind } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { maximizeMark, restoreMark, splitMark } from '../../core/glyphs';
import { nextId } from '../../core/next-id';
import { Toolbar } from '../toolbar/Toolbar';
import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { DocumentTab } from './DocumentTab';
import type { SplitDirection } from './split-direction';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabOpenOptions } from './tab-open-options';
import type { TabSplit } from './TabSplit';

interface Parts {
  manager: TabDocumentManager;
  bar: Component<HTMLDivElement>;
  list: HTMLDivElement;
  panels: Component<HTMLDivElement>;
  tips: Component<HTMLDivElement>;
  empty: HTMLDivElement;
  actions: Toolbar;
  tabs: DocumentTab[];
  active: DocumentTab | null;
  /** The tabs, the one used last first. */
  recent: DocumentTab[];
  split: TabSplit | null;
}

const PARTS = Symbol('mx.tab-group');

const NONE: readonly TabDocument[] = [];

/**
 * A group of a `TabDocumentManager`: a strip of tabs and the active document's content under it.
 * The manager makes and closes groups (`split`, `closeGroup`); a group is a container, so focus
 * comes back to where it was when the group is focused again.
 */
export class TabGroup extends FocusContainer<HTMLDivElement> {
  constructor(manager: TabDocumentManager) {
    super('div', {});
    const self = this as unknown as { [PARTS]?: Parts };
    self[PARTS] = this.createParts(manager);
    this.listen();
  }

  get manager(): TabDocumentManager {
    return this.parts.manager;
  }
  /** The documents, in strip order. Reactive. */
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
  /** A locked group takes no documents opened without naming it. */
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
  /** @internal The element the tabs are in. */
  get listElement(): HTMLDivElement {
    return this.parts.list;
  }

  /** @internal Puts a tab (and its panel) in at `index`. */
  addTab(tab: DocumentTab, index: number): void {
    const parts = this.parts;
    const at = Math.max(0, Math.min(index, parts.tabs.length));
    parts.list.insertBefore(tab.header, parts.tabs[at]?.header ?? null);
    parts.tabs.splice(at, 0, tab);
    parts.recent.push(tab);
    if (tab.panel.parent) Transporter.transport(tab.panel, parts.panels);
    else parts.panels.controls.add(tab.panel);
    tab.group = this;
    tab.attachTooltip(parts.tips);
    this.changed();
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

  /** @internal Moves a tab to `index` in the strip. */
  moveTab(tab: DocumentTab, index: number): void {
    const parts = this.parts;
    const from = parts.tabs.indexOf(tab);
    if (from < 0) return;
    parts.tabs.splice(from, 1);
    const at = Math.max(0, Math.min(index, parts.tabs.length));
    parts.tabs.splice(at, 0, tab);
    parts.list.insertBefore(tab.header, parts.tabs[at + 1]?.header ?? null);
    this.changed();
  }

  /** @internal Shows a tab's panel and hides the one shown before. */
  showTab(tab: DocumentTab | null): void {
    const parts = this.parts;
    const previous = parts.active;
    if (previous && previous !== tab) previous.show(false);
    parts.active = tab;
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
    this.element.setAttribute('aria-label', manager.textOf('tabDocsGroup', { n: number }));
    this.parts.list.setAttribute('aria-label', manager.textOf('tabDocsTabs', { n: number }));
    this.parts.empty.textContent = manager.textOf('tabDocsEmpty');
  }

  /** @internal The tab whose header holds `target`. */
  tabOf(target: EventTarget | null): DocumentTab | undefined {
    const header = target instanceof Element ? target.closest('.mx-tabdocs__tab') : null;
    return header ? this.parts.tabs.find((t) => t.header === header) : undefined;
  }

  /** @internal Scrolls the strip, not the page, so that a tab is in sight. */
  reveal(tab: DocumentTab): void {
    const list = this.parts.list;
    const header = tab.header;
    if (!list.isConnected || header.parentElement !== list) return;
    const room = list.getBoundingClientRect();
    const box = header.getBoundingClientRect();
    if (box.left < room.left) list.scrollLeft += box.left - room.left;
    else if (box.right > room.right) list.scrollLeft += box.right - room.right;
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
    const list = doc.createElement('div');
    list.className = 'mx-tabdocs__tabs';
    list.setAttribute('role', 'tablist');
    list.hidden = true;
    bar.element.append(list);

    const split: ToolbarItem = { icon: () => splitMark(), hint: () => manager.textOf('tabDocsSplitRight'), click: () => manager.splitByUser(this, 'right') };
    const maximize: ToolbarItem = {
      icon: () => (this.isMaximized ? restoreMark() : maximizeMark()),
      hint: () => manager.textOf(this.isMaximized ? 'tabDocsRestore' : 'tabDocsMaximize'),
      click: () => manager.toggleMaximizeByUser(this),
    };
    // The item list itself changes, not an item's `visible`: a control hidden before it is built would show.
    const actions = new Toolbar({
      size: 'sm',
      overflow: 'scroll',
      label: () => manager.textOf('tabDocsGroupActions'),
      items: () => (this.isMaximized || manager.groups.length > 1 ? [split, maximize] : [split]),
    });
    actions.element.classList.add('mx-tabdocs__actions');
    bar.controls.add(actions);
    const stopActions = effect(() => {
      const on = manager.groupActions;
      untracked(() => (actions.element.hidden = !on));
    });
    this.motif.setDisposable(stopActions);

    const panels = new Component<HTMLDivElement>('div');
    panels.element.className = 'mx-tabdocs__panels';
    const empty = doc.createElement('div');
    empty.className = 'mx-tabdocs__empty';
    panels.element.append(empty);
    const tips = new Component<HTMLDivElement>('div');
    tips.element.className = 'mx-tabdocs__tips';
    this.controls.add(bar, panels, tips);
    return { manager, bar, list, panels, tips, empty, actions, tabs: [], active: null, recent: [], split: null };
  }

  private listen(): void {
    const parts = this.parts;
    const { list, manager } = parts;
    this.element.addEventListener('focusin', () => manager.groupFocused(this));
    list.addEventListener('click', (e) => {
      const tab = this.tabOf(e.target);
      if (!tab) return;
      if ((e.target as Element).closest('.mx-tabdocs__close')) {
        e.stopPropagation();
        void manager.closeByUser(tab.document);
      } else {
        manager.activateByUser(tab.document);
      }
    });
    list.addEventListener('mousedown', (e) => {
      // The close button does not take focus from where it is.
      if ((e.target as Element).closest('.mx-tabdocs__close')) e.preventDefault();
    });
    list.addEventListener('auxclick', (e) => {
      const tab = this.tabOf(e.target);
      if (tab && e.button === 1) {
        e.preventDefault();
        void manager.closeByUser(tab.document);
      }
    });
    list.addEventListener('dblclick', (e) => {
      if (this.tabOf(e.target) && !(e.target as Element).closest('.mx-tabdocs__close')) manager.tabDoubleClicked(this);
    });
    list.addEventListener(
      'wheel',
      (e) => {
        // A plain mouse wheel scrolls the strip sideways.
        if (e.deltaX || !e.deltaY || list.scrollWidth <= list.clientWidth) return;
        e.preventDefault();
        list.scrollLeft += e.deltaY;
      },
      { passive: false },
    );
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
      const observer = new view.ResizeObserver(() => parts.active && this.reveal(parts.active));
      observer.observe(list);
      this.motif.setDisposable(() => observer.disconnect());
    }
  }
}
