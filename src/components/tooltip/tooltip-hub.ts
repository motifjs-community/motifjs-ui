import type { Tooltip } from './Tooltip';

// One set of document listeners serves every tooltip on the page, and only one tooltip is open
// at a time. Targets are found by walking up from the event target; `addTooltip` registers a
// function that makes its tooltip on first use.

type Source = Tooltip | (() => Tooltip);
type Cause = 'pointer' | 'focus' | 'code';

const sources = new WeakMap<Element, Source>();
let installed = false;

let current: Tooltip | null = null;
let currentAnchor: Element | null = null;
let currentCause: Cause = 'code';
let pending: Tooltip | null = null;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let closedAt = -Infinity;
/** A target that was pressed or dismissed with Escape: no tooltip on it until the pointer leaves it. */
let muted: Element | null = null;

export const tooltipTiming = { skipDelay: 300 };

export function linkTooltip(element: Element, source: Source): void {
  sources.set(element, source);
  install();
}

export function unlinkTooltip(element: Element, source: Source): void {
  if (sources.get(element) === source) sources.delete(element);
}

export function isTooltipShown(tooltip: Tooltip): boolean {
  return current === tooltip;
}

export function showTooltip(tooltip: Tooltip, anchor: Element, cause: Cause, described?: Element): void {
  cancelPending();
  clearTimeout(hideTimer);
  if (current && (current !== tooltip || currentAnchor !== anchor)) hideTooltip(current);
  const opening = current !== tooltip;
  current = tooltip;
  currentAnchor = anchor;
  currentCause = cause;
  if (!opening) return;
  document.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('scrollend', onScrollEnd, true);
  window.addEventListener('resize', onResize);
  tooltip.present(anchor, described);
}

export function hideTooltip(tooltip: Tooltip): void {
  if (pending === tooltip) cancelPending();
  if (current !== tooltip) return;
  clearTimeout(hideTimer);
  current = currentAnchor = null;
  closedAt = performance.now();
  document.removeEventListener('keydown', onKeyDown, true);
  window.removeEventListener('scroll', onScroll, true);
  window.removeEventListener('scrollend', onScrollEnd, true);
  window.removeEventListener('resize', onResize);
  tooltip.dismiss();
}

function install(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('pointerover', onPointerOver, true);
  document.addEventListener('pointerout', onPointerOut, true);
  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focusout', onFocusOut, true);
}

function find(node: EventTarget | null): { anchor: Element; tooltip: Tooltip } | null {
  for (let el = node instanceof Element ? node : null; el; el = el.parentElement) {
    const source = sources.get(el);
    if (source) return { anchor: el, tooltip: typeof source === 'function' ? source() : source };
  }
  return null;
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

function onPointerOver(e: PointerEvent): void {
  if (e.pointerType === 'touch') return;
  const node = e.target as Node;
  if (current?.element.contains(node)) {
    clearTimeout(hideTimer);
    return;
  }
  const hit = find(node);
  if (muted && hit?.anchor !== muted) muted = null;
  if (!hit || hit.anchor === muted || hit.tooltip.showOn !== 'hover-focus' || !hit.tooltip.enabled) {
    leave();
    return;
  }
  const { anchor, tooltip } = hit;
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
    if (anchor.isConnected) showTooltip(tooltip, anchor, 'pointer');
  }, delay);
}

function onPointerOut(e: PointerEvent): void {
  // Leaving the window: no pointerover follows.
  if (!e.relatedTarget) {
    muted = null;
    leave();
  }
}

function onPointerDown(e: PointerEvent): void {
  const node = e.target as Node;
  if (current?.element.contains(node)) return;
  cancelPending();
  muted = find(node)?.anchor ?? null;
  // One shown with showOn 'manual' is the app's to close.
  if (current && current.showOn !== 'manual') hideTooltip(current);
}

function focusVisible(el: Element): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}

function onFocusIn(e: FocusEvent): void {
  const hit = find(e.target);
  if (muted && hit?.anchor !== muted) muted = null;
  if (!hit || hit.anchor === muted) return;
  const { anchor, tooltip } = hit;
  if (tooltip.showOn === 'manual' || !tooltip.enabled || !focusVisible(e.target as Element)) return;
  showTooltip(tooltip, anchor, 'focus', e.target as Element);
}

function onFocusOut(e: FocusEvent): void {
  if (!current || currentCause !== 'focus') return;
  const to = e.relatedTarget as Node | null;
  if (to && currentAnchor?.contains(to)) return;
  hideTooltip(current);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || !current) return;
  // Only the tooltip closes: it sits above whatever else Escape would close.
  e.preventDefault();
  e.stopPropagation();
  muted = currentAnchor;
  hideTooltip(current);
}

function onScroll(e: Event): void {
  const scrolled = e.target;
  if (!current || !currentAnchor) return;
  if (scrolled !== document && !(scrolled instanceof Node && scrolled.contains(currentAnchor))) return;
  // Focus scrolls a field into view (smoothly, too), and the one reading still needs its tooltip:
  // it follows the field, and closes only if the field is off the screen once scrolling ends.
  if (current.showOn === 'manual' || currentCause === 'focus') current.place();
  else hideTooltip(current);
}

function onScrollEnd(): void {
  if (current && currentAnchor && currentCause === 'focus' && current.showOn !== 'manual' && !onScreen(currentAnchor)) hideTooltip(current);
}

function onScreen(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

function onResize(): void {
  current?.place();
}
