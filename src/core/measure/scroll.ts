import { ComponentBase } from '@motifx/core';
import type { Box } from './box';
import { elementOf, isText } from './element-of';
import { hasMotion } from './motion';
import { notePending } from './pending-scrolls';
import { boxOf, isRtl, rectOf, scrollOf, styleOf } from './read';
import type { RevealOptions } from './reveal-options';
import type { RevealRange } from './reveal-range';
import { measure } from './rounds';
import type { ScrollMotion } from './scroll-motion';
import type { ScrollPlace } from './scroll-place';

/**
 * Scrolls `component` to `place` through its own `scrollTo`, which core calls a microtask later; reads in between count
 * an instant one. Returns whether it wrote: where the element cannot scroll (a test document without scroll methods),
 * nothing is written.
 */
export function scrollTo(component: ComponentBase, place: ScrollPlace, motion: ScrollMotion = 'instant'): boolean {
  if (place.start === undefined && place.top === undefined) return false;
  const el = elementOf(component);
  if (!el || typeof (el as HTMLElement).scrollTo !== 'function') return false;
  const behavior = behaviorOf(component, motion);
  const to: ScrollToOptions = { behavior };
  if (place.start !== undefined) to.left = isRtl(component) ? -place.start : place.start;
  if (place.top !== undefined) to.top = place.top;
  component.attr.add({ scrollTo: to });  if (behavior === 'instant') notePending(component, place);
  return true;
}

/** Scrolls `component` on by `by` (`start` along the inline axis, right to left too) through its own `scrollBy`. Returns whether it wrote. */
export function scrollBy(component: ComponentBase, by: ScrollPlace, motion: ScrollMotion = 'instant'): boolean {
  if (!by.start && !by.top) return false;
  const el = elementOf(component);
  if (!el || typeof (el as HTMLElement).scrollBy !== 'function') return false;
  const behavior = behaviorOf(component, motion);
  const step: ScrollToOptions = { behavior };
  if (by.start) step.left = isRtl(component) ? -by.start : by.start;
  if (by.top) step.top = by.top;
  component.attr.add({ scrollBy: step });
  if (behavior === 'instant') notePending(component, by, true);
  return true;
}

/**
 * Brings `target` into view through its own `scrollIntoView`: every scroller around it moves, the page too, where
 * `reveal` moves one. Returns whether it wrote.
 */
export function scrollIntoView(target: ComponentBase, options: { block?: ScrollLogicalPosition; inline?: ScrollLogicalPosition; motion?: ScrollMotion } = {}): boolean {
  const el = elementOf(target);
  if (!el || typeof (el as HTMLElement).scrollIntoView !== 'function') return false;
  target.attr.add({ scrollIntoView: { block: options.block ?? 'nearest', inline: options.inline ?? 'nearest', behavior: behaviorOf(target, options.motion ?? 'instant') } });
  return true;
}

/**
 * Scrolls `scroller`, and nothing else, only as far as it takes to bring `target` into view: one of its parts, or a
 * stretch of its content placed by the model. Read in the next round, written after it. Returns what takes it back.
 */
export function reveal(scroller: ComponentBase, target: ComponentBase | RevealRange, options: RevealOptions = {}): () => void {
  return measure(
    scroller,
    () => placeOf(scroller, target, options),
    (place) => {
      if (place) scrollTo(scroller, place, options.motion);
      const then = options.then;
      if (then) measure(scroller, () => true, () => then());
    },
  );
}

/**
 * Notes how far `root` and every component under it are scrolled, before a change that loses it (a move to another
 * parent or window, a part hidden, a drag that may be canceled). The function returned scrolls them back in the next
 * round of the windows they are in then. Only components are kept: content that is no component scrolls back on its own
 * or not at all.
 */
export function keepScroll(root: ComponentBase): () => void {
  const kept: [ComponentBase, ScrollPlace][] = [];
  const walk = (component: ComponentBase): void => {
    if (component.isDisposed || isText(component)) return;
    if (elementOf(component)) {
      const at = scrollOf(component);
      if (at.start || at.top) kept.push([component, at]);
    }
    for (const child of component.controls.items) walk(child);
  };
  walk(root);
  return () => {
    for (const [component, place] of kept) {
      if (!component.isDisposed) measure(component, () => isRtl(component), () => scrollTo(component, place));
    }
  };
}

/** `component`, or the nearest component it sits in, that scrolls along `axis`; null for the page. */
export function scrollerOf(component: ComponentBase, axis: 'x' | 'y' = 'y'): ComponentBase | null {
  for (let at: ComponentBase | null = component; at; at = at.parent) if (scrolls(at, axis, false)) return at;
  return null;
}

/**
 * The innermost component, `within` or under it, that the event started in and that can still scroll along `axis`; null
 * when none can. Found down the component tree with `motif.isEventFrom`, never from the event's element.
 */
export function scrollerUnder(e: Event, within: ComponentBase, axis: 'x' | 'y'): ComponentBase | null {
  const path: ComponentBase[] = [within];
  for (let at: ComponentBase | undefined = within; at; ) {
    at = at.controls.items.find((child) => !child.isDisposed && child.motif.isEventFrom(e));
    if (at) path.push(at);
  }
  for (let i = path.length - 1; i >= 0; i--) if (scrolls(path[i], axis, true)) return path[i];
  return null;
}

function behaviorOf(component: ComponentBase, motion: ScrollMotion): ScrollBehavior {
  if (motion === 'smooth') return hasMotion(component) ? 'smooth' : 'instant';
  return motion;
}

function scrolls(component: ComponentBase, axis: 'x' | 'y', withRoom: boolean): boolean {
  const name = axis === 'x' ? 'overflow-x' : 'overflow-y';
  const overflow = styleOf(component, [name])[name];
  if (overflow !== 'auto' && overflow !== 'scroll' && overflow !== 'overlay') return false;
  if (!withRoom) return true;
  const box = boxOf(component);
  return axis === 'x' ? box.scrollWidth > box.clientWidth + 1 : box.scrollHeight > box.clientHeight + 1;
}

/** Where `scroller` has to be for `target` to show; null when it shows already. */
function placeOf(scroller: ComponentBase, target: ComponentBase | RevealRange, options: RevealOptions): ScrollPlace | null {
  const box = boxOf(scroller);
  if (!box.clientWidth && !box.clientHeight) return null;
  const range = target instanceof ComponentBase ? rangeOf(box, target) : target;
  if (!range) return null;
  const cover = options.cover ?? {};
  const axis = options.axis ?? 'both';
  const place: ScrollPlace = {};
  if (axis !== 'y' && range.start !== undefined) {
    const start = along(range.start, range.size ?? 0, box.scrollStart, box.clientWidth, coverOf(cover.start, 'x'), coverOf(cover.end, 'x'), box.scrollWidth - box.clientWidth, options.align);
    if (Math.abs(start - box.scrollStart) >= 1) place.start = start;
  }
  if (axis !== 'x' && range.top !== undefined) {
    const top = along(range.top, range.height ?? 0, box.scrollTop, box.clientHeight, coverOf(cover.top, 'y'), coverOf(cover.bottom, 'y'), box.scrollHeight - box.clientHeight, options.align);
    if (Math.abs(top - box.scrollTop) >= 1) place.top = top;
  }
  return place.start === undefined && place.top === undefined ? null : place;
}

/** Where a part is in the scroller's content, what is scrolled counted. */
function rangeOf(box: Box, target: ComponentBase): RevealRange | null {
  const part = rectOf(target);
  if (!part.width && !part.height) return null;
  // The inside starts past the border, and right to left past a scroll bar on the left too.
  const left = box.left + box.clientLeft;
  const top = box.top + box.clientTop;
  const start = box.rtl ? left + box.clientWidth - part.right : part.left - left;
  return { start: start + box.scrollStart, size: part.width, top: part.top - top + box.scrollTop, height: part.height };
}

/** The position along one axis that shows `at` to `at + size` in `room`, `before` and `after` covered at its ends. */
function along(at: number, size: number, now: number, room: number, before: number, after: number, most: number, align: RevealOptions['align']): number {
  let next = now;
  if (align === 'start') next = at - before;
  else if (align === 'end') next = at + size - room + after;
  else if (align === 'center') next = at - before - (room - before - after - size) / 2;
  else if (at < now + before || size > room - before - after) next = at - before;
  else if (at + size > now + room - after) next = at + size - room + after;
  return Math.max(0, Math.min(Math.max(0, most), next));
}

function coverOf(side: number | ComponentBase | undefined, axis: 'x' | 'y'): number {
  if (side === undefined) return 0;
  if (typeof side === 'number') return side;
  const rect = rectOf(side);
  return axis === 'x' ? rect.width : rect.height;
}
