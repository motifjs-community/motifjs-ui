import { Component, Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { deepActiveElement, nextTabbable } from '../../core/focus';
import { chevronDown } from '../../core/glyphs';
import { isElement } from '../../core/node-kind';
import { ResizeWatch } from '../../core/resize-watch';
import { Tab } from './Tab';
import type { TabCloseEventArgs } from './tab-close-event-args';
import type { TabSelectingEventArgs } from './tab-selecting-event-args';
import type { TabSelectionChangedEventArgs } from './tab-selection-changed-event-args';
import type { TabsActivation } from './tabs-activation';
import type { TabsPlacement } from './tabs-placement';
import type { TabsProps } from './tabs-props';
import type { TabsVariant } from './tabs-variant';

const OWN = ['activation', 'placement', 'variant', 'size', 'stretch', 'scrollButtons', 'closable', 'lazy', 'keepAlive', 'selectedIndex', 'value'] as const;

const LOOK = ['placement', 'variant', 'size', 'stretch'] as const;

const NO_TABS: readonly Tab[] = [];

interface Parts {
  list: HTMLDivElement;
  back: HTMLSpanElement;
  forward: HTMLSpanElement;
  panels: Component<HTMLDivElement>;
  /** A selection asked for (by `value` or `selectedIndex`) before its tab was there. */
  wanted: { name: 'value' | 'selectedIndex'; value: unknown } | null;
  /** The JSX tabs are in: from now on an added tab may be selected at once. */
  ready: boolean;
  disposing: boolean;
  overflowQueued: boolean;
  selecting: Emitter<TabSelectingEventArgs>;
  selectionChanged: Emitter<TabSelectionChangedEventArgs>;
  closing: Emitter<TabCloseEventArgs>;
}

const PARTS = Symbol('mx.tabs');

/**
 * Tabs: a strip of tabs and the panel of the selected one, following the ARIA tabs pattern.
 * Tabs come as `<Tab>` children or from code (`add`, `insert`, `remove`); `value` (two-way with
 * `x-model`) is the selected tab's `key`, else its index. Arrow keys move along the strip (and
 * select, with `activation="auto"`), Home and End go to the ends, Delete closes a closable tab,
 * a tab's `&` key selects it. Panels are built when first shown (`lazy`).
 *
 * @example
 * <Tabs x-model={() => this.state.page}>
 *   <Tab key="general" title="&General">…</Tab>
 *   <Tab key="advanced" title="&Advanced" icon="/icons/gear.svg">…</Tab>
 * </Tabs>
 *
 * const tabs = new Tabs({ closable: true });
 * tabs.add(new Tab({ title: 'Log', content: () => new LogView() }));
 */
export class Tabs extends Control<HTMLDivElement, TabsProps> {
  constructor(props?: IBaseProp<TabsProps>) {
    super('div', props);
    const own = (this.props ?? {}) as TabsProps;
    const parts = this.parts;
    this.controls.add(parts.panels);

    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.observeProperty<string>('text', (text) => {
      const label = parseAccessKey(text ?? '').text;
      if (label) parts.list.setAttribute('aria-label', label);
      else parts.list.removeAttribute('aria-label');
    });
    this.observeProperty('closable', () => this.refreshTabs());
    this.observeProperty('lazy', () => this.refreshTabs());
    this.observeProperty('scrollButtons', () => this.queueOverflow());

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onSelecting) this.onSelecting(own.onSelecting);
    if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
    if (own.onClose) this.onClose(own.onClose);

    for (const child of this.childs ?? []) if (child instanceof Tab) this.place(child, this.tabsNow().length);
    parts.ready = true;
    this.settle();
    this.listen();
    this.motif.setDisposable(() => {
      parts.selecting.dispose();
      parts.selectionChanged.dispose();
      parts.closing.dispose();
    });
  }

  // Properties (see TabsProps).

  /** The tabs, in strip order. Reactive. */
  get tabs(): readonly Tab[] {
    return this.getProperty<readonly Tab[] | undefined>('tabs') ?? NO_TABS;
  }
  /** The selected tab, `null` when there is none. Reactive. */
  get selectedTab(): Tab | null {
    return this.getProperty<Tab | null | undefined>('selected') ?? null;
  }
  get selectedIndex(): number {
    const selected = this.selectedTab;
    return selected ? this.tabs.indexOf(selected) : -1;
  }
  set selectedIndex(value: Bind<number>) {
    this.assignProperty('selectedIndex', value, Number);
  }
  /** The selected tab's `key`, else its index; `null` when none is selected. */
  get value(): string | number | null {
    const selected = this.selectedTab;
    return selected ? this.valueAt(selected, this.tabs) : null;
  }
  set value(value: Bind<string | number | null | undefined>) {
    this.assignProperty('value', value);
  }
  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get activation(): TabsActivation {
    return this.getProperty<TabsActivation | undefined>('activation') ?? 'auto';
  }
  set activation(value: Bind<TabsActivation>) {
    this.assignProperty('activation', value);
  }
  get placement(): TabsPlacement {
    return this.getProperty<TabsPlacement | undefined>('placement') ?? 'top';
  }
  set placement(value: Bind<TabsPlacement>) {
    this.assignProperty('placement', value);
  }
  get variant(): TabsVariant {
    return this.getProperty<TabsVariant | undefined>('variant') ?? 'line';
  }
  set variant(value: Bind<TabsVariant>) {
    this.assignProperty('variant', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get stretch(): boolean {
    return !!this.getProperty<boolean>('stretch');
  }
  set stretch(value: Bind<boolean>) {
    this.assignProperty('stretch', value, Boolean);
  }
  get scrollButtons(): boolean {
    return this.getProperty<boolean | undefined>('scrollButtons') ?? true;
  }
  set scrollButtons(value: Bind<boolean>) {
    this.assignProperty('scrollButtons', value, Boolean);
  }
  get closable(): boolean {
    return !!this.getProperty<boolean>('closable');
  }
  set closable(value: Bind<boolean>) {
    this.assignProperty('closable', value, Boolean);
  }
  get lazy(): boolean {
    return this.getProperty<boolean | undefined>('lazy') ?? true;
  }
  set lazy(value: Bind<boolean>) {
    this.assignProperty('lazy', value, Boolean);
  }
  get keepAlive(): boolean {
    return this.getProperty<boolean | undefined>('keepAlive') ?? true;
  }
  set keepAlive(value: Bind<boolean>) {
    this.assignProperty('keepAlive', value, Boolean);
  }

  // Events.

  /** The user is about to select a tab; `e.cancel = true` keeps the current one. */
  get onSelecting(): MotifEvent<TabSelectingEventArgs> {
    return this.parts.selecting.event;
  }
  /** The selected tab changed, by the user or by code (`e.byUser`). */
  get onSelectionChanged(): MotifEvent<TabSelectionChangedEventArgs> {
    return this.parts.selectionChanged.event;
  }
  /** A tab is about to close; `e.cancel = true` keeps it. */
  get onClose(): MotifEvent<TabCloseEventArgs> {
    return this.parts.closing.event;
  }

  // Methods.

  /** Adds a tab at the end (a tab of another `Tabs` moves here). */
  add(tab: Tab): Tab {
    return this.insert(this.tabsNow().length, tab);
  }

  /** Adds a tab at `index`. */
  insert(index: number, tab: Tab): Tab {
    const current = tab.owner;
    if (current === this) return tab;
    if (current) current.forget(tab);
    this.place(tab, Math.max(0, Math.min(index, this.tabsNow().length)));
    this.settle();
    return tab;
  }

  /** Removes a tab and disposes it; the selection moves to a neighbour. No `onClose`. */
  remove(tab: Tab): boolean {
    if (!this.tabsNow().includes(tab)) return false;
    const active = deepActiveElement();
    const hadFocus = !!active && (tab.element.contains(active) || tab.headerElement.contains(active));
    this.forget(tab);
    this.parts.panels.controls.remove(tab);
    if (hadFocus && !this.focus()) nextTabbable(this.element, this.element.closest('dialog') ?? document.body)?.focus();
    return true;
  }

  /** Selects a tab (or the tab at an index) from code; `false` when it is hidden or not here. */
  select(tab: Tab | number): boolean {
    const target = typeof tab === 'number' ? this.tabsNow()[tab] : tab;
    if (!target) return false;
    // A tab chosen from code takes the place of one the model is still waiting for.
    this.parts.wanted = null;
    return untracked(() => this.choose(target, false));
  }

  /** Closes a tab as the user would: `onClose` can cancel it. */
  close(tab: Tab, byUser = false, event?: Event): boolean {
    const tabs = this.tabsNow();
    if (!tabs.includes(tab) || (byUser && !tab.isEnabled)) return false;
    const e: TabCloseEventArgs = { tab, index: tabs.indexOf(tab), cancel: false, byUser, source: this, event };
    this.parts.closing.fire(e);
    return !e.cancel && this.remove(tab);
  }

  override onDisposing(): void {
    // The tabs go with it: no new selection for each.
    this.parts.disposing = true;
  }

  /** Focuses the selected tab (the one Tab reaches). */
  protected override get focusElement(): HTMLElement {
    return this.stopTab()?.headerElement ?? this.parts.list;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'tabStop') {
      this.renderRoving();
      return;
    }
    super.applyProperty(name, value);
    if (name === 'value' || name === 'selectedIndex') this.selectFrom(name, value);
  }

  // Called by Tab.

  /** @internal `closable` without tracking it. */
  peekClosable(): boolean {
    return !!this.peekProperty<boolean>('closable');
  }

  /** @internal The access key of a tab: select it as the user would, and focus it. */
  activate(tab: Tab): boolean {
    if (!tab.visible || !tab.isEnabled) return false;
    this.choose(tab, true);
    return tab.focus();
  }

  /** @internal A tab's visibility, `enabled`, `key` or `lazy` changed. */
  tabChanged(tab: Tab): void {
    if (!this.tabsNow().includes(tab)) return;
    untracked(() => {
      if (this.selectedNow() === tab && !tab.visible) this.choose(this.neighbour(tab), false);
      else if (!this.selectedNow()) this.settle();
      if (!this.lazyOf(tab)) tab.buildContent();
      this.renderRoving();
      this.syncSelection();
    });
    this.queueOverflow();
  }

  /** @internal A tab's title, icon or badge changed. */
  tabResized(): void {
    this.queueOverflow();
  }

  /** @internal A tab was disposed without `remove`. */
  tabGone(tab: Tab): void {
    if (!this.parts.disposing) this.forget(tab);
  }

  // Tabs coming and going.

  private place(tab: Tab, index: number): void {
    const parts = this.parts;
    const next = [...this.tabsNow()];
    next.splice(index, 0, tab);
    parts.list.insertBefore(tab.headerElement, next[index + 1]?.headerElement ?? null);
    parts.panels.controls.add(index, tab);
    this.setProperty('tabs', next);
    tab.attachTo(this);
    if (!this.lazyOf(tab)) tab.buildContent();
    this.renderRoving();
    this.queueOverflow();
  }

  /** Takes a tab out of the strip without disposing it; the selection moves on. */
  private forget(tab: Tab): void {
    const tabs = this.tabsNow();
    if (!tabs.includes(tab)) return;
    untracked(() => {
      if (this.selectedNow() === tab) this.choose(this.neighbour(tab), false);
      this.setProperty(
        'tabs',
        tabs.filter((t) => t !== tab),
      );
      tab.attachTo(null);
      this.renderRoving();
      this.syncSelection();
    });
    this.queueOverflow();
  }

  /** The tab next to `tab` that can take its place: after it, else before it. */
  private neighbour(tab: Tab): Tab | null {
    const tabs = this.tabsNow();
    const at = tabs.indexOf(tab);
    const others = [...tabs.slice(at + 1), ...tabs.slice(0, at).reverse()];
    return others.find((t) => t.visible && t.isEnabled) ?? others.find((t) => t.visible) ?? null;
  }

  // Selection.

  private tabsNow(): readonly Tab[] {
    return this.peekProperty<readonly Tab[]>('tabs') ?? NO_TABS;
  }

  private selectedNow(): Tab | null {
    return this.peekProperty<Tab | null>('selected') ?? null;
  }

  private valueAt(tab: Tab, tabs: readonly Tab[]): string | number {
    return tab.key || tabs.indexOf(tab);
  }

  private findByValue(value: unknown): Tab | undefined {
    const tabs = this.tabsNow();
    const text = String(value);
    return tabs.find((t) => t.key !== '' && t.key === text) ?? (typeof value === 'number' ? tabs[value] : undefined);
  }

  /** `value` or `selectedIndex` was set or bound: select that tab, or wait for it. */
  private selectFrom(name: 'value' | 'selectedIndex', value: unknown): void {
    if (value === null || value === undefined || (name === 'selectedIndex' && !((value as number) >= 0))) return;
    untracked(() => {
      const tab = name === 'value' ? this.findByValue(value) : this.tabsNow()[value as number];
      if (tab === this.selectedNow()) return;
      if (tab && this.choose(tab, false)) this.parts.wanted = null;
      else this.parts.wanted = { name, value };
    });
  }

  /** After tabs came in: the selection asked for, else keep the current one, else the first usable tab. */
  private settle(): void {
    const parts = this.parts;
    if (!parts.ready) return;
    untracked(() => {
      const wanted = parts.wanted;
      if (wanted) {
        const tab = wanted.name === 'value' ? this.findByValue(wanted.value) : this.tabsNow()[wanted.value as number];
        if (tab && this.choose(tab, false)) {
          parts.wanted = null;
          return;
        }
      }
      if (!this.selectedNow()) {
        const tabs = this.tabsNow();
        const first = tabs.find((t) => t.visible && t.isEnabled) ?? tabs.find((t) => t.visible);
        if (first) this.choose(first, false);
      }
      this.syncSelection();
    });
  }

  private choose(tab: Tab | null, byUser: boolean, event?: Event): boolean {
    const parts = this.parts;
    const tabs = this.tabsNow();
    const previous = this.selectedNow();
    if (tab === previous) return true;
    if (tab && (!tabs.includes(tab) || !tab.visible || (byUser && !tab.isEnabled))) return false;
    const previousIndex = previous ? tabs.indexOf(previous) : -1;
    const index = tab ? tabs.indexOf(tab) : -1;
    if (byUser && tab) {
      const e: TabSelectingEventArgs = { tab, index, previousTab: previous, previousIndex, cancel: false, source: this, event };
      parts.selecting.fire(e);
      if (e.cancel) return false;
      parts.wanted = null;
    }
    previous?.showPanel(false, this.keepAliveOf(previous));
    this.setProperty('selected', tab);
    tab?.showPanel(true, true);
    this.renderRoving();
    this.syncSelection();
    if (tab) this.reveal(tab.headerElement);
    // `x-model` hears every change of the selection, except while it waits for a tab it asked for.
    if (byUser || !parts.wanted) this.bindings.writeModel(this.value);
    parts.selectionChanged.fire({ tab, index, previousTab: previous, previousIndex, byUser, source: this, event });
    return true;
  }

  /** Keeps the `value` and `selectedIndex` storage in step, without dropping a bound getter. */
  private syncSelection(): void {
    const selected = this.selectedNow();
    const tabs = this.tabsNow();
    this.changeProperty('selectedIndex', selected ? tabs.indexOf(selected) : -1);
    this.changeProperty('value', selected ? this.valueAt(selected, tabs) : null);
  }

  private lazyOf(tab: Tab): boolean {
    return tab.lazy ?? this.peekProperty<boolean>('lazy') ?? true;
  }

  private keepAliveOf(tab: Tab): boolean {
    return tab.keepAlive ?? this.peekProperty<boolean>('keepAlive') ?? true;
  }

  // Focus and keys.

  /** The tab Tab reaches: the selected one, else the first usable one. */
  private stopTab(): Tab | null {
    const selected = this.selectedNow();
    if (selected && selected.visible && selected.isEnabled) return selected;
    return this.tabsNow().find((t) => t.visible && t.isEnabled) ?? null;
  }

  private renderRoving(): void {
    const stop = this.peekProperty('tabStop') === false ? null : untracked(() => this.stopTab());
    for (const tab of this.tabsNow()) tab.headerElement.tabIndex = tab === stop ? 0 : -1;
  }

  private tabOf(target: EventTarget | null): Tab | undefined {
    const header = isElement(target) ? target.closest('.mx-tabs__tab') : null;
    return header ? this.tabsNow().find((t) => t.headerElement === header) : undefined;
  }

  private get vertical(): boolean {
    const placement = this.peekProperty<TabsPlacement>('placement');
    return placement === 'start' || placement === 'end';
  }

  private listen(): void {
    const parts = this.parts;
    const list = parts.list;
    list.addEventListener('click', (e) => {
      const tab = this.tabOf(e.target);
      if (tab) untracked(() => this.choose(tab, true, e));
    });
    list.addEventListener('auxclick', (e) => {
      const tab = this.tabOf(e.target);
      if (tab && e.button === 1 && untracked(() => tab.isClosable)) {
        e.preventDefault();
        this.close(tab, true, e);
      }
    });
    list.addEventListener('keydown', (e) => untracked(() => this.onKeyDown(e)));
    list.addEventListener('focusin', (e) => this.reveal(e.target as HTMLElement));
    list.addEventListener('scroll', () => this.renderEnds());
    for (const button of [parts.back, parts.forward]) {
      button.addEventListener('mousedown', (e) => e.preventDefault());
      button.addEventListener('click', () => this.scrollBy(button === parts.forward ? 1 : -1));
    }
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeWatch(() => this.checkOverflow());
      observer.observe(list);
      this.motif.setDisposable(() => observer.disconnect());
    }
    if (typeof MutationObserver === 'function') {
      // Content that comes and goes in the shown panel decides whether the panel takes focus.
      const observer = new MutationObserver(() => this.selectedNow()?.updatePanelFocus());
      observer.observe(parts.panels.element, { childList: true, subtree: true });
      this.motif.setDisposable(() => observer.disconnect());
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tab = this.tabOf(e.target);
    if (!tab) return;
    const usable = this.tabsNow().filter((t) => t.visible && t.isEnabled);
    const at = usable.indexOf(tab);
    const vertical = this.vertical;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    let next: Tab | undefined;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        if (vertical) return;
        next = usable[(at + ((e.key === 'ArrowRight') !== rtl ? 1 : -1) + usable.length) % usable.length];
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        if (!vertical) return;
        next = usable[(at + (e.key === 'ArrowDown' ? 1 : -1) + usable.length) % usable.length];
        break;
      case 'Home':
        next = usable[0];
        break;
      case 'End':
        next = usable[usable.length - 1];
        break;
      case 'Delete':
        if (!tab.isClosable) return;
        e.preventDefault();
        this.close(tab, true, e);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (!next) return;
    next.headerElement.focus();
    if (this.activation === 'auto') this.choose(next, true, e);
  }

  // The strip: overflow, scroll buttons.

  private queueOverflow(): void {
    const parts = this.parts;
    if (parts.overflowQueued) return;
    parts.overflowQueued = true;
    queueMicrotask(() => {
      parts.overflowQueued = false;
      this.checkOverflow();
    });
  }

  private checkOverflow(): void {
    const list = this.parts.list;
    const vertical = this.vertical;
    const room = vertical ? list.clientHeight : list.clientWidth;
    const needed = vertical ? list.scrollHeight : list.scrollWidth;
    const buttons = this.peekProperty('scrollButtons') !== false;
    this.element.toggleAttribute('data-scroll-buttons', buttons);
    this.element.toggleAttribute('data-overflow', buttons && needed > room + 1);
    this.renderEnds();
  }

  /** Dims a scroll button that has nowhere to go. */
  private renderEnds(): void {
    const { list, back, forward } = this.parts;
    const vertical = this.vertical;
    const position = Math.abs(vertical ? list.scrollTop : list.scrollLeft);
    const room = vertical ? list.clientHeight : list.clientWidth;
    const needed = vertical ? list.scrollHeight : list.scrollWidth;
    back.toggleAttribute('data-end', position <= 1);
    forward.toggleAttribute('data-end', position + room >= needed - 1);
  }

  private scrollBy(direction: 1 | -1): void {
    const list = this.parts.list;
    const smooth = typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
    if (this.vertical) {
      list.scrollBy({ top: direction * list.clientHeight * 0.8, behavior });
    } else {
      const rtl = getComputedStyle(this.element).direction === 'rtl';
      list.scrollBy({ left: direction * (rtl ? -1 : 1) * list.clientWidth * 0.8, behavior });
    }
  }

  /** Scrolls the strip, not the page, so that a tab is in sight. */
  private reveal(header: HTMLElement): void {
    const list = this.parts.list;
    if (!list.isConnected || header.hidden || header.parentElement !== list) return;
    const room = list.getBoundingClientRect();
    const box = header.getBoundingClientRect();
    if (this.vertical) {
      if (box.top < room.top) list.scrollTop += box.top - room.top;
      else if (box.bottom > room.bottom) list.scrollTop += box.bottom - room.bottom;
    } else if (box.left < room.left) {
      list.scrollLeft += box.left - room.left;
    } else if (box.right > room.right) {
      list.scrollLeft += box.right - room.right;
    }
  }

  // Rendering.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.element.classList.add('mx-tabs');
    const strip = document.createElement('div');
    strip.className = 'mx-tabs__strip';
    const list = document.createElement('div');
    list.className = 'mx-tabs__list';
    list.setAttribute('role', 'tablist');
    const back = scrollButton('back');
    const forward = scrollButton('forward');
    strip.append(back, list, forward);
    this.element.prepend(strip);
    const panels = new Component<HTMLDivElement>('div');
    panels.element.className = 'mx-tabs__panels';
    return {
      list,
      back,
      forward,
      panels,
      wanted: null,
      ready: false,
      disposing: false,
      overflowQueued: false,
      selecting: new Emitter(),
      selectionChanged: new Emitter(),
      closing: new Emitter(),
    };
  }

  private renderLook(): void {
    const data = this.element.dataset;
    data.placement = this.peekProperty<TabsPlacement>('placement') ?? 'top';
    data.variant = this.peekProperty<TabsVariant>('variant') ?? 'line';
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    this.element.toggleAttribute('data-stretch', !!this.peekProperty('stretch'));
    if (this.vertical) this.parts.list.setAttribute('aria-orientation', 'vertical');
    else this.parts.list.removeAttribute('aria-orientation');
    this.queueOverflow();
  }

  /** `closable` or `lazy` of the whole strip changed: every tab that follows it. */
  private refreshTabs(): void {
    for (const tab of this.tabsNow()) {
      tab.renderClose();
      if (!this.lazyOf(tab)) tab.buildContent();
    }
    this.queueOverflow();
  }
}

function scrollButton(direction: 'back' | 'forward'): HTMLSpanElement {
  // The arrow keys reach every tab, so these are for the pointer only.
  const button = document.createElement('span');
  button.className = 'mx-tabs__scroll';
  button.dataset.direction = direction;
  button.setAttribute('aria-hidden', 'true');
  button.append(chevronDown());
  return button;
}
