import { Emitter, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { part, partBefore } from '../../core/draw-parts';
import { boxOf, lengthOf, measure, onLayout, pageOf, probeLengths, readAgain, rectOf, scrollerUnder, viewportOf } from '../../core/measure';
import { css, mark, put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { OverlayPanel } from '../../parts/overlay/OverlayPanel';
import { SwipeTracker } from '../../parts/overlay/swipe-tracker';
import type { BottomSheetDetent } from './bottom-sheet-detent';
import type { BottomSheetProps } from './bottom-sheet-props';
import type { DetentChangedEventArgs } from './detent-changed-event-args';
import type { DetentChangingEventArgs } from './detent-changing-event-args';
import { onLanguage } from '../../core/on-language';

const OWN = ['detents', 'detent', 'showHandle', 'draggable', 'dragContent', 'swipeToClose', 'flickSpeed', 'topGap'] as const;

const DEFAULT_DETENTS: readonly BottomSheetDetent[] = ['half', 'full'];

/** How far, in pixels, a finger moves before the sheet decides it is a drag and which way. */
const SLOP = 6;

const TOP_GAP = '--mx-sheet-top-gap';
const PEEK = '--mx-sheet-peek-height';

/** One of the heights, as it measures now. */
interface Stop {
  detent: BottomSheetDetent;
  px: number;
}

/** What the heights are made of, as it measures now. */
interface Room {
  /** The height of what it opens over, less the on-screen keyboard over the page. */
  height: number;
  /** How much of the page the on-screen keyboard covers; 0 over a container. */
  keyboard: number;
  gap: number;
  peek: number;
}

/** A drag of the sheet that is going on. */
interface Drag {
  startY: number;
  startSize: number;
  tracker: SwipeTracker;
  /** The pointer or touch it follows. */
  id: number;
  moved: boolean;
  /** The heights and the room as they measured when it began. */
  stops: Stop[];
  room: number;
}

interface Parts {
  handlePart: Component<HTMLDivElement>;
  grip: Component<HTMLSpanElement>;
  /** The height it is at now, in pixels. */
  size: number;
  /** The height as written on the panel, `''` until it is first placed: measuring the content puts it back. */
  sizeValue: string;
  /** How far it is pulled below its lowest height now, in whole pixels. */
  drop: number;
  drag: Drag | null;
  /** A touch on the content that may become a drag. */
  touch: { id: number; x: number; y: number; decided: boolean; take: boolean } | null;
  /** The heights as last placed, the lowest first. */
  stops: Stop[];
  /** The height of its content as last measured, for a `fit` height. */
  fit: number;
  readRoom: () => Room;
  place: (room: Room) => void;
  /** Stops following the on-screen keyboard. */
  stopKeyboard: (() => void) | null;
  stopTexts: (() => void) | null;
  detentChanging: Emitter<DetentChangingEventArgs>;
  detentChanged: Emitter<DetentChangedEventArgs>;
}

const PARTS = Symbol('mx.bottom-sheet');

/**
 * A panel that slides up from the bottom of the page or of a container and stops at a few heights
 * (`detents`: a peek, half, full, the height of its content, or custom heights). A finger or the
 * mouse drags it by its handle and title from height to height, a flick moves to the next height,
 * and dragging it below the lowest height closes it. The content drags the sheet when it cannot
 * scroll in that direction. The handle is a slider for the keyboard (the arrow keys, Home and End).
 * It is a dialog: modal by default, closed by Escape, a click on the scrim and the browser's back
 * action, with focus moved in and returned. It stays clear of the screen's safe areas.
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
    this.observeProperty<boolean | undefined>('showHandle', (on) => mark(parts.handlePart, 'hidden', on === false));
    this.observeProperty('detents', () => this.isOpen && this.placePanel());
    this.observeProperty('topGap', () => {
      this.probeGap();
      if (this.isOpen) this.placePanel();
    });
    this.probeGap();
    parts.stopTexts = onLanguage(this, () => this.renderHandle());
    this.listenDrag();
    // It covers what it opens over: a change of its size, or of the look its lengths come from, places it again.
    const follow = () => this.isOpen && !parts.drag && this.placePanel();
    onLayout(this, 'size', follow);
    onLayout(this, 'look', follow);
    // Whether the content scrolls is known once a change of height has run.
    this.panelPart.motif.on('transitionend:self', (_, e: TransitionEvent | undefined) => e?.propertyName === 'block-size' && this.updateBodyFocus());
    this.motif.setDisposable(() => {
      parts.stopTexts?.();
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
  /** The current height, or the height it opens at. Reactive. Setting it moves the sheet there. */
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

  /** The current height in pixels, or 0 while closed. */
  get height(): number {
    return this.isOpen ? Math.round(this.sheet.size) : 0;
  }

  get onDetentChanging(): MotifEvent<DetentChangingEventArgs> {
    return this.sheet.detentChanging.event;
  }
  get onDetentChanged(): MotifEvent<DetentChangedEventArgs> {
    return this.sheet.detentChanged.event;
  }

  /** Moves it to a height, and opens it there if closed. Returns `false` if an `onDetentChanging` listener canceled it. */
  snapTo(detent: BottomSheetDetent): boolean {
    if (!this.isOpen) {
      this.detent = detent;
      return this.open();
    }
    return this.changeDetent(detent, false);
  }

  /** Moves to the next taller height. Returns `false` at the tallest. */
  expand(): boolean {
    return this.step(1, false);
  }

  /** Moves to the next shorter height. Returns `false` at the lowest. */
  collapse(): boolean {
    return this.step(-1, false);
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    const sheet = (this as unknown as { [PARTS]?: Parts })[PARTS];
    if (name === 'detent' && sheet && this.isOpen && !sheet.drag) this.placePanel();
  }

  /** Measures what it opens over with the next frame of its window and places the panel at its height then. */
  protected override placePanel(): void {
    const parts = this.sheet;
    measure(this, parts.readRoom, parts.place);
    if (!parts.stopKeyboard) {
      parts.stopKeyboard = onLayout(this, 'viewport', () => this.isOpen && !parts.drag && this.placePanel());
    }
  }

  private place(room: Room): void {
    const parts = this.sheet;
    if (!this.isOpen || parts.drag) return;
    if (this.detents.includes('fit')) parts.fit = this.fitHeight();
    const stops = this.stopsIn(room);
    const at = stops.find((s) => sameDetent(s.detent, this.peekProperty<BottomSheetDetent>('detent') ?? this.detents[0])) ?? stops[0];
    if (!at) return;
    parts.stops = stops;
    this.setSize(at.px, 0, room.height);
    this.renderHandle();
    this.updateBodyFocus();
    // Over the page it stands on the on-screen keyboard, so a field in it stays in sight.
    css(this, '--_keyboard', room.keyboard ? `${room.keyboard}px` : '');
  }

  protected override panelClosed(): void {
    const parts = this.sheet;
    parts.stopKeyboard?.();
    parts.stopKeyboard = null;
    parts.drag = null;
    mark(this, 'data-dragging', false);
  }

  private get sheet(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createSheet());
  }

  private createSheet(): Parts {
    // First in the panel, above its header.
    const panel = this.panelPart;
    const handlePart = partBefore<HTMLDivElement>(panel, panel.controls.items[0] ?? null, 'div', 'mx-bottom-sheet__handle');
    put(handlePart, 'tabindex', '0');
    handlePart.attr.add({ role: 'slider', 'aria-orientation': 'vertical', 'aria-valuemin': '0', 'aria-valuemax': '100' });
    const grip = part<HTMLSpanElement>(handlePart, 'span', 'mx-bottom-sheet__grip');
    grip.attr.add({ 'aria-hidden': 'true' });
    return {
      handlePart,
      grip,
      size: 0,
      sizeValue: '',
      drop: 0,
      drag: null,
      touch: null,
      stops: [],
      fit: 0,
      readRoom: () => this.readRoom(),
      place: (room) => this.place(room),
      stopKeyboard: null,
      stopTexts: null,
      detentChanging: new Emitter(),
      detentChanged: new Emitter(),
    };
  }

  /** The heights as they measure now, read at the start of a key or a gesture; a `fit` height as last placed. */
  private stops(): Stop[] {
    return this.stopsIn(this.readRoom());
  }

  /** The heights in `room`, the lowest first; none taller than full. */
  private stopsIn(room: Room): Stop[] {
    const full = Math.max(0, room.height - room.gap);
    const out: Stop[] = [];
    for (const detent of this.detents) {
      const px = Math.min(full, Math.max(0, this.heightOf(detent, room, full)));
      if (!out.some((s) => Math.abs(s.px - px) < 1)) out.push({ detent, px });
    }
    return out.sort((a, b) => a.px - b.px);
  }

  private heightOf(detent: BottomSheetDetent, room: Room, full: number): number {
    if (typeof detent === 'number') return detent;
    if (detent === 'full') return full;
    if (detent === 'half') return room.height / 2;
    if (detent === 'peek') return room.peek;
    if (detent === 'fit') return this.sheet.fit;
    const share = parseFloat(detent);
    return share >= 0 ? (room.height * share) / 100 : room.height / 2;
  }

  /** As tall as the content needs, measured with no height of its own: a fit, in the write of a placement. */
  private fitHeight(): number {
    css(this.panelPart, '--_size', 'auto');
    const height = readAgain(() => rectOf(this.panelPart).height);
    css(this.panelPart, '--_size', this.sheet.sizeValue);
    return height;
  }

  /** What it opens over and the lengths its heights read there. */
  private readRoom(): Room {
    const over = this.overPage ? null : this.containerPart;
    const keyboard = over ? 0 : this.keyboard();
    // Over the page: what the on-screen keyboard leaves of it.
    const height = over ? boxOf(over).clientHeight : pageOf(this).height - keyboard;
    const gap = this.peekProperty<number | string | null>('topGap');
    return {
      height,
      keyboard,
      gap: typeof gap === 'number' ? gap : lengthOf(this, gap || TOP_GAP, 0, 'block'),
      peek: lengthOf(this, PEEK, 0, 'block'),
    };
  }

  /** Makes the probes of the lengths its heights read, the top gap given now included. */
  private probeGap(): void {
    const gap = this.peekProperty<number | string | null>('topGap');
    probeLengths(this, typeof gap === 'string' && gap ? [TOP_GAP, PEEK, gap] : [TOP_GAP, PEEK], 'block');
  }

  /** How much of the page the on-screen keyboard covers now, in pixels (0 without one). */
  private keyboard(): number {
    const seen = viewportOf(this);
    return Math.max(0, Math.round(seen.windowHeight - seen.bottom));
  }

  /** Its height and how far below it is pulled (a drag past its lowest height). */
  private setSize(px: number, drop: number, room: number): void {
    const parts = this.sheet;
    parts.size = px;
    parts.sizeValue = `${Math.round(px)}px`;
    parts.drop = drop > 0 ? Math.round(drop) : 0;
    css(this.panelPart, '--_size', parts.sizeValue);
    mark(this, 'data-full', px >= room - 1);
    css(this.panelPart, '--_drop', drop > 0 ? `${parts.drop}px` : '');
  }

  private renderHandle(): void {
    const parts = this.sheet;
    const strings = uiLocale.strings;
    const handle = parts.handlePart;
    put(handle, 'aria-label', strings.sheetHandle);
    const full = parts.stops.reduce((m, s) => Math.max(m, s.px), 0);
    const detent = this.peekProperty<BottomSheetDetent>('detent') ?? this.detents[0];
    put(handle, 'aria-valuenow', String(full > 0 ? Math.round((parts.size / full) * 100) : 0));
    put(handle, 'aria-valuetext', detentText(detent));
    if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) put(this.panelPart, 'aria-label', strings.sheetLabel);
  }

  /** Goes `by` heights up (1) or down (-1) from the height it is at, also when that is not placed yet. */
  private step(by: 1 | -1, byUser: boolean, stops = this.stops()): boolean {
    const detent = this.peekProperty<BottomSheetDetent>('detent') ?? this.detents[0];
    const at = stops.find((s) => sameDetent(s.detent, detent)) ?? this.nearest(stops, this.sheet.size);
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
    // Pressed on the handle or the header: the pointer is followed on that part until it is let go. A press on a
    // button, a link or a field there is theirs.
    const grab = (on: ComponentBase, e: PointerEvent) => {
      if (!this.isOpen || !this.draggable || e.button !== 0) return;
      if (on.$('button, a, input').fromComponent().some((c) => c.motif.isEventFrom(e))) return;
      e.preventDefault();
      this.startDrag(e.clientY, e.pointerId, this.readRoom());
      on.attr.add({ setPointerCapture: e.pointerId });
      const move = (_: ComponentBase, m: PointerEvent) => m.pointerId === e.pointerId && this.moveDrag(m.clientY);
      const up = (_: ComponentBase, u: PointerEvent) => {
        if (u.pointerId !== e.pointerId) return;
        void on.motif.off('pointermove', move);
        void on.motif.off('pointerup', up);
        void on.motif.off('pointercancel', up);
        const tapped = !parts.drag?.moved;
        const stops = parts.drag?.stops ?? [];
        this.endDrag(u.type === 'pointercancel');
        // A tap on the handle goes to the next height, round to the lowest.
        if (tapped && u.type === 'pointerup' && on === parts.handlePart && stops.length) {
          if (!this.step(1, true, stops)) this.changeDetent(stops[0].detent, true);
        }
      };
      void on.motif.on('pointermove', move);
      void on.motif.on('pointerup', up);
      void on.motif.on('pointercancel', up);
    };
    parts.handlePart.motif.on('pointerdown', grab);
    this.headerPart.motif.on('pointerdown', grab);
    parts.handlePart.motif.on('keydown', (_, e) => this.handleKey(e));
    // A phone decides when the finger lands whether the page may scroll: the content holds a
    // touchmove listener from the start, so a drag of the sheet can stop the scroll.
    const body = this.contentPart;
    body.motif.on('touchstart:passive', (_, e: TouchEvent | undefined) => e && this.touchStart(e));
    body.motif.on('touchmove', (_, e: TouchEvent | undefined) => e && this.touchMove(e));
    body.motif.on('touchend', (_, e: TouchEvent | undefined) => e && this.touchEnd(e));
    body.motif.on('touchcancel', (_, e: TouchEvent | undefined) => e && this.touchEnd(e));
    this.panelPart.motif.on('touchmove', (_, e: TouchEvent | undefined) => parts.drag && e?.cancelable && e.preventDefault());
  }

  /** Begins a drag in `room`, read when it was pressed: the moves only write. */
  private startDrag(y: number, id: number, room: Room): void {
    const parts = this.sheet;
    const tracker = new SwipeTracker();
    tracker.start(0, y);
    parts.drag = { startY: y, startSize: parts.size, tracker, id, moved: false, stops: this.stopsIn(room), room: room.height };
    mark(this, 'data-dragging', true);
  }

  private moveDrag(y: number): void {
    const drag = this.sheet.drag;
    if (!drag) return;
    drag.tracker.move(0, y);
    const dy = drag.startY - y;
    if (Math.abs(dy) > 2) drag.moved = true;
    const stops = drag.stops;
    if (!stops.length) return;
    const lowest = stops[0].px;
    const highest = stops[stops.length - 1].px;
    let size = drag.startSize + dy;
    // Past the tallest height it gives a little, and only a little.
    if (size > highest) size = highest + (size - highest) / 4;
    if (size < lowest) {
      const drop = this.swipeToClose ? lowest - size : (lowest - size) / 4;
      this.setSize(lowest, drop, drag.room);
    } else {
      this.setSize(size, 0, drag.room);
    }
  }

  private endDrag(canceled: boolean): void {
    const parts = this.sheet;
    const drag = parts.drag;
    if (!drag) return;
    parts.drag = null;
    mark(this, 'data-dragging', false);
    if (!drag.moved || canceled) {
      this.placePanel();
      return;
    }
    const stops = drag.stops;
    const speed = -drag.tracker.velocity('y');
    const size = parts.size - parts.drop;
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
      const scroller = scrollerUnder(e, this.contentPart, 'y');
      const room = this.readRoom();
      const stops = this.stopsIn(room);
      const tallest = stops[stops.length - 1]?.px ?? 0;
      // Down from the top of what scrolls, or up while it is not at its tallest: the sheet moves.
      touch.take = dy > 0 ? !scroller || boxOf(scroller).scrollTop <= 0 : parts.size < tallest - 1;
      if (!touch.take) return;
      this.startDrag(touch.y, touch.id, room);
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
        this.step(1, true, stops);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'PageDown':
        this.step(-1, true, stops);
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
