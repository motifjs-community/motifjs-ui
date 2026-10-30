import { onLookChanged } from '../../core/look-watch';
import { Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { controlOf } from '../../core/control-map';
import { follow } from '../../core/follow';
import type { ControlSize } from '../../core/control-size';
import type { IconSource } from '../../core/icon-source';
import { deepActiveElement, focusableIn, isShown } from '../../core/focus';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { moreMark } from '../../core/glyphs';
import { isNode } from '../../core/node-kind';
import { ResizeWatch } from '../../core/resize-watch';
import { uiLocale } from '../../core/ui-locale';
import { lineAfter } from '../../parts/menu/line-after';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Button } from '../button/Button';
import type { ButtonProps } from '../button/button-props';
import type { ButtonVariant } from '../button/button-variant';
import { ToolbarSeparator } from './ToolbarSeparator';
import type { ToolbarItem } from './toolbar-item';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import type { ToolbarItemOverflow } from './toolbar-item-overflow';
import type { ToolbarItemType } from './toolbar-item-type';
import type { ToolbarOrientation } from './toolbar-orientation';
import type { ToolbarOverflow } from './toolbar-overflow';
import type { ToolbarProps } from './toolbar-props';
import { onLanguage } from '../../core/on-language';

const OWN = ['items', 'orientation', 'size', 'buttonVariant', 'overflow'] as const;

/** A control made for an item of `items`. */
interface Made {
  control: Control;
  type: ToolbarItemType;
}

/** A control of the bar and how it can leave it for the "more" menu. */
interface Kid {
  element: HTMLElement;
  control: Control | undefined;
  overflow: ToolbarItemOverflow;
  separator: boolean;
  /** A button: it has a menu item to become. */
  movable: boolean;
}

interface Parts {
  made: Map<ToolbarItem, Made>;
  overflowOf: Map<ToolbarItem, ToolbarItemOverflow>;
  stopItems: (() => void) | null;
  /** The controls given the toolbar's size and variant. */
  styled: WeakSet<Control>;
  /** The element Tab reaches. */
  current: HTMLElement | null;
  more: Button | null;
  stopMoreLabel: (() => void) | null;
  restyleQueued: boolean;
  layoutQueued: boolean;
  /** The size the overflow was worked out for. */
  laidOut: number;
  itemClick: Emitter<ToolbarItemClickEventArgs>;
}

const PARTS = Symbol('mx.toolbar');

/**
 * A bar of commands (`role="toolbar"`): buttons, toggle buttons, menus and fields, in groups
 * between separators. It is one Tab stop; Left and Right (Up and Down when vertical) and Home and
 * End move between its controls, while a text field keeps the arrows for its text. Items come
 * as data (`items`) and as JSX children. Items that do not fit move into a "more" menu at the
 * end (`overflow`), keeping their names, checks and menus there.
 *
 * @example
 * <Toolbar label="Format" items={[
 *   { type: 'toggle', icon: boldIcon, hint: 'Bold', pressed: () => this.doc.bold, click: () => this.doc.toggleBold() },
 *   { type: 'separator' },
 *   { text: '&Save', click: () => this.save() },
 * ]}>
 *   <TextBox label="Find" labelMode="hidden" />
 * </Toolbar>
 *
 * const bar = new Toolbar({ label: 'Actions', size: 'sm' });
 * bar.controls.add(new Button({ text: 'Refresh', onclick: () => this.load() }));
 */
export class Toolbar extends Control<HTMLDivElement, ToolbarProps> {
  constructor(props?: IBaseProp<ToolbarProps>) {
    super(props);
    const own = (this.props ?? {}) as ToolbarProps;
    const parts = this.parts;
    this.element.setAttribute('role', 'toolbar');
    this.observeProperty<string>('text', (text) => {
      const label = parseAccessKey(text ?? '').text;
      if (label) this.element.setAttribute('aria-label', label);
      else this.element.removeAttribute('aria-label');
    });
    this.observeProperty('orientation', () => this.renderLook());
    this.observeProperty('size', () => this.renderLook());
    this.observeProperty('overflow', () => this.renderLook());
    this.observeProperty('items', () => this.followItems());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onItemClick) this.onItemClick(own.onItemClick);
    this.listen();
    this.motif.setDisposable(() => {
      parts.stopItems?.();
      parts.stopMoreLabel?.();
      parts.itemClick.dispose();
    });
  }

  // Properties (see ToolbarProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get items(): readonly ToolbarItem[] {
    return this.getProperty<readonly ToolbarItem[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly ToolbarItem[]>) {
    this.assignProperty('items', value);
  }
  get orientation(): ToolbarOrientation {
    return this.getProperty<ToolbarOrientation | undefined>('orientation') ?? 'horizontal';
  }
  set orientation(value: Bind<ToolbarOrientation>) {
    this.assignProperty('orientation', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get buttonVariant(): ButtonVariant {
    return this.getProperty<ButtonVariant | undefined>('buttonVariant') ?? 'ghost';
  }
  set buttonVariant(value: Bind<ButtonVariant>) {
    this.assignProperty('buttonVariant', value);
  }
  get overflow(): ToolbarOverflow {
    return this.getProperty<ToolbarOverflow | undefined>('overflow') ?? 'menu';
  }
  set overflow(value: Bind<ToolbarOverflow>) {
    this.assignProperty('overflow', value);
  }

  /** The controls that are in the "more" menu now. Reactive. */
  get overflowed(): readonly Control[] {
    return this.getProperty<readonly Control[] | undefined>('overflowed') ?? [];
  }

  /** An item of `items` was pressed, after its own `click`. */
  get onItemClick(): MotifEvent<ToolbarItemClickEventArgs> {
    return this.parts.itemClick.event;
  }

  /** The control made for an item of `items`. */
  controlOf(item: ToolbarItem): Control | null {
    return this.parts.made.get(item)?.control ?? null;
  }

  /** Works out again which items fit, e.g. after their content changed size. */
  updateOverflow(): void {
    this.layout();
  }

  /**
   * Reads the items again after they were changed in place: the list, and each item's fields. Your items may be
   * plain or reactive; the toolbar reads them as they are.
   */
  refresh(): void {
    for (const [item, made] of this.parts.made) this.fill(item, made);
    this.followItems();
  }

  /** The control Tab reaches. */
  protected override get focusElement(): HTMLElement {
    return this.parts.current ?? this.stops()[0] ?? this.element;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'tabStop') {
      this.queueRestyle();
      return;
    }
    super.applyProperty(name, value);
  }

  // Items.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.element.classList.add('mx-toolbar');
    return {
      made: new Map(),
      overflowOf: new Map(),
      stopItems: null,
      styled: new WeakSet(),
      current: null,
      more: null,
      stopMoreLabel: null,
      restyleQueued: false,
      layoutQueued: false,
      laidOut: -1,
      itemClick: new Emitter(),
    };
  }

  /** Makes the controls of `items` again when the list, an item's type or its overflow changes, or on `reState()`. */
  private followItems(): void {
    const parts = this.parts;
    parts.stopItems?.();
    const items = this.peekProperty<readonly ToolbarItem[]>('items') ?? [];
    // The getter and the items' own functions are followed; the list and the fields are not.
    parts.stopItems = follow(
      this,
      'items',
      () =>
        givenList(items).map((item) => ({
          item,
          type: givenField<ToolbarItemType | undefined>(item, 'type') ?? 'button',
          overflow: givenField<ToolbarItemOverflow | undefined>(item, 'overflow') ?? 'auto',
        })),
      (wanted) => this.place(wanted),
    );
  }

  private place(wanted: readonly { item: ToolbarItem; type: ToolbarItemType; overflow: ToolbarItemOverflow }[]): void {
    const parts = this.parts;
    const made = new Map<ToolbarItem, Made>();
    parts.overflowOf.clear();
    for (const { item, type, overflow } of wanted) {
      const old = parts.made.get(item);
      made.set(item, old && old.type === type ? old : { control: this.make(item, type), type });
      parts.overflowOf.set(item, overflow);
    }
    for (const [item, old] of parts.made) if (made.get(item) !== old) this.controls.remove(old.control);
    parts.made = made;
    // The items come first, in their order, before the JSX children. Core places them (a hidden
    // one as its placeholder), and only once the toolbar is built.
    let index = 0;
    for (const { control } of made.values()) {
      if (!this.controls.items.includes(control)) this.controls.add(index, control);
      else if (this.controls.items.indexOf(control) !== index) this.controls.moveToIndex(control, index);
      index++;
    }
    this.queueRestyle();
    this.queueLayout();
  }

  private make(item: ToolbarItem, type: ToolbarItemType): Control {
    const field = <K extends keyof ToolbarItem>(name: K) => givenValue<ToolbarItem[K]>(item, name);
    if (type === 'separator') return new ToolbarSeparator({ visible: field('visible') });
    const props: ButtonProps = { text: field('text'), icon: field('icon'), hint: field('hint'), tone: field('tone'), enabled: field('enabled'), visible: field('visible') };
    if (type === 'toggle') {
      props.toggle = true;
      props.pressed = field('pressed');
    }
    if (type === 'menu') props.menu = field('menu') ?? [];
    const button = new Button(props);
    this.adopt(button);
    if (type !== 'menu') button.element.addEventListener('click', (e) => this.itemPressed(item, button, e));
    return button;
  }

  /** Gives a made control the item's fields again, as they are now. */
  private fill(item: ToolbarItem, made: Made): void {
    const field = <K extends keyof ToolbarItem>(name: K) => givenValue<ToolbarItem[K]>(item, name);
    made.control.visible = field('visible') ?? true;
    if (!(made.control instanceof Button)) return;
    const button = made.control;
    button.text = field('text') ?? '';
    button.icon = (field('icon') ?? null) as Bind<IconSource | null>;
    button.hint = field('hint') ?? '';
    button.tone = field('tone') ?? 'standard';
    button.enabled = field('enabled') ?? true;
    const pressed = field('pressed');
    if (made.type === 'toggle' && pressed !== undefined) button.pressed = pressed;
    if (made.type === 'menu') {
      button.menu = field('menu') ?? [];
      button.refresh();
    }
  }

  private itemPressed(item: ToolbarItem, button: Button, event: Event): void {
    const args: ToolbarItemClickEventArgs = { item, source: this, event };
    givenValue<ToolbarItem['click']>(item, 'click')?.(args);
    // A press set the toggle's own state; one bound to the app follows the app again.
    const pressed = givenValue<ToolbarItem['pressed']>(item, 'pressed');
    if (typeof pressed === 'function') button.pressed = pressed;
    this.parts.itemClick.fire(args);
  }

  /**
   * Gives a control the toolbar's size, and a button its variant, unless it has its own. A button
   * the toolbar is given no size or variant for takes them from the toolbar's button place.
   */
  private adopt(control: Control): void {
    const parts = this.parts;
    if (parts.styled.has(control)) return;
    parts.styled.add(control);
    const own = (control.props ?? {}) as { size?: unknown; variant?: unknown };
    const target = control as unknown as { size?: Bind<ControlSize>; variant?: Bind<ButtonVariant> };
    const isButton = control instanceof Button;
    if ('size' in control && own.size === undefined) target.size = isButton ? () => this.givenSize() : () => this.size;
    if (isButton && own.variant === undefined) target.variant = () => this.givenButtonVariant();
  }

  /** The size the toolbar is given; none: its buttons' place decides. */
  private givenSize(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') as ControlSize;
  }

  /** The button variant the toolbar is given; none: its buttons' place decides. */
  private givenButtonVariant(): ButtonVariant {
    return this.getProperty<ButtonVariant | undefined>('buttonVariant') as ButtonVariant;
  }

  // The bar's controls: styling, roving focus.

  private kids(): Kid[] {
    const parts = this.parts;
    const kids: Kid[] = [];
    for (const element of Array.from(this.element.children) as HTMLElement[]) {
      if (element === parts.more?.element) continue;
      const control = controlOf(element);
      const item = control && [...parts.made].find(([, made]) => made.control === control)?.[0];
      const overflow = (item ? parts.overflowOf.get(item) : (element.dataset.overflow as ToolbarItemOverflow | undefined)) ?? 'auto';
      const button = control instanceof Button && !(control.hasMenu && control.dropDown);
      kids.push({ element, control, overflow, separator: control instanceof ToolbarSeparator, movable: button });
    }
    return kids;
  }

  /** The elements the arrow keys visit, in order; the "more" button last. */
  private stops(): HTMLElement[] {
    const all = focusableIn(this.element).filter((el) => !(el as HTMLButtonElement).disabled && !el.closest('.mx-popup, [data-overflowed], [data-idle]'));
    const more = this.parts.more?.element;
    if (!more) return all;
    return [...all.filter((el) => !more.contains(el)), ...all.filter((el) => more.contains(el))];
  }

  private queueRestyle(): void {
    const parts = this.parts;
    if (parts.restyleQueued) return;
    parts.restyleQueued = true;
    queueMicrotask(() => {
      parts.restyleQueued = false;
      if (!this.isDisposed) untracked(() => this.restyle());
    });
  }

  private restyle(): void {
    const parts = this.parts;
    const more = parts.more?.element;
    if (more && this.element.lastElementChild !== more) this.element.append(more);
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    for (const kid of this.kids()) {
      if (kid.control) this.adopt(kid.control);
      if (kid.separator) setAttribute(kid.element, 'aria-orientation', vertical ? 'horizontal' : 'vertical');
    }
    this.renderRoving();
  }

  private renderRoving(): void {
    const parts = this.parts;
    const stops = this.stops();
    let current: HTMLElement | undefined = parts.current && stops.includes(parts.current) ? parts.current : stops[0];
    parts.current = current ?? null;
    if (this.peekProperty('tabStop') === false) current = undefined;
    for (const el of stops) setAttribute(el, 'tabindex', el === current ? '0' : '-1');
  }

  private renderLook(): void {
    const data = this.element.dataset;
    const orientation = this.peekProperty<ToolbarOrientation>('orientation') ?? 'horizontal';
    data.orientation = orientation;
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    data.overflow = this.peekProperty<ToolbarOverflow>('overflow') ?? 'menu';
    this.element.setAttribute('aria-orientation', orientation);
    this.queueRestyle();
    this.queueLayout();
  }

  // Overflow.

  private queueLayout(): void {
    const parts = this.parts;
    if (parts.layoutQueued) return;
    parts.layoutQueued = true;
    queueMicrotask(() => {
      parts.layoutQueued = false;
      if (!this.isDisposed) this.layout();
    });
  }

  /** Puts back every item, then moves into the "more" menu what does not fit (and what always goes there). */
  private layout(): void {
    untracked(() => {
      const parts = this.parts;
      const kids = this.kids();
      const focused = deepActiveElement();
      for (const kid of kids) kid.element.removeAttribute('data-overflowed');
      parts.more?.element.setAttribute('data-idle', '');
      const menuMode = (this.peekProperty<ToolbarOverflow>('overflow') ?? 'menu') === 'menu';
      const out = menuMode ? this.findOverflow(kids) : [];
      for (const kid of out) kid.element.setAttribute('data-overflowed', '');
      const moved = out.filter((kid) => !kid.separator);
      if (moved.length) {
        const more = this.moreButton();
        more.element.removeAttribute('data-idle');
        more.menu = this.moreItems(out);
      } else if (parts.more) {
        parts.more.menu = [];
      }
      this.setProperty(
        'overflowed',
        moved.map((kid) => kid.control!),
      );
      this.renderRoving();
      if (focused && out.some((kid) => kid.element.contains(focused))) parts.more?.focus();
    });
  }

  private findOverflow(kids: readonly Kid[]): Kid[] {
    const parts = this.parts;
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    const sizeOf = (el: Element) => {
      const box = el.getBoundingClientRect();
      return vertical ? box.height : box.width;
    };
    const style = getComputedStyle(this.element);
    const gap = parseFloat(vertical ? style.rowGap : style.columnGap) || 0;
    const padding = vertical
      ? (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
      : (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    const room = (vertical ? this.element.clientHeight : this.element.clientWidth) - padding;
    parts.laidOut = vertical ? this.element.clientHeight : this.element.clientWidth;
    const shown = kids.filter((kid) => isShown(kid.element));
    const sizes = new Map(shown.map((kid) => [kid, sizeOf(kid.element)]));
    const length = (list: readonly Kid[]) => list.reduce((sum, kid) => sum + sizes.get(kid)!, 0) + gap * Math.max(0, list.length - 1);
    const out = new Set(shown.filter((kid) => kid.movable && kid.overflow === 'always'));
    let kept = shown.filter((kid) => !out.has(kid));
    if (!out.size && length(kept) <= room + 0.5) return [];
    const more = this.moreButton();
    more.element.removeAttribute('data-idle');
    const left = room - sizeOf(more.element) - gap;
    while (length(kept) > left + 0.5) {
      const last = [...kept].reverse().find((kid) => kid.movable && kid.overflow !== 'never');
      if (!last) break;
      out.add(last);
      kept = kept.filter((kid) => kid !== last);
    }
    // A separator stays only between two groups that stay.
    let before = false;
    kept.forEach((kid, i) => {
      if (!kid.separator) before = true;
      else if (!before || !kept.slice(i + 1).some((k) => !k.separator)) out.add(kid);
      else before = false;
    });
    return kids.filter((kid) => out.has(kid));
  }

  private moreButton(): Button {
    const parts = this.parts;
    if (parts.more) return parts.more;
    const more = new Button({ menu: [], icon: moreMark(), size: () => this.givenSize(), variant: () => this.givenButtonVariant() });
    parts.styled.add(more);
    more.element.classList.add('mx-toolbar__more');
    more.element.setAttribute('data-idle', '');
    this.controls.add(more);
    const face = more.element.querySelector<HTMLElement>('.mx-button__main') ?? more.element;
    parts.stopMoreLabel = onLanguage(this, () => {
      const label = uiLocale.strings.moreOptions;
      face.setAttribute('aria-label', label);
      face.title = label;
    });
    parts.more = more;
    return more;
  }

  /** The "more" menu: each moved button as a menu item, the separators as group lines. */
  private moreItems(out: readonly Kid[]): MenuItem[] {
    const items: MenuItem[] = [];
    let group = false;
    for (const kid of out) {
      if (kid.separator) {
        group = items.length > 0;
        continue;
      }
      if (!(kid.control instanceof Button)) continue;
      items.push({ ...menuItemOf(kid.control), beginGroup: group });
      group = false;
    }
    return items;
  }

  // Keys and observers.

  private listen(): void {
    const parts = this.parts;
    this.element.addEventListener('keydown', (e) => untracked(() => this.onKeyDown(e)));
    this.element.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target === parts.current || !this.stops().includes(target)) return;
      parts.current = target;
      untracked(() => this.renderRoving());
    });
    if (typeof MutationObserver === 'function') {
      // Controls added from code, disabled, hidden: the arrows and Tab follow. A control that takes another size
      // (its look read once it is in the page) changes what fits.
      const observer = new MutationObserver((records) => {
        this.queueRestyle();
        if (records.some((r) => (r.type === 'childList' && r.target === this.element) || r.attributeName === 'data-size' || r.attributeName === 'data-variant')) this.queueLayout();
      });
      observer.observe(this.element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['disabled', 'hidden', 'tabindex', 'aria-disabled', 'data-size', 'data-variant'],
      });
      this.motif.setDisposable(() => observer.disconnect());
    }
    // Another design language, theme or density: the controls have other sizes.
    this.motif.setDisposable(onLookChanged(() => this.queueLayout()));
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeWatch(() => {
        const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
        const size = vertical ? this.element.clientHeight : this.element.clientWidth;
        if (size !== parts.laidOut) this.layout();
      });
      observer.observe(this.element);
      this.motif.setDisposable(() => observer.disconnect());
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    if (target.closest('.mx-popup') || keepsArrows(target)) return;
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    let step = 0;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        if (vertical) return;
        step = (e.key === 'ArrowRight') !== rtl ? 1 : -1;
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        if (!vertical) return;
        step = e.key === 'ArrowDown' ? 1 : -1;
        break;
      case 'Home':
      case 'End':
        break;
      default:
        return;
    }
    const stops = this.stops();
    if (!stops.length) return;
    const at = stops.findIndex((el) => el === target || el.contains(target));
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? stops.length - 1 : (at + step + stops.length) % stops.length;
    e.preventDefault();
    stops[next].focus();
  }
}

function setAttribute(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

/** A text field (and a slider) keeps the arrow keys and Home and End for itself. */
function keepsArrows(el: HTMLElement): boolean {
  if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  if (el.getAttribute('role') === 'slider') return true;
  return el.tagName === 'INPUT' && !['button', 'submit', 'reset', 'checkbox', 'radio', 'color', 'file', 'image'].includes((el as HTMLInputElement).type);
}

/** The menu shows a copy: the node of an icon stays in its button. */
function iconCopy(icon: IconSource | null): IconSource | null {
  if (!icon || typeof icon === 'string') return icon;
  const node = isNode(icon) ? icon : (icon.element as Node | undefined);
  return node ? node.cloneNode(true) : null;
}

/** A button as an item of the "more" menu: its name, icon, state and menu. */
function menuItemOf(button: Button): MenuItem {
  const face = button.element.querySelector<HTMLElement>('.mx-button__main') ?? button.element;
  const name = () => button.text || face.getAttribute('aria-label') || button.hint || face.textContent?.trim() || '';
  const press = () => face.click();
  if (button.hasMenu && button.split) {
    return { text: name, icon: () => iconCopy(button.icon), hint: () => button.hint, tone: () => button.tone, enabled: () => button.isEnabled, items: () => [lineAfter<MenuItem>({ text: name, click: press }), ...givenList(button.menu)] };
  }
  if (button.hasMenu) {
    return { text: name, icon: () => iconCopy(button.icon), hint: () => button.hint, tone: () => button.tone, enabled: () => button.isEnabled, items: () => button.menu };
  }
  return {
    text: name,
    icon: () => iconCopy(button.icon),
    hint: () => button.hint,
    tone: () => button.tone,
    enabled: () => button.isEnabled,
    checked: () => (button.toggle ? button.pressed : undefined),
    click: press,
  };
}
