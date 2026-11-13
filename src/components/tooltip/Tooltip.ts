import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { partBefore } from '../../core/draw-parts';
import { placeInTree } from '../../core/flow-home';
import { canTakeFocus } from '../../core/focus';
import { isInPage } from '../../core/measure';
import { nextId } from '../../core/next-id';
import { isElement } from '../../core/node-kind';
import { mark, put, text as writeText } from '../../core/part-writes';
import { placeNear } from '../../parts/popup/place-near';
import type { PopupPlacement } from '../../parts/popup/popup-placement';
import { hideTooltip, isTooltipShown, linkTooltip, showTooltip, tooltipTiming, unlinkTooltip } from './tooltip-hub';
import type { TooltipProps } from './tooltip-props';
import type { TooltipShowOn } from './tooltip-show-on';
import type { TooltipTarget } from './tooltip-target';

const OWN = ['target', 'content', 'placement', 'delay', 'hideDelay', 'showOn'] as const;

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** The parts of a tooltip. On one object made on first use: the base constructor already renders. */
interface Parts {
  id: string;
  label: Component<HTMLSpanElement> | null;
  content: ComponentBase | null;
  /** The target, linked in the hub. */
  anchor: ComponentBase | null;
  /** The part that carries `aria-describedby` while it is shown. */
  described: ComponentBase | null;
  /** Shown in the page's top layer (`showPopover`). */
  inTopLayer: boolean;
  /** Created programmatically and put into the page by the tooltip itself. */
  placedItself: boolean;
  /** Takes back the placement asked for last. */
  stopPlace: (() => void) | null;
  opened: Emitter<void>;
  closed: Emitter<void>;
}

const PARTS = Symbol('mx.tooltip');

/** The tooltips given each component target, which go with it. */
const onTarget = new WeakMap<ComponentBase, Set<Tooltip>>();

/**
 * The part a target is described on: the target when it takes focus, else the focus part of a target control, else
 * the first part inside it that takes focus.
 */
function describedPart(anchor: ComponentBase): ComponentBase {
  if (canTakeFocus(anchor)) return anchor;
  if (anchor instanceof Control) {
    const part = anchor.focusPart;
    if (part && part !== anchor) return describedPart(part);
  }
  return firstFocusable(anchor) ?? anchor;
}

/** The first part inside `part`, in order, that takes focus. */
function firstFocusable(part: ComponentBase): ComponentBase | null {
  for (const child of part.controls.items) {
    const found = canTakeFocus(child) ? child : firstFocusable(child);
    if (found) return found;
  }
  return null;
}

/** Adds `token` to the list in attribute `name`, keeping what others put there. */
function addToken(part: ComponentBase, name: string, token: string): void {
  const tokens = (part.attr.get(name) ?? '').split(/\s+/).filter(Boolean);
  if (!tokens.includes(token)) put(part, name, [...tokens, token].join(' '));
}

function removeToken(part: ComponentBase, name: string, token: string): void {
  const tokens = (part.attr.get(name) ?? '').split(/\s+/).filter((t) => t && t !== token);
  put(part, name, tokens.length ? tokens.join(' ') : null);
}

/**
 * A short description shown next to an element when the pointer rests on it, when it receives
 * keyboard focus, or programmatically. The pointer can move onto the tooltip without closing it. Escape,
 * a click, leaving focus and scrolling close it. One tooltip is open at a time on the page, and
 * all of them share one set of document listeners. It never takes focus and contains nothing
 * interactive, and the target is described by it (`aria-describedby`) while it is shown.
 *
 * @example
 * <Button ref={(b) => (this.save = b)} icon={saveIcon} aria-label="Save" />
 * <Tooltip target={() => this.save} text="Save the file (Ctrl+S)" />
 *
 * const tip = new Tooltip({ target: this.saveButton, text: 'Save the file' });
 * tip.placement = 'bottom';
 */
export class Tooltip extends Control<HTMLDivElement, TooltipProps> {
  /** The time in milliseconds after a tooltip closes during which the next one appears immediately. `0` turns it off. */
  static get skipDelay(): number {
    return tooltipTiming.skipDelay;
  }
  static set skipDelay(value: number) {
    tooltipTiming.skipDelay = value;
  }

  constructor(props?: IBaseProp<TooltipProps>) {
    super(props);
    this.class.add('mx-tooltip');
    this.attr.add({ id: this.parts.id, role: 'tooltip' });
    if (hasPopover) this.attr.add({ popover: 'manual' });
    else mark(this, 'hidden', true);

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

  /** Indicates whether it is visible. Reactive. Set it to open or close the tooltip. */
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

  /**
   * Shows the tooltip now, regardless of `showOn`. Returns `false` if there is no target on the page or it is
   * disabled.
   */
  open(): boolean {
    const anchor = this.parts.anchor;
    if (!anchor || !isInPage(anchor) || !this.enabled) return false;
    showTooltip(this, anchor, 'code');
    return true;
  }

  close(): void {
    hideTooltip(this);
  }

  /** Repositions it relative to its target, for example after the target moves. */
  place(): void {
    const parts = this.parts;
    if (!isTooltipShown(this) || !parts.anchor) return;
    parts.stopPlace = placeNear(this, parts.anchor, { placement: this.peekProperty<PopupPlacement>('placement') ?? 'top' });
  }

  /**
   * @internal Called by the shared listeners: puts it on the screen next to `anchor`. `described` is the part of the
   * target focus went to, when focus opened it.
   */
  present(anchor: ComponentBase, described?: ComponentBase): void {
    const parts = this.parts;
    if (!isInPage(this)) {
      if (!this.isBuilt) this.build();
      placeInTree(anchor, this);
      parts.placedItself = true;
    }
    this.renderContent();
    if (hasPopover) {
      // The browser shows it a moment later; it is placed with the next measuring of its window, after that.
      if (!parts.inTopLayer) this.attr.add({ showPopover: true });
      parts.inTopLayer = true;
    } else {
      mark(this, 'hidden', false);
    }
    this.place();
    parts.described = described && canTakeFocus(described) ? described : describedPart(anchor);
    addToken(parts.described, 'aria-describedby', parts.id);
    this.setProperty('opened', true);
    parts.opened.fire();
  }

  /** @internal Called by the shared listeners: takes it off the screen. */
  dismiss(): void {
    const parts = this.parts;
    parts.stopPlace?.();
    parts.stopPlace = null;
    if (parts.inTopLayer) {
      parts.inTopLayer = false;
      this.attr.add({ showPopover: false });
    } else {
      mark(this, 'hidden', true);
    }
    // A described part disposed before it (the target's) has nothing left to take the token from.
    if (parts.described && !parts.described.isDisposed) removeToken(parts.described, 'aria-describedby', parts.id);
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
      id: nextId('tooltip'),
      label: null,
      content: null,
      anchor: null,
      described: null,
      inTopLayer: false,
      placedItself: false,
      stopPlace: null,
      opened: new Emitter(),
      closed: new Emitter(),
    });
  }

  /** The target given, when it has an element to describe (a fragment has none). */
  private takeIn(target: TooltipTarget | null | undefined): ComponentBase | null {
    return target && isElement(target.element) ? target : null;
  }

  private attach(target: TooltipTarget | null): void {
    const parts = this.parts;
    const anchor = this.takeIn(target);
    if (anchor === parts.anchor) return;
    if (parts.anchor) {
      hideTooltip(this);
      unlinkTooltip(parts.anchor, this);
      onTarget.get(parts.anchor)?.delete(this);
    }
    parts.anchor = anchor;
    if (!anchor) return;
    linkTooltip(anchor, this);
    // Created programmatically for a component: it goes with the component.
    Tooltip.goWith(anchor).add(this);
  }

  /** The tooltips that go with `target`, which is watched once however many tooltips it is given. */
  private static goWith(target: ComponentBase): Set<Tooltip> {
    const known = onTarget.get(target);
    if (known) return known;
    const tooltips = new Set<Tooltip>();
    onTarget.set(target, tooltips);
    target.motif.setDisposable(() => {
      onTarget.delete(target);
      for (const tooltip of [...tooltips]) tooltip.leaveWith(target);
    });
    return tooltips;
  }

  private leaveWith(target: ComponentBase): void {
    // Placed by nobody but itself (where its target was when it opened).
    const own = !this.parent || this.parts.placedItself;
    if (!own || this.peekProperty('target') !== target) return;
    if (this.parent) this.parent.controls.remove(this);
    else void this.dispose();
  }

  private renderText(text: string): void {
    const parts = this.parts;
    if (!parts.label) {
      if (!text) return;
      // First, before a content given.
      parts.label = partBefore<HTMLSpanElement>(this, this.controls.items[0] ?? null, 'span', 'mx-tooltip__text');
    }
    writeText(parts.label, text ?? '');
    mark(parts.label, 'hidden', !text);
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
