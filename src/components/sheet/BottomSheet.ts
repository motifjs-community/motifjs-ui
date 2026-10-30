import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { follow } from '../../core/follow';
import { ResizeWatch } from '../../core/resize-watch';
import { uiLocale } from '../../core/ui-locale';
import { cssLength } from '../../parts/overlay/css-length';
import { OverlayPanel } from '../../parts/overlay/OverlayPanel';
import { SwipeTracker } from '../../parts/overlay/swipe-tracker';
import type { BottomSheetDetent } from './bottom-sheet-detent';
import type { BottomSheetProps } from './bottom-sheet-props';
import type { DetentChangedEventArgs } from './detent-changed-event-args';
import type { DetentChangingEventArgs } from './detent-changing-event-args';

const OWN = ['detents', 'detent', 'showHandle', 'draggable', 'dragContent', 'swipeToClose', 'flickSpeed', 'topGap'] as const;

const DEFAULT_DETENTS: readonly BottomSheetDetent[] = ['half', 'full'];

/** How far, in pixels, a finger moves before the sheet decides it is a drag and which way. */
const SLOP = 6;

/** One of the heights, as it measures now. */
interface Stop {
  detent: BottomSheetDetent;
  px: number;
}

/** A drag of the sheet that is going on. */
interface Drag {
  startY: number;
  startSize: number;
  tracker: SwipeTracker;
  /** The pointer or touch it follows. */
  id: number;
  moved: boolean;
}

interface Parts {
  handle: HTMLDivElement;
  grip: HTMLSpanElement;
  /** The height it is at now, in pixels. */
  size: number;
  drag: Drag | null;
  /** A touch on the content that may become a drag. */
  touch: { id: number; x: number; y: number; decided: boolean; take: boolean } | null;
  watch: ResizeWatch | null;
  /** Stops following the on-screen keyboard. */
  stopKeyboard: (() => void) | null;
  stopTexts: (() => void) | null;
  detentChanging: Emitter<DetentChangingEventArgs>;
  detentChanged: Emitter<DetentChangedEventArgs>;
}

const PARTS = Symbol('mx.bottom-sheet');

/**
 * A panel that comes up from the bottom of the page or of a container and stops at a few heights
 * (`detents`: a peek, half, full, as tall as its content, or heights of your own). The finger and the
 * mouse drag it by its handle and its title from height to height, a flick goes on to the next one,
 * and dragging it down past the lowest one closes it; the content takes the sheet along when it
 * cannot scroll that way. The handle is a slider for the keyboard (the arrow keys, Home and End).
 * It is a dialog: modal by default, with Escape, a press on the scrim and the browser's back
 * closing it, focus moved in and back again; it keeps clear of the screen's safe areas.
 *
 * @example
 * <BottomSheet title="Filters" detents={['peek', 'half', 'full']} x-model={() => this.state.filters}>…</BottomSheet>
 *
 * const sheet = new BottomSheet({ title: 'Share', detent: 'fit', content: new ShareList() });
 * sheet.show(this);
 */
export class BottomSheet extends OverlayPanel<BottomSheetProps> {
  static override overlayClass = 'mx-bottom-sheet';

  constructor(props?: IBaseProp<BottomSheetProps>) {
    super(props);
    const own = (this.props ?? {}) as BottomSheetProps;
    const parts = this.sheet;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onDetentChanging) this.onDetentChanging(own.onDetentChanging);
    if (own.onDetentChanged) this.onDetentChanged(own.onDetentChanged);
    this.observeProperty<boolean | undefined>('showHandle', (on) => (parts.handle.hidden = on === false));
    this.observeProperty('detents', () => this.isOpen && this.placePanel());
    this.observeProperty('topGap', () => this.isOpen && this.placePanel());
    parts.stopTexts = follow(this, 'texts', () => uiLocale.strings, () => this.renderHandle());
    this.listenDrag();
    // Whether the content scrolls is known once a change of height has run.
    this.panelElement.addEventListener('transitionend', (e) => e.target === this.panelElement && e.propertyName === 'block-size' && this.updateBodyFocus());
    this.motif.setDisposable(() => {
      parts.stopTexts?.();
      parts.watch?.disconnect();
      parts.detentChanging.dispose();
      parts.detentChanged.dispose();
    });
  }

  // Properties (see BottomSheetProps).

  get detents(): readonly BottomSheetDetent[] {
    const own = this.getProperty<readonly BottomSheetDetent[] | undefined>('detents');
    return own?.length ? own : DEFAULT_DETENTS;
  }
  set detents(value: Bind<readonly BottomSheetDetent[]>) {
    this.assignProperty('detents', value);
  }
  /** The height it is at (or opens at). Reactive. Setting it moves the sheet there. */
  get detent(): BottomSheetDetent {
    return this.getProperty<BottomSheetDetent | undefined>('detent') ?? this.detents[0];
  }
  set detent(value: Bind<BottomSheetDetent>) {
    this.assignProperty('detent', value);
  }
  get showHandle(): boolean {
    return this.getProperty<boolean | undefined>('showHandle') !== false;
  }
  set showHandle(value: Bind<boolean>) {
    this.assignProperty('showHandle', value, Boolean);
  }
  get draggable(): boolean {
    return this.getProperty<boolean | undefined>('draggable') !== false;
  }
  set draggable(value: Bind<boolean>) {
    this.assignProperty('draggable', value, Boolean);
  }
  get dragContent(): boolean {
    return this.getProperty<boolean | undefined>('dragContent') !== false;
  }
  set dragContent(value: Bind<boolean>) {
    this.assignProperty('dragContent', value, Boolean);
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
  get topGap(): number | string | null {
    return this.getProperty<number | string | null | undefined>('topGap') ?? null;
  }
  set topGap(value: Bind<number | string | null>) {
    this.assignProperty('topGap', value);
  }

  /** Its height now, in pixels (0 while closed). */
  get height(): number {
    return this.isOpen ? Math.round(this.sheet.size) : 0;
  }

  get onDetentChanging(): MotifEvent<DetentChangingEventArgs> {
    return this.sheet.detentChanging.event;
  }
  get onDetentChanged(): MotifEvent<DetentChangedEventArgs> {
    return this.sheet.detentChanged.event;
  }

  /** Moves it to one of its heights (opened at it when closed). `false` when an `onDetentChanging` listener said no. */
  snapTo(detent: BottomSheetDetent): boolean {
    if (!this.isOpen) {
      this.detent = detent;
      return this.open();
    }
    return this.changeDetent(detent, false);
  }

  /** To the next taller height; `false` at the tallest. */
  expand(): boolean {
    return this.step(1, false);
  }

  /** To the next lower height; `false` at the lowest. */
  collapse(): boolean {
    return this.step(-1, false);
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    const sheet = (this as unknown as { [PARTS]?: Parts })[PARTS];
    if (name === 'detent' && sheet && this.isOpen && !sheet.drag) this.placePanel();
  }

  protected override placePanel(): void {
    const parts = this.sheet;
    const stops = this.stops();
    const at = stops.find((s) => sameDetent(s.detent, this.peekProperty<BottomSheetDetent>('detent') ?? this.detents[0])) ?? stops[0];
    if (!at) return;
    this.setSize(at.px, 0);
    this.renderHandle();
    this.updateBodyFocus();
    // Over the page it stands on the on-screen keyboard, so a field in it stays in sight.
    const over = this.overElement === this.element.ownerDocument.documentElement;
    const lift = over ? this.keyboard() : 0;
    if (lift) this.element.style.setProperty('--_keyboard', `${lift}px`);
    else this.element.style.removeProperty('--_keyboard');
    if (!parts.watch) {
      parts.watch = new ResizeWatch(() => {
        if (this.isOpen && !parts.drag) this.placePanel();
      });
      parts.watch.observe(this.overElement);
      const visual = this.element.ownerDocument.defaultView?.visualViewport;
      const follow = () => this.isOpen && !parts.drag && this.placePanel();
      visual?.addEventListener('resize', follow);
      parts.stopKeyboard = () => visual?.removeEventListener('resize', follow);
    }
  }

  protected override panelClosed(): void {
    const parts = this.sheet;
    parts.watch?.disconnect();
    parts.watch = null;
    parts.stopKeyboard?.();
    parts.stopKeyboard = null;
    parts.drag = null;
    this.element.removeAttribute('data-dragging');
  }

  private get sheet(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createSheet());
  }

  private createSheet(): Parts {
    const doc = this.element.ownerDocument;
    const handle = doc.createElement('div');
    handle.className = 'mx-bottom-sheet__handle';
    handle.tabIndex = 0;
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    const grip = doc.createElement('span');
    grip.className = 'mx-bottom-sheet__grip';
    grip.setAttribute('aria-hidden', 'true');
    handle.append(grip);
    this.panelElement.prepend(handle);
    return {
      handle,
      grip,
      size: 0,
      drag: null,
      touch: null,
      watch: null,
      stopKeyboard: null,
      stopTexts: null,
      detentChanging: new Emitter(),
      detentChanged: new Emitter(),
    };
  }

  /** The heights as they measure now, the lowest first; none taller than full. */
  private stops(): Stop[] {
    const room = this.room();
    const gap = this.peekProperty<number | string | null>('topGap');
    const full = Math.max(0, room - cssLength(this.overElement, gap === null || gap === undefined || gap === '' ? 'var(--mx-sheet-top-gap)' : gap));
    const out: Stop[] = [];
    for (const detent of this.detents) {
      const px = Math.min(full, Math.max(0, this.measure(detent, room, full)));
      if (!out.some((s) => Math.abs(s.px - px) < 1)) out.push({ detent, px });
    }
    return out.sort((a, b) => a.px - b.px);
  }

  private measure(detent: BottomSheetDetent, room: number, full: number): number {
    if (typeof detent === 'number') return detent;
    if (detent === 'full') return full;
    if (detent === 'half') return room / 2;
    if (detent === 'peek') return cssLength(this.overElement, 'var(--mx-sheet-peek-height)');
    if (detent === 'fit') return this.fitHeight();
    const share = parseFloat(detent);
    return share >= 0 ? (room * share) / 100 : room / 2;
  }

  /** As tall as the content needs, measured with no height of its own. */
  private fitHeight(): number {
    const panel = this.panelElement;
    const before = panel.style.getPropertyValue('--_size');
    panel.style.setProperty('--_size', 'auto');
    const height = panel.getBoundingClientRect().height;
    if (before) panel.style.setProperty('--_size', before);
    else panel.style.removeProperty('--_size');
    return height;
  }

  /** The height of what it opens over. */
  private room(): number {
    const over = this.overElement;
    if (over !== this.element.ownerDocument.documentElement) return over.clientHeight;
    // Over the page: what the on-screen keyboard leaves of it.
    return (over.clientHeight || this.element.ownerDocument.defaultView?.innerHeight || 0) - this.keyboard();
  }

  /** How much of the page the on-screen keyboard covers now, in pixels (0 without one). */
  private keyboard(): number {
    const view = this.element.ownerDocument.defaultView;
    const visual = view?.visualViewport;
    if (!view || !visual) return 0;
    return Math.max(0, Math.round(view.innerHeight - visual.height - visual.offsetTop));
  }

  /** Its height and how far below it is pulled (a drag past its lowest height). */
  private setSize(px: number, drop: number): void {
    const parts = this.sheet;
    parts.size = px;
    const style = this.panelElement.style;
    style.setProperty('--_size', `${Math.round(px)}px`);
    this.element.toggleAttribute('data-full', px >= this.room() - 1);
    if (drop > 0) style.setProperty('--_drop', `${Math.round(drop)}px`);
    else style.removeProperty('--_drop');
  }

  private renderHandle(): void {
    const parts = this.sheet;
    const strings = uiLocale.strings;
    const handle = parts.handle;
    handle.setAttribute('aria-label', strings.sheetHandle);
    const full = this.stops().reduce((m, s) => Math.max(m, s.px), 0);
    const detent = this.peekProperty<BottomSheetDetent>('detent') ?? this.detents[0];
    handle.setAttribute('aria-valuenow', String(full > 0 ? Math.round((parts.size / full) * 100) : 0));
    handle.setAttribute('aria-valuetext', detentText(detent));
    if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) this.panelElement.setAttribute('aria-label', strings.sheetLabel);
  }

  /** Goes `by` heights up (1) or down (-1). */
  private step(by: 1 | -1, byUser: boolean): boolean {
    const stops = this.stops();
    const at = this.nearest(stops, this.sheet.size);
    const next = stops[stops.indexOf(at) + by];
    return !!next && this.changeDetent(next.detent, byUser);
  }

  private nearest(stops: Stop[], px: number): Stop {
    return stops.reduce((a, b) => (Math.abs(b.px - px) < Math.abs(a.px - px) ? b : a));
  }

  /** Moves to `detent`, asking first; it goes back where it was when the change is refused. */
  private changeDetent(detent: BottomSheetDetent, byUser: boolean): boolean {
    const parts = this.sheet;
    const from = this.peekProperty<BottomSheetDetent>('detent') ?? this.detents[0];
    if (sameDetent(from, detent)) {
      this.placePanel();
      return true;
    }
    const e: DetentChangingEventArgs = { from, to: detent, byUser, cancel: false, source: this };
    parts.detentChanging.fire(e);
    if (e.cancel) {
      this.placePanel();
      return false;
    }
    if (byUser) this.changeProperty('detent', e.to);
    else this.setProperty('detent', e.to);
    this.placePanel();
    parts.detentChanged.fire({ from, to: e.to, byUser, source: this });
    return true;
  }

  // The finger and the mouse.

  private listenDrag(): void {
    const parts = this.sheet;
    const panel = this.panelElement;
    const grab = (e: PointerEvent) => {
      const target = e.target as Element;
      if (!this.isOpen || !this.draggable || e.button !== 0 || !target.closest) return;
      if (!target.closest('.mx-bottom-sheet__handle, .mx-bottom-sheet__header') || target.closest('button, a, input')) return;
      e.preventDefault();
      this.startDrag(e.clientY, e.pointerId);
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture?.(e.pointerId);
      const move = (m: PointerEvent) => m.pointerId === e.pointerId && this.moveDrag(m.clientY);
      const up = (u: PointerEvent) => {
        if (u.pointerId !== e.pointerId) return;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        const tapped = !parts.drag?.moved;
        this.endDrag(u.type === 'pointercancel');
        // A tap on the handle goes to the next height, round to the lowest.
        if (tapped && u.type === 'pointerup' && target.closest('.mx-bottom-sheet__handle')) {
          if (!this.step(1, true)) this.changeDetent(this.stops()[0]?.detent ?? this.detent, true);
        }
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    };
    parts.handle.addEventListener('pointerdown', grab);
    this.headerElement.addEventListener('pointerdown', grab);
    parts.handle.addEventListener('keydown', (e) => this.handleKey(e));
    // A phone decides when the finger lands whether the page may scroll: the content holds a
    // touchmove listener from the start, so a drag of the sheet can stop the scroll.
    const body = this.contentElement;
    body.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
    body.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
    body.addEventListener('touchend', (e) => this.touchEnd(e));
    body.addEventListener('touchcancel', (e) => this.touchEnd(e));
    panel.addEventListener('touchmove', (e) => parts.drag && e.cancelable && e.preventDefault(), { passive: false });
  }

  private startDrag(y: number, id: number): void {
    const parts = this.sheet;
    const tracker = new SwipeTracker();
    tracker.start(0, y);
    parts.drag = { startY: y, startSize: parts.size, tracker, id, moved: false };
    this.element.toggleAttribute('data-dragging', true);
  }

  private moveDrag(y: number): void {
    const drag = this.sheet.drag;
    if (!drag) return;
    drag.tracker.move(0, y);
    const dy = drag.startY - y;
    if (Math.abs(dy) > 2) drag.moved = true;
    const stops = this.stops();
    if (!stops.length) return;
    const lowest = stops[0].px;
    const highest = stops[stops.length - 1].px;
    let size = drag.startSize + dy;
    // Past the tallest height it gives a little, and only a little.
    if (size > highest) size = highest + (size - highest) / 4;
    if (size < lowest) {
      const drop = this.swipeToClose ? lowest - size : (lowest - size) / 4;
      this.setSize(lowest, drop);
    } else {
      this.setSize(size, 0);
    }
  }

  private endDrag(canceled: boolean): void {
    const parts = this.sheet;
    const drag = parts.drag;
    if (!drag) return;
    parts.drag = null;
    this.element.removeAttribute('data-dragging');
    if (!drag.moved || canceled) {
      this.placePanel();
      return;
    }
    const stops = this.stops();
    const speed = -drag.tracker.velocity('y');
    const drop = parseFloat(this.panelElement.style.getPropertyValue('--_drop')) || 0;
    const size = parts.size - drop;
    const lowest = stops[0];
    const flick = this.flickSpeed;
    if (this.swipeToClose && (size < lowest.px / 2 || (speed < -flick && size <= lowest.px + 1))) {
      this.close('swipe');
      return;
    }
    let target: Stop;
    if (Math.abs(speed) >= flick) {
      // A flick goes on to the next height that way.
      target = speed > 0 ? (stops.find((s) => s.px > size + 1) ?? stops[stops.length - 1]) : ([...stops].reverse().find((s) => s.px < size - 1) ?? lowest);
    } else {
      target = this.nearest(stops, size);
    }
    this.changeDetent(target.detent, true);
  }

  private touchStart(e: TouchEvent): void {
    const parts = this.sheet;
    if (!this.isOpen || !this.draggable || !this.dragContent || e.touches.length !== 1 || parts.drag) {
      parts.touch = null;
      return;
    }
    const t = e.touches[0];
    parts.touch = { id: t.identifier, x: t.clientX, y: t.clientY, decided: false, take: false };
  }

  private touchMove(e: TouchEvent): void {
    const parts = this.sheet;
    const touch = parts.touch;
    if (!touch) return;
    const t = Array.from(e.changedTouches).find((c) => c.identifier === touch.id);
    if (!t) return;
    if (!touch.decided) {
      const dx = t.clientX - touch.x;
      const dy = t.clientY - touch.y;
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      touch.decided = true;
      if (Math.abs(dy) <= Math.abs(dx)) return;
      const scroller = scrollerAt(e.target as Element, this.contentElement);
      const stops = this.stops();
      const tallest = stops[stops.length - 1]?.px ?? 0;
      // Down from the top of what scrolls, or up while it is not at its tallest: the sheet moves.
      touch.take = dy > 0 ? !scroller || scroller.scrollTop <= 0 : parts.size < tallest - 1;
      if (!touch.take) return;
      this.startDrag(touch.y, touch.id);
    }
    if (!touch.take) return;
    if (e.cancelable) e.preventDefault();
    this.moveDrag(t.clientY);
  }

  private touchEnd(e: TouchEvent): void {
    const parts = this.sheet;
    const touch = parts.touch;
    if (!touch || !Array.from(e.changedTouches).some((c) => c.identifier === touch.id)) return;
    parts.touch = null;
    if (touch.take) this.endDrag(e.type === 'touchcancel');
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.ctrlKey || e.altKey || e.metaKey || !this.isOpen) return;
    const stops = this.stops();
    let done = true;
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'PageUp':
        this.step(1, true);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'PageDown':
        this.step(-1, true);
        break;
      case 'Home':
        if (stops[0]) this.changeDetent(stops[0].detent, true);
        break;
      case 'End':
        if (stops.length) this.changeDetent(stops[stops.length - 1].detent, true);
        break;
      default:
        done = false;
    }
    if (done) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

function sameDetent(a: BottomSheetDetent, b: BottomSheetDetent): boolean {
  return String(a) === String(b);
}

/** What the handle says about a height. */
function detentText(detent: BottomSheetDetent): string {
  const strings = uiLocale.strings;
  if (detent === 'peek') return strings.sheetPeek;
  if (detent === 'half') return strings.sheetHalf;
  if (detent === 'full') return strings.sheetFull;
  if (detent === 'fit') return strings.sheetFit;
  return strings.sheetHeight.replace('{height}', String(detent).endsWith('%') ? String(detent) : `${detent}px`);
}

/** The element under the finger that scrolls up and down, up to the content area. */
function scrollerAt(target: Element | null, content: HTMLElement): HTMLElement | null {
  const view = content.ownerDocument.defaultView;
  for (let el = target; el; el = el.parentElement) {
    const html = el as HTMLElement;
    if (html.scrollHeight > html.clientHeight + 1 && view && /auto|scroll/.test(view.getComputedStyle(html).overflowY)) return html;
    if (el === content) break;
  }
  return null;
}
