import { Emitter, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { iconPart, mark, part, put, shown, text } from '../../core/draw-parts';
import type { IconSource } from '../../core/icon-source';
import { LanguageLook } from '../../core/language-look';
import { nextId } from '../../core/next-id';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import { Avatar } from '../avatar/Avatar';
import type { AvatarProps } from '../avatar/avatar-props';
import { CheckBox } from '../checkbox/CheckBox';
import type { CardOrientation } from './card-orientation';
import type { CardProps } from './card-props';
import type { CardSelectedChangedEventArgs } from './card-selected-changed-event-args';
import type { CardVariant } from './card-variant';

const OWN = [
  'title',
  'subtitle',
  'avatar',
  'action',
  'media',
  'mediaAlt',
  'content',
  'footer',
  'variant',
  'size',
  'orientation',
  'clickable',
  'href',
  'rel',
  'selectable',
  'selected',
] as const;

/** What a press on a selectable card leaves to itself: its own buttons, links and fields. */
const OWN_PRESS = 'a, button, input, select, textarea, [role="button"], [role="checkbox"], [tabindex]';

/** The parts that hold a component given in a prop. */
type Slot = 'action' | 'content' | 'footer';

/**
 * A surface holding one thing: a picture running to its edges, a header (avatar, title, subtitle and an
 * action), content (JSX children or `content`) and a row of actions (`footer`). Parts with nothing in them
 * are left out. Its look defaults to the design language's; `clickable` makes the whole card pressable.
 *
 * @example
 * <Card title="Ada Lovelace" subtitle="Mathematician" avatar={{ name: 'Ada Lovelace' }} footer={<Button text="Follow" />}>
 *   First to publish an algorithm meant for a machine.
 * </Card>
 */
export class Card extends Control<HTMLDivElement, CardProps> {
  /** A look not given is the design language's. */
  private readonly look = new LanguageLook(this.element, { variant: '--_card-variant' }, () => this.renderLook());
  private readonly mediaPart: Component<HTMLDivElement>;
  private readonly headerPart: Component<HTMLDivElement>;
  private readonly titlePart: Component<HTMLDivElement>;
  /** The title as text, or as the link of a link card. */
  private readonly titleText: Component<HTMLSpanElement>;
  private readonly titleLink: Component<HTMLAnchorElement>;
  private readonly subtitlePart: Component<HTMLDivElement>;
  private readonly selectPart: Component<HTMLDivElement>;
  private checkBox: CheckBox | null = null;
  private readonly selectedChanged = new Emitter<CardSelectedChangedEventArgs>();
  private byUser = false;
  private ready = false;
  private readonly slots: Record<Slot, Component<HTMLDivElement>>;
  private readonly placed: Record<Slot, ComponentBase | null> = { action: null, content: null, footer: null };
  private avatarPart: Avatar | null = null;
  /** The picture shown, a child of the media part. */
  private mediaShown: ComponentBase | null = null;

  constructor(props?: IBaseProp<CardProps>) {
    super('div', props);
    const own = (this.props ?? {}) as CardProps;
    const el = this.element;
    el.classList.add('mx-card');
    this.mediaPart = part(this, 'div', 'mx-card__media');
    const body = part<HTMLDivElement>(this, 'div', 'mx-card__body');
    this.headerPart = part(body, 'div', 'mx-card__header');
    const heading = part<HTMLDivElement>(this.headerPart, 'div', 'mx-card__heading');
    this.titlePart = part(heading, 'div', 'mx-card__title');
    this.titlePart.element.id = nextId('card-title');
    this.titleText = part(this.titlePart, 'span', '');
    this.titleLink = part(this.titlePart, 'a', 'mx-card__link');
    this.subtitlePart = part(heading, 'div', 'mx-card__subtitle');
    this.slots = {
      action: part(this.headerPart, 'div', 'mx-card__action'),
      content: part(body, 'div', 'mx-card__content'),
      footer: part(body, 'div', 'mx-card__footer'),
    };
    this.selectPart = part(this, 'div', 'mx-card__select');
    if (this.childs?.length) this.slots.content.controls.add(...this.childs);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onSelectedChanged) this.onSelectedChanged(own.onSelectedChanged);

    for (const name of ['title', 'subtitle', 'href', 'rel'] as const) this.observeProperty(name, () => this.renderHeader());
    for (const name of ['selectable', 'selected'] as const) this.observeProperty(name, () => this.renderSelect());
    this.observeProperty<boolean>('selected', (selected) => {
      if (this.ready) this.selectedChanged.fire({ selected: !!selected, byUser: this.byUser, source: this });
    });
    // The check box is named after the title, in the kit's language.
    onLanguage(this, () => this.renderSelect());
    void this.motif.on('click', (_sender, e) => this.pressed(e));
    this.motif.setDisposable(() => this.selectedChanged.dispose());
    this.observeProperty<AvatarProps | null>('avatar', (avatar) => this.renderAvatar(avatar));
    for (const name of ['action', 'content', 'footer'] as const) this.observeProperty(name, () => this.place(name));
    for (const name of ['media', 'mediaAlt'] as const) this.observeProperty(name, () => this.renderMedia());
    for (const name of ['variant', 'size', 'orientation', 'clickable'] as const) this.observeProperty(name, () => this.renderLook());
    void this.motif.on('keydown', (_sender, e) => this.keyDown(e));
    this.motif.setDisposable(this.look.watch());
    this.ready = true;
  }

  // Properties (see CardProps).

  get title(): string {
    return this.getProperty<string | undefined>('title') ?? '';
  }
  set title(value: Bind<string>) {
    this.assignProperty('title', value);
  }
  get subtitle(): string {
    return this.getProperty<string | undefined>('subtitle') ?? '';
  }
  set subtitle(value: Bind<string>) {
    this.assignProperty('subtitle', value);
  }
  get avatar(): AvatarProps | null {
    return this.getProperty<AvatarProps | null | undefined>('avatar') ?? null;
  }
  set avatar(value: Bind<AvatarProps | null>) {
    this.assignProperty('avatar', value);
  }
  get action(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('action') ?? null;
  }
  set action(value: Bind<ComponentBase | null>) {
    this.assignProperty('action', value);
  }
  get media(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('media') ?? null;
  }
  set media(value: Bind<IconSource | null>) {
    this.assignProperty('media', value);
  }
  get mediaAlt(): string {
    return this.getProperty<string | undefined>('mediaAlt') ?? '';
  }
  set mediaAlt(value: Bind<string>) {
    this.assignProperty('mediaAlt', value);
  }
  get content(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('content') ?? null;
  }
  set content(value: Bind<ComponentBase | null>) {
    this.assignProperty('content', value);
  }
  get footer(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('footer') ?? null;
  }
  set footer(value: Bind<ComponentBase | null>) {
    this.assignProperty('footer', value);
  }
  get variant(): CardVariant {
    return this.getProperty<CardVariant | undefined>('variant') ?? (this.look.get('variant') as CardVariant | null) ?? 'elevated';
  }
  set variant(value: Bind<CardVariant>) {
    this.assignProperty('variant', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get orientation(): CardOrientation {
    return this.getProperty<CardOrientation | undefined>('orientation') ?? 'vertical';
  }
  set orientation(value: Bind<CardOrientation>) {
    this.assignProperty('orientation', value);
  }
  get clickable(): boolean {
    return !!this.getProperty<boolean>('clickable');
  }
  set clickable(value: Bind<boolean>) {
    this.assignProperty('clickable', value, Boolean);
  }

  get href(): string | null {
    return this.getProperty<string | null | undefined>('href') || null;
  }
  set href(value: Bind<string | null>) {
    this.assignProperty('href', value);
  }
  get rel(): string {
    return this.getProperty<string | undefined>('rel') ?? '';
  }
  set rel(value: Bind<string>) {
    this.assignProperty('rel', value);
  }
  get selectable(): boolean {
    return !!this.getProperty<boolean>('selectable');
  }
  set selectable(value: Bind<boolean>) {
    this.assignProperty('selectable', value, Boolean);
  }
  get selected(): boolean {
    return !!this.getProperty<boolean>('selected');
  }
  set selected(value: Bind<boolean>) {
    this.assignProperty('selected', value, Boolean);
  }

  /** It was selected or not any more, by the user or by code (`e.byUser`). */
  get onSelectedChanged(): MotifEvent<CardSelectedChangedEventArgs> {
    return this.selectedChanged.event;
  }

  /** The part holding the content, for adding to it programmatically. */
  get contentPart(): Component<HTMLDivElement> {
    return this.slots.content;
  }

  /** The avatar before the titles, when it has one. */
  get avatarControl(): Avatar | null {
    return this.avatarPart;
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target !== this.element || !this.peekProperty('clickable') || !this.isEnabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.element.click();
    }
  }

  /** A component given in a prop goes into its part; the one it replaces leaves it (it stays yours). */
  private place(slot: Slot): void {
    const control = this.peekProperty<ComponentBase | null>(slot) ?? null;
    const area = this.slots[slot];
    const old = this.placed[slot];
    if (control !== old) {
      if (old && old.parent === area) area.controls.remove(old);
      this.placed[slot] = control;
      if (control) area.controls.add(control);
    }
    if (slot === 'content') return;
    shown(area.element, !!control);
    if (slot === 'action') this.renderHeader();
  }

  /** A press on a selectable card turns it on and off, unless it was on one of its own buttons, links or fields. */
  private pressed(e: MouseEvent): void {
    if (!this.peekProperty('selectable') || !this.isEnabled) return;
    // Its own controls keep their press (the check box turns it on and off itself).
    const own = (e.target as Element).closest(OWN_PRESS);
    if (own && own !== this.element && this.element.contains(own)) return;
    this.toggle(!this.peekProperty('selected'));
  }

  private toggle(selected: boolean): void {
    this.byUser = true;
    this.changeProperty('selected', selected);
    this.byUser = false;
  }

  private renderSelect(): void {
    const selectable = !!this.peekProperty('selectable');
    const selected = !!this.peekProperty('selected');
    mark(this.element, 'data-selected', selectable && selected);
    shown(this.selectPart.element, selectable);
    if (selectable && !this.checkBox) {
      this.checkBox = new CheckBox({ labelMode: 'hidden', onValueChanged: (e) => e.byUser && this.toggle(!!e.value) });
      this.selectPart.controls.add(this.checkBox);
    }
    if (!this.checkBox) return;
    if (this.checkBox.value !== selected) this.checkBox.value = selected;
    const title = this.peekProperty<string>('title') ?? '';
    const label = uiLocale.text('cardSelect', { title });
    if (this.checkBox.label !== label) this.checkBox.label = label;
  }

  private renderHeader(): void {
    const title = this.peekProperty<string>('title') ?? '';
    const subtitle = this.peekProperty<string>('subtitle') ?? '';
    const href = this.peekProperty<string | null>('href') || null;
    const link = this.titleLink.element;
    text(href ? link : this.titleText.element, title);
    text(href ? this.titleText.element : link, '');
    put(link, 'href', href);
    put(link, 'rel', href ? this.peekProperty<string>('rel') || null : null);
    shown(link, !!href);
    shown(this.titleText.element, !href);
    mark(this.element, 'data-link', !!href);
    mark(this.element, 'data-pressable', !!href || !!this.peekProperty('clickable'));
    text(this.subtitlePart.element, subtitle);
    // The check box is named after the title.
    this.renderSelect();
    shown(this.titlePart.element, !!title);
    shown(this.subtitlePart.element, !!subtitle);
    shown(this.headerPart.element, !!(title || subtitle || this.avatarPart || this.placed.action));
    put(this.element, 'aria-labelledby', title ? this.titlePart.element.id : null);
  }

  private renderAvatar(avatar: AvatarProps | null | undefined): void {
    this.avatarPart?.dispose();
    this.avatarPart = null;
    if (avatar) {
      const control = new Avatar({ size: this.peekProperty<ControlSize>('size') === 'sm' ? 'sm' : 'md', ...avatar });
      control.element.classList.add('mx-card__avatar');
      this.headerPart.controls.insert(0, control);
      this.avatarPart = control;
    }
    this.renderHeader();
  }

  private renderMedia(): void {
    void this.mediaShown?.dispose();
    const media = this.peekProperty<IconSource | null>('media') ?? null;
    this.mediaShown = media ? iconPart(this.mediaPart, media, this.peekProperty<string>('mediaAlt') ?? '') : null;
    shown(this.mediaPart.element, !!media);
  }

  private renderLook(): void {
    const el = this.element;
    put(el, 'data-variant', this.peekProperty<CardVariant>('variant') ?? (this.look.get('variant') as CardVariant | null) ?? 'elevated');
    put(el, 'data-size', this.peekProperty<ControlSize>('size') ?? 'md');
    put(el, 'data-orientation', this.peekProperty<CardOrientation>('orientation') ?? 'vertical');
    // A link card is pressed through its link: the card itself takes no focus.
    const clickable = !!this.peekProperty('clickable');
    mark(el, 'data-pressable', clickable || !!this.peekProperty('href'));
    put(el, 'role', 'group');
    // While disabled, the Tab stop is the disabling's (it gives it back as it was).
    if (!el.hasAttribute('data-disabled')) put(el, 'tabindex', clickable ? (this.peekProperty('tabStop') === false ? '-1' : '0') : null);
  }
}
