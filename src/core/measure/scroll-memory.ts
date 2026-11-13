import type { ComponentBase } from '@motifx/core';
import { isElement } from '../node-kind';
import { onDocument } from '../window-events';
import { elementOf } from './element-of';
import { pendingScroll } from './pending-scrolls';
import type { View } from './view';

// How far elements are scrolled, as the page last told it: their scroll events (one listener per window), and what the
// layer itself read or wrote. Noting a place before a move then reads nothing, so it lays nothing out: a move made where
// the page has changed (a drop) costs no layout for it. An element never scrolled is at its start.

const known = new WeakMap<Element, { start: number; top: number }>();
const heard = new WeakSet<View>();
const AT_START = { start: 0, top: 0 };

/** Notes from now on how far the elements of `view` are scrolled. */
export function rememberScrolls(view: View): void {
  if (heard.has(view)) return;
  heard.add(view);
  onDocument(
    view.document,
    'scroll',
    (e) => {
      const el = e.target;
      // The page's own scroll comes from the document: no component is the document.
      if (isElement(el)) known.set(el, { start: Math.abs(el.scrollLeft), top: el.scrollTop });
    },
    { capture: true, passive: true },
  );
}

/** Notes how far `el` is scrolled, as the layer read it or wrote it. */
export function noteScroll(el: Element, place: { start?: number; top?: number }, by = false): void {
  const was = known.get(el) ?? AT_START;
  const start = place.start === undefined ? was.start : Math.max(0, (by ? was.start : 0) + place.start);
  const top = place.top === undefined ? was.top : Math.max(0, (by ? was.top : 0) + place.top);
  known.set(el, { start, top });
}

/** How far `component` is scrolled as last told, counting a scroll written and not made yet; nothing is read. */
export function knownScrollOf(component: ComponentBase): { start: number; top: number } {
  const el = elementOf(component);
  if (!el) return AT_START;
  const seen = known.get(el) ?? AT_START;
  const pending = pendingScroll(component);
  if (!pending) return seen;
  return { start: Math.max(0, (pending.start ?? seen.start) + pending.byStart), top: Math.max(0, (pending.top ?? seen.top) + pending.byTop) };
}
