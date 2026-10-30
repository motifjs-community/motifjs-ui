import { untracked, type Bind, type ComponentBase, type IBaseProp } from '@motifx/core';
import { isHtmlElement } from '../../core/node-kind';
import { uiLocale } from '../../core/ui-locale';
import type { OverlayCloseReason } from '../../parts/overlay/overlay-close-reason';
import { OverlayPanel } from '../../parts/overlay/OverlayPanel';
import { SwipeTracker } from '../../parts/overlay/swipe-tracker';
import type { DrawerMode } from './drawer-mode';
import type { DrawerProps } from './drawer-props';
import type { DrawerSide } from './drawer-side';
import { onLanguage } from '../../core/on-language';

const OWN = ['side', 'mode', 'size', 'edgeSwipe', 'edgeSize', 'swipeToClose', 'flickSpeed'] as const;

/** How far, in pixels, a finger moves before the drawer decides it is a swipe and which way. */
const SLOP = 8;

/** A finger that may open or close the drawer, and once it does, how it goes. */
interface Swipe {
  id: number;
  x: number;
  y: number;
  /** Opening from the edge, or closing. */
  opening: boolean;
  decided: boolean;
  taken: boolean;
  size: number;
  tracker: SwipeTracker;
}

interface Parts {
  swipe: Swipe | null;
  /** Where the edge swipe listens, and how to stop it. */
  edge: { at: EventTarget; stop: () => void } | null;
  /** The element pushed aside, while it is. */
  pushed: HTMLElement | null;
  stopLabel: (() => void) | null;
}

const PARTS = Symbol('mx.drawer');

/**
 * A panel that slides in from an edge of the page or of a container: the start or the end (they
 * follow the reading direction), the top or the bottom. It covers the content (`over`) or moves it
 * aside (`push`, with `pushTarget`). A finger swiping it back towards its edge closes it, and one
 * swiping in from the edge opens it (`edgeSwipe`). Like a bottom sheet it is a dialog: modal over
 * the content by default, with Escape, a press on the scrim and the browser's back closing it,
 * and focus moved in and back again.
 *
 * @example
 * <Drawer title="Navigation" side="start" edgeSwipe x-model={() => this.state.menu}>…</Drawer>
 */
export class Drawer extends OverlayPanel<DrawerProps> {
  static override overlayClass = 'mx-drawer';

  constructor(props?: IBaseProp<DrawerProps>) {
    super(props);
    const own = (this.props ?? {}) as DrawerProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.pushTarget !== undefined) this.setProperty('pushTarget', own.pushTarget);
    this.observeProperty('side', () => this.renderSide());
    this.observeProperty('mode', () => this.renderSide());
    onLanguage(this, () => this.renderSide());
    this.observeProperty('size', () => this.renderSize());
    this.observeProperty('edgeSwipe', () => this.renderEdge());
    this.observeProperty('container', () => this.renderEdge());
    this.motif.on('x:built', () => queueMicrotask(() => this.renderEdge()));
    this.listenSwipe();
    this.renderSide();
    this.motif.setDisposable(() => {
      const parts = this.drawer;
      parts.edge?.stop();
      parts.edge = null;
      this.unpush();
      parts.stopLabel?.();
    });
  }

  // Properties (see DrawerProps).

  get side(): DrawerSide {
    return this.getProperty<DrawerSide | undefined>('side') ?? 'start';
  }
  set side(value: Bind<DrawerSide>) {
    this.assignProperty('side', value);
  }
  get mode(): DrawerMode {
    return this.getProperty<DrawerMode | undefined>('mode') ?? 'over';
  }
  set mode(value: Bind<DrawerMode>) {
    this.assignProperty('mode', value);
  }
  /** What push mode moves aside; a function given is read each time it opens. */
  get pushTarget(): HTMLElement | ComponentBase | null {
    const given = this.getProperty<Bind<HTMLElement | ComponentBase | null> | undefined>('pushTarget');
    return (typeof given === 'function' ? given() : given) ?? null;
  }
  set pushTarget(value: Bind<HTMLElement | ComponentBase | null>) {
    this.setProperty('pushTarget', value);
  }
  get size(): number | string | null {
    return this.getProperty<number | string | null | undefined>('size') ?? null;
  }
  set size(value: Bind<number | string | null>) {
    this.assignProperty('size', value);
  }
  get edgeSwipe(): boolean {
    return !!this.getProperty<boolean>('edgeSwipe');
  }
  set edgeSwipe(value: Bind<boolean>) {
    this.assignProperty('edgeSwipe', value, Boolean);
  }
  get edgeSize(): number {
    return this.getProperty<number | undefined>('edgeSize') ?? 24;
  }
  set edgeSize(value: Bind<number>) {
    this.assignProperty('edgeSize', value, Number);
  }
  get swipeToClose(): boolean {
    return this.getProperty<boolean | undefined>('swipeToClose') !== false;
  }
  set swipeToClose(value: Bind<boolean>) {
    this.assignProperty('swipeToClose', value, Boolean);
  }
  get flickSpeed(): number {
    return this.getProperty<number | undefined>('flickSpeed') ?? 0.4;
  }
  set flickSpeed(value: Bind<number>) {
    this.assignProperty('flickSpeed', value, Number);
  }
  /** Modal as set; else modal over the content, not while it pushes the content aside. */
  override get modal(): boolean {
    const own = this.getProperty<boolean | undefined>('modal');
    return own ?? this.mode !== 'push';
  }
  override set modal(value: Bind<boolean>) {
    this.assignProperty('modal', value, Boolean);
  }

  protected override placePanel(): void {
    this.renderSide();
    // A finger bringing it in holds it where it is.
    if (!this.drawer.swipe) this.setShift(0);
    if (this.mode === 'push') this.push(this.panelSize());
  }

  protected override closeBy(reason: OverlayCloseReason): boolean {
    const closed = super.closeBy(reason);
    if (closed && !this.isOpen) this.pushBy(0);
    return closed;
  }

  protected override panelClosed(): void {
    this.unpush();
    this.setShift(null);
    this.drawer.swipe = null;
    this.element.removeAttribute('data-dragging');
  }

  private get drawer(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { swipe: null, edge: null, pushed: null, stopLabel: null });
  }

  /** The logical edge it comes from: `left` and `right` turned into start and end for the reading direction. */
  private logicalSide(): 'start' | 'end' | 'top' | 'bottom' {
    const side = this.peekProperty<DrawerSide>('side') ?? 'start';
    if (side !== 'left' && side !== 'right') return side;
    return (side === 'left') !== this.rtl() ? 'start' : 'end';
  }

  private rtl(): boolean {
    const view = this.element.ownerDocument.defaultView;
    return !!view && this.element.isConnected && view.getComputedStyle(this.element).direction === 'rtl';
  }

  /** Along which axis it moves, and which way is in: +1 from the left or the top, -1 from the right or the bottom. */
  private axis(): { axis: 'x' | 'y'; inward: 1 | -1 } {
    const side = this.logicalSide();
    if (side === 'top') return { axis: 'y', inward: 1 };
    if (side === 'bottom') return { axis: 'y', inward: -1 };
    const fromLeft = (side === 'start') !== this.rtl();
    return { axis: 'x', inward: fromLeft ? 1 : -1 };
  }

  private renderSide(): void {
    const el = this.element;
    el.dataset.side = this.logicalSide();
    el.dataset.mode = this.peekProperty<DrawerMode>('mode') ?? 'over';
    if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) this.panelElement.setAttribute('aria-label', uiLocale.strings.drawerLabel);
  }

  private renderSize(): void {
    const size = this.peekProperty<number | string | null>('size');
    const style = this.panelElement.style;
    if (size === null || size === undefined || size === '') style.removeProperty('--_size');
    else style.setProperty('--_size', typeof size === 'number' ? `${size}px` : size);
  }

  /** The panel's size along its axis, in pixels. */
  private panelSize(): number {
    const box = this.panelElement.getBoundingClientRect();
    return this.axis().axis === 'x' ? box.width : box.height;
  }

  /** How far the panel is from open, signed along its axis; `null` takes the drag position away. */
  private setShift(px: number | null): void {
    const style = this.panelElement.style;
    style.removeProperty('--_shift-x');
    style.removeProperty('--_shift-y');
    if (px === null || px === 0) return;
    style.setProperty(this.axis().axis === 'x' ? '--_shift-x' : '--_shift-y', `${Math.round(px)}px`);
  }

  // Pushing the content.

  private push(amount: number): void {
    const parts = this.drawer;
    const given = untracked(() => this.pushTarget);
    const target = given ? (isHtmlElement(given) ? given : (given.element as HTMLElement | null)) : null;
    if (parts.pushed && parts.pushed !== target) this.unpush();
    if (!target) return;
    parts.pushed = target;
    target.setAttribute('data-mx-drawer-push', '');
    this.pushBy(amount);
  }

  private pushBy(amount: number): void {
    const target = this.drawer.pushed;
    if (!target) return;
    const { axis, inward } = this.axis();
    const px = `${Math.round(amount * inward)}px`;
    target.style.setProperty('--_mx-push', axis === 'x' ? `${px} 0px` : `0px ${px}`);
  }

  private unpush(): void {
    const parts = this.drawer;
    const target = parts.pushed;
    if (!target) return;
    parts.pushed = null;
    target.removeAttribute('data-mx-drawer-push');
    target.removeAttribute('data-mx-dragging');
    target.style.removeProperty('--_mx-push');
  }

  // Swipes.

  /** Where a swipe from the edge is listened for: the container, else the whole page. */
  private renderEdge(): void {
    const parts = this.drawer;
    const want = !!this.peekProperty('edgeSwipe') && !this.isDisposed;
    const given = untracked(() => this.container);
    const at: EventTarget | null = !want ? null : given ? (isHtmlElement(given) ? given : (given.element as HTMLElement | null)) : this.element.ownerDocument;
    if (parts.edge?.at === at) return;
    parts.edge?.stop();
    parts.edge = null;
    if (!at) return;
    const start = (e: Event) => this.edgeStart(e as TouchEvent);
    const move = (e: Event) => this.swipeMove(e as TouchEvent);
    const end = (e: Event) => this.swipeEnd(e as TouchEvent);
    // The touchmove listener is there before a finger lands: only then can it keep the page from scrolling.
    at.addEventListener('touchstart', start, { passive: true });
    at.addEventListener('touchmove', move, { passive: false });
    at.addEventListener('touchend', end);
    at.addEventListener('touchcancel', end);
    parts.edge = {
      at,
      stop: () => {
        at.removeEventListener('touchstart', start);
        at.removeEventListener('touchmove', move);
        at.removeEventListener('touchend', end);
        at.removeEventListener('touchcancel', end);
      },
    };
  }

  private listenSwipe(): void {
    const el = this.element;
    el.addEventListener(
      'touchstart',
      (e) => {
        if (!this.isOpen || !this.swipeToClose || e.touches.length !== 1 || this.drawer.swipe) return;
        if (sideScroller(e.target as Element, this.panelElement)) return;
        const t = e.touches[0];
        this.begin(t, false);
      },
      { passive: true },
    );
    el.addEventListener('touchmove', (e) => this.swipeMove(e), { passive: false });
    el.addEventListener('touchend', (e) => this.swipeEnd(e));
    el.addEventListener('touchcancel', (e) => this.swipeEnd(e));
  }

  private edgeStart(e: TouchEvent): void {
    if (this.isOpen || !this.isEnabled || e.touches.length !== 1 || this.drawer.swipe) return;
    const t = e.touches[0];
    const at0 = this.drawer.edge?.at;
    if (!at0) return;
    const view = this.element.ownerDocument.defaultView;
    const box = isHtmlElement(at0) ? at0.getBoundingClientRect() : new DOMRect(0, 0, view?.innerWidth ?? 0, view?.innerHeight ?? 0);
    const { axis, inward } = this.axis();
    const edge = axis === 'x' ? (inward === 1 ? box.left : box.right) : inward === 1 ? box.top : box.bottom;
    const at = axis === 'x' ? t.clientX : t.clientY;
    if (Math.abs(at - edge) > this.edgeSize) return;
    const across = axis === 'x' ? t.clientY : t.clientX;
    const [lo, hi] = axis === 'x' ? [box.top, box.bottom] : [box.left, box.right];
    if (across < lo || across > hi) return;
    this.begin(t, true);
  }

  private begin(t: Touch, opening: boolean): void {
    const tracker = new SwipeTracker();
    tracker.start(t.clientX, t.clientY);
    this.drawer.swipe = { id: t.identifier, x: t.clientX, y: t.clientY, opening, decided: false, taken: false, size: 0, tracker };
  }

  private swipeMove(e: TouchEvent): void {
    const parts = this.drawer;
    const swipe = parts.swipe;
    if (!swipe) return;
    const t = Array.from(e.changedTouches).find((c) => c.identifier === swipe.id);
    if (!t) return;
    swipe.tracker.move(t.clientX, t.clientY);
    const { axis, inward } = this.axis();
    const along = (axis === 'x' ? t.clientX - swipe.x : t.clientY - swipe.y) * inward;
    const across = axis === 'x' ? t.clientY - swipe.y : t.clientX - swipe.x;
    if (!swipe.decided) {
      if (Math.abs(along) < SLOP && Math.abs(across) < SLOP) return;
      swipe.decided = true;
      // Only a swipe along the axis, the way it would go, is the drawer's.
      if (Math.abs(along) <= Math.abs(across) || (swipe.opening ? along <= 0 : along >= 0)) {
        parts.swipe = null;
        return;
      }
      if (!this.take(swipe)) {
        parts.swipe = null;
        return;
      }
    }
    if (!swipe.taken) return;
    if (e.cancelable) e.preventDefault();
    const shown = Math.min(swipe.size, Math.max(0, swipe.opening ? along : swipe.size + along));
    this.setShift(-inward * (swipe.size - shown));
    if (parts.pushed) this.pushBy(shown);
  }

  /** The swipe is the drawer's: it opens (out of sight yet) to follow the finger. */
  private take(swipe: Swipe): boolean {
    const el = this.element;
    el.toggleAttribute('data-dragging', true);
    if (swipe.opening) {
      // Laid out where it would be open, then held out of sight while the finger brings it in.
      const style = this.panelElement.style;
      style.setProperty(this.axis().axis === 'x' ? '--_shift-x' : '--_shift-y', `${this.axis().inward * -100000}px`);
      if (!this.openBy()) {
        el.removeAttribute('data-dragging');
        return false;
      }
    }
    swipe.size = this.panelSize();
    swipe.taken = true;
    this.drawer.pushed?.setAttribute('data-mx-dragging', '');
    return true;
  }

  private swipeEnd(e: TouchEvent): void {
    const parts = this.drawer;
    const swipe = parts.swipe;
    if (!swipe || !Array.from(e.changedTouches).some((c) => c.identifier === swipe.id)) return;
    parts.swipe = null;
    if (!swipe.taken) return;
    const { axis, inward } = this.axis();
    this.element.removeAttribute('data-dragging');
    parts.pushed?.removeAttribute('data-mx-dragging');
    const shift = parseFloat(this.panelElement.style.getPropertyValue(axis === 'x' ? '--_shift-x' : '--_shift-y')) || 0;
    const shown = swipe.size - Math.abs(shift);
    const speed = swipe.tracker.velocity(axis) * inward;
    const flick = this.flickSpeed;
    const open = e.type === 'touchcancel' ? !swipe.opening : speed > flick ? true : speed < -flick ? false : shown > swipe.size / 2;
    if (open) {
      this.setShift(0);
      if (parts.pushed) this.pushBy(swipe.size);
    } else {
      this.close('swipe');
    }
  }
}

/** Whether the finger is on something inside the panel that scrolls sideways itself. */
function sideScroller(target: Element | null, panel: HTMLElement): boolean {
  const view = panel.ownerDocument.defaultView;
  for (let el = target; el && el !== panel; el = el.parentElement) {
    const html = el as HTMLElement;
    if (html.scrollWidth > html.clientWidth + 1 && view && /auto|scroll/.test(view.getComputedStyle(html).overflowX)) return true;
  }
  return false;
}
