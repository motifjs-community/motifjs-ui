import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { follow } from '../../core/follow';
import { givenField, givenList } from '../../core/given-field';
import { glyph } from '../../core/glyphs';
import { iconPart, part, put, shown, text } from '../../core/draw-parts';
import type { IconSource } from '../../core/icon-source';
import { onLanguage } from '../../core/on-language';
import { ResizeWatch } from '../../core/resize-watch';
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
  face: Component<HTMLElement>;
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
  private steps: Step[] = [];
  private looks: Look[] = [];
  private stopItems: (() => void) | null = null;
  /** The steps now in the menu. */
  private hidden = new Set<number>();
  private readonly watch = new ResizeWatch(() => this.fit());

  constructor(props?: IBaseProp<BreadcrumbProps>) {
    super('nav', props);
    const own = (this.props ?? {}) as BreadcrumbProps;
    this.element.classList.add('mx-breadcrumb');
    this.list = part(this, 'ol', 'mx-breadcrumb__list');
    this.moreItem = part(this.list, 'li', 'mx-breadcrumb__item mx-breadcrumb__more');
    this.more = new Button({ icon: glyph('more'), variant: 'ghost', size: 'sm', menu: [] });
    this.moreItem.controls.add(this.more);
    this.divider(this.moreItem);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onItemClick) this.onItemClick(own.onItemClick);

    this.observeProperty('items', () => this.renderItems());
    for (const name of ['rel', 'lastIsCurrent'] as const) this.observeProperty(name, () => this.drawSteps());
    this.observeProperty('maxItems', () => this.fit());
    this.observeProperty<ControlSize>('size', (size) => put(this.element, 'data-size', size ?? 'md'));
    this.observeProperty<string>('label', () => this.renderName());
    onLanguage(this, () => this.renderName());
    this.watch.observe(this.element);
    this.motif.setDisposable(() => {
      this.watch.disconnect();
      this.stopItems?.();
      this.clicked.dispose();
    });
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

  override onMounted(): void {
    this.fit();
  }

  private renderName(): void {
    put(this.element, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.breadcrumb);
    if (this.more.hint !== uiLocale.strings.breadcrumbMore) this.more.hint = uiLocale.strings.breadcrumbMore;
  }

  private renderItems(): void {
    this.stopItems?.();
    const items = givenList(this.peekProperty<readonly unknown[]>('items'));
    // The items' own functions are tracked; the list and drawing are not.
    this.stopItems = follow(
      this,
      'items',
      () => items.map((item) => this.lookOf(item)),
      (looks) => {
        this.looks = looks;
        this.drawSteps();
      },
    );
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

  /** The steps are recreated: their kind (link, button, current) depends on what they say. */
  private drawSteps(): void {
    for (const step of this.steps) void step.li.dispose();
    const current = this.peekProperty<boolean | undefined>('lastIsCurrent') !== false;
    const rel = this.peekProperty<string>('rel') || null;
    this.steps = this.looks.map((look, index) => {
      // The menu of the steps that do not fit comes right after the first one.
      const li = new Component<HTMLLIElement>('li');
      li.element.className = 'mx-breadcrumb__item';
      this.list.controls.insert(index + (index > 0 ? 1 : 0), li);
      const last = index === this.looks.length - 1;
      let face: Component<HTMLElement>;
      if (last && current) {
        face = part(li, 'span', 'mx-breadcrumb__current');
        face.element.setAttribute('aria-current', 'page');
      } else if (look.href) {
        face = part<HTMLAnchorElement>(li, 'a', 'mx-breadcrumb__link');
        put(face.element, 'href', look.href);
        put(face.element, 'rel', rel);
      } else {
        face = part<HTMLButtonElement>(li, 'button', 'mx-breadcrumb__link');
        (face.element as HTMLButtonElement).type = 'button';
      }
      if (look.icon) iconPart(face, look.icon);
      text(part(face, 'span', 'mx-breadcrumb__text').element, look.text);
      if (!look.enabled && face.element.classList.contains('mx-breadcrumb__link')) {
        face.element.setAttribute('aria-disabled', 'true');
        if (face.element instanceof HTMLAnchorElement) face.element.removeAttribute('href');
      }
      face.element.addEventListener('click', (e) => this.pressed(index, e));
      if (!last) this.divider(li);
      return { li, face };
    });
    this.fit();
  }

  /** A divider after a step: a glyph whose shape is the design language's (`divider.icon`). */
  private divider(li: Component<HTMLLIElement>): void {
    const mark = part<HTMLSpanElement>(li, 'span', 'mx-glyph mx-breadcrumb__divider');
    mark.element.setAttribute('aria-hidden', 'true');
  }

  /** A step pressed: told first; a link is followed unless canceled, a disabled one never. */
  private pressed(index: number, e: Event): void {
    const look = this.looks[index];
    if (!look || !look.enabled) {
      e.preventDefault();
      return;
    }
    const args: BreadcrumbItemClickEventArgs = { item: look.item, index, cancel: false, source: this };
    this.clicked.fire(args);
    if (args.cancel) e.preventDefault();
  }

  /** As many steps as fit (and no more than `maxItems`): the ones between the first and the last go into the menu. */
  private fit(): void {
    const count = this.steps.length;
    const max = this.maxItems;
    this.hidden = new Set();
    const keep = (n: number) => {
      // Hides the steps from the second on, until `n` show (the first and the last always do).
      for (let i = 1; i < count - 1 && count - this.hidden.size > n; i++) this.hidden.add(i);
    };
    if (max !== null && count > max) keep(max);
    this.showSteps();
    const list = this.list.element;
    for (let i = 1; i < count - 1 && list.scrollWidth > list.clientWidth + 0.5; i++) {
      if (this.hidden.has(i)) continue;
      this.hidden.add(i);
      this.showSteps();
    }
  }

  private showSteps(): void {
    this.steps.forEach((step, i) => shown(step.li.element, !this.hidden.has(i)));
    shown(this.moreItem.element, this.hidden.size > 0);
    const menu: MenuItem[] = this.collapsed.map((i) => {
      const look = this.looks[i];
      return {
        text: look.text,
        icon: look.icon,
        enabled: look.enabled,
        // The step's own face is pressed: a link is followed as one, so the router takes it too.
        click: () => (this.steps[i].face.element as HTMLElement).click(),
      };
    });
    this.more.menu = menu;
  }
}
