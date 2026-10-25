import { Component, Emitter, type Event as MotifEvent } from '@motifx/core';
import { deepActiveElement } from '../../core/focus';
import { placePopup } from './place-popup';
import type { PopupCloseReason } from './popup-close-reason';
import type { PopupOpenOptions } from './popup-open-options';
import type { PopupPlacement } from './popup-placement';

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/**
 * A surface shown next to an anchor, above everything else (the browser's top layer): a menu, a
 * drop-down list, a picker. It follows the anchor while the page scrolls or resizes, opens on the
 * other side when there is no room, and closes on Escape, on a press outside it and its toggle,
 * and when focus leaves both. Focus inside goes back to the toggle when it closes. Its content is
 * whatever is added to its `controls`; presses inside do not reach the component that hosts it.
 */
export class Popup extends Component<HTMLDivElement> {
  static override elementTag = 'div';

  placement: PopupPlacement = 'bottom-start';
  /** At least as wide as the anchor. */
  matchWidth = true;

  private anchor: HTMLElement | null = null;
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
    if (opening) {
      if (hasPopover) this.element.showPopover();
      else this.element.hidden = false;
      document.addEventListener('pointerdown', this.onPointerDown, true);
      window.addEventListener('scroll', this.schedule, true);
      window.addEventListener('resize', this.schedule);
    }
    this.place();
  }

  close(reason: PopupCloseReason = 'code'): void {
    if (!this.anchor) return;
    const focusInside = this.element.contains(deepActiveElement());
    const returnFocus = this.returnFocus;
    this.stopFollowing();
    if (hasPopover && this.element.matches(':popover-open')) this.element.hidePopover();
    else this.element.hidden = true;
    // Focus that leaves on its own (Tab, a click elsewhere) goes where it was going.
    if (focusInside && reason !== 'focus') returnFocus?.focus();
    this.closedEmitter.fire(reason);
  }

  /** Lines the popup up with its anchor again, e.g. after its content changed size. */
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
    cancelAnimationFrame(this.frame);
    document.removeEventListener('pointerdown', this.onPointerDown, true);
    window.removeEventListener('scroll', this.schedule, true);
    window.removeEventListener('resize', this.schedule);
  }

  private readonly schedule = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.place());
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
