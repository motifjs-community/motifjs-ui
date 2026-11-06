import { Component, Emitter, type Event as MotifEvent } from '@motifx/core';
import { deepActiveElement } from '../../core/focus';
import { isNode } from '../../core/node-kind';
import { placePopup } from './place-popup';
import type { PopupCloseReason } from './popup-close-reason';
import type { PopupOpenOptions } from './popup-open-options';
import type { PopupPlacement } from './popup-placement';

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

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

  private anchor: HTMLElement | null = null;
  /** The document it follows its anchor in while it is open. */
  private watched: Document | null = null;
  private toggle: Element | null = null;
  private returnFocus: HTMLElement | null = null;
  private frame = 0;
  private readonly closedEmitter = new Emitter<PopupCloseReason>();

  readonly onClosed: MotifEvent<PopupCloseReason> = this.closedEmitter.event;

  override onConfigured(): void {
    this.class.add('mx-popup');
    this.element.tabIndex = -1;
    if (hasPopover) this.element.popover = 'manual';
    else this.element.hidden = true;
    this.element.addEventListener('keydown', (e) => this.onKeyDown(e));
    this.element.addEventListener('focusout', (e) => this.onFocusOut(e));
    this.element.addEventListener('click', (e) => e.stopPropagation());
    this.motif.setDisposable(() => {
      this.stopFollowing();
      this.closedEmitter.dispose();
    });
  }

  get isOpen(): boolean {
    return this.anchor !== null;
  }

  /** Opens next to `anchor`, or moves there when it is open. */
  open(anchor: HTMLElement, options: PopupOpenOptions = {}): void {
    const opening = !this.anchor;
    this.anchor = anchor;
    this.toggle = options.toggle ?? anchor;
    this.returnFocus = options.returnFocus ?? (this.toggle as HTMLElement);
    const doc = anchor.ownerDocument;
    let show = opening;
    if (this.element.ownerDocument !== doc) {
      // A popup shows in the top layer of the document it is in: it goes to its anchor's.
      this.stopListening();
      if (!opening) this.hideSurface();
      doc.body.append(this.element);
      show = true;
    }
    if (show) {
      if (hasPopover) this.element.showPopover();
      else this.element.hidden = false;
    }
    if (!this.watched) {
      this.watched = doc;
      const view = doc.defaultView;
      doc.addEventListener('pointerdown', this.onPointerDown, true);
      view?.addEventListener('scroll', this.onScroll, true);
      view?.addEventListener('resize', this.schedule);
    }
    this.place();
  }

  close(reason: PopupCloseReason = 'code'): void {
    if (!this.anchor) return;
    const focusInside = this.element.contains(deepActiveElement(this.element));
    const returnFocus = this.returnFocus;
    this.stopFollowing();
    this.hideSurface();
    // Focus that leaves on its own (Tab, a click elsewhere) goes where it was going.
    if (focusInside && reason !== 'focus') returnFocus?.focus();
    this.closedEmitter.fire(reason);
  }

  /** Aligns the popup with its anchor again, such as after its content changes size. */
  place(): void {
    if (!this.anchor) return;
    if (!this.anchor.isConnected) {
      this.close('code');
      return;
    }
    placePopup(this.element, this.anchor, this.placement, this.matchWidth);
  }

  private stopFollowing(): void {
    this.anchor = this.toggle = this.returnFocus = null;
    this.stopListening();
  }

  private hideSurface(): void {
    if (hasPopover && this.element.matches(':popover-open')) this.element.hidePopover();
    else this.element.hidden = true;
  }

  private stopListening(): void {
    const doc = this.watched;
    this.watched = null;
    if (!doc) return;
    const view = doc.defaultView;
    doc.removeEventListener('pointerdown', this.onPointerDown, true);
    view?.cancelAnimationFrame?.(this.frame);
    view?.removeEventListener('scroll', this.onScroll, true);
    view?.removeEventListener('resize', this.schedule);
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
    if (isNode(e.target) && this.element.contains(e.target)) return;
    this.schedule();
  };

  private readonly onPointerDown = (e: PointerEvent) => {
    const target = e.target as Node;
    if (!this.element.contains(target) && !this.toggle?.contains(target)) this.close('outside');
  };

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    // Handled here: a window around the popup must not close too.
    e.preventDefault();
    e.stopPropagation();
    this.close('escape');
  }

  private onFocusOut(e: FocusEvent): void {
    const to = e.relatedTarget as Node | null;
    if (to && !this.element.contains(to) && !this.toggle?.contains(to)) this.close('focus');
  }
}
