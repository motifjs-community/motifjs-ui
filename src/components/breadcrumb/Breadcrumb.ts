import { Component, Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { givenField, givenList } from '../../core/given-field';
import { glyph } from '../../core/glyphs';
import { loose, part } from '../../core/draw-parts';
import type { IconSource } from '../../core/icon-source';
import { boxOf, measure, onLayout, readAgain, type Box } from '../../core/measure';
import { onLanguage } from '../../core/on-language';
import { put, shown, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Button } from '../button/Button';
import type { BreadcrumbItem } from './breadcrumb-item';
import type { BreadcrumbItemClickEventArgs } from './breadcrumb-item-click-event-args';
import type { BreadcrumbProps } from './breadcrumb-props';

const OWN = ['items', 'rel', 'maxItems', 'lastIsCurrent', 'size', 'label'] as const;

/** What one item says. */
interface Look {
  item: unknown;
  text: string;
  href: string | null;
  icon: IconSource | null;
  enabled: boolean;
}

/** One drawn step. */
interface Step {
  li: Component<HTMLLIElement>;
  /** The link, the button, or the current page. */
  face: Component<HTMLElement> | null;
}

/** An item in its place, with the step drawn for it. */
interface Entry {
  item: unknown;
  step: Step | null;
}

type Kind = 'here' | 'link' | 'button';

/** Where the menu of the steps that do not fit goes in the list: right after the first step. */
const MORE = Symbol('mx.breadcrumb.more');
const DIVIDER = Symbol('mx.breadcrumb.divider');

/** An icon given as an address. */
function iconImage(src: string): Component<HTMLImageElement> {
  const img = loose<HTMLImageElement>('img');
  img.attr.add({ src, alt: '' });
  return img;
}

/**
 * The path to the current page. Each step is a link (`href`, `rel="router"` for the MotifJS router) or a button
 * (`onItemClick`), with the current page last. Steps that do not fit, or that exceed `maxItems`, move to a menu after
 * the first step. The first and last steps always stay visible.
 *
 * @example
 * <Breadcrumb rel="router" items={[{ text: 'Home', href: '/' }, { text: 'Orders', href: '/orders' }, { text: () => this.order.number }]} />
 */
export class Breadcrumb extends Control<HTMLElement, BreadcrumbProps> {
  private readonly clicked = new Emitter<BreadcrumbItemClickEventArgs>();
  private readonly list: Component<HTMLOListElement>;
  private readonly moreItem: Component<HTMLLIElement>;
  private readonly more: Button;
  private entries: Entry[] = [];
  /** The steps now in the menu. */
  private hidden = new Set<number>();

  constructor(props?: IBaseProp<BreadcrumbProps>) {
    super('nav', props);
    const own = (this.props ?? {}) as BreadcrumbProps;
    this.class.add('mx-breadcrumb');
    this.list = part(this, 'ol', 'mx-breadcrumb__list');
    this.moreItem = loose<HTMLLIElement>('li', 'mx-breadcrumb__item mx-breadcrumb__more');
    this.more = new Button({ icon: glyph('more'), variant: 'ghost', size: 'sm', menu: [] });
    this.moreItem.controls.add(this.more, this.divider());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onItemClick) this.onItemClick(own.onItemClick);

    // Built once: a step stays while its item does, and a changed item changes only what shows it.
    this.list.bindings.list(
      () => {
        const [first, ...rest] = this.entryList();
        return first ? [first, MORE, ...rest] : [MORE];
      },
      (entry: Entry | typeof MORE) => (entry === MORE ? this.moreItem : this.makeStep(entry)),
    );
    // What fits is measured again when the steps or what they say change.
    this.bindings.watch(() => {
      for (const entry of this.entryList()) this.lookOf(entry.item);
      untracked(() => this.fit());
    });
    this.observeProperty('maxItems', () => this.fit());
    this.observeProperty<ControlSize>('size', (size) => put(this, 'data-size', size ?? 'md'));
    this.observeProperty<string>('label', () => this.renderName());
    onLanguage(this, () => this.renderName());
    onLayout(this, 'size', () => this.fit());
    this.motif.setDisposable(() => this.clicked.dispose());
  }

  // Properties (see BreadcrumbProps).

  get items(): readonly (BreadcrumbItem | string)[] {
    return this.getProperty<readonly (BreadcrumbItem | string)[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly (BreadcrumbItem | string)[]>) {
    this.assignProperty('items', value);
  }
  get rel(): string {
    return this.getProperty<string | undefined>('rel') ?? '';
  }
  set rel(value: Bind<string>) {
    this.assignProperty('rel', value);
  }
  get maxItems(): number | null {
    const n = Number(this.getProperty('maxItems'));
    return Number.isFinite(n) && n >= 2 ? Math.floor(n) : null;
  }
  set maxItems(value: Bind<number | null>) {
    this.assignProperty('maxItems', value);
  }
  get lastIsCurrent(): boolean {
    return this.getProperty<boolean | undefined>('lastIsCurrent') !== false;
  }
  set lastIsCurrent(value: Bind<boolean>) {
    this.assignProperty('lastIsCurrent', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** Occurs when a step is clicked, on the breadcrumb or in its menu. `cancel` prevents following a link. */
  get onItemClick(): MotifEvent<BreadcrumbItemClickEventArgs> {
    return this.clicked.event;
  }

  /** The indexes of the steps currently in the menu. */
  get collapsed(): readonly number[] {
    return [...this.hidden].sort((a, b) => a - b);
  }

  private renderName(): void {
    put(this, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.breadcrumb);
    if (this.more.hint !== uiLocale.strings.breadcrumbMore) this.more.hint = uiLocale.strings.breadcrumbMore;
  }

  /** One entry per item, in item order: the same entry while its item stays (an item given twice has two). */
  private entryList(): Entry[] {
    const items = givenList(this.getProperty<readonly unknown[]>('items'));
    const old = new Map<unknown, Entry[]>();
    for (const entry of this.entries) {
      const same = old.get(entry.item);
      if (same) same.push(entry);
      else old.set(entry.item, [entry]);
    }
    return (this.entries = items.map((item) => old.get(item)?.shift() ?? { item, step: null }));
  }

  private isLast(entry: Entry): boolean {
    return this.entryList().at(-1) === entry;
  }

  /** The current page, a link or a button: what the step's face is made of. */
  private kindOf(entry: Entry): Kind {
    if (this.isLast(entry) && this.getProperty<boolean | undefined>('lastIsCurrent') !== false) return 'here';
    return this.lookOf(entry.item).href ? 'link' : 'button';
  }

  private lookOf(item: unknown): Look {
    if (typeof item !== 'object' || item === null) return { item, text: String(item ?? ''), href: null, icon: null, enabled: true };
    return {
      item,
      text: String(givenField(item, 'text') ?? ''),
      href: givenField<string | null | undefined>(item, 'href') || null,
      icon: givenField<IconSource | null | undefined>(item, 'icon') ?? null,
      enabled: givenField(item, 'enabled') !== false,
    };
  }

  /** A step, built once: its face changes only when its kind does, its divider only when it becomes (or stops being) the last. */
  private makeStep(entry: Entry): Component<HTMLLIElement> {
    const li = loose<HTMLLIElement>('li', 'mx-breadcrumb__item');
    const step: Step = { li, face: null };
    entry.step = step;
    li.motif.setDisposable(() => {
      if (entry.step === step) entry.step = null;
    });
    li.bindings.list(() => [this.kindOf(entry)], (kind: Kind) => this.makeFace(entry, step, kind));
    li.bindings.list(() => (this.isLast(entry) ? [] : [DIVIDER]), () => this.divider());
    // What fits may have been worked out before the step was made.
    shown(li, !this.hidden.has(this.entries.indexOf(entry)));
    return li;
  }

  private makeFace(entry: Entry, step: Step, kind: Kind): Component<HTMLElement> {
    const tag = kind === 'here' ? 'span' : kind === 'link' ? 'a' : 'button';
    const face = loose<HTMLElement>(tag, kind === 'here' ? 'mx-breadcrumb__current' : 'mx-breadcrumb__link');
    step.face = face;
    face.motif.setDisposable(() => {
      if (step.face === face) step.face = null;
    });
    if (kind === 'here') face.attr.add({ 'aria-current': 'page' });
    if (kind === 'button') face.attr.add({ type: 'button' });
    face.bindings.list(
      () => {
        const icon = this.lookOf(entry.item).icon;
        return icon ? [icon] : [];
      },
      (icon: IconSource) => (typeof icon === 'string' ? iconImage(icon) : icon),
    );
    const caption = part<HTMLSpanElement>(face, 'span', 'mx-breadcrumb__text');
    face.bindings.watch(() => {
      const look = this.lookOf(entry.item);
      const rel = kind === 'link' ? this.getProperty<string>('rel') || null : null;
      untracked(() => {
        text(caption, look.text);
        // A disabled link or button; the current page is neither.
        if (kind !== 'here') put(face, 'aria-disabled', look.enabled ? null : 'true');
        if (kind === 'link') {
          put(face, 'href', look.enabled ? look.href : null);
          put(face, 'rel', rel);
        }
      });
    });
    face.motif.on('click', (_, e) => this.pressed(entry, e));
    return face;
  }

  /** A divider after a step: a glyph whose shape is the design language's (`divider.icon`). */
  private divider(): Component<HTMLSpanElement> {
    const mark = loose<HTMLSpanElement>('span', 'mx-glyph mx-breadcrumb__divider');
    mark.attr.add({ 'aria-hidden': 'true' });
    return mark;
  }

  /** A step pressed: told first; a link is followed unless canceled, a disabled one never. */
  private pressed(entry: Entry, e: Event): void {
    const index = this.entries.indexOf(entry);
    const look = untracked(() => this.lookOf(entry.item));
    if (index < 0 || !look.enabled) {
      e.preventDefault();
      return;
    }
    const args: BreadcrumbItemClickEventArgs = { item: look.item, index, cancel: false, source: this };
    this.clicked.fire(args);
    if (args.cancel) e.preventDefault();
  }

  /** As many steps as fit (and no more than `maxItems`): the ones between the first and the last go into the menu. */
  private fit(): void {
    const count = this.entries.length;
    const max = this.maxItems;
    this.hidden = new Set();
    const keep = (n: number) => {
      // Hides the steps from the second on, until `n` show (the first and the last always do).
      for (let i = 1; i < count - 1 && count - this.hidden.size > n; i++) this.hidden.add(i);
    };
    if (max !== null && count > max) keep(max);
    this.showSteps();
    measure(this, this.readList, this.hideOverflow);
  }

  private readonly readList = (): Box => boxOf(this.list);

  /** Hides steps from the second on while the list overflows, measuring it again after each one. */
  private readonly hideOverflow = (list: Box): void => {
    const count = this.entries.length;
    for (let i = 1; i < count - 1 && list.scrollWidth > list.clientWidth + 0.5; i++) {
      if (this.hidden.has(i)) continue;
      this.hidden.add(i);
      this.showSteps();
      list = readAgain(this.readList);
    }
  };

  private showSteps(): void {
    this.entries.forEach((entry, i) => shown(entry.step?.li ?? null, !this.hidden.has(i)));
    shown(this.moreItem, this.hidden.size > 0);
    const menu: MenuItem[] = this.collapsed.map((i) => {
      const entry = this.entries[i];
      const look = untracked(() => this.lookOf(entry.item));
      return {
        text: look.text,
        icon: look.icon,
        enabled: look.enabled,
        // The step's own face is pressed: a link is followed as one, so the router takes it too.
        click: () => entry.step?.face?.attr.add({ click: true }),
      };
    });
    this.more.menu = menu;
  }
}
