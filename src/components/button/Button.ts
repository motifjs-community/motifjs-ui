import { LanguageLook } from '../../core/language-look';
import { Component, type Bind, type ComponentBase, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { canTakeFocus, focusFirstIn, focusOn } from '../../core/focus';
import { clearParts, glyphPart, part, partBefore, removePart } from '../../core/draw-parts';
import { flag, mark, put } from '../../core/part-writes';
import { givenField, givenList } from '../../core/given-field';
import { showIcon } from '../../core/show-icon';
import { iconCopy, type IconSource } from '../../core/icon-source';
import { uiLocale } from '../../core/ui-locale';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../parts/popup/Popup';
import type { ButtonProps } from './button-props';
import type { ButtonSize } from './button-size';
import type { ButtonTone } from './button-tone';
import type { ButtonVariant } from './button-variant';
import { onLanguage } from '../../core/on-language';
import { runItem } from '../../core/command-fields';

const OWN = [
  'variant',
  'tone',
  'size',
  'icon',
  'iconPosition',
  'stretch',
  'type',
  'hint',
  'toggle',
  'pressed',
  'busy',
  'focusableWhenDisabled',
  'split',
  'menu',
  'dropDown',
] as const;

const LOOK = ['variant', 'tone', 'size', 'iconPosition', 'stretch'] as const;

/** The parts of a button. On one object made on first use: the base constructor already asks for the focus part. */
interface Parts {
  /** With a menu, the main part and the arrow are components of the button: JSX children are the main part's. */
  facePart: Component<HTMLButtonElement> | null;
  arrowPart: Component<HTMLButtonElement> | null;
  stopArrowLabel: (() => void) | null;
  caption: Component<HTMLSpanElement> | null;
  icon: Component<HTMLSpanElement> | null;
  releaseIcon: () => void;
  spinner: Component<HTMLSpanElement> | null;
  chevron: Component<HTMLSpanElement> | null;
  popup: Popup | null;
  list: MenuList | null;
  content: ComponentBase | null;
}

const PARTS = Symbol('mx.button');

function withMenu(props: ButtonProps | undefined): boolean {
  return !!props && (props.split !== undefined || props.menu !== undefined || props.dropDown !== undefined);
}

/**
 * A `<button>` drawn from the design tokens. The caption is `text` (`&Save` makes Alt+S click it)
 * or the JSX children, with an optional icon. It can be a toggle (`pressed`, where `x-model` provides two-way
 * binding), show that work is in progress (`busy`), and open a menu or any content. The whole button opens it, or
 * with `split` an arrow next to the button opens it while the button keeps its own action.
 *
 * @example
 * <Button text="&Save" tone="accent" onclick={() => this.model.save()} />
 * <Button text="Save" split menu={[{ text: 'Save as…', click: () => this.saveAs() }]} onclick={() => this.save()} />
 *
 * const retry = new Button({ text: 'Retry', icon: '/icons/retry.svg' });
 * this.toolbar.controls.add(retry);
 * retry.busy = true;
 */
export class Button extends Control<HTMLElement, ButtonProps> {
  /** A variant, tone or size not given is the design language's, or the one of the place the button sits in. */
  private readonly look = new LanguageLook(this, { variant: '--_button-variant', tone: '--_button-tone', size: '--_button-size' }, () =>
    this.renderLook(),
  );
  /** The icon as given, a function too: the "more" menu calls it again for its own copy. */
  private givenIcon: Bind<IconSource | null | undefined>;

  constructor(props?: IBaseProp<ButtonProps>) {
    // A button with a menu is two parts in a group, so its element is chosen here.
    super(withMenu(props) ? 'div' : 'button', props);
    const own = (this.props ?? {}) as ButtonProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    this.givenIcon = own.icon;

    this.observeProperty<string>('text', (text) => this.renderText(text));
    this.observeProperty('icon', () => this.renderIcon());
    this.observeProperty<boolean>('busy', (busy) => this.renderBusy(!!busy));
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.observeProperty<string>('hint', (hint) => this.renderHint(hint));
    this.observeProperty<boolean>('focusableWhenDisabled', (on) => this.renderFocusable(!!on));
    this.observeProperty('split', () => this.renderMode());
    this.observeProperty('type', () => this.renderMode());
    this.observeProperty('toggle', () => this.renderPressed());
    this.observeProperty('pressed', () => this.renderPressed());
    this.observeProperty('menu', () => this.refill());
    this.observeProperty('dropDown', () => this.refill());

    this.motif.setDisposable(this.look.watch());
    this.listen();
    this.placeChildren();
    this.motif.setDisposable(() => {
      const parts = this.parts;
      parts.releaseIcon();
      parts.stopArrowLabel?.();
      // The drop-down content goes with the button: until its popup first opens it is in no tree.
      const content = this.peekProperty<ComponentBase | null>('dropDown');
      if (content && !content.isDisposed) content.dispose();
    });
  }

  // Properties (see ButtonProps).

  get variant(): ButtonVariant {
    return this.getProperty<ButtonVariant | undefined>('variant') ?? (this.look.get('variant') as ButtonVariant | null) ?? 'solid';
  }
  set variant(value: Bind<ButtonVariant>) {
    this.assignProperty('variant', value);
  }
  get tone(): ButtonTone {
    return this.getProperty<ButtonTone | undefined>('tone') ?? (this.look.get('tone') as ButtonTone | null) ?? 'standard';
  }
  set tone(value: Bind<ButtonTone>) {
    this.assignProperty('tone', value);
  }
  get size(): ButtonSize {
    return this.getProperty<ButtonSize | undefined>('size') ?? (this.look.get('size') as ButtonSize | null) ?? 'md';
  }
  set size(value: Bind<ButtonSize>) {
    this.assignProperty('size', value);
  }
  get icon(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null>) {
    this.givenIcon = value;
    this.assignProperty('icon', value);
  }
  /**
   * @internal A new copy of the icon for a second place (the "more" menu of a toolbar or a ribbon): an address as it
   * is, a function given called again. `null` for a component given as is, which stays in the button.
   */
  iconCopy(): IconSource | null {
    // Read tracked: a menu item drawn from it follows the icon.
    const shown = this.icon;
    return shown ? iconCopy(this.givenIcon, shown) : null;
  }
  get iconPosition(): 'start' | 'end' {
    return this.getProperty<'start' | 'end' | undefined>('iconPosition') ?? 'start';
  }
  set iconPosition(value: Bind<'start' | 'end'>) {
    this.assignProperty('iconPosition', value);
  }
  get stretch(): boolean {
    return !!this.getProperty<boolean>('stretch');
  }
  set stretch(value: Bind<boolean>) {
    this.assignProperty('stretch', value, Boolean);
  }
  get type(): 'button' | 'submit' | 'reset' {
    return this.getProperty<'button' | 'submit' | 'reset' | undefined>('type') ?? 'button';
  }
  set type(value: Bind<'button' | 'submit' | 'reset'>) {
    this.assignProperty('type', value);
  }
  get hint(): string {
    return this.getProperty<string | undefined>('hint') ?? '';
  }
  set hint(value: Bind<string>) {
    this.assignProperty('hint', value);
  }
  get toggle(): boolean {
    return !!this.getProperty<boolean>('toggle');
  }
  set toggle(value: Bind<boolean>) {
    this.assignProperty('toggle', value, Boolean);
  }
  get pressed(): boolean {
    return !!this.getProperty<boolean>('pressed');
  }
  set pressed(value: Bind<boolean>) {
    const before = !!this.peekProperty('pressed');
    this.assignProperty('pressed', value, Boolean);
    // A state set programmatically shows in `x-model` too, so the model and the button never differ.
    const now = !!this.peekProperty('pressed');
    if (typeof value !== 'function' && now !== before) this.bindings.writeModel(now);
  }
  get busy(): boolean {
    return !!this.getProperty<boolean>('busy');
  }
  set busy(value: Bind<boolean>) {
    this.assignProperty('busy', value, Boolean);
  }
  get focusableWhenDisabled(): boolean {
    return !!this.getProperty<boolean>('focusableWhenDisabled');
  }
  set focusableWhenDisabled(value: Bind<boolean>) {
    this.assignProperty('focusableWhenDisabled', value, Boolean);
  }
  get split(): boolean {
    return !!this.getProperty<boolean>('split');
  }
  set split(value: Bind<boolean>) {
    this.requireMenu();
    this.assignProperty('split', value, Boolean);
  }
  get menu(): readonly MenuItem[] {
    return this.getProperty<readonly MenuItem[] | undefined>('menu') ?? [];
  }
  set menu(value: Bind<readonly MenuItem[]>) {
    this.requireMenu();
    this.assignProperty('menu', value);
  }
  get dropDown(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('dropDown') ?? null;
  }
  set dropDown(value: Bind<ComponentBase | null>) {
    this.requireMenu();
    this.assignProperty('dropDown', value);
  }

  /** Maps to `pressed` for `x-model` on a toggle button. */
  get value(): boolean {
    return this.pressed;
  }
  set value(value: boolean) {
    this.pressed = !!value;
  }

  /** Indicates whether the button was created with a menu (`split`, `menu` or `dropDown`). */
  get hasMenu(): boolean {
    return this.parts.facePart !== null;
  }

  /** Indicates whether the menu or drop-down is open. Reactive. Set it to open or close it. */
  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }
  set opened(value: boolean) {
    if (value) this.open();
    else this.close();
  }

  /**
   * Opens the menu or drop-down with focus on its first item. Returns `false` if there is nothing to open or the
   * button cannot be used.
   */
  open(): boolean {
    return this.openMenu('first');
  }

  close(): void {
    this.parts.popup?.close('code');
  }

  /**
   * Re-reads the menu after its items have been changed in place, and an open menu shows the change immediately.
   * Your items can be plain or reactive, and the button reads them as they are.
   */
  refresh(): void {
    this.refill();
    if (this.parts.popup?.isOpen) this.parts.list?.refresh();
  }

  /**
   * Sets focus on the first item of the open menu that `test` accepts. Returns `false` if the menu is not open or
   * no item is accepted.
   */
  focusMenuItem(test: (item: MenuItem) => boolean): boolean {
    const parts = this.parts;
    if (!parts.popup?.isOpen || !parts.list) return false;
    return parts.list.focusWhere(test);
  }

  // Focus and keys.

  override get focusPart(): ComponentBase {
    return this.faceComponent;
  }

  override get canFocus(): boolean {
    return (this.isEnabled || this.focusableWhenDisabled) && canTakeFocus(this.faceComponent);
  }

  /** The access key clicks the button, as HTML `accesskey` does. With a menu and no `split`, it opens the menu. */
  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    this.faceComponent.attr.add({ click: true });
    return true;
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'tabStop') {
      const arrow = this.parts.arrowPart;
      if (arrow && value === false) put(arrow, 'tabindex', '-1');
      else if (arrow) put(arrow, 'tabindex', null);
    } else if (name === 'enabled' && value === false) {
      this.close();
    }
  }

  // Parts.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.class.add('mx-button');
    let facePart: Component<HTMLButtonElement> | null = null;
    // The constructor picked the element from the same props.
    if (withMenu(this.props)) {
      facePart = new Component<HTMLButtonElement>('button');
      facePart.class.add('mx-button__main');
      this.controls.insert(0, facePart);
    }
    (facePart ?? this).class.add('mx-button__face');
    put(facePart ?? this, 'type', 'button');
    return {
      facePart,
      arrowPart: null,
      stopArrowLabel: null,
      caption: null,
      icon: null,
      releaseIcon: () => {},
      spinner: null,
      chevron: null,
      popup: null,
      list: null,
      content: null,
    };
  }

  private requireMenu(): void {
    if (!this.hasMenu) throw new TypeError('Button: give it split, menu or dropDown when it is created to use a menu.');
  }

  /** JSX children go after the text: in the button, or in its main part. */
  private placeChildren(): void {
    const childs = this.childs ?? [];
    if (!childs.length) return;
    (this.parts.facePart ?? this).controls.add(...childs);
  }

  private listen(): void {
    // Busy: a click does nothing, before any other listener sees it.
    this.motif.on('click:capture', (_, e) => {
      if (!this.peekProperty('busy')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    });
    const face = this.faceComponent;
    face.motif.on('click', () => this.faceClicked());
    face.motif.on('keydown', (_, e) => this.faceKeyDown(e));
  }

  /** The part that is pressed and takes focus: the button itself, or its main part with a menu. Its parts are its children. */
  get faceComponent(): ComponentBase {
    return this.parts.facePart ?? this;
  }

  private faceClicked(): void {
    if (this.hasMenu && !this.peekProperty('split')) {
      this.toggleMenu();
      return;
    }
    if (!this.peekProperty('toggle')) return;
    // A click is the reader's change: a state bound with a function keeps following it, and x-model hears the change.
    const next = !this.peekProperty('pressed');
    this.changeProperty('pressed', next);
    this.bindings.writeModel(next);
  }

  private faceKeyDown(e: KeyboardEvent): void {
    if (!this.hasMenu) return;
    const opens = this.peekProperty('split') ? e.altKey && e.key === 'ArrowDown' : !e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp');
    if (opens) {
      e.preventDefault();
      this.openMenu(e.key === 'ArrowUp' ? 'last' : 'first');
    }
  }

  private arrowKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    this.openMenu(e.key === 'ArrowUp' ? 'last' : 'first');
  }

  // Rendering.

  private renderText(text: string): void {
    const parsed = parseAccessKey(text ?? '');
    this.setAccessKey(parsed.key);
    const parts = this.parts;
    if (parsed.text || parts.caption) {
      const caption = parts.caption ?? this.placeCaption();
      renderAccessKey(caption, parsed);
      // An empty caption would still take a gap next to the icon.
      mark(caption, 'hidden', !parsed.text);
    }
    if (parts.popup && parts.content) put(parts.popup, 'aria-label', parsed.text);
    this.renderIconOnly();
  }

  /** An icon and no text: the language may draw it square or round. */
  private renderIconOnly(): void {
    const text = parseAccessKey(this.peekProperty<string>('text') ?? '').text;
    const only = !!this.peekProperty('icon') && !text && !this.childs?.length;
    mark(this, 'data-icon-only', only);
  }

  /** The caption has its own element, so the language can trim its line box to the letters (`text-box`). */
  private placeCaption(): Component<HTMLSpanElement> {
    const parts = this.parts;
    const face = this.faceComponent;
    // Right after the icon, else first.
    const items = face.controls.items;
    const before = parts.icon ? (items[items.indexOf(parts.icon) + 1] ?? null) : (items[0] ?? null);
    const caption = partBefore<HTMLSpanElement>(face, before, 'span', 'mx-button__text');
    parts.caption = caption;
    return caption;
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    mark(this, 'data-icon', !!icon);
    this.renderIconOnly();
    if (!icon) {
      removePart(parts.icon);
      parts.icon = null;
      return;
    }
    if (!parts.icon) {
      // First in the pressed part.
      const face = this.faceComponent;
      parts.icon = partBefore<HTMLSpanElement>(face, face.controls.items[0] ?? null, 'span', 'mx-button__icon');
      parts.icon.attr.add({ 'aria-hidden': 'true' });
    }
    clearParts(parts.icon);
    parts.releaseIcon = showIcon(icon, parts.icon);
  }

  private renderBusy(busy: boolean): void {
    const parts = this.parts;
    mark(this, 'data-busy', busy);
    flag(this.faceComponent, 'aria-busy', busy);
    if (busy && !parts.spinner) {
      parts.spinner = part<HTMLSpanElement>(this.faceComponent, 'span', 'mx-button__spinner');
      parts.spinner.attr.add({ 'aria-hidden': 'true' });
    }
    if (busy) this.close();
  }

  /**
   * Re-reads what the design language sets for the button (variant, tone, size). The button does this once it is
   * on the page. A button placed on the page outside the component tree is notified when it is placed.
   */
  readLook(): void {
    this.look.read();
  }

  /**
   * @internal Reads the design language's choice at once, inside the write of a fit that tries a size and measures it
   * (a ribbon group).
   */
  readLookNow(): void {
    this.look.readNow();
  }

  /** @internal The same for several buttons with one layout: a fit that sized them all at once. */
  static readLooksNow(buttons: readonly Button[]): void {
    LanguageLook.readNowTogether(buttons.map((button) => button.look as LanguageLook<string>));
  }

  override onMounted(): void {
    this.readLook();
  }

  private renderLook(): void {
    const look = this.look;
    put(this, 'data-variant', this.peekProperty<ButtonVariant>('variant') ?? look.get('variant') ?? 'solid');
    put(this, 'data-tone', this.peekProperty<ButtonTone>('tone') ?? look.get('tone') ?? 'standard');
    put(this, 'data-size', this.peekProperty<ButtonSize>('size') ?? look.get('size') ?? 'md');
    put(this, 'data-icon-position', this.peekProperty<'start' | 'end'>('iconPosition') ?? 'start');
    mark(this, 'data-stretch', !!this.peekProperty('stretch'));
  }

  private renderHint(hint: string | undefined): void {
    put(this.faceComponent, 'title', hint || null);
  }

  private renderPressed(): void {
    const on = !!this.peekProperty('toggle') && !this.opensMenuItself();
    const pressed = on && !!this.peekProperty('pressed');
    put(this.faceComponent, 'aria-pressed', on ? String(pressed) : null);
    mark(this, 'data-pressed', pressed);
  }

  /** Disabled, the parts take `aria-disabled` and keep their place in the Tab order. */
  private renderFocusable(on: boolean): void {
    const parts = this.parts;
    for (const part of [this.faceComponent, parts.arrowPart]) if (part) mark(part, 'data-mx-focusable-disabled', on);
    // Already disabled: cover the parts again, the new way.
    if (this.peekProperty('enabled') === false) {
      super.applyProperty('enabled', true);
      super.applyProperty('enabled', false);
    }
  }

  /** The whole button opens the menu (a menu without `split`). */
  private opensMenuItself(): boolean {
    return this.hasMenu && !this.peekProperty('split');
  }

  /** `split` or not: the arrow part, the chevron, which part says it opens a popup, the native type. */
  private renderMode(): void {
    const parts = this.parts;
    put(this.faceComponent, 'type', this.opensMenuItself() ? 'button' : (this.peekProperty<'button' | 'submit' | 'reset'>('type') ?? 'button'));
    if (!this.hasMenu) return;
    const split = !!this.peekProperty('split');
    put(this, 'data-mode', split ? 'split' : 'menu');
    if (split && !parts.arrowPart) {
      const arrowPart = new Component<HTMLButtonElement>('button');
      arrowPart.attr.add({ type: 'button' });
      arrowPart.class.add('mx-button__face mx-button__arrow');
      mark(arrowPart, 'data-mx-focusable-disabled', !!this.peekProperty('focusableWhenDisabled'));
      if (this.peekProperty('tabStop') === false) put(arrowPart, 'tabindex', '-1');
      glyphPart(arrowPart, 'chevron-down');
      arrowPart.motif.on('click', (_, e) => {
        // The arrow opens the menu; the button's own click listeners are for its action.
        e.stopPropagation();
        this.toggleMenu();
      });
      arrowPart.motif.on('keydown', (_, e) => this.arrowKeyDown(e));
      // Right after the main part.
      this.controls.insert(this.controls.items.indexOf(parts.facePart!) + 1, arrowPart);
      parts.stopArrowLabel = onLanguage(this, () => put(arrowPart, 'aria-label', uiLocale.strings.moreOptions));
      parts.arrowPart = arrowPart;
    } else if (!split && parts.arrowPart) {
      parts.stopArrowLabel?.();
      this.controls.remove(parts.arrowPart);
      parts.stopArrowLabel = null;
      parts.arrowPart = null;
    }
    if (!split && !parts.chevron) {
      parts.chevron = glyphPart(this.faceComponent, 'chevron-down', 'mx-button__chevron');
    } else if (split && parts.chevron) {
      removePart(parts.chevron);
      parts.chevron = null;
    }
    this.markToggle();
    this.renderPressed();
    this.close();
  }

  /** The part that opens the popup says what it opens and whether it is open. */
  private markToggle(): void {
    const parts = this.parts;
    const face = this.faceComponent;
    const toggle = parts.arrowPart ?? face;
    if (toggle !== face) {
      put(face, 'aria-haspopup', null);
      put(face, 'aria-expanded', null);
    }
    put(toggle, 'aria-haspopup', this.peekProperty('dropDown') ? 'dialog' : 'menu');
    put(toggle, 'aria-expanded', String(!!this.peekProperty('opened')));
  }

  // The menu.

  private toggleMenu(): void {
    if (this.parts.popup?.isOpen) this.close();
    else this.openMenu('first');
  }

  private openMenu(focus: 'first' | 'last'): boolean {
    if (!this.hasMenu || !this.isEnabled || this.peekProperty('busy') || !this.fill()) return false;
    const parts = this.parts;
    const popup = parts.popup!;
    popup.open(this, { toggle: parts.arrowPart ?? this.faceComponent });
    this.setProperty('opened', true);
    this.markToggle();
    if (parts.content) {
      if (!focusFirstIn(popup)) focusOn(popup);
    } else {
      parts.list!.focusItem(focus);
    }
    return true;
  }

  /** Puts the drop-down content or the menu into the popup; `false` when there is nothing to show. */
  private fill(): boolean {
    const parts = this.parts;
    const content = this.peekProperty<ComponentBase | null>('dropDown') ?? null;
    const items = this.peekProperty<readonly MenuItem[]>('menu') ?? [];
    if (!content && !givenList(items).some((item) => givenField(item, 'visible') !== false)) return false;
    const popup = (parts.popup ??= this.createPopup());
    if (content) {
      if (parts.list) popup.controls.remove(parts.list);
      parts.list = null;
      if (parts.content !== content) {
        if (parts.content) popup.controls.remove(parts.content);
        popup.controls.add(content);
        parts.content = content;
      }
      put(popup, 'role', 'dialog');
      put(popup, 'aria-label', parseAccessKey(this.peekProperty<string>('text') ?? '').text);
    } else {
      if (parts.content) popup.controls.remove(parts.content);
      parts.content = null;
      put(popup, 'role', null);
      put(popup, 'aria-label', null);
      if (!parts.list) {
        const list = new MenuList();
        list.source = this;
        list.onChosen((e) => this.itemChosen(e));
        popup.controls.add(list);
        parts.list = list;
      }
      parts.list.setItems(items);
    }
    return true;
  }

  /** The menu or the content changed: shown at once when it is open. */
  private refill(): void {
    if (!this.hasMenu) return;
    this.markToggle();
    if (!this.parts.popup?.isOpen) return;
    if (this.fill()) this.parts.popup.place();
    else this.close();
  }

  private createPopup(): Popup {
    const popup = new Popup();
    this.controls.add(popup);
    popup.onClosed(() => {
      this.setProperty('opened', false);
      this.markToggle();
    });
    return popup;
  }

  private itemChosen(e: MenuItemClickEventArgs): void {
    this.close();
    runItem(e.item, e, e.source, e.event, this);
    this.props?.onItemClick?.(e);
  }
}
