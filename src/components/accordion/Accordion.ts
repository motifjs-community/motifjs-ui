import { Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { focusAway, holdsFocus } from '../../core/focus';
import { put } from '../../core/part-writes';
import type { AccordionChevron } from './accordion-chevron';
import type { AccordionExpandedEventArgs } from './accordion-expanded-event-args';
import type { AccordionExpandingEventArgs } from './accordion-expanding-event-args';
import { AccordionItem } from './AccordionItem';
import type { AccordionProps } from './accordion-props';
import type { AccordionVariant } from './accordion-variant';

const OWN = ['multiple', 'collapsible', 'headingLevel', 'arrowKeys', 'regions', 'variant', 'size', 'chevron', 'lazy', 'keepAlive', 'value'] as const;

const LOOK = ['variant', 'size', 'chevron'] as const;

const NO_ITEMS: readonly AccordionItem[] = [];

/** APG: with more sections than this, region landmarks are more noise than help. */
const MAX_REGIONS = 6;

interface Parts {
  /** The value is being applied to the items: their changes do not write it back. */
  applying: boolean;
  /** The value storage is being brought in step: not a value to apply. */
  syncing: boolean;
  /** Changes now come from the user. */
  byUser: boolean;
  ready: boolean;
  disposing: boolean;
  expanding: Emitter<AccordionExpandingEventArgs>;
  collapsing: Emitter<AccordionExpandingEventArgs>;
  expanded: Emitter<AccordionExpandedEventArgs>;
  collapsed: Emitter<AccordionExpandedEventArgs>;
}

const PARTS = Symbol('mx.accordion');

/**
 * Sections that expand and collapse under their headers, following the ARIA accordion pattern.
 * Items are `<AccordionItem>` children or are managed programmatically (`add`, `insert`, `remove`). One item is
 * open at a time unless `multiple` is set, and `value` lists the keys of the open items (`x-model` provides two-way
 * binding). Up and Down move between the headers, an item's `&` key toggles it, and a section is created when it is
 * first opened (`lazy`).
 *
 * @example
 * <Accordion multiple x-model={() => this.state.open}>
 *   <AccordionItem key="shipping" title="&Shipping">…</AccordionItem>
 *   <AccordionItem key="payment" title="&Payment">…</AccordionItem>
 * </Accordion>
 *
 * const faq = new Accordion({ variant: 'separated' });
 * faq.add(new AccordionItem({ title: 'Can I pay later?', content: () => new Answer() }));
 */
export class Accordion extends Control<HTMLDivElement, AccordionProps> {
  constructor(props?: IBaseProp<AccordionProps>) {
    super('div', props);
    const own = (this.props ?? {}) as AccordionProps;
    const parts = this.parts;
    this.class.add('mx-accordion');
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    this.observeProperty('multiple', () => this.settle());
    this.observeProperty('collapsible', () => this.settle());
    this.observeProperty('headingLevel', () => this.renderItems());
    this.observeProperty('regions', () => this.renderItems());
    this.observeProperty('lazy', () => {
      for (const item of this.itemsNow()) item.prepare();
    });
    if (own.onExpanding) this.onExpanding(own.onExpanding);
    if (own.onCollapsing) this.onCollapsing(own.onCollapsing);
    if (own.onExpanded) this.onExpanded(own.onExpanded);
    if (own.onCollapsed) this.onCollapsed(own.onCollapsed);

    for (const child of this.childs ?? []) if (child instanceof AccordionItem) this.place(child, this.itemsNow().length);
    parts.ready = true;
    if (own.value !== undefined) this.applyValue(this.peekProperty('value'));
    this.settle();
    this.motif.setDisposable(() => {
      parts.expanding.dispose();
      parts.collapsing.dispose();
      parts.expanded.dispose();
      parts.collapsed.dispose();
    });
  }

  // Properties (see AccordionProps).

  /** The items, in order. Reactive. */
  get items(): readonly AccordionItem[] {
    return this.getProperty<readonly AccordionItem[] | undefined>('items') ?? NO_ITEMS;
  }
  /** The keys of the open items (an item without a key uses its index). Reactive. */
  get value(): (string | number)[] {
    const items = this.items;
    return items.filter((item) => item.expanded).map((item) => this.keyOf(item, items));
  }
  set value(value: Bind<readonly (string | number)[] | null | undefined>) {
    this.assignProperty('value', value);
  }
  /** The open items. Reactive. */
  get expandedItems(): AccordionItem[] {
    return this.items.filter((item) => item.expanded);
  }
  get multiple(): boolean {
    return !!this.getProperty<boolean>('multiple');
  }
  set multiple(value: Bind<boolean>) {
    this.assignProperty('multiple', value, Boolean);
  }
  get collapsible(): boolean {
    return this.getProperty<boolean | undefined>('collapsible') ?? true;
  }
  set collapsible(value: Bind<boolean>) {
    this.assignProperty('collapsible', value, Boolean);
  }
  get headingLevel(): number {
    return this.getProperty<number | undefined>('headingLevel') ?? 3;
  }
  set headingLevel(value: Bind<number>) {
    this.assignProperty('headingLevel', value, Number);
  }
  get arrowKeys(): boolean {
    return this.getProperty<boolean | undefined>('arrowKeys') ?? true;
  }
  set arrowKeys(value: Bind<boolean>) {
    this.assignProperty('arrowKeys', value, Boolean);
  }
  get regions(): boolean | 'auto' {
    return this.getProperty<boolean | 'auto' | undefined>('regions') ?? 'auto';
  }
  set regions(value: Bind<boolean | 'auto'>) {
    this.assignProperty('regions', value);
  }
  get variant(): AccordionVariant {
    return this.getProperty<AccordionVariant | undefined>('variant') ?? 'list';
  }
  set variant(value: Bind<AccordionVariant>) {
    this.assignProperty('variant', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get chevron(): AccordionChevron {
    return this.getProperty<AccordionChevron | undefined>('chevron') ?? 'end';
  }
  set chevron(value: Bind<AccordionChevron>) {
    this.assignProperty('chevron', value);
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

  /** Occurs before the user opens an item. Set `e.cancel = true` to keep it closed. */
  get onExpanding(): MotifEvent<AccordionExpandingEventArgs> {
    return this.parts.expanding.event;
  }
  /** Occurs before the user closes an item. Set `e.cancel = true` to keep it open. */
  get onCollapsing(): MotifEvent<AccordionExpandingEventArgs> {
    return this.parts.collapsing.event;
  }
  /** Occurs after an item opens, either by the user or programmatically (`e.byUser`). */
  get onExpanded(): MotifEvent<AccordionExpandedEventArgs> {
    return this.parts.expanded.event;
  }
  /** Occurs after an item closes, either by the user or programmatically (`e.byUser`). */
  get onCollapsed(): MotifEvent<AccordionExpandedEventArgs> {
    return this.parts.collapsed.event;
  }

  // Methods.

  /** Adds an item at the end. An item from another `Accordion` moves here. */
  add(item: AccordionItem): AccordionItem {
    return this.insert(this.itemsNow().length, item);
  }

  /** Adds an item at `index`. */
  insert(index: number, item: AccordionItem): AccordionItem {
    const current = item.owner;
    if (current === this) return item;
    if (current) current.forget(item);
    this.place(item, Math.max(0, Math.min(index, this.itemsNow().length)));
    this.settle();
    return item;
  }

  /** Removes an item and disposes it. */
  remove(item: AccordionItem): boolean {
    if (!this.itemsNow().includes(item)) return false;
    const hadFocus = holdsFocus(item);
    const next = this.neighbour(item);
    this.forget(item);
    this.controls.remove(item);
    if (hadFocus && !next?.focus()) focusAway(this);
    this.settle();
    return true;
  }

  /** Opens every item programmatically. This requires `multiple`. */
  expandAll(): void {
    if (!this.peekProperty('multiple')) return;
    for (const item of this.itemsNow()) item.setExpanded(true);
  }

  /** Closes every item programmatically. With `collapsible` off, the first item stays open. */
  collapseAll(): void {
    for (const item of this.itemsNow()) item.setExpanded(false);
    this.settle();
  }

  override onDisposing(): void {
    // The items go with it.
    this.parts.disposing = true;
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'value' && this.parts.ready && !this.parts.syncing) this.applyValue(value);
  }

  // Called by AccordionItem.

  /** @internal The user pressed an item's header. */
  itemClicked(item: AccordionItem, event?: Event): void {
    if (!item.isEnabled || !this.itemsNow().includes(item)) return;
    untracked(() => {
      const open = item.expanded;
      if (open && this.locked(item)) return;
      const e: AccordionExpandingEventArgs = { item, index: this.itemsNow().indexOf(item), cancel: false, source: this, event };
      (open ? this.parts.collapsing : this.parts.expanding).fire(e);
      if (e.cancel) return;
      this.parts.byUser = true;
      try {
        item.setExpanded(!open);
      } finally {
        this.parts.byUser = false;
      }
    });
  }

  /** @internal A key pressed on an item's header. */
  headerKeyDown(item: AccordionItem, e: KeyboardEvent): void {
    untracked(() => this.onKeyDown(item, e));
  }

  /** @internal An item opened or closed. */
  itemToggled(item: AccordionItem): void {
    const parts = this.parts;
    const items = this.itemsNow();
    if (!items.includes(item) || parts.disposing) return;
    untracked(() => {
      const open = item.expanded;
      if (open && !this.peekProperty('multiple')) {
        for (const other of items) if (other !== item && other.expanded) other.setExpanded(false);
      }
      const e: AccordionExpandedEventArgs = { item, index: items.indexOf(item), byUser: parts.byUser, source: this };
      (open ? parts.expanded : parts.collapsed).fire(e);
      this.renderItems();
      this.syncValue();
    });
  }

  /** @internal An item's visibility, `enabled` or `key` changed. */
  itemChanged(item: AccordionItem): void {
    if (!this.itemsNow().includes(item)) return;
    this.renderItems();
    this.syncValue();
  }

  /** @internal An item was disposed without `remove`. */
  itemGone(item: AccordionItem): void {
    if (!this.parts.disposing) this.forget(item);
  }

  // Items coming and going.

  private place(item: AccordionItem, index: number): void {
    const next = [...this.itemsNow()];
    next.splice(index, 0, item);
    this.controls.add(index, item);
    this.setProperty('items', next);
    item.attachTo(this);
    this.renderItems();
  }

  private forget(item: AccordionItem): void {
    const items = this.itemsNow();
    if (!items.includes(item)) return;
    this.setProperty(
      'items',
      items.filter((i) => i !== item),
    );
    item.attachTo(null);
    this.renderItems();
    this.syncValue();
  }

  private neighbour(item: AccordionItem): AccordionItem | null {
    const items = this.itemsNow();
    const at = items.indexOf(item);
    return [...items.slice(at + 1), ...items.slice(0, at).reverse()].find((i) => i.visible && i.isEnabled) ?? null;
  }

  // State.

  private itemsNow(): readonly AccordionItem[] {
    return this.peekProperty<readonly AccordionItem[]>('items') ?? NO_ITEMS;
  }

  private keyOf(item: AccordionItem, items: readonly AccordionItem[]): string | number {
    return item.key || items.indexOf(item);
  }

  /** An open item that may not close: `collapsible` is off and it is the only one open. */
  private locked(item: AccordionItem): boolean {
    if (this.peekProperty('collapsible') !== false || !item.expanded) return false;
    return this.itemsNow().filter((i) => i.expanded).length === 1;
  }

  /** One open item without `multiple`; one open item at least without `collapsible`. */
  private settle(): void {
    const parts = this.parts;
    if (!parts.ready) return;
    untracked(() => {
      const items = this.itemsNow();
      const open = items.filter((i) => i.expanded);
      if (!this.peekProperty('multiple')) for (const extra of open.slice(1)) extra.setExpanded(false);
      if (this.peekProperty('collapsible') === false && !open.length) {
        items.find((i) => i.visible && i.isEnabled)?.setExpanded(true);
      }
      this.renderItems();
      this.syncValue();
    });
  }

  private applyValue(value: unknown): void {
    if (!Array.isArray(value)) return;
    const parts = this.parts;
    const keys = value.map((v) => String(v));
    parts.applying = true;
    try {
      untracked(() => {
        const items = this.itemsNow();
        let opened = 0;
        for (const item of items) {
          const key = item.key;
          const wanted = (key !== '' ? keys.includes(key) : value.includes(items.indexOf(item))) && (opened === 0 || !!this.peekProperty('multiple'));
          if (wanted) opened++;
          if (item.expanded !== wanted) item.setExpanded(wanted);
        }
      });
    } finally {
      parts.applying = false;
    }
    this.syncValue();
  }

  /** Keeps the `value` storage in step, without dropping a bound getter. */
  private syncValue(): void {
    const parts = this.parts;
    if (parts.applying || !parts.ready) return;
    const before = this.peekProperty<readonly (string | number)[] | null | undefined>('value');
    const now = untracked(() => this.value);
    parts.syncing = true;
    try {
      this.changeProperty('value', now);
    } finally {
      parts.syncing = false;
    }
    // `x-model` hears every change of what is open, from wherever it comes.
    if (!sameKeys(before, now)) this.bindings.writeModel(now);
  }

  // Keys.

  /** Up, Down, Home and End on a header move between the headers. */
  private onKeyDown(item: AccordionItem, e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey || this.peekProperty('arrowKeys') === false) return;
    const usable = this.itemsNow().filter((i) => i.visible && i.isEnabled);
    const at = usable.indexOf(item);
    if (at < 0) return;
    let next: AccordionItem | undefined;
    switch (e.key) {
      case 'ArrowDown':
        next = usable[(at + 1) % usable.length];
        break;
      case 'ArrowUp':
        next = usable[(at - 1 + usable.length) % usable.length];
        break;
      case 'Home':
        next = usable[0];
        break;
      case 'End':
        next = usable[usable.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    next?.focus();
  }

  // Rendering.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= {
      applying: false,
      syncing: false,
      byUser: false,
      ready: false,
      disposing: false,
      expanding: new Emitter(),
      collapsing: new Emitter(),
      expanded: new Emitter(),
      collapsed: new Emitter(),
    });
  }

  private renderLook(): void {
    put(this, 'data-variant', this.peekProperty<AccordionVariant>('variant') ?? 'list');
    put(this, 'data-size', this.peekProperty<ControlSize>('size') ?? 'md');
    put(this, 'data-chevron', this.peekProperty<AccordionChevron>('chevron') ?? 'end');
  }

  /** Heading levels, region roles and the header of an item that may not close. */
  private renderItems(): void {
    const items = this.itemsNow();
    const level = Math.min(6, Math.max(1, Math.round(this.peekProperty<number>('headingLevel') ?? 3)));
    const setting = this.peekProperty<boolean | 'auto'>('regions') ?? 'auto';
    untracked(() => {
      const region = setting === 'auto' ? items.filter((i) => i.visible).length <= MAX_REGIONS : !!setting;
      for (const item of items) item.renderOuter(level, region, this.locked(item));
    });
  }
}

function sameKeys(a: readonly (string | number)[] | null | undefined, b: readonly (string | number)[]): boolean {
  return !!a && a.length === b.length && a.every((key, i) => key === b[i]);
}
