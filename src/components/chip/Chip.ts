import { Emitter, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { glyphPart, iconPart, mark, part, put, shown, text } from '../../core/draw-parts';
import type { IconSource } from '../../core/icon-source';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { uiLocale } from '../../core/ui-locale';
import { Avatar } from '../avatar/Avatar';
import type { AvatarProps } from '../avatar/avatar-props';
import type { ChipProps } from './chip-props';
import type { ChipRemoveEventArgs } from './chip-remove-event-args';
import type { ChipSelectedChangedEventArgs } from './chip-selected-changed-event-args';
import type { ChipTone } from './chip-tone';
import type { ChipVariant } from './chip-variant';

const OWN = ['value', 'icon', 'avatar', 'selectable', 'selected', 'clickable', 'removable', 'variant', 'tone', 'size'] as const;

const STATE = ['selectable', 'selected', 'clickable', 'removable', 'tabStop'] as const;

/**
 * A short text with an icon or an avatar before it and a remove button after it. It can be clicked
 * (`clickable`), toggled (`selectable`, as a filter) or removed (`removable`: its button, Delete and Backspace raise
 * `onRemove`, and your code performs the removal). The appearance defaults to that of the design language. In a
 * `ChipGroup` with selection, the group controls which chips are selected.
 *
 * @example
 * <Chip text="Vegan" selectable selected={() => this.filters.vegan} onSelectedChanged={(e) => (this.filters.vegan = e.selected)} />
 * <Chip text={() => this.user.name} avatar={{ name: this.user.name }} removable onRemove={() => this.removeUser()} />
 */
export class Chip extends Control<HTMLSpanElement, ChipProps> {
  /** An appearance that is not set comes from the design language. */
  private readonly look = new LanguageLook(this.element, { variant: '--_chip-variant', check: '--_chip-check' }, () => this.renderLook());
  private readonly removed = new Emitter<ChipRemoveEventArgs>();
  private readonly selectedChanged = new Emitter<ChipSelectedChangedEventArgs>();
  private readonly checkPart: Component<HTMLSpanElement>;
  private readonly iconPart: Component<HTMLSpanElement>;
  private readonly textPart: Component<HTMLSpanElement>;
  private readonly removePart: Component<HTMLSpanElement>;
  private avatarPart: Avatar | null = null;
  /** The icon shown, a child of the icon part. */
  private iconShown: ComponentBase | null = null;
  private byUser = false;
  private ready = false;

  constructor(props?: IBaseProp<ChipProps>) {
    super(props);
    const own = (this.props ?? {}) as ChipProps;
    const el = this.element;
    el.classList.add('mx-chip');
    this.checkPart = part(this, 'span', 'mx-chip__check');
    glyphPart(this.checkPart, 'check');
    this.iconPart = part(this, 'span', 'mx-chip__icon');
    this.textPart = part(this, 'span', 'mx-chip__text');
    this.removePart = part(this, 'span', 'mx-chip__remove');
    glyphPart(this.removePart, 'dismiss');
    this.removePart.element.setAttribute('role', 'button');
    this.removePart.element.tabIndex = -1;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onRemove) this.onRemove(own.onRemove);
    if (own.onSelectedChanged) this.onSelectedChanged(own.onSelectedChanged);

    this.observeProperty<string>('text', () => this.renderText());
    this.observeProperty<IconSource | null>('icon', (icon) => this.renderIcon(icon));
    this.observeProperty<AvatarProps | null>('avatar', (avatar) => this.renderAvatar(avatar));
    for (const name of STATE) this.observeProperty(name, () => this.renderState());
    for (const name of ['variant', 'tone', 'size', 'selected'] as const) this.observeProperty(name, () => this.renderLook());
    this.observeProperty<boolean>('selected', (selected) => {
      if (this.ready) this.selectedChanged.fire({ selected: !!selected, byUser: this.byUser, source: this });
    });
    // The remove button's name is a kit text.
    onLanguage(this, () => this.renderText());
    void this.motif.on('click', (_sender, e) => this.pressed(e));
    void this.motif.on('keydown', (_sender, e) => this.keyDown(e));
    this.motif.setDisposable(this.look.watch());
    this.motif.setDisposable(() => {
      this.removed.dispose();
      this.selectedChanged.dispose();
    });
    this.ready = true;
  }

  // Properties (see ChipProps).

  get value(): unknown {
    const value = this.getProperty<unknown>('value');
    return value === undefined ? this.text : value;
  }
  set value(value: Bind<unknown>) {
    this.assignProperty('value', value);
  }
  get icon(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null>) {
    this.assignProperty('icon', value);
  }
  get avatar(): AvatarProps | null {
    return this.getProperty<AvatarProps | null | undefined>('avatar') ?? null;
  }
  set avatar(value: Bind<AvatarProps | null>) {
    this.assignProperty('avatar', value);
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
  get clickable(): boolean {
    return !!this.getProperty<boolean>('clickable');
  }
  set clickable(value: Bind<boolean>) {
    this.assignProperty('clickable', value, Boolean);
  }
  get removable(): boolean {
    return !!this.getProperty<boolean>('removable');
  }
  set removable(value: Bind<boolean>) {
    this.assignProperty('removable', value, Boolean);
  }
  get variant(): ChipVariant {
    return this.getProperty<ChipVariant | undefined>('variant') ?? (this.look.get('variant') as ChipVariant | null) ?? 'filled';
  }
  set variant(value: Bind<ChipVariant>) {
    this.assignProperty('variant', value);
  }
  get tone(): ChipTone {
    return this.getProperty<ChipTone | undefined>('tone') ?? 'standard';
  }
  set tone(value: Bind<ChipTone>) {
    this.assignProperty('tone', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }

  /** Occurs when the user requests removal, using the remove button or Delete / Backspace. */
  get onRemove(): MotifEvent<ChipRemoveEventArgs> {
    return this.removed.event;
  }

  /** Occurs when the chip is turned on or off, either by the user or programmatically (`e.byUser`). */
  get onSelectedChanged(): MotifEvent<ChipSelectedChangedEventArgs> {
    return this.selectedChanged.event;
  }

  /** The avatar before the text, if there is one. */
  get avatarControl(): Avatar | null {
    return this.avatarPart;
  }

  /** Requests removal, as the remove button does. */
  remove(): void {
    if (this.isEnabled) this.removed.fire({ byKeyboard: false, source: this });
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
    this.renderState();
  }

  /** @internal Draws again what a group took over or gave back (selection, role, Tab stop). */
  drawState(): void {
    this.renderState();
    this.renderLook();
  }

  /** In a group, the group owns the Tab stop (arrow keys move between chips). */
  private get inGroup(): boolean {
    return this.element.hasAttribute('data-in-group');
  }

  /** In a group that selects, the group owns the selection and the role. */
  private get asOption(): boolean {
    return this.element.hasAttribute('data-option');
  }

  private get pressable(): boolean {
    return !!(this.peekProperty('clickable') || this.peekProperty('selectable') || this.asOption);
  }

  /** @internal Whether it takes focus: it can be pressed or removed. */
  get focusable(): boolean {
    return this.pressable || !!this.peekProperty('removable');
  }

  /** Turns it on or off as the user did. */
  private toggle(): void {
    this.byUser = true;
    this.changeProperty('selected', !this.peekProperty('selected'));
    this.byUser = false;
  }

  private pressed(e: MouseEvent): void {
    if (!this.isEnabled) return;
    if (this.removePart.element.contains(e.target as Node)) {
      e.stopPropagation();
      this.removed.fire({ byKeyboard: false, source: this });
      return;
    }
    if (this.peekProperty('selectable') && !this.asOption) this.toggle();
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey || !this.isEnabled || e.target !== this.element) return;
    if ((e.key === 'Enter' || e.key === ' ') && this.pressable) {
      e.preventDefault();
      this.element.click();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && this.peekProperty('removable')) {
      e.preventDefault();
      this.removed.fire({ byKeyboard: true, source: this });
    }
  }

  private renderText(): void {
    const value = this.peekProperty<string>('text') ?? '';
    text(this.textPart.element, value);
    put(this.removePart.element, 'aria-label', uiLocale.text('removeItem', { text: value }));
  }

  private renderIcon(icon: IconSource | null | undefined): void {
    void this.iconShown?.dispose();
    this.iconShown = icon ? iconPart(this.iconPart, icon) : null;
    this.renderLead();
  }

  private renderAvatar(avatar: AvatarProps | null | undefined): void {
    this.avatarPart?.dispose();
    this.avatarPart = null;
    if (avatar) {
      const control = new Avatar({ ...avatar, size: 'xs' });
      control.element.classList.add('mx-chip__avatar');
      this.controls.insert(this.controls.items.indexOf(this.textPart), control);
      this.avatarPart = control;
    }
    this.renderLead();
  }

  /** What stands before the text: the check mark when it shows, else the icon or the avatar. */
  private renderLead(): void {
    const el = this.element;
    const check = el.hasAttribute('data-check');
    const icon = !check && !!this.peekProperty('icon');
    const avatar = !check && !icon && !!this.avatarPart;
    shown(this.iconPart.element, icon);
    if (this.avatarPart) shown(this.avatarPart.element, avatar);
    put(el, 'data-lead', check || icon ? 'icon' : avatar ? 'avatar' : null);
  }

  private renderState(): void {
    const el = this.element;
    const removable = !!this.peekProperty('removable');
    mark(el, 'data-removable', removable);
    shown(this.removePart.element, removable);
    mark(el, 'data-pressable', this.pressable);
    if (!this.asOption) {
      const selectable = !!this.peekProperty('selectable');
      put(el, 'role', selectable || this.peekProperty('clickable') ? 'button' : null);
      put(el, 'aria-pressed', selectable ? String(!!this.peekProperty('selected')) : null);
    }
    // While disabled, the Tab stop is the disabling's (it gives it back as it was).
    if (!this.inGroup && !el.hasAttribute('data-disabled')) {
      put(el, 'tabindex', this.focusable ? (this.peekProperty('tabStop') === false ? '-1' : '0') : null);
    }
  }

  private renderLook(): void {
    const el = this.element;
    put(el, 'data-size', this.peekProperty<ControlSize>('size') ?? 'md');
    put(el, 'data-variant', this.peekProperty<ChipVariant>('variant') ?? (this.look.get('variant') as ChipVariant | null) ?? 'filled');
    put(el, 'data-tone', this.peekProperty<ChipTone>('tone') ?? 'standard');
    const selected = !!this.peekProperty('selected');
    mark(el, 'data-selected', selected);
    mark(el, 'data-check', selected && this.look.get('check') === 'leading');
    if (!this.asOption) put(el, 'aria-pressed', this.peekProperty('selectable') ? String(selected) : null);
    this.renderLead();
  }
}
