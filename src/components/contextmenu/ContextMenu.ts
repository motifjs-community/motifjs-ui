import { effect, Emitter, read, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { deepActiveElement, isFocusable } from '../../core/focus';
import { isElement, isHtmlElement, isNode } from '../../core/node-kind';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../parts/popup/Popup';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ContextMenuOpeningEventArgs } from './context-menu-opening-event-args';
import type { ContextMenuProps } from './context-menu-props';
import type { ContextMenuTarget } from './context-menu-target';

const OWN = ['items', 'keyboard', 'closeOnScroll', 'openOnHover'] as const;

const NO_ITEMS: readonly MenuItem[] = [];

interface Parts {
  /** An invisible 1×1 point the popup opens next to: the pointer, or the focused element. */
  anchor: HTMLDivElement;
  popup: Popup | null;
  list: MenuList | null;
  /** The target as given; `undefined`: the element the menu is placed in. */
  source: Bind<ContextMenuTarget | null | undefined> | undefined;
  stopTarget: (() => void) | null;
  attached: Element | null;
  /** When a key last opened the menu: the `contextmenu` event the same key may send is not a second opening. */
  keyOpenedAt: number;
  /** The element the menu opened on, and where the anchor sits from its corner: the menu goes along when it scrolls. */
  follow: { element: Element; x: number; y: number } | null;
  /** Listens on the target and, while open, on the window. */
  listener: (e: Event) => void;
  /** The window it listens on while open. */
  view: Window | null;
  opening: Emitter<ContextMenuOpeningEventArgs>;
  itemClick: Emitter<MenuItemClickEventArgs>;
  closed: Emitter<PopupCloseReason>;
}

const PARTS = Symbol('mx.contextmenu');

/**
 * A menu that opens on an element's right-click (or long press), at the pointer, and from the
 * keyboard with the Menu key or Shift+F10, at the focused element. `onOpening` builds the items
 * for the element it opened on (a row of a list) or cancels. It closes on Escape, a press outside
 * it and focus leaving it; when the page scrolls it goes along with the element it opened on, and
 * closes once that element is out of sight. The items are `MenuItem`s: submenus, check and radio
 * items, shortcuts. Opened on an element in another document (a window the app opened), the menu
 * goes there.
 *
 * @example
 * <ContextMenu target={() => this.list} items={[{ text: '&Copy', click: () => this.copy() }]} />
 *
 * const menu = new ContextMenu({ target: this.grid, items: this.rowItems });
 * menu.onOpening((e) => (e.items = this.itemsFor(e.target)));
 */
export class ContextMenu extends Control<HTMLDivElement, ContextMenuProps> {
  constructor(props?: IBaseProp<ContextMenuProps>) {
    super(props);
    const own = (this.props ?? {}) as ContextMenuProps;
    const parts = this.parts;
    this.observeProperty<string>('text', (text) => {
      const label = parseAccessKey(text ?? '').text;
      if (label) parts.list?.element.setAttribute('aria-label', label);
      else parts.list?.element.removeAttribute('aria-label');
    });
    this.observeProperty('items', () => {
      if (parts.popup?.isOpen) parts.list!.setItems(this.peekProperty<readonly MenuItem[]>('items') ?? NO_ITEMS);
    });
    this.observeProperty<boolean>('openOnHover', (on) => {
      if (parts.list) parts.list.openOnHover = on !== false;
    });
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onOpening) this.onOpening(own.onOpening);
    if (own.onItemClick) this.onItemClick(own.onItemClick);
    if (own.onClosed) this.onClosed(own.onClosed);
    parts.source = own.target;
    // A target given as a function may name a component made after this one (a ref): read it once both are made.
    if (own.target !== undefined && typeof own.target !== 'function') this.followTarget();
    else queueMicrotask(() => this.followTarget());
    this.motif.on('x:built', () => queueMicrotask(() => this.followTarget()));
    this.motif.setDisposable(() => {
      parts.stopTarget?.();
      this.attach(null);
      this.stopClosing();
      parts.opening.dispose();
      parts.itemClick.dispose();
      parts.closed.dispose();
    });
  }

  // Properties (see ContextMenuProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get items(): readonly MenuItem[] {
    return this.getProperty<readonly MenuItem[] | undefined>('items') ?? NO_ITEMS;
  }
  set items(value: Bind<readonly MenuItem[]>) {
    this.assignProperty('items', value);
  }
  /** The element the menu listens on. Reactive. Set it with an element, a component or a function of one. */
  get target(): Element | null {
    return this.getProperty<Element | null | undefined>('attached') ?? null;
  }
  set target(value: Bind<ContextMenuTarget | null | undefined>) {
    this.parts.source = value;
    this.followTarget();
  }
  get keyboard(): boolean {
    return this.getProperty<boolean | undefined>('keyboard') !== false;
  }
  set keyboard(value: Bind<boolean>) {
    this.assignProperty('keyboard', value, Boolean);
  }
  get closeOnScroll(): boolean {
    return this.getProperty<boolean | undefined>('closeOnScroll') !== false;
  }
  set closeOnScroll(value: Bind<boolean>) {
    this.assignProperty('closeOnScroll', value, Boolean);
  }
  get openOnHover(): boolean {
    return this.getProperty<boolean | undefined>('openOnHover') !== false;
  }
  set openOnHover(value: Bind<boolean>) {
    this.assignProperty('openOnHover', value, Boolean);
  }

  /** Whether the menu is open. Reactive. */
  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }

  /** The element the menu was last opened on (pressed, or focused); kept after it closes. Reactive. */
  get targetElement(): Element | null {
    return this.getProperty<Element | null | undefined>('targetElement') ?? null;
  }

  /** The menu is about to open; set `e.items` for `e.target`, or cancel. */
  get onOpening(): MotifEvent<ContextMenuOpeningEventArgs> {
    return this.parts.opening.event;
  }
  /** An item was chosen, after the item's own `click`. */
  get onItemClick(): MotifEvent<MenuItemClickEventArgs> {
    return this.parts.itemClick.event;
  }
  get onClosed(): MotifEvent<PopupCloseReason> {
    return this.parts.closed.event;
  }

  /**
   * Opens the menu from code: at a point of the viewport, or at an element (its start corner,
   * below it). `target` is what `onOpening` and `targetElement` report; the target element by
   * default. Returns whether it opened.
   */
  open(at: { x: number; y: number } | Element, target?: Element): boolean {
    const point = isElement(at) ? pointOf(at) : at;
    const element = target ?? (isElement(at) ? at : this.parts.attached);
    if (!element) return false;
    return this.show(point, element, new Event('open'), isElement(at), focusTarget(element));
  }

  close(): void {
    this.parts.popup?.close('code');
  }

  override onAccessKey(): boolean {
    return false;
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'enabled' && value === false) this.close();
  }

  // The target.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.element.classList.add('mx-context-menu');
    const anchor = this.element.ownerDocument.createElement('div');
    anchor.className = 'mx-context-menu__anchor';
    anchor.style.inlineSize = anchor.style.blockSize = '1px';
    this.element.append(anchor);
    return {
      anchor,
      popup: null,
      list: null,
      source: undefined,
      stopTarget: null,
      attached: null,
      keyOpenedAt: -Infinity,
      follow: null,
      listener: (e) => this.handle(e),
      view: null,
      opening: new Emitter(),
      itemClick: new Emitter(),
      closed: new Emitter(),
    };
  }

  private followTarget(): void {
    const parts = this.parts;
    if (this.isDisposed) return;
    parts.stopTarget?.();
    const source = parts.source;
    if (source === undefined) {
      parts.stopTarget = null;
      this.attach(this.element.parentElement);
      return;
    }
    parts.stopTarget = effect(() => {
      const target = read(source);
      untracked(() => this.attach(target ? (isElement(target) ? target : (target.element as Element)) : null));
    });
  }

  private attach(element: Element | null): void {
    const parts = this.parts;
    if (parts.attached === element) return;
    for (const type of ['contextmenu', 'keydown']) {
      parts.attached?.removeEventListener(type, parts.listener);
      element?.addEventListener(type, parts.listener);
    }
    parts.attached = element;
    this.setProperty('attached', element);
  }

  private handle(e: Event): void {
    if (e.type === 'contextmenu') this.onContextMenu(e as MouseEvent);
    else if (e.type === 'keydown') this.onKeyDown(e as KeyboardEvent);
    else if (e.type === 'scroll') this.onScroll(e);
    else if (e.type === 'scrollend') this.closeOutOfSight();
    else this.close();
  }

  private onContextMenu(e: MouseEvent): void {
    const parts = this.parts;
    if (parts.popup?.isOpen && performance.now() - parts.keyOpenedAt < 1000) {
      e.preventDefault();
      return;
    }
    if (e.defaultPrevented || !untracked(() => this.isEnabled)) return;
    const target = isElement(e.target) ? e.target : parts.attached!;
    // Sent by a key the page saw no keydown of: at the focused element.
    const fromKeys = e.button !== 2 && e.clientX === 0 && e.clientY === 0;
    const focused = deepActiveElement(target) ?? target;
    const point = fromKeys ? pointOf(focused) : { x: e.clientX, y: e.clientY };
    this.show(point, fromKeys ? focused : target, e, fromKeys, deepActiveElement(target) ?? focusTarget(target));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const menuKey = e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey);
    if (!menuKey || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
    if (this.peekProperty('keyboard') === false || !untracked(() => this.isEnabled)) return;
    const focused = (isNode(e.target) ? deepActiveElement(e.target) : null) ?? this.parts.attached!;
    if (this.show(pointOf(focused), focused, e, true, focusTarget(focused))) this.parts.keyOpenedAt = performance.now();
  }

  // Opening and closing.

  private show(point: { x: number; y: number }, target: Element, event: Event, byKeyboard: boolean, returnFocus: HTMLElement | null): boolean {
    const parts = this.parts;
    const args: ContextMenuOpeningEventArgs = {
      target,
      items: this.peekProperty<readonly MenuItem[]>('items') ?? NO_ITEMS,
      cancel: false,
      byKeyboard,
      event,
      source: this,
    };
    untracked(() => parts.opening.fire(args));
    if (args.cancel || !args.items.some((item) => untracked(() => read(item.visible)) !== false)) return false;
    event.preventDefault();
    event.stopPropagation();
    this.host(target.ownerDocument);
    const popup = (parts.popup ??= this.createPopup());
    const list = parts.list!;
    list.closeSubmenu();
    list.setItems(args.items);
    parts.anchor.style.left = `${point.x}px`;
    parts.anchor.style.top = `${point.y}px`;
    const box = target.getBoundingClientRect();
    parts.follow = { element: target, x: point.x - box.left, y: point.y - box.top };
    popup.open(parts.anchor, { toggle: parts.anchor, returnFocus: returnFocus ?? undefined });
    this.setProperty('targetElement', target);
    this.setProperty('opened', true);
    this.startClosing(target.ownerDocument.defaultView);
    if (byKeyboard) list.focusItem('first');
    else list.focusList();
    return true;
  }

  /** Made with `new` and never placed, it opens from the end of the page; on an element in another window, from the end of that one. */
  private host(doc: Document): void {
    if (!this.isBuilt) this.build();
    if (this.element.isConnected && this.element.ownerDocument === doc) return;
    this.parts.popup?.close('code');
    doc.body.append(this.element);
  }

  private createPopup(): Popup {
    const parts = this.parts;
    const popup = new Popup();
    popup.placement = 'bottom-start';
    popup.matchWidth = false;
    const list = new MenuList();
    list.source = this;
    list.openOnHover = this.peekProperty('openOnHover') !== false;
    const label = parseAccessKey(this.peekProperty<string>('text') ?? '').text;
    if (label) list.element.setAttribute('aria-label', label);
    list.onChosen((e) => this.chosen(e));
    popup.controls.add(list);
    this.controls.add(popup);
    // Inside its own menu the right button opens nothing, not even the browser's menu.
    popup.element.addEventListener('contextmenu', (e) => e.preventDefault());
    popup.onClosed((reason) => {
      this.stopClosing();
      this.setProperty('opened', false);
      parts.closed.fire(reason);
    });
    parts.list = list;
    return popup;
  }

  private chosen(e: MenuItemClickEventArgs): void {
    this.close();
    e.item.click?.(e);
    this.parts.itemClick.fire(e);
  }

  private startClosing(view: Window | null): void {
    const parts = this.parts;
    this.stopListening();
    parts.view = view;
    if (!view) return;
    const listener = parts.listener;
    view.addEventListener('scroll', listener, true);
    view.addEventListener('scrollend', listener, true);
    view.addEventListener('resize', listener);
    view.addEventListener('blur', listener);
  }

  private stopClosing(): void {
    this.parts.follow = null;
    this.stopListening();
  }

  private stopListening(): void {
    const parts = this.parts;
    const view = parts.view;
    parts.view = null;
    if (!view) return;
    const listener = parts.listener;
    view.removeEventListener('scroll', listener, true);
    view.removeEventListener('scrollend', listener, true);
    view.removeEventListener('resize', listener);
    view.removeEventListener('blur', listener);
  }

  /**
   * A press that moves focus can make the browser scroll a moment later, and the reader may scroll
   * too: the menu goes along with the element it opened on, and closes only once it is out of sight.
   */
  private onScroll(e: Event): void {
    const parts = this.parts;
    const follow = parts.follow;
    const scrolled = e.target;
    if (!follow || (isNode(scrolled) && parts.popup?.element.contains(scrolled))) return;
    if (isElement(scrolled) && !scrolled.contains(follow.element)) return;
    const box = follow.element.getBoundingClientRect();
    parts.anchor.style.left = `${box.left + follow.x}px`;
    parts.anchor.style.top = `${box.top + follow.y}px`;
    if (!('onscrollend' in (follow.element.ownerDocument.defaultView ?? window))) this.closeOutOfSight();
  }

  private closeOutOfSight(): void {
    const follow = this.parts.follow;
    if (!follow || this.peekProperty('closeOnScroll') === false) return;
    if (!follow.element.isConnected || !inSight(follow.element)) this.close();
  }
}

/** Whether some of the element is on the screen and inside every box around it that clips it. */
function inSight(element: Element): boolean {
  const doc = element.ownerDocument;
  const view = doc.defaultView ?? window;
  const box = element.getBoundingClientRect();
  let left = Math.max(box.left, 0);
  let top = Math.max(box.top, 0);
  let right = Math.min(box.right, view.innerWidth);
  let bottom = Math.min(box.bottom, view.innerHeight);
  for (let el = element.parentElement; el && el !== doc.body && el !== doc.documentElement; el = el.parentElement) {
    if (!/auto|scroll|hidden|clip/.test(view.getComputedStyle(el).overflow)) continue;
    const clip = el.getBoundingClientRect();
    left = Math.max(left, clip.left);
    top = Math.max(top, clip.top);
    right = Math.min(right, clip.right);
    bottom = Math.min(bottom, clip.bottom);
  }
  return right > left && bottom > top;
}

/** Where a menu opened at an element starts: its start corner, below it (inside the viewport). */
function pointOf(element: Element): { x: number; y: number } {
  const box = element.getBoundingClientRect();
  const rtl = (element.ownerDocument.defaultView ?? window).getComputedStyle(element).direction === 'rtl';
  const viewHeight = element.ownerDocument.documentElement.clientHeight;
  return { x: rtl ? box.right : box.left, y: Math.max(0, Math.min(box.bottom, viewHeight)) };
}

function focusTarget(element: Element): HTMLElement | null {
  return isHtmlElement(element) && isFocusable(element) ? element : null;
}
