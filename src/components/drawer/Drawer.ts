import { ComponentBase, untracked, type Bind, type IBaseProp } from '@motifx/core';
import { isRtl, measure, pageOf, rectOf, scrollerUnder, type Rect } from '../../core/measure';
import { css, mark, put } from '../../core/part-writes';
import { onDocument } from '../../core/window-events';
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

/** Along which axis it moves, and which way is in: +1 from the left or the top, -1 from the right or the bottom. */
interface Way {
  axis: 'x' | 'y';
  inward: 1 | -1;
}

/** A finger that may open or close the drawer, and once it does, how it goes. */
interface Swipe {
  id: number;
  x: number;
  y: number;
  /** Opening from the edge, or closing. */
  opening: boolean;
  decided: boolean;
  taken: boolean;
  /** Read as the finger lands. */
  way: Way;
  /** The panel's size along its axis; `null` until the panel opened for the swipe is measured. */
  size: number | null;
  /** How far the finger has gone inward along the axis. */
  moved: number;
  /** Once the finger is lifted before the size is known: how it was lifted. */
  ended: SwipeEnd | null;
  tracker: SwipeTracker;
}

interface SwipeEnd {
  cancelled: boolean;
  /** Inward, in pixels per millisecond. */
  speed: number;
}

interface Parts {
  swipe: Swipe | null;
  /** Where the edge swipe listens (the container, `null` for the page), and how to stop it. */
  edge: { over: ComponentBase | null; stop: () => void } | null;
  /** What push mode moves aside, while it does. */
  pushed: ComponentBase | null;
  stopLabel: (() => void) | null;
}

const PARTS = Symbol('mx.drawer');

/**
 * A panel that slides in from an edge of the page or of a container: the start or the end, which
 * follow the reading direction, the top or the bottom. It covers the content (`over`) or moves it
 * aside (`push`, with `pushTarget`). A finger swiping it back toward its edge closes it, and one
 * swiping in from the edge opens it (`edgeSwipe`). Like a bottom sheet, it is a dialog. It is modal
 * over the content by default, it is closed by Escape, a click on the scrim and the browser's back
 * action, and focus moves in and returns.
 *
 * @example
 * <Drawer title="Navigation" side="start" edgeSwipe x-model={() => this.state.menu}>…</Drawer>
 */
export class Drawer extends OverlayPanel<DrawerProps> {
  static override overlayClass = 'mx-drawer';

  private readonly readPush = (): { way: Way; size: number } => {
    const way = this.way();
    return { way, size: this.sizeAlong(way) };
  };

  private readonly drawPush = (read: { way: Way; size: number }): void => {
    if (this.isOpen && !this.drawer.swipe && this.mode === 'push') this.push(read.size, read.way);
  };

  private readonly readSwipeSize = (): number => {
    const swipe = this.drawer.swipe;
    return swipe ? this.sizeAlong(swipe.way) : 0;
  };

  private readonly swipeSized = (size: number): void => {
    const swipe = this.drawer.swipe;
    if (!swipe?.taken || swipe.size !== null) return;
    swipe.size = size;
    if (swipe.ended) this.finish(swipe, swipe.ended);
    else this.follow(swipe);
  };

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
  /** The component that push mode moves aside. A function is read each time the drawer opens. */
  get pushTarget(): ComponentBase | null {
    const given = this.getProperty<Bind<ComponentBase | null> | undefined>('pushTarget');
    return (typeof given === 'function' ? given() : given) ?? null;
  }
  set pushTarget(value: Bind<ComponentBase | null>) {
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
  /** Indicates whether it is modal. Without a value, it is modal over the content and not while pushing it aside. */
  override get modal(): boolean {
    const own = this.getProperty<boolean | undefined>('modal');
    return own ?? this.mode !== 'push';
  }
  override set modal(value: Bind<boolean>) {
    this.assignProperty('modal', value, Boolean);
  }

  protected override placePanel(): void {
    this.renderSide();
    const swipe = this.drawer.swipe;
    // A finger bringing it in holds it where it is, and moves the content along with it.
    if (swipe) {
      if (this.mode === 'push') this.push(0, swipe.way);
      return;
    }
    this.clearShift();
    if (this.mode === 'push') measure(this, this.readPush, this.drawPush);
  }

  protected override closeBy(reason: OverlayCloseReason): boolean {
    const way = this.way();
    const closed = super.closeBy(reason);
    if (closed && !this.isOpen) this.pushBy(0, way);
    return closed;
  }

  protected override panelClosed(): void {
    this.unpush();
    this.clearShift();
    this.drawer.swipe = null;
    mark(this, 'data-dragging', false);
  }

  private get drawer(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { swipe: null, edge: null, pushed: null, stopLabel: null });
  }

  /** The logical edge it comes from: `left` and `right` turned into start and end for the reading direction. */
  private logicalSide(rtl = isRtl(this)): 'start' | 'end' | 'top' | 'bottom' {
    const side = this.peekProperty<DrawerSide>('side') ?? 'start';
    if (side !== 'left' && side !== 'right') return side;
    return (side === 'left') !== rtl ? 'start' : 'end';
  }

  private way(): Way {
    const rtl = isRtl(this);
    const side = this.logicalSide(rtl);
    if (side === 'top') return { axis: 'y', inward: 1 };
    if (side === 'bottom') return { axis: 'y', inward: -1 };
    const fromLeft = (side === 'start') !== rtl;
    return { axis: 'x', inward: fromLeft ? 1 : -1 };
  }

  private renderSide(): void {
    put(this, 'data-side', this.logicalSide());
    put(this, 'data-mode', this.peekProperty<DrawerMode>('mode') ?? 'over');
    if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) put(this.panelPart, 'aria-label', uiLocale.strings.drawerLabel);
  }

  private renderSize(): void {
    const size = this.peekProperty<number | string | null>('size');
    const panel = this.panelPart;
    if (size === null || size === undefined || size === '') css(panel, '--_size', '');
    else css(panel, '--_size', typeof size === 'number' ? `${size}px` : size);
  }

  /** The panel's size along `way`'s axis, in pixels: a read. */
  private sizeAlong(way: Way): number {
    const box = rectOf(this.panelPart);
    return way.axis === 'x' ? box.width : box.height;
  }

  /** How far the panel is from open, signed along `way`'s axis. */
  private setShift(px: number, way: Way): void {
    this.clearShift();
    if (Math.round(px) === 0) return;
    css(this.panelPart, way.axis === 'x' ? '--_shift-x' : '--_shift-y', `${Math.round(px)}px`);
  }

  /** Takes the drag position away. */
  private clearShift(): void {
    const panel = this.panelPart;
    css(panel, '--_shift-x', '');
    css(panel, '--_shift-y', '');
  }

  // Pushing the content.

  private push(amount: number, way: Way): void {
    const parts = this.drawer;
    const target = untracked(() => this.pushTarget);
    if (parts.pushed && parts.pushed !== target) this.unpush();
    if (!target) return;
    parts.pushed = target;
    mark(target, 'data-mx-drawer-push', true);
    this.pushBy(amount, way);
  }

  private pushBy(amount: number, way: Way): void {
    const target = this.drawer.pushed;
    if (!target) return;
    const { axis, inward } = way;
    const px = `${Math.round(amount * inward)}px`;
    css(target, '--_mx-push', axis === 'x' ? `${px} 0px` : `0px ${px}`);
  }

  private unpush(): void {
    const parts = this.drawer;
    const target = parts.pushed;
    if (!target) return;
    parts.pushed = null;
    mark(target, 'data-mx-drawer-push', false);
    mark(target, 'data-mx-dragging', false);
    css(target, '--_mx-push', '');
  }

  // Swipes.

  /** Where a swipe from the edge is listened for: the container, else the whole page. */
  private renderEdge(): void {
    const parts = this.drawer;
    const want = !!this.peekProperty('edgeSwipe') && !this.isDisposed;
    const over = want ? this.containerPart : null;
    if (want && parts.edge && parts.edge.over === over) return;
    parts.edge?.stop();
    parts.edge = null;
    if (!want) return;
    // The touchmove listener is there before a finger lands: only then can it keep the page from scrolling.
    if (over) {
      const start = (_: ComponentBase, e: TouchEvent | undefined) => e && this.edgeStart(e);
      const move = (_: ComponentBase, e: TouchEvent | undefined) => e && this.swipeMove(e);
      const end = (_: ComponentBase, e: TouchEvent | undefined) => e && this.swipeEnd(e);
      void over.motif.on('touchstart:passive', start);
      void over.motif.on('touchmove', move);
      void over.motif.on('touchend', end);
      void over.motif.on('touchcancel', end);
      parts.edge = {
        over,
        stop: () => {
          void over.motif.off('touchstart:passive', start);
          void over.motif.off('touchmove', move);
          void over.motif.off('touchend', end);
          void over.motif.off('touchcancel', end);
        },
      };
      return;
    }
    const stops = [
      onDocument(this, 'touchstart', (e) => this.edgeStart(e), { passive: true }),
      onDocument(this, 'touchmove', (e) => this.swipeMove(e), { passive: false }),
      onDocument(this, 'touchend', (e) => this.swipeEnd(e)),
      onDocument(this, 'touchcancel', (e) => this.swipeEnd(e)),
    ];
    parts.edge = {
      over: null,
      stop: () => {
        for (const stop of stops) stop();
      },
    };
  }

  private listenSwipe(): void {
    this.motif.on('touchstart:passive', (_, e: TouchEvent | undefined) => {
      if (!e || !this.isOpen || !this.swipeToClose || e.touches.length !== 1 || this.drawer.swipe) return;
      // Something inside the panel that scrolls sideways itself keeps the finger.
      const scroller = scrollerUnder(e, this.panelPart, 'x');
      if (scroller && scroller !== this.panelPart) return;
      const way = this.way();
      this.begin(e.touches[0], false, way, this.sizeAlong(way));
    });
    this.motif.on('touchmove', (_, e: TouchEvent | undefined) => e && this.swipeMove(e));
    this.motif.on('touchend', (_, e: TouchEvent | undefined) => e && this.swipeEnd(e));
    this.motif.on('touchcancel', (_, e: TouchEvent | undefined) => e && this.swipeEnd(e));
  }

  private edgeStart(e: TouchEvent): void {
    const listening = this.drawer.edge;
    if (!listening || this.isOpen || !this.isEnabled || e.touches.length !== 1 || this.drawer.swipe) return;
    const t = e.touches[0];
    const box = listening.over ? rectOf(listening.over) : pageRect(this);
    const way = this.way();
    const { axis, inward } = way;
    const edge = axis === 'x' ? (inward === 1 ? box.left : box.right) : inward === 1 ? box.top : box.bottom;
    const at = axis === 'x' ? t.clientX : t.clientY;
    if (Math.abs(at - edge) > this.edgeSize) return;
    const across = axis === 'x' ? t.clientY : t.clientX;
    const [lo, hi] = axis === 'x' ? [box.top, box.bottom] : [box.left, box.right];
    if (across < lo || across > hi) return;
    this.begin(t, true, way, null);
  }

  private begin(t: Touch, opening: boolean, way: Way, size: number | null): void {
    const tracker = new SwipeTracker();
    tracker.start(t.clientX, t.clientY);
    this.drawer.swipe = { id: t.identifier, x: t.clientX, y: t.clientY, opening, decided: false, taken: false, way, size, moved: 0, ended: null, tracker };
  }

  private swipeMove(e: TouchEvent): void {
    const parts = this.drawer;
    const swipe = parts.swipe;
    if (!swipe || swipe.ended) return;
    const t = Array.from(e.changedTouches).find((c) => c.identifier === swipe.id);
    if (!t) return;
    swipe.tracker.move(t.clientX, t.clientY);
    const { axis, inward } = swipe.way;
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
    swipe.moved = along;
    // A panel opened for the swipe follows once it is measured.
    if (swipe.size !== null) this.follow(swipe);
  }

  /** The swipe is the drawer's: it opens (out of sight yet) to follow the finger. */
  private take(swipe: Swipe): boolean {
    mark(this, 'data-dragging', true);
    if (swipe.opening) {
      // Laid out where it would be open, then held out of sight while the finger brings it in.
      this.setShift(swipe.way.inward * -100000, swipe.way);
      if (!this.openBy()) {
        mark(this, 'data-dragging', false);
        return false;
      }
    }
    swipe.taken = true;
    const pushed = this.drawer.pushed;
    if (pushed) mark(pushed, 'data-mx-dragging', true);
    if (swipe.size === null) measure(this, this.readSwipeSize, this.swipeSized);
    return true;
  }

  /** How much of the panel the finger shows. */
  private shownBy(swipe: Swipe, size: number): number {
    return Math.min(size, Math.max(0, swipe.opening ? swipe.moved : size + swipe.moved));
  }

  private follow(swipe: Swipe): void {
    const size = swipe.size ?? 0;
    const shown = this.shownBy(swipe, size);
    this.setShift(-swipe.way.inward * (size - shown), swipe.way);
    if (this.drawer.pushed) this.pushBy(shown, swipe.way);
  }

  private swipeEnd(e: TouchEvent): void {
    const parts = this.drawer;
    const swipe = parts.swipe;
    if (!swipe || swipe.ended || !Array.from(e.changedTouches).some((c) => c.identifier === swipe.id)) return;
    if (!swipe.taken) {
      parts.swipe = null;
      return;
    }
    const end: SwipeEnd = { cancelled: e.type === 'touchcancel', speed: swipe.tracker.velocity(swipe.way.axis) * swipe.way.inward };
    // Lifted before the panel opened for it is measured: it ends once it is.
    if (swipe.size === null) swipe.ended = end;
    else this.finish(swipe, end);
  }

  private finish(swipe: Swipe, end: SwipeEnd): void {
    const parts = this.drawer;
    const size = swipe.size ?? 0;
    parts.swipe = null;
    mark(this, 'data-dragging', false);
    if (parts.pushed) mark(parts.pushed, 'data-mx-dragging', false);
    const flick = this.flickSpeed;
    const open = end.cancelled ? !swipe.opening : end.speed > flick ? true : end.speed < -flick ? false : this.shownBy(swipe, size) > size / 2;
    if (open) {
      this.clearShift();
      if (parts.pushed) this.pushBy(size, swipe.way);
    } else {
      this.close('swipe');
    }
  }
}

/** The viewport of `drawer`'s window as a rect at 0, 0: a read. */
function pageRect(drawer: ComponentBase): Rect {
  const page = pageOf(drawer);
  return { left: 0, top: 0, right: page.width, bottom: page.height, width: page.width, height: page.height };
}
