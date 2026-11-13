import { Component, ComponentBase, Emitter, type Event as MotifEvent } from '@motifx/core';
import { Control } from '../../core/control';
import { focusGoesInto, focusOn, holdsFocus } from '../../core/focus';
import type { FocusMark } from '../../core/focus-mark';
import { isInPage, sameWindow } from '../../core/measure';
import { windowOf } from '../../core/page-documents';
import { placeOnPage } from '../../core/page-layer';
import { onDocument, onWindow } from '../../core/window-events';
import { callNow, kept, put } from '../../core/part-writes';
import { placeBeside } from './place-popup';
import type { PopupCloseReason } from './popup-close-reason';
import type { PopupOpenOptions } from './popup-open-options';
import type { PopupPlacement } from './popup-placement';

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** The popups that are open now, in every document. */
const openPopups = new Set<Popup>();

/** Gives focus back: a control takes it where it decides, a part on itself, a remembered place where it was. */
function giveFocusTo(back: ComponentBase | FocusMark): void {
  if (back instanceof Control) back.focus();
  else if (back instanceof ComponentBase) focusOn(back);
  else back.restore();
}

/**
 * A surface shown next to an anchor, above everything else (the browser's top layer): a menu, a
 * drop-down list or a picker. It follows the anchor while the page scrolls or resizes, opens on the
 * other side when there is no room, and closes on Escape, on a click outside it and its toggle,
 * and when focus leaves both. Focus inside returns to the toggle when it closes. Its content is
 * whatever is added to its `controls`, and clicks inside do not reach the component that hosts it.
 * Opened next to an anchor in another document (a window the app opened), it moves there.
 */
export class Popup extends Component<HTMLDivElement> {
  static override elementTag = 'div';

  placement: PopupPlacement = 'bottom-start';
  /** Makes the popup at least as wide as the anchor. */
  matchWidth = true;

  private anchor: ComponentBase | null = null;
  /** The document it follows its anchor in while it is open. */
  private watched: Document | null = null;
  /** Stops listening to the page while it is open. */
  private stopPage: (() => void)[] = [];
  private toggle: ComponentBase | null = null;
  private returnFocus: ComponentBase | FocusMark | null = null;
  /** Where it belongs while it shows in another document's layer: it goes back there when it closes. */
  private home: ComponentBase | null = null;
  /** It is in the browser's top layer (`showPopover`). */
  private inTopLayer = false;
  private frame = 0;
  private readonly closedEmitter = new Emitter<PopupCloseReason>();

  readonly onClosed: MotifEvent<PopupCloseReason> = this.closedEmitter.event;

  /** Whether an event came from inside a popup that is open now, whoever opened it. */
  static isEventFromAnyOpen(e: Event): boolean {
    for (const popup of openPopups) if (popup.motif.isEventFrom(e)) return true;
    return false;
  }

  override onConfigured(): void {
    this.class.add('mx-popup');
    put(this, 'tabindex', '-1');
    if (hasPopover) this.attr.add({ popover: 'manual' });
    else kept(this, false);
    this.motif.on('keydown', (_, e) => this.onKeyDown(e));
    this.motif.on('focusout', (_, e) => this.onFocusOut(e));
    this.motif.on('click', (_, e) => e.stopPropagation());
    this.motif.setDisposable(() => {
      this.stopFollowing();
      this.closedEmitter.dispose();
    });
  }

  get isOpen(): boolean {
    return this.anchor !== null;
  }

  /** Opens next to `anchor`, or moves there when it is open. */
  open(anchor: ComponentBase, options: PopupOpenOptions = {}): void {
    const opening = !this.anchor;
    this.anchor = anchor;
    this.toggle = options.toggle ?? anchor;
    this.returnFocus = options.returnFocus ?? this.toggle;
    const view = windowOf(anchor);
    const doc = view?.document ?? document;
    let show = opening;
    if (windowOf(this) !== view) {
      // A popup shows in the top layer of the document it is in: it goes to its anchor's.
      this.stopListening();
      if (!opening) this.hideSurface();
      if (!this.home && this.parent) this.home = this.parent;
      const home = this.home;
      const homeThere = home && !home.isDisposed && sameWindow(home, anchor);
      if (homeThere) this.goHome();
      else placeOnPage(doc, this);
      show = true;
    }
    if (show) this.showSurface();
    openPopups.add(this);
    if (!this.watched) {
      this.watched = doc;
      // A press outside, and the page scrolling or changing size, while it is open.
      this.stopPage = [
        onDocument(doc, 'pointerdown', this.onPointerDown, true),
        onWindow(doc, 'scroll', this.onScroll, true),
        onWindow(doc, 'resize', this.schedule),
      ];
    }
    this.place();
  }

  close(reason: PopupCloseReason = 'code'): void {
    if (!this.anchor) return;
    const focusInside = holdsFocus(this);
    const back = this.returnFocus;
    this.stopFollowing();
    this.hideSurface();
    this.goHome();
    // Focus that leaves on its own (Tab, a click elsewhere) goes where it was going.
    if (focusInside && reason !== 'focus' && back) giveFocusTo(back);
    this.closedEmitter.fire(reason);
  }

  /** Aligns the popup with its anchor again, such as after its content changes size. */
  place(): void {
    if (!this.anchor) return;
    if (!isInPage(this.anchor)) {
      this.close('code');
      return;
    }
    placeBeside(this, this.anchor, this.placement, this.matchWidth);
  }

  private stopFollowing(): void {
    this.anchor = this.toggle = this.returnFocus = null;
    openPopups.delete(this);
    this.stopListening();
  }

  /**
   * Into the browser's top layer, or shown where popovers are missing. The browser's own call, made at once: it is
   * placed and measured right after.
   */
  private showSurface(): void {
    if (!hasPopover) {
      kept(this, true);
      return;
    }
    callNow(this, 'showPopover');
    this.inTopLayer = true;
  }

  private hideSurface(): void {
    if (!hasPopover) kept(this, false);
    else if (this.inTopLayer) {
      this.inTopLayer = false;
      callNow(this, 'hidePopover');
    }
  }

  /** Back to its owner from another document's layer. */
  private goHome(): void {
    const home = this.home;
    this.home = null;
    if (home && !home.isDisposed && this.parent !== home) home.controls.add(this);
  }

  private stopListening(): void {
    const doc = this.watched;
    this.watched = null;
    if (!doc) return;
    for (const stop of this.stopPage.splice(0)) stop();
    doc.defaultView?.cancelAnimationFrame?.(this.frame);
  }

  private readonly schedule = () => {
    const view = this.watched?.defaultView;
    if (typeof view?.requestAnimationFrame !== 'function') {
      this.place();
      return;
    }
    view.cancelAnimationFrame(this.frame);
    this.frame = view.requestAnimationFrame(() => this.place());
  };

  // Its own content scrolling moves nothing; placing it again would take that scroll back to the top.
  private readonly onScroll = (e: Event) => {
    if (this.motif.isEventFrom(e)) return;
    this.schedule();
  };

  private readonly onPointerDown = (e: PointerEvent) => {
    if (!this.motif.isEventFrom(e) && !this.toggle?.motif.isEventFrom(e)) this.close('outside');
  };

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    // Handled here: a window around the popup must not close too.
    e.preventDefault();
    e.stopPropagation();
    this.close('escape');
  }

  // Focus that goes to an element outside it and its toggle closes it; focus that goes nowhere keeps it open.
  private onFocusOut(e: FocusEvent): void {
    if (e.relatedTarget && !focusGoesInto(this, e) && !(this.toggle && focusGoesInto(this.toggle, e))) this.close('focus');
  }
}
