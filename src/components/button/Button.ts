import { effect, read, type Bind, type ComponentBase, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { registerControl } from '../../core/control-map';
import { focusInitial, isFocusable } from '../../core/focus';
import { chevronDown } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import { isHtmlElement } from '../../core/node-kind';
import type { IconSource } from '../../core/icon-source';
import { uiLocale } from '../../core/ui-locale';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../parts/popup/Popup';
import type { ButtonProps } from './button-props';
import type { ButtonSize } from './button-size';
import type { ButtonTone } from './button-tone';
import type { ButtonVariant } from './button-variant';

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

/** The parts of a button. On one object made on first use: the base constructor already asks for the focus element. */
interface Parts {
  /** What is pressed: the button itself, or its main part when it has a menu. */
  face: HTMLButtonElement;
  arrow: HTMLButtonElement | null;
  stopArrowLabel: (() => void) | null;
  caption: Text | HTMLSpanElement | null;
  icon: HTMLSpanElement | null;
  releaseIcon: () => void;
  spinner: HTMLSpanElement | null;
  chevron: SVGSVGElement | null;
  popup: Popup | null;
  list: MenuList | null;
  content: ComponentBase | null;
}

const PARTS = Symbol('mx.button');

function withMenu(props: IBaseProp<ButtonProps> | undefined): boolean {
  return !!props && (props.split !== undefined || props.menu !== undefined || props.dropDown !== undefined);
}

/**
 * A `<button>` drawn from the design tokens. Its caption is `text` (`&Save` makes Alt+S press it)
 * or its JSX children, with an optional icon. It can be a toggle (`pressed`, two-way with
 * `x-model`), show that work is running (`busy`), and open a menu or any content: the whole
 * button opens it, or with `split` an arrow next to it does while the button keeps its own action.
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
  constructor(props?: IBaseProp<ButtonProps>) {
    // A button with a menu is two parts in a group, so its element is chosen here.
    super(withMenu(props) ? 'div' : 'button', props);
    const own = (this.props ?? {}) as ButtonProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

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

    this.listen();
    this.placeChildren();
    this.motif.setDisposable(() => {
      const parts = this.parts;
      parts.releaseIcon();
      parts.stopArrowLabel?.();
    });
  }

  // Properties (see ButtonProps).

  get variant(): ButtonVariant {
    return this.getProperty<ButtonVariant | undefined>('variant') ?? 'solid';
  }
  set variant(value: Bind<ButtonVariant>) {
    this.assignProperty('variant', value);
  }
  get tone(): ButtonTone {
    return this.getProperty<ButtonTone | undefined>('tone') ?? 'standard';
  }
  set tone(value: Bind<ButtonTone>) {
    this.assignProperty('tone', value);
  }
  get size(): ButtonSize {
    return this.getProperty<ButtonSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ButtonSize>) {
    this.assignProperty('size', value);
  }
  get icon(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null>) {
    this.assignProperty('icon', value);
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
    this.assignProperty('pressed', value, Boolean);
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

  /** `pressed`, for `x-model` on a toggle button. */
  get value(): boolean {
    return this.pressed;
  }
  set value(value: boolean) {
    this.pressed = !!value;
  }

  /** Whether the button was created with a menu (`split`, `menu` or `dropDown`). */
  get hasMenu(): boolean {
    return this.element.tagName !== 'BUTTON';
  }

  /** Whether its menu or drop-down is open. Reactive. Setting it opens or closes it. */
  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }
  set opened(value: boolean) {
    if (value) this.open();
    else this.close();
  }

  /** Opens the menu or drop-down with focus on its first item; `false` when there is nothing to open or the button cannot be used. */
  open(): boolean {
    return this.openMenu('first');
  }

  close(): void {
    this.parts.popup?.close('code');
  }

  // Focus and keys.

  protected override get focusElement(): HTMLElement {
    return this.parts.face;
  }

  override get canFocus(): boolean {
    const face = this.parts.face;
    return (this.isEnabled || this.focusableWhenDisabled) && face.isConnected && isFocusable(face);
  }

  /** The access key presses the button, as HTML `accesskey` does; with a menu and no `split` it opens the menu. */
  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    this.parts.face.click();
    return true;
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'tabStop') {
      const arrow = this.parts.arrow;
      if (arrow && value === false) arrow.setAttribute('tabindex', '-1');
      else arrow?.removeAttribute('tabindex');
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
    this.element.classList.add('mx-button');
    let face = this.element as HTMLButtonElement;
    if (this.hasMenu) {
      face = this.element.ownerDocument.createElement('button');
      face.classList.add('mx-button__main');
      this.element.prepend(face);
      registerControl(face, this);
    }
    face.classList.add('mx-button__face');
    face.type = 'button';
    return {
      face,
      arrow: null,
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
    this.controls.add(...childs);
    if (this.hasMenu) {
      this.motif.on('x:built', () => this.parts.face.append(...childs.map((c) => c.element as Node).filter(Boolean)));
    }
  }

  private listen(): void {
    // Busy: a press does nothing, before any other listener sees it.
    this.element.addEventListener(
      'click',
      (e) => {
        if (!this.peekProperty('busy')) return;
        e.preventDefault();
        e.stopImmediatePropagation();
      },
      true,
    );
    const face = this.parts.face;
    face.addEventListener('click', () => this.faceClicked());
    face.addEventListener('keydown', (e) => this.faceKeyDown(e));
  }

  private faceClicked(): void {
    if (this.hasMenu && !this.peekProperty('split')) {
      this.toggleMenu();
      return;
    }
    if (!this.peekProperty('toggle')) return;
    this.pressed = !this.peekProperty('pressed');
    this.bindings.writeModel(this.pressed);
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
    if (parsed.index >= 0) {
      const span = isHtmlElement(parts.caption) && parts.caption.localName === 'span' ? parts.caption : this.placeCaption(this.element.ownerDocument.createElement('span'));
      renderAccessKey(span, parsed);
    } else if (parts.caption?.nodeType === 3) {
      (parts.caption as Text).data = parsed.text;
    } else if (parsed.text || parts.caption) {
      this.placeCaption(this.element.ownerDocument.createTextNode(parsed.text));
    }
    if (parts.popup && parts.content) parts.popup.element.setAttribute('aria-label', parsed.text);
  }

  private placeCaption<T extends Text | HTMLSpanElement>(node: T): T {
    const parts = this.parts;
    if (parts.caption) parts.caption.replaceWith(node);
    else if (parts.icon) parts.icon.after(node);
    else parts.face.prepend(node);
    parts.caption = node;
    return node;
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    this.element.toggleAttribute('data-icon', !!icon);
    if (!icon) {
      parts.icon?.remove();
      parts.icon = null;
      return;
    }
    if (!parts.icon) {
      parts.icon = this.element.ownerDocument.createElement('span');
      parts.icon.className = 'mx-button__icon';
      parts.icon.setAttribute('aria-hidden', 'true');
      parts.face.prepend(parts.icon);
    }
    const shown = iconNode(icon);
    parts.icon.replaceChildren(shown.node);
    parts.releaseIcon = shown.release;
  }

  private renderBusy(busy: boolean): void {
    const parts = this.parts;
    this.element.toggleAttribute('data-busy', busy);
    if (busy) parts.face.setAttribute('aria-busy', 'true');
    else parts.face.removeAttribute('aria-busy');
    if (busy && !parts.spinner) {
      parts.spinner = this.element.ownerDocument.createElement('span');
      parts.spinner.className = 'mx-button__spinner';
      parts.spinner.setAttribute('aria-hidden', 'true');
      parts.face.append(parts.spinner);
    }
    if (busy) this.close();
  }

  private renderLook(): void {
    const data = this.element.dataset;
    data.variant = this.peekProperty<ButtonVariant>('variant') ?? 'solid';
    data.tone = this.peekProperty<ButtonTone>('tone') ?? 'standard';
    data.size = this.peekProperty<ButtonSize>('size') ?? 'md';
    data.iconPosition = this.peekProperty<'start' | 'end'>('iconPosition') ?? 'start';
    this.element.toggleAttribute('data-stretch', !!this.peekProperty('stretch'));
  }

  private renderHint(hint: string | undefined): void {
    const face = this.parts.face;
    if (hint) face.title = hint;
    else face.removeAttribute('title');
  }

  private renderPressed(): void {
    const parts = this.parts;
    const on = !!this.peekProperty('toggle') && !this.opensMenuItself();
    const pressed = on && !!this.peekProperty('pressed');
    if (on) parts.face.setAttribute('aria-pressed', String(pressed));
    else parts.face.removeAttribute('aria-pressed');
    this.element.toggleAttribute('data-pressed', pressed);
  }

  /** Disabled, the parts take `aria-disabled` and keep their place in the Tab order. */
  private renderFocusable(on: boolean): void {
    const parts = this.parts;
    for (const part of [parts.face, parts.arrow]) part?.toggleAttribute('data-mx-focusable-disabled', on);
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
    parts.face.type = this.opensMenuItself() ? 'button' : (this.peekProperty<'button' | 'submit' | 'reset'>('type') ?? 'button');
    if (!this.hasMenu) return;
    const split = !!this.peekProperty('split');
    this.element.dataset.mode = split ? 'split' : 'menu';
    if (split && !parts.arrow) {
      const arrow = this.element.ownerDocument.createElement('button');
      arrow.type = 'button';
      arrow.className = 'mx-button__face mx-button__arrow';
      arrow.toggleAttribute('data-mx-focusable-disabled', !!this.peekProperty('focusableWhenDisabled'));
      if (this.peekProperty('tabStop') === false) arrow.tabIndex = -1;
      arrow.append(chevronDown());
      arrow.addEventListener('click', (e) => {
        // The arrow opens the menu; the button's own click listeners are for its action.
        e.stopPropagation();
        this.toggleMenu();
      });
      arrow.addEventListener('keydown', (e) => this.arrowKeyDown(e));
      parts.face.after(arrow);
      registerControl(arrow, this);
      parts.stopArrowLabel = effect(() => arrow.setAttribute('aria-label', uiLocale.strings.moreOptions));
      parts.arrow = arrow;
    } else if (!split && parts.arrow) {
      parts.stopArrowLabel?.();
      parts.arrow.remove();
      parts.arrow = parts.stopArrowLabel = null;
    }
    if (!split && !parts.chevron) {
      parts.chevron = chevronDown();
      parts.chevron.classList.add('mx-button__chevron');
      parts.face.append(parts.chevron);
    } else if (split && parts.chevron) {
      parts.chevron.remove();
      parts.chevron = null;
    }
    this.markToggle();
    this.renderPressed();
    this.close();
  }

  /** The part that opens the popup says what it opens and whether it is open. */
  private markToggle(): void {
    const parts = this.parts;
    const toggle = parts.arrow ?? parts.face;
    if (toggle !== parts.face) {
      parts.face.removeAttribute('aria-haspopup');
      parts.face.removeAttribute('aria-expanded');
    }
    toggle.setAttribute('aria-haspopup', this.peekProperty('dropDown') ? 'dialog' : 'menu');
    toggle.setAttribute('aria-expanded', String(!!this.peekProperty('opened')));
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
    popup.open(this.element, { toggle: parts.arrow ?? parts.face });
    this.setProperty('opened', true);
    this.markToggle();
    if (parts.content) {
      if (!focusInitial(popup.element)) popup.element.focus();
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
    if (!content && !items.some((item) => read(item.visible) !== false)) return false;
    const popup = (parts.popup ??= this.createPopup());
    if (content) {
      if (parts.list) popup.controls.remove(parts.list);
      parts.list = null;
      if (parts.content !== content) {
        if (parts.content) popup.controls.remove(parts.content);
        popup.controls.add(content);
        parts.content = content;
      }
      popup.element.setAttribute('role', 'dialog');
      popup.element.setAttribute('aria-label', parseAccessKey(this.peekProperty<string>('text') ?? '').text);
    } else {
      if (parts.content) popup.controls.remove(parts.content);
      parts.content = null;
      popup.element.removeAttribute('role');
      popup.element.removeAttribute('aria-label');
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
    e.item.click?.(e);
    this.props?.onItemClick?.(e);
  }
}
