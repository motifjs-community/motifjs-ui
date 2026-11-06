import { Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { homeOf } from '../../core/flow-home';
import { focusableIn, isFocusable } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { isElement } from '../../core/node-kind';
import { placePopup } from '../../parts/popup/place-popup';
import type { PopupPlacement } from '../../parts/popup/popup-placement';
import { hideTooltip, isTooltipShown, linkTooltip, showTooltip, tooltipTiming, unlinkTooltip } from './tooltip-hub';
import type { TooltipProps } from './tooltip-props';
import type { TooltipShowOn } from './tooltip-show-on';
import type { TooltipTarget } from './tooltip-target';

const OWN = ['target', 'content', 'placement', 'delay', 'hideDelay', 'showOn'] as const;

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** The parts of a tooltip. On one object made on first use: the base constructor already renders. */
interface Parts {
  /** The element, kept for disposal (core lets go of it). */
  bubble: HTMLDivElement;
  label: HTMLSpanElement | null;
  content: ComponentBase | null;
  /** The target's element, linked to the shared listeners. */
  anchor: Element | null;
  /** The element that carries `aria-describedby` while it is shown. */
  described: Element | null;
  /** Created programmatically and put into the page by the tooltip itself. */
  placedItself: boolean;
  opened: Emitter<void>;
  closed: Emitter<void>;
}

const PARTS = Symbol('mx.tooltip');

function elementOf(target: TooltipTarget | null | undefined): Element | null {
  if (!target) return null;
  if (isElement(target)) return target;
  return isElement(target.element) ? target.element : null;
}

function addToken(el: Element, name: string, token: string): void {
  const tokens = (el.getAttribute(name) ?? '').split(/\s+/).filter(Boolean);
  if (!tokens.includes(token)) el.setAttribute(name, [...tokens, token].join(' '));
}

function removeToken(el: Element, name: string, token: string): void {
  const tokens = (el.getAttribute(name) ?? '').split(/\s+/).filter((t) => t && t !== token);
  if (tokens.length) el.setAttribute(name, tokens.join(' '));
  else el.removeAttribute(name);
}

/**
 * A short description shown next to an element: after the pointer rests on it, when it gets
 * keyboard focus, or programmatically. The pointer can move onto the tooltip without closing it; Escape,
 * a click, leaving focus and scrolling close it. One tooltip is open at a time on the page, and
 * all of them share one set of document listeners. It never takes focus and holds nothing
 * interactive; the target is described by it (`aria-describedby`) while it is shown.
 *
 * @example
 * <Button ref={(b) => (this.save = b)} icon={saveIcon} aria-label="Save" />
 * <Tooltip target={() => this.save} text="Save the file (Ctrl+S)" />
 *
 * const tip = new Tooltip({ target: this.saveButton, text: 'Save the file' });
 * tip.placement = 'bottom';
 */
export class Tooltip extends Control<HTMLDivElement, TooltipProps> {
  /** Milliseconds after a tooltip closes during which the next one shows at once. 0 turns it off. */
  static get skipDelay(): number {
    return tooltipTiming.skipDelay;
  }
  static set skipDelay(value: number) {
    tooltipTiming.skipDelay = value;
  }

  constructor(props?: IBaseProp<TooltipProps>) {
    super(props);
    const el = this.element;
    el.classList.add('mx-tooltip');
    el.id = nextId('tooltip');
    el.setAttribute('role', 'tooltip');
    if (hasPopover) el.popover = 'manual';
    else el.hidden = true;

    const own = (this.props ?? {}) as TooltipProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    this.observeProperty<string>('text', (text) => this.renderText(text));
    this.observeProperty<TooltipTarget | null>('target', (target) => this.attach(target));
    this.observeProperty('content', () => this.opened && this.renderContent());
    this.observeProperty('placement', () => this.place());
    // A ref given later in the same build (`target={() => this.save}` above the button).
    const target = own.target;
    if (typeof target === 'function' && !this.parts.anchor) {
      queueMicrotask(() => {
        if (!this.isDisposed && !this.parts.anchor && this.target === null) this.bindProperty('target', target);
      });
    }
    if (own.onOpened) this.onOpened(own.onOpened);
    if (own.onClosed) this.onClosed(own.onClosed);
    this.motif.setDisposable(() => {
      const parts = this.parts;
      hideTooltip(this);
      this.attach(null);
      if (parts.placedItself) parts.bubble.remove();
      parts.opened.dispose();
      parts.closed.dispose();
    });
  }

  // Properties (see TooltipProps).

  get target(): TooltipTarget | null {
    return this.getProperty<TooltipTarget | null | undefined>('target') ?? null;
  }
  set target(value: Bind<TooltipTarget | null>) {
    this.assignProperty('target', value);
  }
  get content(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('content') ?? null;
  }
  set content(value: Bind<ComponentBase | null>) {
    this.assignProperty('content', value);
  }
  get placement(): PopupPlacement {
    return this.getProperty<PopupPlacement | undefined>('placement') ?? 'top';
  }
  set placement(value: Bind<PopupPlacement>) {
    this.assignProperty('placement', value);
  }
  get delay(): number {
    return this.getProperty<number | undefined>('delay') ?? 500;
  }
  set delay(value: Bind<number>) {
    this.assignProperty('delay', value, Number);
  }
  get hideDelay(): number {
    return this.getProperty<number | undefined>('hideDelay') ?? 150;
  }
  set hideDelay(value: Bind<number>) {
    this.assignProperty('hideDelay', value, Number);
  }
  get showOn(): TooltipShowOn {
    return this.getProperty<TooltipShowOn | undefined>('showOn') ?? 'hover-focus';
  }
  set showOn(value: Bind<TooltipShowOn>) {
    this.assignProperty('showOn', value);
  }

  /** Whether it is shown. Reactive. Setting it opens or closes it. */
  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }
  set opened(value: boolean) {
    if (value) this.open();
    else this.close();
  }

  get onOpened(): MotifEvent<void> {
    return this.parts.opened.event;
  }

  get onClosed(): MotifEvent<void> {
    return this.parts.closed.event;
  }

  /** Shows it now, whatever `showOn` says; `false` without a target on the page or when disabled. */
  open(): boolean {
    const anchor = this.parts.anchor;
    if (!anchor?.isConnected || !this.enabled) return false;
    showTooltip(this, anchor, 'code');
    return true;
  }

  close(): void {
    hideTooltip(this);
  }

  /** Lines it up with its target again, e.g. after the target moved. */
  place(): void {
    const anchor = this.parts.anchor;
    if (isTooltipShown(this) && anchor) placePopup(this.element, anchor, this.peekProperty<PopupPlacement>('placement') ?? 'top', false);
  }

  /** @internal Called by the shared listeners: puts it on the screen next to `anchor`. */
  present(anchor: Element, described?: Element): void {
    const parts = this.parts;
    const el = this.element;
    if (!el.isConnected) {
      if (!this.isBuilt) this.build();
      homeOf(anchor).append(el);
      parts.placedItself = true;
    }
    this.renderContent();
    if (hasPopover) {
      if (!el.matches(':popover-open')) el.showPopover();
    } else {
      el.hidden = false;
    }
    this.place();
    parts.described = described ?? (isFocusable(anchor) ? anchor : (focusableIn(anchor)[0] ?? anchor));
    addToken(parts.described, 'aria-describedby', el.id);
    this.setProperty('opened', true);
    parts.opened.fire();
  }

  /** @internal Called by the shared listeners: takes it off the screen. */
  dismiss(): void {
    const parts = this.parts;
    const el = parts.bubble;
    if (hasPopover && el.matches(':popover-open')) el.hidePopover();
    else el.hidden = true;
    if (parts.described) removeToken(parts.described, 'aria-describedby', el.id);
    parts.described = null;
    this.setProperty('opened', false);
    parts.closed.fire();
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'enabled' && value === false) hideTooltip(this);
  }

  // Parts.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= {
      bubble: this.element,
      label: null,
      content: null,
      anchor: null,
      described: null,
      placedItself: false,
      opened: new Emitter(),
      closed: new Emitter(),
    });
  }

  private attach(target: TooltipTarget | null): void {
    const parts = this.parts;
    const anchor = elementOf(target);
    if (anchor === parts.anchor) return;
    if (parts.anchor) {
      hideTooltip(this);
      unlinkTooltip(parts.anchor, this);
    }
    parts.anchor = anchor;
    if (!anchor) return;
    linkTooltip(anchor, this);
    // Created programmatically for a component: it goes with the component.
    if (target && !isElement(target)) {
      target.motif.setDisposable(() => {
        if (!this.parent && this.peekProperty('target') === target) void this.dispose();
      });
    }
  }

  private renderText(text: string): void {
    const parts = this.parts;
    if (!parts.label) {
      if (!text) return;
      parts.label = this.element.ownerDocument.createElement('span');
      parts.label.className = 'mx-tooltip__text';
      this.element.prepend(parts.label);
    }
    parts.label.textContent = text ?? '';
    parts.label.hidden = !text;
    this.place();
  }

  private renderContent(): void {
    const parts = this.parts;
    const content = this.peekProperty<ComponentBase | null>('content') ?? null;
    if (content === parts.content) return;
    if (parts.content) this.controls.remove(parts.content);
    parts.content = content;
    if (content) this.controls.add(content);
    this.place();
  }
}
