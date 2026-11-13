import { Component, ComponentBase, Emitter, createSignal, read, untracked, type Bind, type Event as MotifEvent, type IBaseProp, type Signal } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { css, put } from '../../core/part-writes';
import { isInPage, isRtl, measure, mediaOf, onLayout, pageOf, rectOf, sameWindow, visibleRectOf, type Point, type Rect } from '../../core/measure';
import { placeOnPage } from '../../core/page-layer';
import { onWindow } from '../../core/window-events';
import { parseAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { canTakeFocus, focusOn, holdsFocus, rememberFocus } from '../../core/focus';
import type { FocusMark } from '../../core/focus-mark';
import { givenField, givenList } from '../../core/given-field';
import { isElement } from '../../core/node-kind';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../parts/popup/Popup';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import { ActionSheet } from '../actionsheet/ActionSheet';
import type { OverlayCloseReason } from '../../parts/overlay/overlay-close-reason';
import type { ContextMenuOpeningEventArgs } from './context-menu-opening-event-args';
import type { ContextMenuPresentation } from './context-menu-presentation';
import type { ContextMenuProps } from './context-menu-props';
import type { ContextMenuTarget } from './context-menu-target';
import { runItem } from '../../core/command-fields';

const OWN = ['items', 'keyboard', 'closeOnScroll', 'openOnHover', 'presentation'] as const;

const NO_ITEMS: readonly MenuItem[] = [];

interface Parts {
  /** An invisible 1×1 point the popup opens next to: the pointer, or the focused element. */
  anchor: Component<HTMLDivElement>;
  popup: Popup | null;
  list: MenuList | null;
  /** The action sheet it shows its items in on a touch screen. */
  sheet: ActionSheet | null;
  /** The target as given; `undefined`: the component the menu is placed in. */
  source: Bind<ContextMenuTarget | null | undefined> | undefined;
  /** Whether the target's watch is made; `turn` reruns it when the target is given anew. */
  watching: boolean;
  turn: Signal<number>;
  /** The component listened to for the target. */
  attachedPart: ComponentBase | null;
  /** Where focus goes back when the menu closes with focus in it: where focus was, or the component it opened at. */
  returnFocus: FocusMark | ComponentBase | null;
  /** When a key last opened the menu: the `contextmenu` event the same key may send is not a second opening. */
  keyOpenedAt: number;
  /** The component the menu opened on: the menu goes along when it scrolls. */
  follow: Follow | null;
  /** Listens, while open, on the window. */
  listener: (e: Event) => void;
  /** Listens on the target's component. */
  onTarget: (sender: ComponentBase, e: Event) => void;
  /** What stops listening and watching while open. */
  stopOpen: (() => void)[];
  /** Where the component it opened on is after a scroll, and the menu moved along: the same two each time. */
  readFollow: () => FollowRead | null;
  moveAlong: (read: FollowRead | null) => void;
  opening: Emitter<ContextMenuOpeningEventArgs>;
  itemClick: Emitter<MenuItemClickEventArgs>;
  closed: Emitter<PopupCloseReason>;
}

/** The component the menu opened on, where the anchor sits from its corner, and where that corner was last. */
interface Follow {
  part: ComponentBase;
  x: number;
  y: number;
  left: number;
  top: number;
}

interface FollowRead {
  follow: Follow;
  box: Rect;
  seen: boolean;
}

const PARTS = Symbol('mx.contextmenu');

/**
 * A menu that opens at the pointer on an element's right-click (or long press), and at the focused element
 * with the Menu key or Shift+F10. `onOpening` builds the items for the element it opened on, such as a list
 * row, or cancels. It closes on Escape, a click outside it and focus leaving it. When the page scrolls, it
 * follows the component it opened on and closes once that is out of view. The items are `MenuItem`s: submenus, check and
 * radio items, shortcuts. Opened on an element in another document (a window the app opened), the menu appears there.
 *
 * @example
 * <ContextMenu target={() => this.list} items={[{ text: '&Copy', click: () => this.copy() }]} />
 *
 * const menu = new ContextMenu({ target: this.grid, items: this.rowItems });
 * menu.onOpening((e) => (e.items = this.itemsFor(this.rows.find((row) => row.motif.isEventFrom(e.event)))));
 */
export class ContextMenu extends Control<HTMLDivElement, ContextMenuProps> {
  constructor(props?: IBaseProp<ContextMenuProps>) {
    super(props);
    const own = (this.props ?? {}) as ContextMenuProps;
    const parts = this.parts;
    this.observeProperty<string>('text', (text) => {
      const label = parseAccessKey(text ?? '').text;
      if (parts.list) put(parts.list, 'aria-label', label);
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
    // A target given as a function may name a component made after this one (a ref): read it once both are created.
    if (own.target !== undefined && typeof own.target !== 'function') this.followTarget();
    else queueMicrotask(() => this.followTarget());
    this.motif.on('x:built', () => queueMicrotask(() => this.followTarget()));
    this.motif.setDisposable(() => {
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
  /** The component the menu listens on. Reactive. Set it to a component or a function that returns one. */
  get target(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('attached') ?? null;
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
  get presentation(): ContextMenuPresentation {
    return this.getProperty<ContextMenuPresentation | undefined>('presentation') ?? 'menu';
  }
  set presentation(value: Bind<ContextMenuPresentation>) {
    this.assignProperty('presentation', value);
  }

  /** Indicates whether the menu is open. Reactive. */
  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }

  /**
   * The component the menu was last opened on (the innermost one under the target that was clicked or focused), kept
   * after it closes. Reactive. The element itself is `e.target` of `onOpening`.
   */
  get targetPart(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('targetPart') ?? null;
  }

  /** Occurs before the menu opens. Set `e.items` for `e.target`, or cancel. */
  get onOpening(): MotifEvent<ContextMenuOpeningEventArgs> {
    return this.parts.opening.event;
  }
  /** Occurs when an item is selected, after the item's own `click`. */
  get onItemClick(): MotifEvent<MenuItemClickEventArgs> {
    return this.parts.itemClick.event;
  }
  get onClosed(): MotifEvent<PopupCloseReason> {
    return this.parts.closed.event;
  }

  /**
   * Opens the menu programmatically, at a point of the viewport, or at a component (its start corner,
   * below it). `target` is the component `targetPart` and `onOpening` report, by default the target; focus goes back
   * to it when the menu closes. Returns whether it opened.
   */
  open(at: { x: number; y: number } | ComponentBase, target?: ComponentBase): boolean {
    const atPart = at instanceof ComponentBase ? at : null;
    if (atPart && !elementOf(atPart)) return false;
    const opener = target ?? atPart ?? this.parts.attachedPart;
    if (!opener) return false;
    const point = !atPart ? (at as Point) : atPart === opener ? null : pointOf(atPart);
    return this.show(opener, point, new Event('open'), !!atPart, canTakeFocus(opener) ? opener : null);
  }

  close(): void {
    this.parts.popup?.close('code');
    this.parts.sheet?.close();
  }

  /**
   * Re-reads the items of the open menu, including an open submenu, after they have been changed in place. Your items
   * can be plain or reactive, and the menu reads them as they are.
   */
  refresh(): void {
    const parts = this.parts;
    if (parts.popup?.isOpen) parts.list?.refresh();
    parts.sheet?.refresh();
  }

  /** The action sheet that displays the items, once it has displayed them. */
  get actionSheet(): ActionSheet | null {
    return this.parts.sheet;
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
    this.class.add('mx-context-menu');
    const anchor = part<HTMLDivElement>(this, 'div', 'mx-context-menu__anchor');
    anchor.style({ 'inline-size': '1px', 'block-size': '1px' });
    return {
      anchor,
      attachedPart: null,
      stopOpen: [],
      popup: null,
      list: null,
      sheet: null,
      source: undefined,
      watching: false,
      turn: createSignal(0),
      returnFocus: null,
      keyOpenedAt: -Infinity,
      follow: null,
      listener: (e) => this.handle(e),
      onTarget: (_: ComponentBase, e: Event) => this.handle(e),
      readFollow: () => this.readFollow(),
      moveAlong: (read) => this.moveAlong(read),
      opening: new Emitter(),
      itemClick: new Emitter(),
      closed: new Emitter(),
    };
  }

  private followTarget(): void {
    const parts = this.parts;
    if (this.isDisposed) return;
    // One watch, read again when the target is given anew (`turn`), on a change of what it reads, and on reState.
    if (parts.watching) {
      const source = parts.source;
      this.attachTo(source, source === undefined ? undefined : untracked(() => read(source)));
      parts.turn.value = parts.turn.peek() + 1;
      return;
    }
    parts.watching = true;
    this.bindings.watch(() => {
      void parts.turn.value;
      const source = parts.source;
      const target = source === undefined ? undefined : read(source);
      untracked(() => this.attachTo(source, target));
    });
  }

  private attachTo(source: unknown, target: ContextMenuTarget | null | undefined): void {
    if (source !== undefined) {
      this.attach(target ?? null);
      return;
    }
    // The component it is placed in: the nearest one above it with an element of its own (a fragment has none).
    let around = this.parent;
    while (around && !isElement(around.element)) around = around.parent;
    this.attach(around);
  }

  private attach(component: ComponentBase | null): void {
    const parts = this.parts;
    const before = parts.attachedPart;
    if (before === component) return;
    if (before) {
      void before.motif.off('contextmenu', parts.onTarget);
      void before.motif.off('keydown', parts.onTarget);
    }
    if (component) {
      void component.motif.on('contextmenu', parts.onTarget);
      void component.motif.on('keydown', parts.onTarget);
    }
    parts.attachedPart = component;
    this.setProperty('attached', component);
  }

  private handle(e: Event): void {
    if (e.type === 'contextmenu') this.onContextMenu(e as MouseEvent);
    else if (e.type === 'keydown') this.onKeyDown(e as KeyboardEvent);
    else this.close();
  }

  private onContextMenu(e: MouseEvent): void {
    const parts = this.parts;
    if (parts.popup?.isOpen && performance.now() - parts.keyOpenedAt < 1000) {
      e.preventDefault();
      return;
    }
    if (e.defaultPrevented || !untracked(() => this.isEnabled)) return;
    if (!parts.attachedPart) return;
    // Sent by a key the page saw no keydown of: it starts at the focused element.
    const fromKeys = e.button !== 2 && e.clientX === 0 && e.clientY === 0;
    this.show(partOfEvent(e, parts.attachedPart), fromKeys ? null : { x: e.clientX, y: e.clientY }, e, fromKeys, rememberFocus(e));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const menuKey = e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey);
    if (!menuKey || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
    if (this.peekProperty('keyboard') === false || !untracked(() => this.isEnabled)) return;
    // A key starts at the focused element.
    const parts = this.parts;
    if (!parts.attachedPart) return;
    if (this.show(partOfEvent(e, parts.attachedPart), null, e, true, rememberFocus(e))) parts.keyOpenedAt = performance.now();
  }

  // Opening and closing.

  /**
   * Opens at `point`, or (`null`) at the start corner of `at`, the component it opened on: it goes along with `at` while
   * the page scrolls. `onOpening` and `targetPart` report `at`.
   */
  private show(at: ComponentBase, point: Point | null, event: Event, byKeyboard: boolean, returnFocus: FocusMark | ComponentBase | null): boolean {
    if (!elementOf(at)) return false;
    const parts = this.parts;
    // Read before anything is written.
    const box = rectOf(at);
    const start = point ?? pointOf(at, box);
    const args: ContextMenuOpeningEventArgs = {
      part: at,
      items: this.peekProperty<readonly MenuItem[]>('items') ?? NO_ITEMS,
      cancel: false,
      byKeyboard,
      event,
      source: this,
    };
    untracked(() => parts.opening.fire(args));
    if (args.cancel || !givenList(args.items).some((item) => untracked(() => givenField(item, 'visible')) !== false)) return false;
    event.preventDefault();
    event.stopPropagation();
    this.host(at);
    if (this.inSheet(event, byKeyboard)) return this.showSheet(args.items, at, byKeyboard);
    const popup = (parts.popup ??= this.createPopup());
    const list = parts.list!;
    list.closeSubmenu();
    list.setItems(args.items);
    css(parts.anchor, 'left', `${start.x}px`);
    css(parts.anchor, 'top', `${start.y}px`);
    parts.follow = { part: at, x: start.x - box.left, y: start.y - box.top, left: box.left, top: box.top };
    parts.returnFocus = returnFocus;
    popup.open(parts.anchor);
    this.setProperty('targetPart', at);
    this.setProperty('opened', true);
    this.startClosing(popup);
    if (byKeyboard) list.focusItem('first');
    else list.focusList();
    return true;
  }

  /** Whether the items go into an action sheet this time. */
  private inSheet(event: Event, byKeyboard: boolean): boolean {
    const presentation = untracked(() => this.presentation);
    if (presentation !== 'auto') return presentation === 'sheet';
    if (byKeyboard) return false;
    const kind = (event as PointerEvent).pointerType;
    if (kind) return kind === 'touch';
    return mediaOf(this, '(hover: none) and (pointer: coarse)');
  }

  private showSheet(items: readonly MenuItem[], at: ComponentBase, byKeyboard: boolean): boolean {
    const parts = this.parts;
    parts.popup?.close('code');
    const sheet = (parts.sheet ??= this.createSheet());
    sheet.label = parseAccessKey(this.peekProperty<string>('text') ?? '').text;
    sheet.items = items;
    if (!sheet.open(byKeyboard)) return false;
    this.setProperty('targetPart', at);
    this.setProperty('opened', true);
    return true;
  }

  private createSheet(): ActionSheet {
    const parts = this.parts;
    const sheet = new ActionSheet();
    this.controls.add(sheet);
    sheet.onItemClick((e) => parts.itemClick.fire({ ...e, source: this }));
    sheet.onClosed((e) => {
      this.setProperty('opened', false);
      parts.closed.fire(SHEET_REASONS[e.reason]);
    });
    return sheet;
  }

  /** Made with `new` and never placed, it opens from the end of the page; on a component in another window, from the end of that one. */
  private host(near: ComponentBase): void {
    if (this.isBuilt && isInPage(this) && sameWindow(this, near)) return;
    this.parts.popup?.close('code');
    // The app's layer of that window holds it (the page itself without an app).
    placeOnPage(near, this);
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
    if (label) put(list, 'aria-label', label);
    list.onChosen((e) => this.chosen(e));
    popup.controls.add(list);
    this.controls.add(popup);
    // Inside its own menu the right button opens nothing, not even the browser's menu.
    popup.motif.on('contextmenu', (_, e) => e.preventDefault());
    popup.onClosed((reason) => {
      this.stopClosing();
      this.giveFocusBack(popup, reason);
      this.setProperty('opened', false);
      parts.closed.fire(reason);
    });
    parts.list = list;
    return popup;
  }

  /** Focus left in the menu as it closes goes back to where it was when the menu opened; focus that moved away stays. */
  private giveFocusBack(popup: Popup, reason: PopupCloseReason): void {
    const parts = this.parts;
    const back = parts.returnFocus;
    parts.returnFocus = null;
    if (!back || reason === 'focus') return;
    // Focus that was in the menu is still in it, or nowhere now that it is hidden.
    if (!holdsFocus(popup) && rememberFocus()) return;
    if (back instanceof ComponentBase) focusOn(back);
    else back.restore();
  }

  private chosen(e: MenuItemClickEventArgs): void {
    this.close();
    runItem(e.item, e, e.source, e.event, this.parts.attachedPart ?? this);
    this.parts.itemClick.fire(e);
  }

  /** While open: the window changing size or losing focus closes it, and a scroll in the page (not in the menu) moves it along. */
  private startClosing(popup: Popup): void {
    const parts = this.parts;
    this.stopListening();
    const listener = parts.listener;
    parts.stopOpen = [
      onWindow(this, 'resize', listener),
      onWindow(this, 'blur', listener),
      onLayout(this, 'scroll', () => measure(this, parts.readFollow, parts.moveAlong), { except: popup }),
    ];
  }

  private stopClosing(): void {
    this.parts.follow = null;
    this.stopListening();
  }

  private stopListening(): void {
    for (const stop of this.parts.stopOpen.splice(0)) stop();
  }

  private readFollow(): FollowRead | null {
    const follow = this.parts.follow;
    if (!follow) return null;
    const part = follow.part;
    const watching = this.peekProperty('closeOnScroll') !== false;
    return { follow, box: rectOf(part), seen: !watching || (isInPage(part) && visibleRectOf(part) !== null) };
  }

  /**
   * A click that moves focus can make the browser scroll a moment later, and the reader may scroll
   * too: the menu goes along with the component it opened on, and closes once that is out of sight.
   */
  private moveAlong(read: FollowRead | null): void {
    const parts = this.parts;
    const follow = parts.follow;
    // Only a move counts: the watch also tells once as it starts.
    if (!read || !follow || read.follow !== follow || (read.box.left === follow.left && read.box.top === follow.top)) return;
    if (!read.seen) {
      this.close();
      return;
    }
    follow.left = read.box.left;
    follow.top = read.box.top;
    css(parts.anchor, 'left', `${follow.left + follow.x}px`);
    css(parts.anchor, 'top', `${follow.top + follow.y}px`);
    // Placed by where the anchor is now, not where it was when the popup heard the scroll.
    parts.popup?.place();
  }
}

/** How the sheet's closing reads as a menu's. */
const SHEET_REASONS: Record<OverlayCloseReason, PopupCloseReason> = {
  code: 'code',
  escape: 'escape',
  scrim: 'outside',
  swipe: 'outside',
  back: 'escape',
  button: 'escape',
  owner: 'code',
};

/** The innermost component, `within` or under it, that the event started in: found down the component tree. */
function partOfEvent(e: Event, within: ComponentBase): ComponentBase {
  let found = within;
  for (let at: ComponentBase | undefined = within; at; ) {
    at = at.controls.items.find((child) => !child.isDisposed && child.motif.isEventFrom(e));
    if (at) found = at;
  }
  return found;
}

/** The element of a component (a fragment has none). */
function elementOf(of: ComponentBase): Element | null {
  return isElement(of.element) ? of.element : null;
}

/** Where a menu opened at a component starts: its start corner, below it (inside the viewport). */
function pointOf(part: ComponentBase, box: Rect = rectOf(part)): Point {
  return { x: isRtl(part) ? box.right : box.left, y: Math.max(0, Math.min(box.bottom, pageOf(part).height)) };
}
