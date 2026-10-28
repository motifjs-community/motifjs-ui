import { Component, read, type Bind, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { registerControl } from '../../core/control-map';
import { chevronDown } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { PanelContent } from '../tabs/PanelContent';
import type { Accordion } from './Accordion';
import type { AccordionItemProps } from './accordion-item-props';

const OWN = ['key', 'icon', 'hint', 'expanded', 'lazy', 'keepAlive'] as const;

/** The parts of an item. On one object made on first use: the base constructor already asks for the focus element. */
interface Parts {
  heading: HTMLDivElement;
  header: HTMLButtonElement;
  label: HTMLSpanElement;
  icon: HTMLSpanElement | null;
  releaseIcon: () => void;
  region: Component<HTMLDivElement>;
  body: Component<HTMLDivElement>;
  owner: Accordion | null;
  content: PanelContent | null;
  releaseTimer: ReturnType<typeof setTimeout> | undefined;
}

const PARTS = Symbol('mx.accordion-item');

/**
 * One section of an {@link Accordion}: a header button and the region it opens. The JSX
 * children are the region's content, built when it is first opened (see `lazy`).
 *
 * @example
 * <Accordion>
 *   <AccordionItem title="&Shipping"><TextBox label="Address" /></AccordionItem>
 *   <AccordionItem title="Payment" expanded>…</AccordionItem>
 * </Accordion>
 */
export class AccordionItem extends Control<HTMLDivElement, AccordionItemProps> {
  constructor(props?: IBaseProp<AccordionItemProps>) {
    super('div', props);
    const own = (this.props ?? {}) as AccordionItemProps;
    const parts = this.parts;
    this.controls.add(parts.region);
    parts.region.controls.add(parts.body);
    parts.content = new PanelContent(parts.body, this.childs ?? [], own.content);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.title !== undefined) this.bindProperty('text', own.title);

    this.observeProperty<string>('text', (text) => {
      const parsed = parseAccessKey(text ?? '');
      renderAccessKey(parts.label, parsed);
      this.setAccessKey(parsed.key);
    });
    this.observeProperty('icon', () => this.renderIcon());
    this.observeProperty<string>('hint', (hint) => {
      if (hint) parts.header.title = hint;
      else parts.header.removeAttribute('title');
    });
    this.observeProperty<boolean>('expanded', (on) => this.renderExpanded(!!on));
    this.observeProperty('key', () => parts.owner?.itemChanged(this));
    this.observeProperty('lazy', () => this.prepare());

    parts.header.addEventListener('click', (e) => {
      if (parts.owner) parts.owner.itemClicked(this, e);
      else this.setExpanded(!this.peekProperty('expanded'));
    });
    this.motif.setDisposable(() => {
      clearTimeout(parts.releaseTimer);
      parts.releaseIcon();
      parts.owner?.itemGone(this);
    });
  }

  // Properties (see AccordionItemProps).

  get title(): string {
    return this.text;
  }
  set title(value: Bind<string>) {
    this.text = value;
  }
  /** The `key` prop (also when written as the JSX `key`), `''` without one. */
  get key(): string {
    const own = this.getProperty<string | undefined>('key');
    if (own !== undefined) return own;
    const key = read((this.props as { indexkey?: unknown } | undefined)?.indexkey as Bind<unknown>);
    return key === undefined || key === null ? '' : String(key);
  }
  set key(value: Bind<string>) {
    this.assignProperty('key', value, (v) => v ?? '');
  }
  /** Whether the section is open. Setting it from code fires no cancelable event. Reactive. */
  get expanded(): boolean {
    return !!this.getProperty<boolean>('expanded');
  }
  set expanded(value: Bind<boolean>) {
    this.assignProperty('expanded', value, Boolean);
  }
  get icon(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null>) {
    this.assignProperty('icon', value);
  }
  get hint(): string {
    return this.getProperty<string | undefined>('hint') ?? '';
  }
  set hint(value: Bind<string>) {
    this.assignProperty('hint', value);
  }
  /** This item's own setting; `undefined` follows the `Accordion`. */
  get lazy(): boolean | undefined {
    return this.getProperty<boolean | undefined>('lazy');
  }
  set lazy(value: Bind<boolean | undefined>) {
    this.assignProperty('lazy', value);
  }
  get keepAlive(): boolean | undefined {
    return this.getProperty<boolean | undefined>('keepAlive');
  }
  set keepAlive(value: Bind<boolean | undefined>) {
    this.assignProperty('keepAlive', value);
  }

  /** The `Accordion` it belongs to. */
  get owner(): Accordion | null {
    return this.parts.owner;
  }

  /** Whether its section content has been built (see `lazy`). */
  get contentBuilt(): boolean {
    return !!this.parts.content?.isBuilt;
  }

  /** The header button. */
  get headerElement(): HTMLButtonElement {
    return this.parts.header;
  }

  /** The region the header opens. */
  get regionElement(): HTMLDivElement {
    return this.parts.region.element;
  }

  /** Opens the section as a click would: `onExpanding` can cancel it. */
  expand(): boolean {
    return this.toggleAsUser(true);
  }

  /** Closes the section as a click would: `onCollapsing` can cancel it. */
  collapse(): boolean {
    return this.toggleAsUser(false);
  }

  protected override get focusElement(): HTMLElement {
    return this.parts.header;
  }

  /** The access key focuses the header and presses it. */
  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    this.parts.header.click();
    return true;
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'visible' || name === 'enabled') this.parts.owner?.itemChanged(this);
  }

  /** @internal Joins or leaves an `Accordion`. */
  attachTo(owner: Accordion | null): void {
    this.parts.owner = owner;
    this.prepare();
  }

  /** @internal Opens or closes it, keeping a bound `expanded` getter. */
  setExpanded(on: boolean): void {
    this.changeProperty('expanded', on);
  }

  /** @internal The heading level and whether the section is a region; the Accordion decides. */
  renderOuter(level: number, region: boolean, locked: boolean): void {
    const parts = this.parts;
    parts.heading.setAttribute('aria-level', String(level));
    const el = parts.region.element;
    if (region) {
      el.setAttribute('role', 'region');
      el.setAttribute('aria-labelledby', parts.header.id);
    } else {
      el.removeAttribute('role');
      el.removeAttribute('aria-labelledby');
    }
    // An open section that may not close says so (APG).
    if (locked) parts.header.setAttribute('aria-disabled', 'true');
    else parts.header.removeAttribute('aria-disabled');
  }

  /** @internal Builds the section now when it is not lazy. */
  prepare(): void {
    if (this.peekProperty('expanded') || !this.lazyNow()) this.parts.content?.build();
  }

  private toggleAsUser(on: boolean): boolean {
    if (!!this.peekProperty('expanded') === on) return true;
    const owner = this.parts.owner;
    if (!owner) {
      this.setExpanded(on);
      return true;
    }
    owner.itemClicked(this);
    return !!this.peekProperty('expanded') === on;
  }

  private lazyNow(): boolean {
    return this.peekProperty<boolean>('lazy') ?? this.parts.owner?.lazy ?? true;
  }

  private keepAliveNow(): boolean {
    return this.peekProperty<boolean>('keepAlive') ?? this.parts.owner?.keepAlive ?? true;
  }

  private renderExpanded(on: boolean): void {
    const parts = this.parts;
    this.element.toggleAttribute('data-expanded', on);
    parts.header.setAttribute('aria-expanded', String(on));
    clearTimeout(parts.releaseTimer);
    if (on) parts.content?.build();
    else if (!this.keepAliveNow()) {
      // Dropped once the closing animation is over.
      const wait = longestTransition(parts.region.element);
      if (wait) parts.releaseTimer = setTimeout(() => parts.content?.release(), wait);
      else parts.content?.release();
    }
    parts.owner?.itemToggled(this);
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    if (!icon) {
      parts.icon?.remove();
      parts.icon = null;
      return;
    }
    if (!parts.icon) {
      parts.icon = document.createElement('span');
      parts.icon.className = 'mx-accordion__icon';
      parts.icon.setAttribute('aria-hidden', 'true');
      parts.label.before(parts.icon);
    }
    const shown = iconNode(icon);
    parts.icon.replaceChildren(shown.node);
    parts.releaseIcon = shown.release;
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.element.classList.add('mx-accordion__item');
    const heading = document.createElement('div');
    heading.className = 'mx-accordion__heading';
    heading.setAttribute('role', 'heading');
    heading.setAttribute('aria-level', '3');
    const header = heading.appendChild(document.createElement('button'));
    header.type = 'button';
    header.className = 'mx-accordion__header';
    header.id = nextId('accordion-header');
    header.setAttribute('aria-expanded', 'false');
    const label = header.appendChild(document.createElement('span'));
    label.className = 'mx-accordion__label';
    // The chevron stands in a plate of its own, which a language may draw behind it.
    const plate = header.appendChild(document.createElement('span'));
    plate.className = 'mx-accordion__plate';
    const chevron = plate.appendChild(chevronDown());
    chevron.classList.add('mx-accordion__chevron');
    registerControl(header, this);
    this.element.prepend(heading);

    const region = new Component<HTMLDivElement>('div');
    region.element.className = 'mx-accordion__region';
    region.element.id = nextId('accordion-region');
    header.setAttribute('aria-controls', region.element.id);
    const body = new Component<HTMLDivElement>('div');
    body.element.className = 'mx-accordion__body';
    return { heading, header, label, icon: null, releaseIcon: () => {}, region, body, owner: null, content: null, releaseTimer: undefined };
  }
}

/** The longest transition on an element, in milliseconds (0 under reduced motion). */
function longestTransition(el: Element): number {
  if (typeof getComputedStyle !== 'function' || !el.isConnected) return 0;
  const style = getComputedStyle(el);
  const durations = style.transitionDuration.split(',');
  const delays = style.transitionDelay.split(',');
  let longest = 0;
  durations.forEach((d, i) => {
    longest = Math.max(longest, seconds(d) + seconds(delays[i] ?? '0s'));
  });
  return longest * 1000;
}

function seconds(text: string): number {
  const value = parseFloat(text);
  if (!Number.isFinite(value)) return 0;
  return text.trim().endsWith('ms') ? value / 1000 : value;
}
