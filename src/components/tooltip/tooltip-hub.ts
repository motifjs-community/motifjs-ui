import type { ComponentBase } from '@motifx/core';
import { focusGoesInto, focusIsVisible } from '../../core/focus';
import { isInPage, measure, onLayout, pageOf, rectOf, type Rect } from '../../core/measure';
import { eachDocument } from '../../core/page-documents';
import { onDocument, onWindow } from '../../core/window-events';
import type { Tooltip } from './Tooltip';

// Each target listens itself for the pointer and for focus, and the innermost target takes the event. One set of
// document listeners, in each document connected to the page too, hears presses and what no target took. Only one
// tooltip is open at a time. `addTooltip` links a function that makes its tooltip on first use.

type Source = Tooltip | (() => Tooltip);
type Cause = 'pointer' | 'focus' | 'code';

/** A target linked to its tooltip, with what takes its listeners off. */
interface Link {
  anchor: ComponentBase;
  source: Source;
  stop: () => void;
}

const links = new WeakMap<ComponentBase, Link>();
let installed = false;

let current: Tooltip | null = null;
let currentAnchor: ComponentBase | null = null;
let currentCause: Cause = 'code';
/** While one is open: what follows its anchor, to take off. */
let following: (() => void) | null = null;
/** Where the anchor of the open one was last seen: a scroll that moves it moves or closes the tooltip. */
let anchorAt: Rect | null = null;
let pending: Tooltip | null = null;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let closedAt = -Infinity;
/** A target that was pressed or dismissed with Escape, and its tooltip: no tooltip on it until the pointer leaves it. */
let muted: { anchor: ComponentBase; tooltip: Tooltip } | null = null;
/** The event a target took: the targets around it and the document leave it alone. */
let claimed: Event | null = null;
/** The innermost target the pointer is over. */
let under: Link | null = null;

export const tooltipTiming = { skipDelay: 300 };

/** Links a target to its tooltip, or to a function that makes it on first use. */
export function linkTooltip(anchor: ComponentBase, source: Source): void {
  const link = links.get(anchor);
  if (link) link.source = source;
  else links.set(anchor, listen(anchor, source));
  install();
}

export function unlinkTooltip(anchor: ComponentBase, source: Source): void {
  const link = links.get(anchor);
  if (!link || link.source !== source) return;
  link.stop();
  links.delete(anchor);
  if (under === link) under = null;
}

export function isTooltipShown(tooltip: Tooltip): boolean {
  return current === tooltip;
}

export function showTooltip(tooltip: Tooltip, anchor: ComponentBase, cause: Cause, described?: ComponentBase): void {
  cancelPending();
  clearTimeout(hideTimer);
  if (current && (current !== tooltip || currentAnchor !== anchor)) hideTooltip(current);
  const opening = current !== tooltip;
  current = tooltip;
  currentAnchor = anchor;
  currentCause = cause;
  if (!opening) return;
  following = follow(tooltip, anchor);
  tooltip.present(anchor, described);
}

export function hideTooltip(tooltip: Tooltip): void {
  if (pending === tooltip) cancelPending();
  if (current !== tooltip) return;
  clearTimeout(hideTimer);
  current = currentAnchor = null;
  closedAt = performance.now();
  following?.();
  following = null;
  tooltip.dismiss();
}

/** The target's own listeners: the pointer coming over it, focus coming into it. */
function listen(anchor: ComponentBase, source: Source): Link {
  const over = (_: ComponentBase, e: PointerEvent) => hovered(link, e);
  const focus = (_: ComponentBase, e: FocusEvent) => focused(link, e);
  const link: Link = {
    anchor,
    source,
    stop: () => {
      void anchor.motif.off('pointerover', over);
      void anchor.motif.off('focusin', focus);
    },
  };
  void anchor.motif.on('pointerover', over);
  void anchor.motif.on('focusin', focus);
  return link;
}

/** One set of listeners on each document of the app, for presses and what no target took. */
function install(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  eachDocument((doc) => {
    const stops = [
      onDocument(doc, 'pointerover', onPointerOver),
      onDocument(doc, 'pointerout', onPointerOut, true),
      onDocument(doc, 'pointerdown', onPointerDown, true),
      onDocument(doc, 'focusin', onFocusIn, true),
      onDocument(doc, 'focusout', onFocusOut, true),
    ];
    return () => {
      for (const stop of stops) stop();
    };
  });
}

/** What closes or moves the open tooltip: a key in the document of its anchor, a scroll that moves the anchor, the page changing size. */
function follow(tooltip: Tooltip, anchor: ComponentBase): () => void {
  anchorAt = null;
  const stops = [
    onDocument(anchor, 'keydown', onKeyDown, true),
    onLayout(tooltip, 'scroll', () => measure(tooltip, readAnchor, anchorSeen), { except: tooltip }),
    onWindow(anchor, 'scrollend', onScrollEnd, true),
    onLayout(tooltip, 'page', () => tooltip.place()),
  ];
  measure(tooltip, readAnchor, anchorSeen);
  return () => {
    for (const stop of stops) stop();
  };
}

function tooltipOf(link: Link): Tooltip {
  const source = link.source;
  return typeof source === 'function' ? source() : source;
}

/** The innermost part of `part` an event came from. */
function partFrom(part: ComponentBase, e: Event): ComponentBase {
  for (const child of part.controls.items) if (child.motif.isEventFrom(e)) return partFrom(child, e);
  return part;
}

function cancelPending(): void {
  clearTimeout(showTimer);
  pending = null;
}

function leave(): void {
  cancelPending();
  const tooltip = current;
  if (!tooltip || currentCause !== 'pointer') return;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => hideTooltip(tooltip), Math.max(0, tooltip.hideDelay));
}

/** The pointer came over a target; the innermost target takes the event. */
function hovered(link: Link, e: PointerEvent): void {
  if (claimed === e) return;
  claimed = e;
  under = link;
  if (e.pointerType === 'touch') return;
  if (current?.motif.isEventFrom(e)) {
    clearTimeout(hideTimer);
    return;
  }
  const tooltip = tooltipOf(link);
  if (muted && muted.tooltip !== tooltip) muted = null;
  if (muted || tooltip.showOn !== 'hover-focus' || !tooltip.enabled) {
    leave();
    return;
  }
  const anchor = link.anchor;
  if (tooltip === current && anchor === currentAnchor) {
    clearTimeout(hideTimer);
    return;
  }
  if (tooltip === pending) return;
  cancelPending();
  const warm = current !== null || performance.now() - closedAt < tooltipTiming.skipDelay;
  const delay = warm ? 0 : Math.max(0, tooltip.delay);
  if (!delay) {
    showTooltip(tooltip, anchor, 'pointer');
    return;
  }
  pending = tooltip;
  showTimer = setTimeout(() => {
    pending = null;
    if (isInPage(anchor)) showTooltip(tooltip, anchor, 'pointer');
  }, delay);
}

/** The pointer came over what no target took: over the open tooltip it stays, anywhere else it goes. */
function onPointerOver(e: PointerEvent): void {
  if (claimed === e) return;
  under = null;
  if (e.pointerType === 'touch') return;
  if (current?.motif.isEventFrom(e)) {
    clearTimeout(hideTimer);
    return;
  }
  muted = null;
  leave();
}

function onPointerOut(e: PointerEvent): void {
  // Leaving the window: no pointerover follows.
  if (!e.relatedTarget) {
    under = muted = null;
    leave();
  }
}

/** Heard before anything else: a press in the target the pointer is over mutes it, also when that target stops the press (a disabled control does). */
function onPointerDown(e: PointerEvent): void {
  if (current?.motif.isEventFrom(e)) return;
  cancelPending();
  muted = under?.anchor.motif.isEventFrom(e) ? { anchor: under.anchor, tooltip: tooltipOf(under) } : null;
  // One shown with showOn 'manual' is the app's to close.
  if (current && current.showOn !== 'manual') hideTooltip(current);
}


/** Focus came into a target; the innermost target takes the event. */
function focused(link: Link, e: FocusEvent): void {
  if (claimed === e) return;
  claimed = e;
  const tooltip = tooltipOf(link);
  if (muted && muted.tooltip !== tooltip) muted = null;
  if (muted || tooltip.showOn === 'manual' || !tooltip.enabled || !focusIsVisible(e)) return;
  showTooltip(tooltip, link.anchor, 'focus', partFrom(link.anchor, e));
}

/** Heard before any target: focus landing off a muted target ends the mute. */
function onFocusIn(e: FocusEvent): void {
  if (muted && !muted.anchor.motif.isEventFrom(e)) muted = null;
}

/** Focus leaving the target of one shown for focus closes it; focus moving inside the target keeps it. */
function onFocusOut(e: FocusEvent): void {
  if (!current || currentCause !== 'focus') return;
  if (currentAnchor && focusGoesInto(currentAnchor, e)) return;
  hideTooltip(current);
}

function onKeyDown(e: KeyboardEvent): void {
  const tooltip = current;
  const anchor = currentAnchor;
  if (e.key !== 'Escape' || !tooltip || !anchor) return;
  // Only the tooltip closes: it sits above whatever else Escape would close.
  e.preventDefault();
  e.stopPropagation();
  muted = { anchor, tooltip };
  hideTooltip(tooltip);
}

function readAnchor(): Rect | null {
  return currentAnchor && !currentAnchor.isDisposed ? rectOf(currentAnchor) : null;
}

/** A scroll moved the anchor of the open tooltip. */
function anchorSeen(at: Rect | null): void {
  const before = anchorAt;
  anchorAt = at;  if (!current || !at || !before || (Math.abs(at.left - before.left) <= 0.5 && Math.abs(at.top - before.top) <= 0.5)) return;
  // Focus scrolls a field into view (smoothly, too), and the one reading still needs its tooltip:
  // it follows the field, and closes only if the field is off the screen once scrolling ends.
  if (current.showOn === 'manual' || currentCause === 'focus') current.place();
  else hideTooltip(current);
}

function followsFocus(): boolean {
  return !!current && currentCause === 'focus' && current.showOn !== 'manual';
}

function onScrollEnd(): void {
  if (current && followsFocus()) measure(current, readOnScreen, closeOffScreen);
}

function readOnScreen(): boolean {
  if (!currentAnchor || currentAnchor.isDisposed) return true;
  const r = rectOf(currentAnchor);
  const page = pageOf(currentAnchor);
  return r.bottom > 0 && r.right > 0 && r.top < page.height && r.left < page.width;
}

function closeOffScreen(onScreen: boolean): void {
  if (!onScreen && current && followsFocus()) hideTooltip(current);
}
