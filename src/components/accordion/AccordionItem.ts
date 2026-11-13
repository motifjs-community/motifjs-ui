import { read, type Bind, type Component, type ComponentBase, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { clearParts, glyphPart, loose, part, partBefore, removePart } from '../../core/draw-parts';
import { isInPage, measure, transitionTime } from '../../core/measure';
import { mark, put } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { PanelContent } from '../tabs/PanelContent';
import type { Accordion } from './Accordion';
import type { AccordionItemProps } from './accordion-item-props';

const OWN = ['key', 'icon', 'hint', 'expanded', 'lazy', 'keepAlive'] as const;

/** The parts of an item. On one object made on first use: the base constructor already asks for the focus element. */
interface Parts {
  heading: Component<HTMLDivElement>;
  header: Component<HTMLButtonElement>;
  /** The header's id: the region is labelled by it. */
  headerId: string;
  label: Component<HTMLSpanElement>;
  icon: Component<HTMLSpanElement> | null;
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
 * children are the content of the region, created when it is first opened (see `lazy`).
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
      if (hint) put(parts.header, 'title', hint);
      else put(parts.header, 'title', null);
    });
    this.observeProperty<boolean>('expanded', (on) => this.renderExpanded(!!on));
    this.observeProperty('key', () => parts.owner?.itemChanged(this));
    this.observeProperty('lazy', () => this.prepare());

    parts.header.motif.on('click', (_sender, e: MouseEvent) => {
      if (parts.owner) parts.owner.itemClicked(this, e);
      else this.setExpanded(!this.peekProperty('expanded'));
    });
    parts.header.motif.on('keydown', (_sender, e: KeyboardEvent) => parts.owner?.headerKeyDown(this, e));
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
  /** The `key` prop, also when written as the JSX `key`, or `''` if there is none. */
  get key(): string {
    const own = this.getProperty<string | undefined>('key');
    if (own !== undefined) return own;
    const key = read((this.props as { indexkey?: unknown } | undefined)?.indexkey as Bind<unknown>);
    return key === undefined || key === null ? '' : String(key);
  }
  set key(value: Bind<string>) {
    this.assignProperty('key', value, (v) => v ?? '');
  }
  /** Indicates whether the section is open. Setting it programmatically raises no cancelable event. Reactive. */
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
  /** This item's own setting. `undefined` inherits from the `Accordion`. */
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

  /** The `Accordion` that owns the item. */
  get owner(): Accordion | null {
    return this.parts.owner;
  }

  /** Indicates whether the section content has been created (see `lazy`). */
  get contentBuilt(): boolean {
    return !!this.parts.content?.isBuilt;
  }

  /** The header button, as a component. */
  get headerPart(): Component<HTMLButtonElement> {
    return this.parts.header;
  }

  /** The region the header opens, as a component. */
  get regionPart(): Component<HTMLDivElement> {
    return this.parts.region;
  }

  /** Opens the section as a click would, so `onExpanding` can cancel it. */
  expand(): boolean {
    return this.toggleAsUser(true);
  }

  /** Closes the section as a click would, so `onCollapsing` can cancel it. */
  collapse(): boolean {
    return this.toggleAsUser(false);
  }

  override get focusPart(): ComponentBase {
    return this.parts.header;
  }

  /** The access key moves focus to the header and opens or closes the section, as a click does. */
  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    this.toggleAsUser(!this.peekProperty('expanded'));
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
    put(parts.heading, 'aria-level', String(level));
    if (region) {
      put(parts.region, 'role', 'region');
      put(parts.region, 'aria-labelledby', parts.headerId);
    } else {
      put(parts.region, 'role', null);
      put(parts.region, 'aria-labelledby', null);
    }
    // An open section that may not close says so (APG).
    if (locked) put(parts.header, 'aria-disabled', 'true');
    else put(parts.header, 'aria-disabled', null);
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
    mark(this, 'data-expanded', on);
    put(parts.header, 'aria-expanded', String(on));
    clearTimeout(parts.releaseTimer);
    if (on) parts.content?.build();
    else if (!this.keepAliveNow()) measure(this, this.readClosing, this.dropContent);
    parts.owner?.itemToggled(this);
  }

  // A closed section's content is dropped once the closing animation is over.
  private readonly readClosing = (): number => {
    const region = this.parts.region;
    return isInPage(region) ? transitionTime(region) : 0;
  };

  private readonly dropContent = (wait: number): void => {
    const parts = this.parts;
    if (this.peekProperty('expanded')) return;
    clearTimeout(parts.releaseTimer);
    if (wait) parts.releaseTimer = setTimeout(() => parts.content?.release(), wait);
    else parts.content?.release();
  };

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    if (!icon) {
      if (parts.icon) removePart(parts.icon);
      parts.icon = null;
      return;
    }
    let host = parts.icon;
    if (!host) {
      host = partBefore<HTMLSpanElement>(parts.header, parts.label, 'span', 'mx-accordion__icon');
      host.attr.add({ 'aria-hidden': 'true' });
      parts.icon = host;
    }
    clearParts(host);
    parts.releaseIcon = showIcon(icon, host);
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.class.add('mx-accordion__item');
    const heading = partBefore<HTMLDivElement>(this, this.controls.items[0] ?? null, 'div', 'mx-accordion__heading');
    heading.attr.add({ role: 'heading', 'aria-level': '3' });
    const header = part<HTMLButtonElement>(heading, 'button', 'mx-accordion__header');
    const headerId = nextId('accordion-header');
    header.attr.add({ type: 'button', id: headerId, 'aria-expanded': 'false' });
    const label = part<HTMLSpanElement>(header, 'span', 'mx-accordion__label');
    // The chevron stands in a plate of its own, which a language may draw behind it.
    glyphPart(part(header, 'span', 'mx-accordion__plate'), 'chevron-down', 'mx-accordion__chevron');

    const region = loose<HTMLDivElement>('div', 'mx-accordion__region');
    const regionId = nextId('accordion-region');
    region.attr.add({ id: regionId });
    header.attr.add({ 'aria-controls': regionId });
    const body = loose<HTMLDivElement>('div', 'mx-accordion__body');
    return { heading, header, headerId, label, icon: null, releaseIcon: () => {}, region, body, owner: null, content: null, releaseTimer: undefined };
  }
}
