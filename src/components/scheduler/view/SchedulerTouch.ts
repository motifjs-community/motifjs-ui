import { SwipeTracker } from '../../../parts/overlay/swipe-tracker';
import type { TouchHost } from './touch-host';

/** How far, in pixels, a finger moves before the gesture is decided. */
const SLOP = 10;
/** The most a swipe has to go to move on (a quarter of the view when that is less), and a flick's speed in pixels per millisecond. */
const SWIPE = 96;
const FLICK = 0.4;
/** A click this soon after a swipe is the end of the swipe. */
const AFTER_SWIPE = 400;

interface Swipe {
  id: number;
  x: number;
  y: number;
  width: number;
  decided: boolean;
  taken: boolean;
  tracker: SwipeTracker;
}

interface Pinch {
  axis: 'x' | 'y';
  distance: number;
  from: number;
  asked: boolean;
  refused: boolean;
}

/**
 * The scheduler's finger gestures, on its own element with every listener there before a finger
 * lands (only then can a gesture keep the page still): a swipe sideways over the view goes to the
 * next or the previous days (a box that can still scroll that way scrolls first), two fingers zoom
 * the time scale (the hours of the day views, the cells of a timeline), and a drag of an
 * appointment keeps the page from scrolling. It also marks the scheduler while a finger is in use,
 * so nothing it touched stays looking hovered, and keeps a long press from opening the page's menu.
 */
export class SchedulerTouch {
  private swipe: Swipe | null = null;
  private pinch: Pinch | null = null;
  private swipedAt = 0;
  private finger = false;

  constructor(private readonly host: TouchHost) {}

  /** Whether a click now is the end of a swipe. */
  get justSwiped(): boolean {
    return Date.now() - this.swipedAt < AFTER_SWIPE;
  }

  /** Listens on the scheduler's element; the function returned stops. */
  attach(): () => void {
    const root = this.host.root();
    const on: [string, EventListener, AddEventListenerOptions][] = [
      ['pointerdown', this.onPointer as EventListener, { capture: true }],
      ['pointermove', this.onPointer as EventListener, { passive: true }],
      ['touchstart', this.onStart as EventListener, { passive: true }],
      ['touchmove', this.onMove as EventListener, { passive: false }],
      ['touchend', this.onEnd as EventListener, {}],
      ['touchcancel', this.onEnd as EventListener, {}],
      ['contextmenu', this.onMenu as EventListener, {}],
    ];
    for (const [name, listener, options] of on) root.addEventListener(name, listener, options);
    return () => {
      for (const [name, listener, options] of on) root.removeEventListener(name, listener, options);
    };
  }

  private onPointer = (e: PointerEvent) => {
    const finger = e.pointerType === 'touch';
    if (e.type === 'pointermove' && (finger || e.pointerType !== 'mouse')) return;
    if (finger === this.finger) return;
    this.finger = finger;
    this.host.root().toggleAttribute('data-touch', finger);
  };

  private onMenu = (e: Event) => {
    if (this.finger && this.inContent(e.target)) e.preventDefault();
  };

  private onStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      this.stopSwipe(false);
      this.startPinch(e);
      return;
    }
    if (e.touches.length !== 1 || !this.host.swipeNavigation() || this.host.dragging()) return;
    const content = this.inContent(e.target);
    if (!content) return;
    const t = e.touches[0];
    const tracker = new SwipeTracker();
    tracker.start(t.clientX, t.clientY);
    this.swipe = { id: t.identifier, x: t.clientX, y: t.clientY, width: content.clientWidth, decided: false, taken: false, tracker };
  };

  private onMove = (e: TouchEvent) => {
    if (this.host.dragging()) {
      e.preventDefault();
      return;
    }
    if (this.pinch) {
      this.movePinch(e);
      return;
    }
    const swipe = this.swipe;
    const t = swipe && Array.from(e.changedTouches).find((c) => c.identifier === swipe.id);
    if (!swipe || !t) return;
    swipe.tracker.move(t.clientX, t.clientY);
    const dx = t.clientX - swipe.x;
    const dy = t.clientY - swipe.y;
    if (!swipe.decided) {
      if (Math.hypot(dx, dy) < SLOP) return;
      swipe.decided = true;
      // Sideways, and only where the view cannot scroll that way itself.
      swipe.taken = Math.abs(dx) > Math.abs(dy) * 1.5 && !this.canScroll(this.towardNext(dx));
      if (!swipe.taken) {
        this.swipe = null;
        return;
      }
    }
    e.preventDefault();
    this.host.swiping(dx / 2, this.towardNext(dx), Math.abs(dx) >= this.reach(swipe));
  };

  private onEnd = (e: TouchEvent) => {
    if (this.pinch && e.touches.length < 2) this.stopPinch();
    const swipe = this.swipe;
    const t = swipe && Array.from(e.changedTouches).find((c) => c.identifier === swipe.id);
    if (!swipe || !t) return;
    const dx = t.clientX - swipe.x;
    const speed = swipe.tracker.velocity('x');
    const go = e.type === 'touchend' && (Math.abs(dx) >= this.reach(swipe) || (Math.abs(speed) > FLICK && Math.abs(dx) > SLOP * 2 && Math.sign(speed) === Math.sign(dx)));
    this.stopSwipe(go ? this.towardNext(dx) : null);
  };

  /** Ends a swipe: `next` moves on that way (`true` the next days, `false` the previous ones); `null` goes back. */
  private stopSwipe(next: boolean | null): void {
    const swipe = this.swipe;
    this.swipe = null;
    if (!swipe?.taken) return;
    this.swipedAt = Date.now();
    this.host.swiping(null, true, false);
    if (next !== null) this.host.step(next ? 1 : -1);
  }

  /** A finger moving toward the start (left, or right in a right-to-left page) brings the next days. */
  private towardNext(dx: number): boolean {
    return this.host.rtl() ? dx > 0 : dx < 0;
  }

  private reach(swipe: Swipe): number {
    return Math.min(SWIPE, swipe.width / 4);
  }

  /** Whether the view's scroll box can still scroll toward the next days (or the previous ones). */
  private canScroll(next: boolean): boolean {
    const scroller = this.host.scroller();
    if (!scroller) return false;
    const room = scroller.scrollWidth - scroller.clientWidth;
    if (room <= 1) return false;
    const at = Math.abs(scroller.scrollLeft);
    return next ? at < room - 1 : at > 1;
  }

  private startPinch(e: TouchEvent): void {
    const kind = this.host.kind();
    const scroller = this.host.scroller();
    if (!this.host.pinchZoom() || (kind !== 'time' && kind !== 'timeline') || !scroller) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    if (!scroller.contains(a.target as Node) || !scroller.contains(b.target as Node)) return;
    const axis = kind === 'time' ? 'y' : 'x';
    this.pinch = { axis, distance: spread(a, b, axis), from: this.host.zoom(), asked: false, refused: false };
  }

  private movePinch(e: TouchEvent): void {
    const pinch = this.pinch!;
    if (pinch.refused || e.touches.length < 2) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    const to = pinch.from * (spread(a, b, pinch.axis) / pinch.distance);
    if (!pinch.asked) {
      pinch.asked = true;
      if (!this.host.zoomChanging(pinch.from, to)) {
        pinch.refused = true;
        return;
      }
    }
    e.preventDefault();
    const scroller = this.host.scroller();
    if (pinch.axis === 'x' || !scroller) {
      // A timeline keeps the time at its start where it is.
      this.host.setZoom(to);
      return;
    }
    // The time between the fingers stays between them.
    const box = scroller.getBoundingClientRect();
    const mid = (a.clientY + b.clientY) / 2 - box.top;
    const share = (scroller.scrollTop + mid) / Math.max(1, scroller.scrollHeight);
    this.host.setZoom(to);
    queueMicrotask(() => (scroller.scrollTop = share * scroller.scrollHeight - mid));
  }

  private stopPinch(): void {
    const pinch = this.pinch;
    this.pinch = null;
    if (!pinch?.asked || pinch.refused) return;
    const to = this.host.zoom();
    if (to !== pinch.from) this.host.zoomChanged(pinch.from, to);
  }

  /** The view a touch began in, `null` outside it (the bar, a sheet). */
  private inContent(target: EventTarget | null): HTMLElement | null {
    const root = this.host.root();
    const content = target instanceof Element ? target.closest<HTMLElement>('.mx-scheduler__content') : null;
    return content && root.contains(content) && content.closest('.mx-scheduler') === root ? content : null;
  }
}

/** How far apart two fingers are along an axis (never so close that a little move zooms a lot). */
function spread(a: Touch, b: Touch, axis: 'x' | 'y'): number {
  return Math.max(24, Math.abs(axis === 'x' ? a.clientX - b.clientX : a.clientY - b.clientY));
}
